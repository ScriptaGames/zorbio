//! Bots. Port of server/BotController.js and server/Bot.js.
//!
//! In the Node server bot.player is the same object stored in model.players;
//! here the Player lives in the model and this controller keeps per-bot
//! metadata (movement pattern, curve, chase state) keyed by player id.

use rand::Rng;

use crate::config::{BotMovement, Config};
use crate::curves::{random_wander_path, CurvePaths};
use crate::model::{get_next_id, Model, Player, PlayerType, BOT_SKINS};
use crate::names::bot_names;
use crate::util::{get_random_int_inclusive, now_ms, Vector3};

/// Per-bot metadata (everything in Bot except the player object itself).
#[allow(dead_code)]
pub struct BotMeta {
    pub player_id: u32,
    pub movement: BotMovement,
    /// curve movement pattern
    pub curve_points: Vec<Vector3>,
    pub next_curve_point: usize,
    /// randomPoint movement pattern
    pub move_to_point: Option<Vector3>,
    /// chase movement pattern
    pub chase_player_id: Option<u32>,
    pub chase_time: i64,
    pub scale: f64,
    pub name: String,
}

pub struct BotController {
    pub bots: Vec<BotMeta>,
    pub current_spawn_cycle: usize,
}

impl BotController {
    pub fn new() -> Self {
        BotController {
            bots: Vec::new(),
            current_spawn_cycle: 0,
        }
    }

    /// BotController.spawnBot - creates a bot player in the model.
    pub fn spawn_bot(&mut self, cfg: &Config, model: &mut Model, rng: &mut impl Rng) -> &BotMeta {
        self.set_next_spawn_cycle(cfg, model);
        let scale = self.get_next_spawn_scale();

        // Decide the movement pattern and curve
        let (movement, curve_points, position): (BotMovement, Vec<Vector3>, Vector3) =
            if !self.has_chaser_bot() && scale < 10.0 {
                // Always have at least one medium to small size chaser bot
                crate::zlog!("Spawning chaser bot");
                (BotMovement::Chase, Vec::new(), model.get_safe_spawn_position(cfg, rng, 10))
            } else {
                // Spawn all other bots with a random curve pattern
                let curve = CurvePaths::get_random_curve(cfg, rng);
                let start = curve.first().copied().unwrap_or_else(|| {
                    model.get_safe_spawn_position(cfg, rng, 10)
                });
                (cfg.bot_default_movement.clone(), curve, start)
            };

        // Bot properties
        let color_code = get_random_int_inclusive(rng, 0, crate::config::COLORS.len() as i64 - 1) as u8;
        let skin_name = BOT_SKINS[get_random_int_inclusive(rng, 0, BOT_SKINS.len() as i64 - 1) as usize];
        let id = get_next_id();
        let name = format!(
            "AI {}",
            bot_names()[get_random_int_inclusive(rng, 0, bot_names().len() as i64 - 1) as usize]
        );

        // Create the player model
        let player = Player::new(
            cfg,
            id,
            &name,
            color_code,
            PlayerType::Bot,
            position,
            scale,
            skin_name,
        );
        let meta = BotMeta {
            player_id: id,
            movement,
            curve_points,
            next_curve_point: 1,
            move_to_point: None,
            chase_player_id: None,
            chase_time: 0,
            scale,
            name: name.clone(),
        };

        model.players.push(player);
        self.bots.push(meta);

        // Initialize chase target (the Bot constructor calls setChaseTarget())
        if movement == BotMovement::Chase {
            let last = self.bots.len() - 1;
            self.set_chase_target(cfg, last, model, rng, None);
        }

        let last = self.bots.len() - 1;
        crate::zlog!(
            "Spawned bot: {} {} {} {}",
            name,
            self.bots[last].player_id,
            scale,
            self.current_spawn_cycle
        );

        &self.bots[last]
    }

    /// BotController.setNextSpawnCycle
    fn set_next_spawn_cycle(&mut self, cfg: &Config, model: &Model) {
        if self.current_spawn_cycle >= cfg.max_bots {
            self.current_spawn_cycle = 0;
        }

        // First find out how many big bots are already in the model
        let big_bots = self.get_num_big_bots(model);

        loop {
            self.current_spawn_cycle += 1;
            if self.current_spawn_cycle >= big_bots {
                break;
            }
        }
    }

    /// BotController.getNumBigBots
    fn get_num_big_bots(&self, model: &Model) -> usize {
        model
            .players
            .iter()
            .filter(|p| p.player_type == PlayerType::Bot && p.sphere.scale >= 90.0)
            .count()
    }

