//! Game model: players, player spheres, abilities, metrics, food state.
//! Port of common/zorbio.js (ZOR.Model, ZOR.Player, ZOR.PlayerSphere,
//! ZOR.Metric, ZOR.SpeedBoostAbility) and ServerPlayer.js.

use std::collections::VecDeque;

use rand::Rng;
use uuid::Uuid;

use crate::config::{Config, BotMovement};
use crate::util::{now_ms, push_shift, Vector3};

/// ZOR.PlayerTypes
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum PlayerType {
    Spectator,
    Player,
    Bot,
}

impl PlayerType {
    pub fn from_str(s: &str) -> PlayerType {
        match s {
            "SPECTATOR" => PlayerType::Spectator,
            "BOT" => PlayerType::Bot,
            _ => PlayerType::Player,
        }
    }

    pub fn as_str(&self) -> &'static str {
        match self {
            PlayerType::Spectator => "SPECTATOR",
            PlayerType::Player => "PLAYER",
            PlayerType::Bot => "BOT",
        }
    }
}

/// ZOR.ActorTypes (only PLAYER_SPHERE ever exists server-side)
pub const ACTOR_TYPE_PLAYER_SPHERE: &str = "PLAYER_SPHERE";

/// Static ID generator (ZOR.IdGenerator).  Player IDs start at 1 and increment.
static NEXT_ID: std::sync::atomic::AtomicU32 = std::sync::atomic::AtomicU32::new(0);

pub fn get_next_id() -> u32 {
    NEXT_ID.fetch_add(1, std::sync::atomic::Ordering::SeqCst) + 1
}

/// A recorded recent position (validation rewind).
#[derive(Debug, Clone, Copy)]
pub struct RecentPosition {
    pub position: Vector3,
    pub radius: f64,
    pub time: u64,
}

/// ZOR.Metric - rolling series of client reported values.
#[derive(Debug, Clone)]
pub struct Metric {
    pub threshold: f64,
    pub reverse_threshold: bool,
    pub last_time: u64,
    pub series: VecDeque<f64>,
    pub mean: f64,
    pub max: f64,
    pub min: f64,
    pub last: f64,
    pub threshold_exceeded_count: u32,
}

impl Metric {
    pub fn new(threshold: f64) -> Self {
        Metric {
            threshold,
            reverse_threshold: false,
            last_time: now_ms(),
            series: VecDeque::new(),
            mean: 0.0,
            max: 0.0,
            min: 0.0,
            last: 0.0,
            threshold_exceeded_count: 0,
        }
    }

    pub fn new_reverse(threshold: f64) -> Self {
        let mut m = Metric::new(threshold);
        m.reverse_threshold = true;
        m
    }

    pub fn add(&mut self, cfg: &Config, value: f64) {
        push_shift(&mut self.series, value, cfg.recent_client_data_length);

        self.last = value;

        let sum: f64 = self.series.iter().sum();
        let count = self.series.len().max(1) as f64;
        // super fast way to truncate decimals (JS Math.round(x*1000)/1000)
        self.mean = ((sum / count) * 1000.0).round() / 1000.0;
        self.max = self.series.iter().cloned().fold(f64::MIN, f64::max);
        self.min = self.series.iter().cloned().fold(f64::MAX, f64::min);

        if self.reverse_threshold {
            if value < self.threshold {
                self.threshold_exceeded_count += 1;
            }
        } else if value > self.threshold {
            self.threshold_exceeded_count += 1;
        }
    }

    pub fn to_json(&self) -> serde_json::Value {
        serde_json::json!({
            "threshold": self.threshold,
            "reverse_threshold": self.reverse_threshold,
            "last_time": self.last_time,
            "series": self.series.iter().collect::<Vec<_>>(),
            "mean": self.mean,
            "max": self.max,
            "min": self.min,
            "last": self.last,
            "threshold_exceeded_count": self.threshold_exceeded_count,
        })
    }
}

/// Events fired by the speed boost ability (ServerPlayer.js listeners).
#[derive(Debug, Clone, Copy, PartialEq)]
#[allow(dead_code)]
pub enum AbilityEvent {
    Activated,
    Deactivated,
    Updated,
}

/// ZOR.SpeedBoostAbility
#[derive(Debug, Clone)]
pub struct SpeedBoostAbility {
    pub active: bool,
    pub min_scale: f64,
    /// how long the ability has been active (ms)
    pub active_duration: u64,
    pub start_time: Option<u64>,
    /// how long before the ability starts cooling down
    pub cooldown_delay: u64,
}

impl SpeedBoostAbility {
    pub fn new(cfg: &Config) -> Self {
        SpeedBoostAbility {
            active: false,
            min_scale: cfg.ability_speed_boost_min_scale,
            active_duration: 0,
            start_time: None,
            cooldown_delay: 0,
        }
    }

    pub fn is_ready(&self, sphere_scale: f64) -> bool {
        !self.active && sphere_scale > self.min_scale
    }

    pub fn is_active(&self) -> bool {
        self.active
    }

    /// Activate. Returns true when activation succeeded.
    pub fn activate(&mut self, cfg: &Config, sphere_scale: f64, now: u64) -> bool {
        if !self.is_ready(sphere_scale) {
            return false;
        }
        self.active = true;
        self.start_time = Some(now - self.active_duration);
        self.cooldown_delay = 1000;
        let _ = cfg;
        true
    }

    pub fn deactivate(&mut self) {
        self.active = false;
        self.start_time = None;
    }

    /// Update ability state. Returns Some(AbilityEvent::Updated) while active
    /// (which triggers the drain penalty in game.rs), mirroring the JS
    /// 'update' event listener.
    pub fn update(&mut self, cfg: &Config, now: u64) -> Option<AbilityEvent> {
        if !self.active {
            if self.cooldown_delay > 0 {
                self.cooldown_delay = self.cooldown_delay.saturating_sub(cfg.tick_fast_interval);
            } else if self.active_duration > 0 {
                // Cool down
                self.active_duration = self
                    .active_duration
                    .saturating_sub(cfg.tick_fast_interval);
            }
            return None;
        }

        if let Some(start) = self.start_time {
            self.active_duration = now.saturating_sub(start);
        }

        Some(AbilityEvent::Updated)
    }
}

/// ZOR.PlayerSphere (an Actor of type PLAYER_SPHERE).  The sphere id always
/// equals the owning player's id.
#[derive(Debug, Clone)]
pub struct PlayerSphere {
    pub id: u32,
    pub player_id: u32,
    pub position: Vector3,
    pub velocity: Vector3,
    pub scale: f64,
    pub expected_scale: f64,
    pub color: u8,
    pub skin: String,
    /// Draining target actor ID
    pub drain_target_id: u32,
    pub speed_boosting: bool,
    pub recent_positions: Vec<RecentPosition>,
}

impl PlayerSphere {
    pub fn new(cfg: &Config, player_id: u32, color: u8, position: Vector3, scale: f64, skin: &str) -> Self {
        let scale = if scale > 0.0 { scale } else { cfg.initial_player_radius };
        PlayerSphere {
            id: player_id,
            player_id,
            position,
            velocity: Vector3::new(0.0, 0.0, 0.0),
            scale,
            expected_scale: scale,
            color,
            skin: skin.to_string(),
            drain_target_id: 0,
            speed_boosting: false,
            recent_positions: Vec::new(),
        }
    }

    /// Returns the radius of the player sphere in terms of the sphere scale.
    pub fn radius(&self) -> f64 {
        self.scale
    }

    /// Grow the sphere an expected amount.  Returns the increase delta.
    pub fn grow_expected(&mut self, cfg: &Config, amount: f64) -> f64 {
        self.expected_scale += amount;

        if self.expected_scale > cfg.max_player_radius {
            self.expected_scale = cfg.max_player_radius;
        } else if self.expected_scale < cfg.initial_player_radius {
            self.expected_scale = cfg.initial_player_radius;
        }

        let increase_delta = (self.expected_scale - self.scale).max(0.0);

        self.scale = self.expected_scale;

        increase_delta
    }

    /// ZOR.Actor.pushRecentPosition - only push newer positions, cap the window.
    pub fn push_recent_position(&mut self, cfg: &Config, position: RecentPosition) {
        if self.recent_positions.is_empty() {
            self.recent_positions.push(position);
        } else {
            let latest_time = self.recent_positions[self.recent_positions.len() - 1].time;
            if position.time > latest_time {
                self.recent_positions.push(position);
                while self.recent_positions.len() > cfg.player_positions_window {
                    self.recent_positions.remove(0); // remove the oldest position
                }
            }
        }
    }