    /// BotController.hasChaserBot
    pub fn has_chaser_bot(&self) -> bool {
        self.bots.iter().any(|b| b.movement == BotMovement::Chase)
    }

    /// BotController.getNextSpawnScale - https://www.desmos.com/calculator/fmmedr9kzi
    fn get_next_spawn_scale(&self) -> f64 {
        // just in case
        let scale = if self.current_spawn_cycle == 0 {
            1.0
        } else {
            self.current_spawn_cycle as f64
        };
        (30.0 / (scale - 0.75)) + 3.0
    }

    /// BotController.popBot - removes the latest bot spawned.
    /// Returns the removed bot's player id.
    pub fn pop_bot(&mut self, model: &mut Model) -> Option<u32> {
        let bot = self.bots.pop()?;
        let player_id = bot.player_id;

        // remove from model
        model.remove_player(player_id);

        crate::zlog!("Removed top bot: {} {}", player_id, bot.name);

        Some(player_id)
    }

    /// BotController.removeBot
    pub fn remove_bot(&mut self, id: u32, model: &mut Model) {
        if let Some(pos) = self.bots.iter().position(|b| b.player_id == id) {
            let bot = self.bots.remove(pos);
            // remove from model (may have already been removed but this won't hurt)
            model.remove_player(bot.player_id);
            crate::zlog!("Removed bot: {} {}", bot.player_id, bot.name);
        }
    }

    pub fn has_bots(&self) -> bool {
        !self.bots.is_empty()
    }

    /// BotController.update - move all bots.
    pub fn update(&mut self, cfg: &Config, model: &mut Model, rng: &mut impl Rng) {
        let bot_ids: Vec<u32> = self.bots.iter().map(|b| b.player_id).collect();

        for bot_id in bot_ids {
            let meta_idx = match self.bots.iter().position(|b| b.player_id == bot_id) {
                Some(i) => i,
                None => continue,
            };
            let player_idx = match model.get_player_index_by_id(bot_id) {
                Some(i) => i,
                None => continue,
            };

            let movement = self.bots[meta_idx].movement;
            match movement {
                BotMovement::Hold => {
                    let player = &mut model.players[player_idx];
                    let pos = player.sphere.position;
                    let scale = player.sphere.scale;
                    let time = now_ms();
                    player.sphere.push_recent_position(
                        cfg,
                        crate::model::RecentPosition { position: pos, radius: scale, time },
                    );
                }
                BotMovement::Chase => {
                    // Decrement chase duration
                    let chase_player_id = self.bots[meta_idx].chase_player_id;
                    if chase_player_id.is_none() {
                        continue; // no valid chase target set
                    }

                    self.bots[meta_idx].chase_time -= cfg.tick_fast_interval as i64;
                    if self.bots[meta_idx].chase_time <= 0 {
                        self.set_chase_target(cfg, meta_idx, model, rng, None);
                    }

                    // Look up the (live) chase position from the model
                    let chase_player_id = match self.bots[meta_idx].chase_player_id {
                        Some(id) => id,
                        None => continue,
                    };
                    let target_pos = model
                        .get_player_index_by_id(chase_player_id)
                        .map(|i| model.players[i].sphere.position);

                    if let Some(chase_position) = target_pos {
                        // Chaser bot moves slower otherwise it's really mean
                        move_toward_point(cfg, &mut model.players[player_idx], chase_position, 0.5);
                    }
                }
                BotMovement::RandomPoint => {
                    let player = &mut model.players[player_idx];
                    if self.bots[meta_idx].move_to_point.is_none() {
                        self.bots[meta_idx].move_to_point =
                            Some(crate::util::random_world_position(cfg, 1.0));
                    }
                    let target = self.bots[meta_idx].move_to_point.unwrap();

                    let dist = player.sphere.position.distance_to(&target);
                    if dist < 5.0 {
                        // reached point, generate a new one
                        self.bots[meta_idx].move_to_point =
                            Some(crate::util::random_world_position(cfg, 1.0));
                    }

                    let target = self.bots[meta_idx].move_to_point.unwrap();
                    move_toward_point(cfg, player, target, 1.0);
                }
                BotMovement::Curve => {
                    let curve_len = self.bots[meta_idx].curve_points.len();
                    if curve_len == 0 {
                        continue;
                    }

                    // Check the distance to the next point
                    let next_idx = self.bots[meta_idx].next_curve_point.min(curve_len - 1);
                    let next_point = self.bots[meta_idx].curve_points[next_idx];
                    let player = &mut model.players[player_idx];

                    if player.sphere.position.distance_to(&next_point) < 5.0 {
                        // reached the point, go to next
                        let npc = self.bots[meta_idx].next_curve_point + 1;
                        self.bots[meta_idx].next_curve_point = if npc >= curve_len { 1 } else { npc };
                    }

                    let next_idx = self.bots[meta_idx].next_curve_point.min(curve_len - 1);
                    let next_point = self.bots[meta_idx].curve_points[next_idx];
                    move_toward_point(cfg, player, next_point, 1.0);
                }
            }
        }
    }