    /// JSON serialization of the full sphere (used for player_join and the
    /// /api/games/:id/actors endpoint, mirrors JSON.stringify of the JS object).
    pub fn to_json(&self) -> serde_json::Value {
        serde_json::json!({
            "id": self.id,
            "position": {"x": self.position.x, "y": self.position.y, "z": self.position.z},
            "velocity": {"x": self.velocity.x, "y": self.velocity.y, "z": self.velocity.z},
            "scale": self.scale,
            "expectedScale": self.expected_scale,
            "type": ACTOR_TYPE_PLAYER_SPHERE,
            "color": self.color,
            "skin": self.skin,
            "drain_target_id": self.drain_target_id,
            "speed_boosting": self.speed_boosting,
            "playerId": self.player_id,
            "recentPositions": self.recent_positions.iter().map(|rp| serde_json::json!({
                "position": {"x": rp.position.x, "y": rp.position.y, "z": rp.position.z},
                "radius": rp.radius,
                "time": rp.time,
            })).collect::<Vec<_>>(),
        })
    }
}

/// ZOR.Player
#[derive(Debug, Clone)]
pub struct Player {
    pub id: u32,
    pub name: String,
    pub player_type: PlayerType,
    pub created_time: u64,
    pub last_heartbeat: u64,
    pub sphere: PlayerSphere,
    pub speed_boost: SpeedBoostAbility,

    // stats
    pub score: f64,
    pub food_captures: u32,
    pub player_captures: u32,
    pub drain_amount: f64,
    pub spawn_time: u64,
    pub death_time: u64,

    // infractions
    pub infractions_food: u32,
    pub infractions_pcap: u32,
    pub infractions_scale: u32,
    pub infractions_speed: Vec<i64>,
    pub infractions_speed_burst: u32,
    pub active_speed_burst_detected: bool,

    // client metrics
    pub ping_metric: Metric,
    pub fps_metric: Metric,
    pub pp_send_metric: Metric,
    pub pp_receive_metric: Metric,
    pub au_receive_metric: Metric,
    pub buffered_amount_metric: Metric,

    // server bookkeeping (ServerPlayer)
    pub headers: String,
    pub socket_uuid: Option<Uuid>,
}

impl Player {
    pub fn new(
        cfg: &Config,
        id: u32,
        name: &str,
        color: u8,
        player_type: PlayerType,
        position: Vector3,
        scale: f64,
        skin: &str,
    ) -> Self {
        let now = now_ms();
        let sphere = PlayerSphere::new(cfg, id, color, position, scale, skin);
        Player {
            id,
            name: name.to_string(),
            player_type,
            created_time: now,
            last_heartbeat: now,
            sphere,
            speed_boost: SpeedBoostAbility::new(cfg),
            // ZOR.Player: this.score = this.sphere.scale
            score: 0.0,
            food_captures: 0,
            player_captures: 0,
            drain_amount: 0.0,
            spawn_time: 0,
            death_time: 0,
            infractions_food: 0,
            infractions_pcap: 0,
            infractions_scale: 0,
            infractions_speed: Vec::new(),
            infractions_speed_burst: 0,
            active_speed_burst_detected: false,
            ping_metric: Metric::new(100.0),
            fps_metric: Metric::new_reverse(20.0),
            pp_send_metric: Metric::new(200.0),
            pp_receive_metric: Metric::new(200.0),
            au_receive_metric: Metric::new(200.0),
            buffered_amount_metric: Metric::new(320.0),
            headers: String::new(),
            socket_uuid: None,
        }
        .with_initial_score()
    }

    fn with_initial_score(mut self) -> Self {
        self.score = self.sphere.scale;
        self
    }

    /// ZOR.Player.prototype.getScore
    pub fn get_score(&self) -> u64 {
        Config::get_padded_int(self.score)
    }

    /// ZOR.Player.prototype.getSpeed
    pub fn get_speed(&self, cfg: &Config) -> f64 {
        let mut player_speed = cfg.player_get_speed(self.sphere.scale);

        if self.name == "PAUL LYONS" && self.sphere.skin == "lyons" {
            player_speed = 4.0;
        }

        if self.speed_boost.is_active() {
            player_speed *= cfg.ability_speed_boost_multiplier;
        }

        player_speed
    }