    /// Bot.setChaseTarget - pick a new random chase target.
    pub fn set_chase_target(
        &mut self,
        cfg: &Config,
        meta_idx: usize,
        model: &Model,
        rng: &mut impl Rng,
        player_id: Option<u32>,
    ) {
        if self.bots[meta_idx].movement != BotMovement::Chase {
            return;
        }

        // Set a timeout to pick a new chase target
        self.bots[meta_idx].chase_time = get_random_int_inclusive(
            rng,
            cfg.bot_chase_time_min as i64,
            cfg.bot_chase_time_max as i64,
        );

        let target_player_id = match player_id {
            Some(id) => model.get_player_index_by_id(id).map(|_| id),
            None => {
                // pick a random other player that is not this bot to chase
                let candidates: Vec<u32> = model
                    .players
                    .iter()
                    .filter(|p| p.id != self.bots[meta_idx].player_id)
                    .map(|p| p.id)
                    .collect();
                if candidates.is_empty() {
                    None
                } else {
                    Some(candidates
                        [get_random_int_inclusive(rng, 0, candidates.len() as i64 - 1) as usize])
                }
            }
        };

        match target_player_id {
            Some(id) => {
                self.bots[meta_idx].chase_player_id = Some(id);
                crate::zlog!(
                    "Bot {} set to chase player id {} for {} seconds",
                    self.bots[meta_idx].player_id,
                    id,
                    self.bots[meta_idx].chase_time as f64 / 1000.0
                );
            }
            None => {
                self.bots[meta_idx].chase_player_id = None;
                crate::zlog!("Bot {} no chase target available", self.bots[meta_idx].player_id);
            }
        }
    }

    /// BotController.validateChaseTargets - re-target chase bots whose target
    /// has left the game.
    pub fn validate_chase_targets(&mut self, cfg: &Config, model: &Model, rng: &mut impl Rng) {
        let chase_bots: Vec<usize> = self
            .bots
            .iter()
            .enumerate()
            .filter(|(_, b)| b.movement == BotMovement::Chase)
            .map(|(i, _)| i)
            .collect();

        for i in chase_bots {
            let invalid = match self.bots[i].chase_player_id {
                Some(target_id) => model.get_player_index_by_id(target_id).is_none(),
                None => true,
            };
            if invalid {
                crate::zlog!("Bot {} chase target invalid, setting new target..", self.bots[i].player_id);
                self.set_chase_target(cfg, i, model, rng, None);
            }
        }
    }
}

/// Bot.moveTowardPoint - move a bot's player toward a point.
fn move_toward_point(cfg: &Config, player: &mut Player, point: Vector3, speed_multiplier: f64) {
    let sphere_pos = player.sphere.position;

    // direction toward the point
    let dir = Vector3::new(
        point.x - sphere_pos.x,
        point.y - sphere_pos.y,
        point.z - sphere_pos.z,
    )
    .normalized();

    // convert speed multiplier from fps to tick fast
    let mut speed = player.get_speed(cfg) * (cfg.tick_fast_interval as f64 / (1000.0 / 60.0));
    speed *= speed_multiplier;

    let delta = Vector3::new(dir.x * speed, dir.y * speed, dir.z * speed);

    player.sphere.position = Vector3::new(
        sphere_pos.x + delta.x,
        sphere_pos.y + delta.y,
        sphere_pos.z + delta.z,
    );

    let pos = player.sphere.position;
    let scale = player.sphere.scale;
    let time = now_ms();
    player.sphere.push_recent_position(
        cfg,
        crate::model::RecentPosition { position: pos, radius: scale, time },
    );
}

/// UTIL.randomWanderPath(10, 1.2, 300) - default curve points for a bot when
/// none is provided (Bot.js).
#[allow(dead_code)]
pub fn default_bot_curve(cfg: &Config) -> Vec<Vector3> {
    random_wander_path(cfg, 10, 1.2, 300)
}