    /// ZOR.Player.prototype.getCaptureRange
    pub fn get_capture_range(&self, cfg: &Config) -> f64 {
        (self.get_speed(cfg) * 3.0) + (self.sphere.scale * 2.0) + 10.0
    }

    /// Reduced player (player schema) as JSON - used by player_join broadcast.
    /// Mirrors JSON.stringify(currentPlayer) closely enough for the client,
    /// which only reads id/name/type/sphere.{color,position,scale,velocity,skin}.
    pub fn to_join_json(&self) -> serde_json::Value {
        serde_json::json!({
            "id": self.id,
            "name": self.name,
            "type": self.player_type.as_str(),
            "createdTime": self.created_time,
            "lastHeartbeat": self.last_heartbeat,
            "sphere": self.sphere.to_json(),
            "abilities": {
                "speed_boost": {
                    "active": self.speed_boost.active,
                    "min_scale": self.speed_boost.min_scale,
                    "active_duration": self.speed_boost.active_duration,
                    "cooldown_delay": self.speed_boost.cooldown_delay,
                },
            },
            "score": self.score,
            "foodCaptures": self.food_captures,
            "playerCaptures": self.player_captures,
            "drainAmount": self.drain_amount,
            "spawnTime": self.spawn_time,
            "deathTime": self.death_time,
            "infractions_food": self.infractions_food,
            "infractions_pcap": self.infractions_pcap,
            "infractions_scale": self.infractions_scale,
            "infractions_speed": self.infractions_speed,
            "infractions_speed_burst": self.infractions_speed_burst,
            "ping_metric": self.ping_metric.to_json(),
            "fps_metric": self.fps_metric.to_json(),
            "pp_send_metric": self.pp_send_metric.to_json(),
            "pp_receive_metric": self.pp_receive_metric.to_json(),
            "au_receive_metric": self.au_receive_metric.to_json(),
            "buffered_amount_metric": self.buffered_amount_metric.to_json(),
            "headers": self.headers,
            "socket_uuid": self.socket_uuid.map(|u| u.to_string()),
        })
    }
}

/// Leader entry for the slow tick (leader schema: {player_id, score}).
#[derive(Debug, Clone, Copy)]
pub struct Leader {
    pub player_id: u32,
    pub score: u64,
}

/// ZOR.Model.  Server-side the actors array only ever contains player spheres
/// (actor.id == player.id), so players are the single source of truth here.
#[derive(Debug, Clone)]
pub struct Model {
    pub players: Vec<Player>,
    pub leaders: Vec<Leader>,
    pub world_size: Vector3,
    pub food_density: u32,
    pub food_count: usize,
    /// Food positions, 3 int16 (x, y, z) per food particle.
    pub food: Vec<i16>,
    /// Per-food respawn timers (ms remaining), server only.
    pub food_respawning: Vec<u32>,
    /// Indexes currently respawning.
    pub food_respawning_indexes: Vec<u32>,
    /// Food captured this tick, sent to clients then cleared.
    pub food_captured_queue: Vec<u32>,
    /// Food ready to respawn, sent to clients then cleared.
    pub food_respawn_ready_queue: Vec<u32>,
}

impl Model {
    pub fn new(cfg: &Config, rng: &mut impl Rng) -> Self {
        let world_size = cfg.world_size;
        let food_density = cfg.food_density;

        let mut model = Model {
            players: Vec::new(),
            leaders: Vec::new(),
            world_size: Vector3::new(world_size, world_size, world_size),
            food_density,
            food_count: 0,
            food: Vec::new(),
            food_respawning: Vec::new(),
            food_respawning_indexes: Vec::new(),
            food_captured_queue: Vec::new(),
            food_respawn_ready_queue: Vec::new(),
        };

        if food_density > 0 {
            model.init_food(cfg, rng);
        }

        model
    }

    fn init_food(&mut self, cfg: &Config, rng: &mut impl Rng) {
        self.food_count = (self.food_density as usize - 1).pow(3);
        self.food_respawning = vec![0u32; self.food_count];
        self.food_respawning_indexes = Vec::new();
        self.food_captured_queue = Vec::new();
        self.food_respawn_ready_queue = Vec::new();
        self.food = crate::food::generate_food_map(
            &cfg.food_map_type,
            self.food_count,
            self.food_density,
            cfg,
            rng,
        );
    }

    pub fn get_player_index_by_id(&self, id: u32) -> Option<usize> {
        self.players.iter().position(|p| p.id == id)
    }

    /// ZOR.Model.getActorById - actor id == player id.
    pub fn get_player_index_by_actor_id(&self, actor_id: u32) -> Option<usize> {
        self.players.iter().position(|p| p.sphere.id == actor_id)
    }

    /// ZOR.Model.getRealPlayers
    pub fn get_real_player_indexes(&self) -> Vec<usize> {
        self.players
            .iter()
            .enumerate()
            .filter(|(_, p)| p.player_type == PlayerType::Player)
            .map(|(i, _)| i)
            .collect()
    }

    /// ZOR.Model.addPlayer
    pub fn add_player(&mut self, player: Player, replace: bool) {
        if self.get_player_index_by_id(player.id).is_some() {
            if !replace {
                return; // already there and don't replace
            }
            self.remove_player(player.id);
        }

        self.players.push(player);
    }

    /// ZOR.Model.removePlayer
    pub fn remove_player(&mut self, id: u32) {
        if let Some(idx) = self.get_player_index_by_id(id) {
            self.players.remove(idx);
        }
    }

    /// ZOR.Model.findNearestPlayerSphere - returns (dist, sphere_scale) of the
    /// nearest player where dist = distance / 3.
    fn find_nearest_player_sphere(&self, position: Vector3) -> (f64, Option<f64>) {
        let mut nearest_dist = self.world_size.x; // config.WORLD_SIZE
        let mut nearest_scale: Option<f64> = None;

        for player in &self.players {
            let distance = position.distance_to(&player.sphere.position);
            let min_distance = distance / 3.0;

            if min_distance < nearest_dist {
                nearest_dist = min_distance;
                nearest_scale = Some(player.sphere.scale);
            }
        }

        (nearest_dist, nearest_scale)
    }

    /// ZOR.Model.isSafeSpawnPosition
    fn is_safe_spawn_position(nearest_dist: f64, nearest_scale: Option<f64>, cfg: &Config) -> bool {
        match nearest_scale {
            Some(scale) => !(nearest_dist < scale * 2.0 && scale > cfg.initial_player_radius),
            None => true,
        }
    }

    /// ZOR.Model.getSafeSpawnPosition
    pub fn get_safe_spawn_position(&self, cfg: &Config, _rng: &mut impl Rng, num_tries: usize) -> Vector3 {
        let mut position = crate::util::random_horizontal_position(cfg);

        if !self.players.is_empty() {
            let mut tried_positions: Vec<(Vector3, f64)> = Vec::new();

            for _ in 0..num_tries {
                let (nearest_dist, nearest_scale) = self.find_nearest_player_sphere(position);

                if Self::is_safe_spawn_position(nearest_dist, nearest_scale, cfg) {
                    return position; // safe dist from everyone, use this position
                } else {
                    // too close to a player try a new one
                    tried_positions.push((position, nearest_dist));
                    position = crate::util::random_horizontal_position(cfg);
                }
            }

            // couldn't find a safe position in the number of tries so return
            // the one that was farthest away
            tried_positions.sort_by(|a, b| a.1.partial_cmp(&b.1).unwrap_or(std::cmp::Ordering::Equal));
            if let Some(last) = tried_positions.last() {
                position = last.0;
            }
        }

        position
    }

    /// Count players of a given type (used by the API).
    pub fn get_player_count(&self, player_type: PlayerType) -> usize {
        self.players
            .iter()
            .filter(|p| p.player_type == player_type)
            .count()
    }

    /// Food model info for the /api/games/:id/food endpoint.
    pub fn food_model_json(&self) -> serde_json::Value {
        serde_json::json!({
            "foodDensity": self.food_density,
            "foodCount": self.food_count,
            "food_respawning_indexes": self.food_respawning_indexes,
            "food_respawn_ready_queue": self.food_respawn_ready_queue,
        })
    }
}

/// Default bot skin pool (Bot.js).  Duplicated entries weight the selection.
pub const BOT_SKINS: [&str; 10] = [
    "default", "default", "default", "default", "neptune", "earth", "venus", "jupiter", "boing",
    "mars",
];

/// Unused import silencer for BotMovement (referenced by bots.rs).
#[allow(dead_code)]
pub type BotMovementType = BotMovement;
