//! One game instance (AppServer). Port of server/AppServer.js.
//!
//! Each instance runs as its own tokio task that owns all game state - the
//! same serialization the original single-threaded Node event loop provided.
//! Websocket connections talk to the instance through an mpsc channel;
//! outbound messages flow through per-connection unbounded senders.

use std::collections::HashMap;
use std::sync::Arc;
use std::time::{Duration, Instant};

use axum::extract::ws::Message;
use rand::SeedableRng;
use axum::body::Bytes;
use tokio::sync::{mpsc, oneshot};
use uuid::Uuid;

use crate::backend::SharedBackend;
use crate::bots::BotController;
use crate::config::{Config, SKIN_CATALOG};
use crate::drain;
use crate::model::{get_next_id, Leader, Model, Player, PlayerType};
use crate::protocol::{self, ClientTextMsg, LeaderboardLeader};
use crate::util::{now_ms, Vector3};
use crate::validators::{self, ErrorCode, MovementValidator};

/// Handle for talking to a running game instance.
#[derive(Clone)]
pub struct GameInstanceHandle {
    pub id: usize,
    tx: mpsc::UnboundedSender<InstanceMsg>,
}

impl GameInstanceHandle {
    /// Spawn a new game instance task.
    pub fn spawn(
        cfg: Arc<Config>,
        id: usize,
        server_label: &str,
        port: u16,
        backend: SharedBackend,
    ) -> GameInstanceHandle {
        let (tx, rx) = mpsc::unbounded_channel();
        let handle = GameInstanceHandle { id, tx: tx.clone() };

        let instance = GameInstance {
            cfg: cfg.clone(),
            id,
            uuid: format!("{}:{}-{}", server_label, port, id),
            tx,
            model: Model::new(&cfg, &mut rand::rngs::SmallRng::from_entropy()),
            bot_controller: BotController::new(),
            movement_validator: MovementValidator::new(&cfg),
            clients: HashMap::new(),
            states: HashMap::new(),
            socket_uuid_map: HashMap::new(),
            server_msg: String::new(),
            backend,
            leaders_1_day: Vec::new(),
            leaders_7_day: Vec::new(),
            leaders_30_day: Vec::new(),
            au_send_metric: (now_ms(), 0, 0),
            status_tick_counter: 0,
            rng: rand::rngs::SmallRng::from_entropy(),
        };

        tokio::spawn(instance.run(rx));
        handle
    }

    pub fn send(&self, msg: InstanceMsg) {
        let _ = self.tx.send(msg);
    }

    pub async fn stats(&self) -> Option<InstanceStats> {
        let (reply, rx) = oneshot::channel();
        self.tx.send(InstanceMsg::Stats { reply }).ok()?;
        rx.await.ok()
    }

    pub async fn snapshot(&self) -> Option<serde_json::Value> {
        let (reply, rx) = oneshot::channel();
        self.tx.send(InstanceMsg::Snapshot { reply }).ok()?;
        rx.await.ok()
    }

    #[allow(dead_code)]
    pub fn is_alive(&self) -> bool {
        !self.tx.is_closed()
    }
}

#[derive(Debug, Clone)]
pub struct InstanceStats {
    pub id: usize,
    pub clients: usize,
    pub players: usize,
    pub bots: usize,
}

#[allow(dead_code)]
pub enum InstanceMsg {
    Connected {
        uuid: Uuid,
        out: mpsc::UnboundedSender<Message>,
        /// Aborts the connection pump task; lets the instance reclaim a
        /// connection immediately (e.g. heartbeat-timeout kicks of peers that
        /// vanished without a TCP FIN/RST) instead of waiting for the OS to
        /// give up on a half-open socket.
        abort: tokio::task::AbortHandle,
        headers: String,
        nb_srv_id: String,
    },
    Disconnected {
        uuid: Uuid,
    },
    Text {
        uuid: Uuid,
        text: String,
    },
    Binary {
        uuid: Uuid,
        data: Vec<u8>,
    },
    /// Fired ~200ms after player_ready (the playerJoinDelay setTimeout).
    JoinDelay {
        uuid: Uuid,
    },
    /// Backstop hard-close for connections that ignore the graceful close
    /// (peers with a permanently full TCP send buffer).
    ForceDisconnect {
        uuid: Uuid,
    },
    Stats {
        reply: oneshot::Sender<InstanceStats>,
    },
    Snapshot {
        reply: oneshot::Sender<serde_json::Value>,
    },
    SetServerMessage {
        msg: String,
    },
}

struct ClientHandle {
    out: mpsc::UnboundedSender<Message>,
    abort: tokio::task::AbortHandle,
}

/// Properties captured from the enter_game message (closure variables in Node).
#[derive(Debug, Clone)]
struct EnterProps {
    player_type: String,
    name: String,
    color: u8,
    skin: String,
}

/// Per-connection state (the closure variables of ws.on('message') in Node).
struct ClientState {
    player_id: Option<u32>,
    /// The player between enter_game/respawn and the delayed join (lives in
    /// the closure in Node; once joined it is moved into the model).
    pending_player: Option<Player>,
    enter_props: Option<EnterProps>,
    headers: String,
    not_in_model_count: u32,
}

pub struct GameInstance {
    cfg: Arc<Config>,
    id: usize,
    uuid: String,

    /// self channel for scheduling delayed work (player join delay)
    tx: mpsc::UnboundedSender<InstanceMsg>,

    model: Model,
    bot_controller: BotController,
    movement_validator: MovementValidator,

    /// socket uuid -> outbound sender
    clients: HashMap<Uuid, ClientHandle>,
    /// socket uuid -> per-connection state
    states: HashMap<Uuid, ClientState>,
    /// player id -> socket uuid
    socket_uuid_map: HashMap<u32, Uuid>,

    server_msg: String,

    backend: SharedBackend,
    leaders_1_day: Vec<LeaderboardLeader>,
    leaders_7_day: Vec<LeaderboardLeader>,
    leaders_30_day: Vec<LeaderboardLeader>,

    au_send_metric: (u64, u64, u64), // (last_time, count, threshold-exceeded)
    status_tick_counter: u64,
    rng: rand::rngs::SmallRng,
}

impl GameInstance {

    fn log(&self, msg: &str) {
        crate::zlog!("[{}] {}", self.id, msg);
    }

    async fn run(mut self, mut rx: mpsc::UnboundedReceiver<InstanceMsg>) {
        self.log(&format!("Creating game instance with ID: {}", self.id));

        let fast_period = Duration::from_millis(self.cfg.tick_fast_interval);
        let slow_period = Duration::from_millis(self.cfg.tick_slow_interval);
        let lb_period = Duration::from_millis(self.cfg.leaderboard_refresh_interval);

        let mut fast_tick = tokio::time::interval(fast_period);
        fast_tick.set_missed_tick_behavior(tokio::time::MissedTickBehavior::Delay);
        let mut slow_tick = tokio::time::interval(slow_period);
        slow_tick.set_missed_tick_behavior(tokio::time::MissedTickBehavior::Delay);
        let mut lb_tick = tokio::time::interval(lb_period);
        lb_tick.set_missed_tick_behavior(tokio::time::MissedTickBehavior::Delay);

        // Spawn bots (AppServer constructor)
        for _ in 0..self.cfg.max_bots {
            self.bot_controller.spawn_bot(&self.cfg, &mut self.model, &mut self.rng);
        }

        // Load leaderboards on server start up
        self.refresh_leaderboards();

        loop {
            tokio::select! {
                maybe = rx.recv() => {
                    match maybe {
                        Some(msg) => self.handle_msg(msg).await,
                        None => break,
                    }
                }
                _ = fast_tick.tick() => self.server_tick_fast(),
                _ = slow_tick.tick() => self.server_tick_slow(),
                _ = lb_tick.tick() => self.refresh_leaderboards(),
            }
        }
    }

    // -----------------------------------------------------------------
    // messaging helpers
    // -----------------------------------------------------------------

    fn broadcast_binary(&self, data: Vec<u8>) {
        let msg = Message::Binary(Bytes::from(data));
        for handle in self.clients.values() {
            let _ = handle.out.send(msg.clone());
        }
    }

    fn broadcast_text(&self, text: &str) {
        let msg = Message::Text(String::from(text).into());
        for handle in self.clients.values() {
            let _ = handle.out.send(msg.clone());
        }
    }

    fn send_text_to_socket(&self, uuid: &Uuid, text: impl Into<String>) {
        if let Some(handle) = self.clients.get(uuid) {
            let _ = handle.out.send(Message::Text(text.into().into()));
        }
    }

    fn send_binary_to_socket(&self, uuid: &Uuid, data: Vec<u8>) {
        if let Some(handle) = self.clients.get(uuid) {
            let _ = handle.out.send(Message::Binary(Bytes::from(data)));
        }
    }

    /// AppServer.sendToPlayer
    fn send_text_to_player(&self, player_id: u32, text: impl Into<String>) {
        if let Some(uuid) = self.socket_uuid_map.get(&player_id) {
            self.send_text_to_socket(uuid, text);
        }
    }

    fn send_binary_to_player(&self, player_id: u32, data: Vec<u8>) {
        if let Some(uuid) = self.socket_uuid_map.get(&player_id) {
            self.send_binary_to_socket(uuid, data);
        }
    }

    fn get_client_count(&self) -> usize {
        self.clients.len()
    }

    #[allow(dead_code)]
    fn is_full(&self) -> bool {
        self.get_client_count() >= self.cfg.max_players_per_instance
    }

    // -----------------------------------------------------------------
    // message handling
    // -----------------------------------------------------------------

    async fn handle_msg(&mut self, msg: InstanceMsg) {
        match msg {
            InstanceMsg::Connected { uuid, out, abort, headers, nb_srv_id } => {
                self.handle_connected(uuid, out, abort, headers, nb_srv_id);
            }
            InstanceMsg::Disconnected { uuid } => {
                self.handle_close(uuid);
            }
            InstanceMsg::Text { uuid, text } => {
                self.handle_text(uuid, text);
            }
            InstanceMsg::Binary { uuid, data } => {
                self.handle_binary(uuid, data);
            }
            InstanceMsg::JoinDelay { uuid } => {
                self.handle_join_delay(uuid);
            }
            InstanceMsg::ForceDisconnect { uuid } => {
                self.force_disconnect(uuid);
            }
            InstanceMsg::Stats { reply } => {
                let _ = reply.send(InstanceStats {
                    id: self.id,
                    clients: self.get_client_count(),
                    players: self.model.get_player_count(PlayerType::Player),
                    bots: self.model.get_player_count(PlayerType::Bot),
                });
            }
            InstanceMsg::Snapshot { reply } => {
                let _ = reply.send(self.snapshot_json());
            }
            InstanceMsg::SetServerMessage { msg } => {
                self.log(&format!("Setting server message: {}", msg));
                self.server_msg = msg;
            }
        }
    }

    /// AppServer.addClient
    fn handle_connected(
        &mut self,
        uuid: Uuid,
        out: mpsc::UnboundedSender<Message>,
        abort: tokio::task::AbortHandle,
        headers: String,
        nb_srv_id: String,
    ) {
        self.log(&format!("Client connection headers: {}", headers));
        self.log(&format!("Socket UUID: {}", uuid));

        self.clients.insert(uuid, ClientHandle { out, abort });
        self.states.insert(
            uuid,
            ClientState {
                player_id: None,
                pending_player: None,
                enter_props: None,
                headers: headers.clone(),
                not_in_model_count: 0,
            },
        );

        self.send_init_game(uuid, &nb_srv_id);
    }

    /// AppServer.sendInitGame
    fn send_init_game(&self, uuid: Uuid, nb_srv_id: &str) {
        let buffer = protocol::encode_init_game(nb_srv_id, &self.model);
        self.send_binary_to_socket(&uuid, buffer);
    }

    /// AppServer.sendLeaderboardsUpdate
    fn send_leaderboards_update(&self, uuid: &Uuid) {
        let buffer = protocol::encode_leaderboards_update(
            &self.leaders_1_day,
            &self.leaders_7_day,
            &self.leaders_30_day,
        );
        crate::zlog!("Sending leaderboards update");
        self.send_binary_to_socket(uuid, buffer);
    }

    fn handle_text(&mut self, uuid: Uuid, text: String) {
        let msg = match protocol::parse_client_text(&text) {
            Some(m) => m,
            None => return, // ignore unparseable / unknown ops (JSON parse errors are ignored in Node too)
        };

        match msg {
            ClientTextMsg::EnterGame { player_type, name, color, skin, key } => {
                self.handle_enter_game(uuid, player_type, name, color, skin, key);
            }
            ClientTextMsg::Respawn => {
                self.handle_respawn(uuid);
            }
            ClientTextMsg::PlayerReady => {
                self.handle_player_ready(uuid);
            }
            ClientTextMsg::ZorPing { last_ping, fps } => {
                self.handle_zor_ping(uuid, last_ping, fps);
            }
            ClientTextMsg::SpeedBoostStart => {
                self.handle_speed_boost_start(uuid);
            }
            ClientTextMsg::SpeedBoostStop => {
                self.handle_speed_boost_stop(uuid);
            }
        }
    }

    /// handle_enter_game
    fn handle_enter_game(&mut self, uuid: Uuid, player_type: String, requested_name: String, color: u8, skin: String, key: String) {
        let player_id = get_next_id();
        let type_ = player_type;
        // custom names are not allowed; the server assigns player_N names from
        // a process-lifetime monotonically increasing counter
        let name = crate::model::next_player_name();
        // validate skin name
        let skin = if SKIN_CATALOG.contains(&skin.as_str()) { skin } else { "default".to_string() };
        let color = color.min(crate::config::COLORS.len() as u8 - 1);

        self.log(&format!(
            "Player enter request: {} {} assigned={} (requested={}) {} {} {}",
            player_id, type_, name, requested_name, color, skin, key
        ));

        if let Some(state) = self.states.get_mut(&uuid) {
            state.player_id = Some(player_id);
            // stash enter-game properties for the respawn handler
            state.enter_props = Some(EnterProps {
                player_type: type_,
                name,
                color,
                skin,
            });
        }

        // spawn the player
        self.handle_respawn(uuid);
    }

    /// handle_msg_respawn
    fn handle_respawn(&mut self, uuid: Uuid) {
        let position = self.model.get_safe_spawn_position(&self.cfg, &mut self.rng, 10);

        let state = match self.states.get(&uuid) {
            Some(s) => s,
            None => return,
        };

        let player_id = match state.player_id {
            Some(id) => id,
            None => return,
        };

        // make sure this player isn't already connected and playing
        if self.is_player_in_game(player_id) {
            self.log("Respawn error: Player is already in game");
            self.kick_player(player_id, "Forced respawn.");
            return;
        }

        let props = match &state.enter_props {
            Some(p) => p.clone(),
            None => return,
        };

        // Create the Player
        let mut current_player = Player::new(
            &self.cfg,
            player_id,
            &props.name,
            props.color,
            PlayerType::from_str(&props.player_type),
            position,
            0.0,
            &props.skin,
        );
        current_player.headers = state.headers.clone();
        current_player.socket_uuid = Some(uuid);

        // See if this is PAUL LYONS
        if props.name == "PAUL LYONS" && props.skin == "lyons" {
            self.log("PAUL LYONS GOD MODE!");
            let big_scale = 70.0;
            current_player.sphere.scale = big_scale;
            current_player.sphere.expected_scale = big_scale;
        }

        // Send welcome message
        let buffer = protocol::encode_welcome(&current_player);
        self.send_binary_to_socket(&uuid, buffer);

        self.log(&format!("User {} spawning into the game", current_player.id));

        if let Some(state) = self.states.get_mut(&uuid) {
            state.pending_player = Some(current_player);
        }
    }

    /// handle_msg_player_ready
    fn handle_player_ready(&mut self, uuid: Uuid) {
        let player_id = match self.states.get(&uuid).and_then(|s| s.player_id) {
            Some(id) => id,
            None => return,
        };
        self.log(&format!("Player {} client ready", player_id));

        // Save mapping of player_id to socket uuid
        self.socket_uuid_map.insert(player_id, uuid);

        // Set initial times
        let now = now_ms();
        if let Some(p) = self.pending_or_model_player_mut(&uuid) {
            p.last_heartbeat = now;
            p.spawn_time = now;
        }

        // Pass any data to the client for final setup
        self.send_text_to_socket(&uuid, protocol::json_game_setup());

        // give the client player time to load the game before notifying other
        // players to add them (200ms playerJoinDelay)
        let tx = self.tx.clone();
        tokio::spawn(async move {
            tokio::time::sleep(Duration::from_millis(200)).await;
            let _ = tx.send(InstanceMsg::JoinDelay { uuid });
        });
    }

    /// handle_msg_zor_ping
    fn handle_zor_ping(&mut self, uuid: Uuid, last_ping: f64, fps: f64) {
        let now = now_ms();
        let cfg = self.cfg.clone();
        if let Some(p) = self.pending_or_model_player_mut(&uuid) {
            p.last_heartbeat = now;

            // save recent pings and fps
            if last_ping >= 0.0 {
                p.ping_metric.add(&cfg, last_ping);
            }
            p.fps_metric.add(&cfg, fps);
        }

        self.send_text_to_socket(&uuid, protocol::json_zor_pong());
    }

    /// handle_msg_speed_boost_start
    fn handle_speed_boost_start(&mut self, uuid: Uuid) {
        let now = now_ms();
        let cfg = self.cfg.clone();
        let mut response = false;

        if let Some(p) = self.pending_or_model_player_mut(&uuid) {
            let scale = p.sphere.scale;
            if p.speed_boost.activate(&cfg, scale, now) {
                p.sphere.speed_boosting = true;
                response = true;
            }
        }

        if response {
            // Tell client to activate speed boost
            self.send_text_to_socket(&uuid, protocol::json_speed_boost_res());
        }
    }

    /// handle_msg_speed_boost_stop
    fn handle_speed_boost_stop(&mut self, uuid: Uuid) {
        if let Some(p) = self.pending_or_model_player_mut(&uuid) {
            p.speed_boost.deactivate();
            p.sphere.speed_boosting = false;
            // 'deactivate' listener: start validating again at the regular speed
            p.sphere.recent_positions.clear();
        }
    }

    /// handle_close
    fn handle_close(&mut self, uuid: Uuid) {
        // Capture the connection state before removing it (the Node closure
        // keeps player_id/currentPlayer alive past socket cleanup).
        let state = self.states.remove(&uuid);

        // removePlayerSocket
        let had_client = self.clients.remove(&uuid).is_some();
        if !had_client {
            return; // already cleaned up
        }
        self.log(&format!("Deleted client socket: {}", uuid));

        let player_id = state.as_ref().and_then(|s| s.player_id);

        match player_id {
            Some(player_id) => {
                self.log(&format!("Player connection closed for player_id: {}", player_id));

                // Save their score to leaderboard if they were in game and got any points
                let in_model = self.model.get_player_index_by_id(player_id).is_some();
                if in_model {
                    if let Some(p) = self.current_model_player(player_id) {
                        let name = p.name.clone();
                        let score = p.get_score();
                        self.save_player_score(&name, score, None);
                    }
                }

                // notify other clients to remove this player
                self.broadcast_text(&protocol::json_remove_player(player_id));

                self.remove_player_from_model(player_id);

                // remove the map of the player id to the socket uuid
                self.socket_uuid_map.remove(&player_id);

                self.replenish_bot();
            }
            None => {
                let headers = state.map(|s| s.headers).unwrap_or_default();
                self.log(&format!("Menu socket connection closed: {}", headers));
            }
        }
    }

    /// handle_binary - dispatch binary websocket frames.
    fn handle_binary(&mut self, uuid: Uuid, data: Vec<u8>) {
        if data.is_empty() {
            return;
        }

        // Read first byte from buffer
        let op = data[0];
        if op == protocol::ops::PLAYER_UPDATE {
            self.handle_msg_player_update(uuid, &data);
        } else if protocol::is_leaderboards_request(&data) {
            self.send_leaderboards_update(&uuid);
        } else if let Some(view) = protocol::parse_client_position_rapid(&data) {
            self.handle_client_position_rapid(view);
        }
    }

    /// handle_client_position_rapid
    fn handle_client_position_rapid(&mut self, view: [f32; 5]) {
        if !self.cfg.enable_rapid_updates {
            return;
        }

        let actor_id = view[1] as u32;
        if let Some(idx) = self.model.get_player_index_by_actor_id(actor_id) {
            self.model.players[idx].sphere.position =
                Vector3::new(view[2] as f64, view[3] as f64, view[4] as f64);
        }
    }

    /// handle_msg_player_update
    fn handle_msg_player_update(&mut self, uuid: Uuid, data: &[u8]) {
        if !self.has_current_player(&uuid) {
            return;
        }

        // record timing
        let now_time = now_ms();
        let (receive_gap, set_last) = {
            let p = match self.pending_or_model_player_ref(&uuid) {
                Some(p) => p,
                None => return,
            };
            let receive_gap = now_time.saturating_sub(p.pp_receive_metric.last_time);
            (receive_gap, p.pp_receive_metric.last_time)
        };
        let _ = set_last;

        // Decode the buffer
        let msg = match protocol::decode_player_update(data) {
            Ok(m) => m,
            Err(e) => {
                if self.cfg.debug {
                    crate::zlog!("[AppServer] error decoding player_update: {}", e);
                }
                return;
            }
        };

        // Save the client metrics + heartbeat
        {
            let cfg = self.cfg.clone();
            if let Some(p) = self.pending_or_model_player_mut(&uuid) {
                p.last_heartbeat = now_time;
                p.pp_receive_metric.last_time = now_time;
                p.pp_send_metric.add(&cfg, msg.pp_gap as f64);
                p.pp_receive_metric.add(&cfg, receive_gap as f64);
                p.au_receive_metric.add(&cfg, msg.au_gap as f64);
                p.buffered_amount_metric.add(&cfg, msg.buffered_mount as f64);
            }
        }

        // Fixes bug #145: the client may send one last position update before
        // they are removed from the game
        let actor_idx = self.model.get_player_index_by_actor_id(msg.sphere_id);

        let err = match actor_idx {
            None => ErrorCode::PlayerNotInModel,
            Some(idx) => {
                // Build the validation object
                let latest = &msg.latest_position;
                let player = &self.model.players[idx];
                self.movement_validator.movement_sampled(
                    &self.cfg,
                    player,
                    latest,
                    Some(&msg.oldest_position),
                )
            }
        };

        if err == ErrorCode::NoError || err == ErrorCode::NoChange {
            let idx = actor_idx.unwrap();
            let cfg = self.cfg.clone();

            // update the players position in the model
            let latest = msg.latest_position.position;
            self.model.players[idx].sphere.position = latest;

            // Recent positions
            let player = &mut self.model.players[idx];
            player.sphere.push_recent_position(&cfg, msg.prev_position_3);
            player.sphere.push_recent_position(&cfg, msg.prev_position_2);
            player.sphere.push_recent_position(&cfg, msg.prev_position_1);
            player.sphere.push_recent_position(&cfg, msg.latest_position);

            // Iterate over pending food captures
            let entries = msg.food_capture_queue.clone();
            let player_id = player.id;
            for food_entry in entries {
                self.food_capture(player_id, food_entry.fi, idx, food_entry.radius);
            }
        } else {
            match err {
                ErrorCode::SpeedTooFast => {
                    self.send_text_to_socket(&uuid, protocol::json_speeding_warning());
                    if let Some(player_idx) = self.model.get_player_index_by_id(
                        self.states.get(&uuid).and_then(|s| s.player_id).unwrap_or(0),
                    ) {
                        self.model.players[player_idx]
                            .infractions_speed
                            .push(self.cfg.infraction_speed_expire);
                    }
                }
                ErrorCode::PlayerNotInModel => {
                    let count = self
                        .states
                        .get_mut(&uuid)
                        .map(|state| {
                            state.not_in_model_count += 1;
                            state.not_in_model_count
                        });
                    if let Some(count) = count {
                        if count > self.cfg.max_not_in_model_errors {
                            self.log(&format!("Player had to many not-in-model errors {}", count));
                            let pid = self
                                .states
                                .get(&uuid)
                                .and_then(|s| s.player_id)
                                .unwrap_or(0);
                            self.kick_player(pid, "Disconnected from server");
                        }
                    }
                    self.log(&format!(
                        "Recieved 'player_update' from player not in model! {}",
                        msg.sphere_id
                    ));
                }
                _ => {}
            }
        }
    }

    /// AppServer.foodCapture
    fn food_capture(&mut self, player_id: u32, fi: u32, actor_idx: usize, orig_radius: f64) {
        let food_value = self.cfg.food_get_value(orig_radius);

        let sphere_position = self.model.players[actor_idx].sphere.position;
        let err = validators::food_capture(&self.cfg, &self.model, fi, &sphere_position, orig_radius);

        if err == ErrorCode::NoError || err == ErrorCode::NoChange {
            if let Some(idx) = self.model.get_player_index_by_id(player_id) {
                let fi_usize = fi as usize;
                if fi_usize < self.model.food_respawning.len() {
                    self.model.food_respawning[fi_usize] = self.cfg.food_respawn_time;
                }

                // Increment the players food captures
                self.model.players[idx].food_captures += 1;

                // grow player and add to their score
                let cfg = self.cfg.clone();
                let growth = self.model.players[idx].sphere.grow_expected(&cfg, food_value);
                self.model.players[idx].score += growth;

                // Queue to notify clients of food capture so they can update their food view
                self.model.food_captured_queue.push(fi);
            }
        } else {
            match err {
                ErrorCode::FoodCaptureTooFar => {
                    // inform client of invalid capture, and make them shrink, mark infraction
                    if let Some(idx) = self.model.get_player_index_by_id(player_id) {
                        self.model.players[idx].infractions_food += 1;
                    }
                }
                ErrorCode::PlayerNotInModel => {
                    self.log(&format!(
                        "Recieved 'foodCapture' from player not in model! {}",
                        self.model.players[actor_idx].sphere.id
                    ));
                }
                _ => {}
            }
        }
    }

    /// The delayed (200ms) join from player_ready.
    fn handle_join_delay(&mut self, uuid: Uuid) {
        let state = match self.states.get_mut(&uuid) {
            Some(s) => s,
            None => return, // socket gone before the delay fired
        };

        let player_id = state.player_id;

        if let Some(player) = state.pending_player.take() {
            // Only join if the socket is still connected (fixes the ghost
            // player the Node server could broadcast after a fast disconnect).
            if !self.clients.contains_key(&uuid) {
                return;
            }

            // Notify other clients that player has joined
            let join_json = protocol::json_player_join(&player);
            self.broadcast_text(&join_json);

            self.log(&format!("Player {} joined game!", player.id));

            // Add the player to the model
            self.model.add_player(player, true);

            let player_count = self.model.players.len();
            self.log(&format!("Total real players: {}", self.model.get_real_player_indexes().len()));

            // see if we need to remove a bot
            if self.bot_controller.has_bots() && player_count > self.cfg.max_bots {
                if let Some(bot_id) = self.bot_controller.pop_bot(&mut self.model) {
                    // notify other players that this bot was removed
                    self.broadcast_text(&protocol::json_remove_player(bot_id));
                }
            }
        } else if let Some(pid) = player_id {
            // double player_ready: re-broadcast the join like Node does
            if let Some(idx) = self.model.get_player_index_by_id(pid) {
                let join_json = protocol::json_player_join(&self.model.players[idx]);
                self.broadcast_text(&join_json);
                self.log(&format!("Player {} joined game!", pid));
            }
        }
    }

    // -----------------------------------------------------------------
    // player helpers
    // -----------------------------------------------------------------

    fn is_player_in_game(&self, player_id: u32) -> bool {
        self.model.get_player_index_by_id(player_id).is_some()
            && self.socket_uuid_map.contains_key(&player_id)
            && self
                .socket_uuid_map
                .get(&player_id)
                .map(|u| self.clients.contains_key(u))
                .unwrap_or(false)
    }

    fn has_current_player(&self, uuid: &Uuid) -> bool {
        match self.states.get(uuid) {
            Some(s) => s.pending_player.is_some() || s.player_id.is_some(),
            None => false,
        }
    }

    /// The "currentPlayer" of a socket: the pending player if it hasn't joined
    /// the model yet, otherwise the player in the model.
    fn pending_or_model_player_mut(&mut self, uuid: &Uuid) -> Option<&mut Player> {
        let player_id = *self.states.get(uuid)?.player_id.as_ref()?;

        if let Some(state) = self.states.get_mut(uuid) {
            if let Some(p) = state.pending_player.as_mut() {
                return Some(p);
            }
        }

        let idx = self.model.get_player_index_by_id(player_id)?;
        Some(&mut self.model.players[idx])
    }

    fn pending_or_model_player_ref(&self, uuid: &Uuid) -> Option<&Player> {
        let player_id = *self.states.get(uuid)?.player_id.as_ref()?;

        if let Some(state) = self.states.get(uuid) {
            if let Some(p) = state.pending_player.as_ref() {
                return Some(p);
            }
        }

        let idx = self.model.get_player_index_by_id(player_id)?;
        Some(&self.model.players[idx])
    }

    fn current_model_player(&self, player_id: u32) -> Option<&Player> {
        let idx = self.model.get_player_index_by_id(player_id)?;
        Some(&self.model.players[idx])
    }

    /// AppServer.kickPlayer
    fn kick_player(&mut self, player_id: u32, reason: &str) {
        self.log(&format!("kicking player: {} {}", player_id, reason));

        // notify player that they are kicked
        self.send_text_to_player(player_id, &protocol::json_kick(reason));

        // notify other clients
        self.broadcast_text(&protocol::json_remove_player(player_id));

        self.remove_player_from_model(player_id);
    }

    /// Hard-close a connection and reclaim all of its session resources
    /// immediately.  Used for heartbeat-timeout kicks where the peer is
    /// presumed dead: aborting the pump task closes the socket fd right away
    /// (even if the pump is parked on a full TCP send buffer of a half-open
    /// connection) instead of waiting for TCP retransmission to fail (~15 min).
    ///
    /// This is a deliberate improvement over the Node server, which left
    /// kicked sockets open until the OS noticed the peer was gone.
    fn force_disconnect(&mut self, uuid: Uuid) {
        if let Some(handle) = self.clients.get(&uuid) {
            handle.abort.abort();
        }
        // run the same teardown a socket-close would have triggered; a
        // late-arriving Disconnected for this uuid is a no-op (idempotent)
        self.handle_close(uuid);
    }

    /// AppServer.removePlayerFromModel
    fn remove_player_from_model(&mut self, player_id: u32) {
        self.model.remove_player(player_id);
        self.log(&format!("Removed player: {}", player_id));
    }    /// AppServer.replenishBot
    fn replenish_bot(&mut self) {
        // bot was captured, lets see if we need to spawn another to replace it
        if self.model.players.len() < self.cfg.max_bots {
            let bot = self.bot_controller.spawn_bot(&self.cfg, &mut self.model, &mut self.rng);

            // Notify other clients that bot has joined
            if let Some(idx) = self.model.get_player_index_by_id(bot.player_id) {
                let join_json = protocol::json_player_join(&self.model.players[idx]);
                self.broadcast_text(&join_json);
            }
        }
    }

    // -----------------------------------------------------------------
    // ticks
    // -----------------------------------------------------------------

    /// serverTickFast - 50ms
    fn server_tick_fast(&mut self) {
        let start = Instant::now();
        self.player_updates();
        self.bot_controller.update(&self.cfg, &mut self.model, &mut self.rng);
        self.update_player_captures();
        self.update_actor_drains();
        self.send_actor_updates();
        self.log_server_status_nth(start);
    }

    /// serverTickSlow - 200ms
    fn server_tick_slow(&mut self) {
        self.check_heartbeats();
        self.update_food_respawns();
        self.players_checks();
        self.send_server_tick_data();
    }

    /// AppServer.playerUpdates - update all player abilities, apply the speed
    /// boost penalty (ServerPlayer 'update' listener).
    fn player_updates(&mut self) {
        let now = now_ms();
        let cfg = self.cfg.clone();

        let mut boost_stop: Vec<u32> = Vec::new();

        for player in &mut self.model.players {
            if let Some(crate::model::AbilityEvent::Updated) = player.speed_boost.update(&cfg, now) {
                // Get active duration in seconds
                let active_duration = player.speed_boost.active_duration as f64 / 1000.0;

                // The longer the player holds speed boost the worse the penalty gets.
                // https://www.desmos.com/calculator/y14fpblqob
                let shrink_amount =
                    cfg.ability_speed_boost_penalty + (active_duration * active_duration) * 0.005;

                // Apply penalty
                player.sphere.grow_expected(&cfg, -shrink_amount);

                if player.sphere.scale <= cfg.initial_player_radius {
                    boost_stop.push(player.id);
                }
            }
        }

        for player_id in boost_stop {
            self.send_text_to_player(player_id, &protocol::json_speed_boost_stop());
        }
    }

    /// AppServer.updateActorDrains
    fn update_actor_drains(&mut self) {
        let drainers = drain::find_all(&self.cfg, &self.model.players);
        let cfg = self.cfg.clone();

        let player_ids: Vec<u32> = self.model.players.iter().map(|p| p.id).collect();

        for player_id in player_ids.into_iter().rev() {
            let i = match self.model.get_player_index_by_id(player_id) {
                Some(i) => i,
                None => continue,
            };

            self.model.players[i].sphere.drain_target_id = 0; // reset

            let drain_target = drainers
                .get(&player_id)
                .and_then(|v| v.first())
                .copied();

            if let Some(target) = drain_target {
                if target.id > 0 {
                    let drainee_id = target.id;
                    self.model.players[i].sphere.drain_target_id = drainee_id;

                    let j = match self.model.get_player_index_by_id(drainee_id) {
                        Some(j) => j,
                        None => continue,
                    };

                    // Bots can't drain each other
                    let both_bots = self.model.players[i].player_type == PlayerType::Bot
                        && self.model.players[j].player_type == PlayerType::Bot;

                    if !both_bots {
                        let (drainer_scale, drainee_scale) = (
                            self.model.players[i].sphere.scale,
                            self.model.players[j].sphere.scale,
                        );

                        let drain_amount =
                            drain::amount(target.dist) * drain::bonus_amount(&cfg, drainer_scale, drainee_scale);

                        let apply = |drainer: &mut Player, drainee: &mut Player| {
                            // Grow the drainer and add to their score
                            let delta = drainer.sphere.grow_expected(&cfg, drain_amount);
                            drainer.score += delta;

                            drainee.sphere.grow_expected(&cfg, -drain_amount);

                            drainer.drain_amount += drain_amount;

                            // if the drain caused the drainer to get bigger than
                            // the drainee, correct so that they're the same size.
                            if drainer.sphere.scale > drainee.sphere.scale {
                                let avg = (drainer.sphere.scale + drainee.sphere.scale) / 2.0;
                                drainer.sphere.scale = avg;
                                drainee.sphere.scale = avg;
                            }
                        };

                        split_borrow_two(&mut self.model.players, i, j, apply);
                    }
                }
            }
        }
    }

    /// AppServer.updatePlayerCaptures - check all pairs of players for captures.
    fn update_player_captures(&mut self) {
        let cfg = self.cfg.clone();

        // Scan phase (immutable)
        let mut captures: Vec<(u32, u32)> = Vec::new();

        let len = self.model.players.len();
        if len < 2 {
            return;
        }

        let mut i = len as i64 - 1;
        while i >= 0 {
            // JS `while (j--)` starting at i+1: the body sees j = i, i-1, ..., 0
            let p1_idx = i as usize;

            for j in (0..=i).rev() {
                if i == j {
                    continue; // don't compare player to itself
                }

                let p2_idx = j as usize;

                // find the distance between these two players
                let distance = self.model.players[p1_idx]
                    .sphere
                    .position
                    .distance_to(&self.model.players[p2_idx].sphere.position);

                // players too far apart for capture checking
                if distance > self.model.players[p1_idx].get_capture_range(&cfg)
                    && distance > self.model.players[p2_idx].get_capture_range(&cfg)
                {
                    continue;
                }

                // Check if player capture should happen between these two players
                if let Some((attacking, target)) = self.check_player_capture(p1_idx, p2_idx) {
                    let target_is_p1 = target == self.model.players[p1_idx].id;
                    captures.push((attacking, target));

                    // p1 got captured so move to the next player
                    if target_is_p1 {
                        break;
                    }
                }
            }
            i -= 1;
        }

        // Apply phase (mutable)
        for (attacking, target) in captures {
            self.capture_player(attacking, target);
        }
    }

    /// AppServer.checkPlayerCapture
    fn check_player_capture(&self, p1_idx: usize, p2_idx: usize) -> Option<(u32, u32)> {
        let p1 = &self.model.players[p1_idx];
        let p2 = &self.model.players[p2_idx];

        let p1_rp = &p1.sphere.recent_positions;
        let p2_rp = &p2.sphere.recent_positions;

        // give brand new players time to load positions
        if p1_rp.len() < 4 || p2_rp.len() < 4 {
            return None;
        }

        let tolerance = self.cfg.player_capture_extra_tolerance;

        for i in p1_rp.len() - 4..p1_rp.len() {
            for j in p2_rp.len() - 4..p2_rp.len() {
                let rp1 = &p1_rp[i];
                let rp2 = &p2_rp[j];

                let distance = rp1.position.distance_to(&rp2.position);

                let p1_scale = rp1.radius;
                let p2_scale = rp2.radius;

                // if distance is less than radius of p1 and p1 larger than p2, p1 captures p2
                // if distance is less than radius of p2 and p2 larger than p1, p2 captures p1
                if distance < (p1_scale + tolerance) && p1_scale > p2_scale {
                    return Some((p1.id, p2.id));
                } else if distance < (p2_scale + tolerance) && p2_scale > p1_scale {
                    return Some((p2.id, p1.id));
                }
            }
        }

        None
    }

    /// AppServer.capturePlayer
    fn capture_player(&mut self, attacking_player_id: u32, target_player_id: u32) {
        let attacking_idx = self.model.get_player_index_by_id(attacking_player_id);
        let target_idx = self.model.get_player_index_by_id(target_player_id);

        let (attacking_idx, target_idx) = match (attacking_idx, target_idx) {
            (Some(a), Some(t)) => (a, t),
            _ => {
                self.log("ERROR: player capture attacking or target player undefined.");
                return;
            }
        };

        // Don't allow bots to capture each other
        if self.model.players[attacking_idx].player_type == PlayerType::Bot
            && self.model.players[target_idx].player_type == PlayerType::Bot
        {
            return;
        }

        self.log(&format!(
            "Capture player: {} {}",
            attacking_player_id, target_player_id
        ));

        // Increment player captures for the attacking player
        self.model.players[attacking_idx].player_captures += 1;

        // grow the attacking player the expected amount
        let cfg = self.cfg.clone();
        let target_radius = self.model.players[target_idx].sphere.radius();
        let amount = cfg.player_capture_value(target_radius);

        // Grow the capturing player and add to their score
        let growth = self.model.players[attacking_idx].sphere.grow_expected(&cfg, amount);
        self.model.players[attacking_idx].score += growth;

        let attacking_is_bot =
            self.model.players[attacking_idx].player_type == PlayerType::Bot;
        let target_is_bot = self.model.players[target_idx].player_type == PlayerType::Bot;

        if !attacking_is_bot {
            // Inform the attacking player that they captured target player
            self.send_text_to_player(
                attacking_player_id,
                &protocol::json_captured_player(target_player_id),
            );
        }

        if !target_is_bot {
            // Inform the target player that they died
            let time_alive = now_ms()
                .saturating_sub(self.model.players[target_idx].spawn_time)
                / 1000;
            let score = self.model.players[target_idx].get_score();
            let size = Config::get_padded_int(self.model.players[target_idx].sphere.scale);
            let drain_amount =
                Config::get_padded_int(self.model.players[target_idx].drain_amount);

            let msg = protocol::YouDiedMsg {
                attacking_player_id,
                food_captures: self.model.players[target_idx].food_captures,
                player_captures: self.model.players[target_idx].player_captures,
                drain_ammount: drain_amount,
                time_alive,
                score,
                size,
            };

            let buffer = protocol::encode_you_died(&msg);

            // Notify the target player that they died
            self.send_binary_to_player(target_player_id, buffer);

            // Save score to leaderboard if they got any points
            let name = self.model.players[target_idx].name.clone();
            let target_socket = self.socket_uuid_map.get(&target_player_id).copied();
            self.save_player_score(&name, score, target_socket);
        } else {
            self.capture_bot(target_player_id);
        }

        self.remove_player_from_model(target_player_id);

        // Inform the bot controller in case the captured player was a chase target
        self.bot_controller
            .validate_chase_targets(&self.cfg, &self.model, &mut self.rng);

        // Inform other clients that target player died
        let msg = protocol::json_player_died(attacking_player_id, target_player_id);
        self.broadcast_text(&msg);
    }

    /// AppServer.captureBot
    fn capture_bot(&mut self, bot_id: u32) {
        self.bot_controller.remove_bot(bot_id, &mut self.model);
        self.replenish_bot();
    }

    /// AppServer.checkHeartbeats
    fn check_heartbeats(&mut self) {
        if !self.cfg.heartbeat_enable {
            return;
        }

        let time = now_ms();
        let timeout = self.cfg.heartbeat_timeout;

        let to_kick: Vec<u32> = self
            .model
            .players
            .iter()
            .filter(|p| {
                p.player_type != PlayerType::Bot
                    && p.last_heartbeat > 0
                    && time.saturating_sub(p.last_heartbeat) > timeout
            })
            .map(|p| p.id)
            .collect();

        for player_id in to_kick {
            let msg = format!(
                "You were kicked because last heartbeat was over {} seconds ago.",
                timeout / 1000
            );
            self.kick_player(player_id, &msg);

            // The peer stopped responding, so presume it is gone.  Ask the
            // connection pump to close gracefully first - the Close frame is
            // queued behind the kick message in the same FIFO channel, so a
            // live (merely idle) client still receives its kick reason.
            if let Some(uuid) = self.socket_uuid_map.get(&player_id).copied() {
                if let Some(handle) = self.clients.get(&uuid) {
                    let _ = handle.out.send(Message::Close(None));
                }

                // Backstop: a true zombie (half-open TCP, full send buffer)
                // can never drain the channel, so hard-abort it shortly.
                let tx = self.tx.clone();
                tokio::spawn(async move {
                    tokio::time::sleep(Duration::from_secs(2)).await;
                    let _ = tx.send(InstanceMsg::ForceDisconnect { uuid });
                });
            }
        }
    }

    /// AppServer.updateFoodRespawns
    fn update_food_respawns(&mut self) {
        // keep a current reference of which food indexes are respawning
        self.model.food_respawning_indexes.clear();

        let tick = self.cfg.tick_slow_interval as u32;

        for i in 0..self.model.food_respawning.len() {
            if self.model.food_respawning[i] > 0 {
                let time_left = self.model.food_respawning[i].saturating_sub(tick);
                self.model.food_respawning[i] = time_left;

                if self.model.food_respawning[i] == 0 {
                    // queue up food respawn to send to clients
                    self.model.food_respawn_ready_queue.push(i as u32);
                } else {
                    self.model.food_respawning_indexes.push(i as u32);
                }
            }
        }
    }

    /// AppServer.playersChecks
    fn players_checks(&mut self) {
        let cfg = self.cfg.clone();
        self.model.leaders.clear();

        let player_ids: Vec<u32> = self.model.players.iter().map(|p| p.id).collect();
        let inst_id = self.id;

        for player_id in player_ids {
            let idx = match self.model.get_player_index_by_id(player_id) {
                Some(i) => i,
                None => continue,
            };

            let mut kick = false;

            {
                let player = &mut self.model.players[idx];

                // Expire speed infractions
                let mut sum: i64 = 0;
                let mut i = player.infractions_speed.len();
                while i > 0 {
                    i -= 1;
                    player.infractions_speed[i] -= cfg.tick_slow_interval as i64;
                    if player.infractions_speed[i] <= 0 {
                        player.infractions_speed.remove(i); // remove expired speed infraction
                    } else {
                        sum += player.infractions_speed[i];
                    }
                }

                // detect speed bursts
                let num_speed_infractions = player.infractions_speed.len();
                if num_speed_infractions >= cfg.speed_burst_detection_window
                    && !player.active_speed_burst_detected
                {
                    let mean = sum as f64 / num_speed_infractions as f64;
                    if mean > 7000.0 {
                        crate::zlog!(
                            "Speed burst detected from player id {} mean expiry left {}",
                            player.id,
                            mean
                        );
                        player.infractions_speed_burst += 1;
                        player.active_speed_burst_detected = true;
                    }
                } else if num_speed_infractions == 0 {
                    player.active_speed_burst_detected = false;
                }

                // Check for infractions
                if player.infractions_food > cfg.infraction_tolerance_food {
                    crate::zlog!(
                        "[{}] INFRACTION: Player reached food infraction tolerance: {} {} {}",
                        inst_id, player.id, player.infractions_food, cfg.infraction_tolerance_food
                    );
                    player.infractions_food = 0;
                } else if player.infractions_pcap > cfg.infraction_tolerance_pcap {
                    crate::zlog!(
                        "[{}] INFRACTION: Player reached player capture infraction tolerance: {} {} {}",
                        inst_id, player.id, player.infractions_pcap, cfg.infraction_tolerance_pcap
                    );
                    player.infractions_pcap = 0;
                } else if player.infractions_speed.len() > cfg.infraction_tolerance_speed
                    || player.infractions_speed_burst > cfg.infraction_tolerance_speed_burst
                {
                    kick = true;
                } else if player.infractions_scale > cfg.infraction_tolerance_scale {
                    crate::zlog!(
                        "[{}] INFRACTION: Player reached scale infraction tolerance: {} {} {}",
                        inst_id, player.id, player.infractions_scale, cfg.infraction_tolerance_scale
                    );
                    player.infractions_scale = 0;
                }

                // Add players to leaders array in sorted order by score
                let leader = Leader {
                    player_id: player.id,
                    score: player.get_score(),
                };
                sorted_push_leader(&mut self.model.leaders, leader);
            }

            if kick {
                self.kick_player(
                    player_id,
                    "You were removed because you had too many speed infractions.",
                );
            }
        }

        // Prepare leaders array (reverse for descending order)
        self.model.leaders.reverse();
    }

    /// AppServer.sendServerTickData
    fn send_server_tick_data(&mut self) {
        let fr = std::mem::take(&mut self.model.food_respawn_ready_queue);
        let fc = std::mem::take(&mut self.model.food_captured_queue);
        let sm = self.server_msg.clone();
        let leaders = self.model.leaders.clone();

        let buffer = protocol::encode_tick_slow(&fr, &fc, &sm, &leaders);
        self.broadcast_binary(buffer);
    }

    /// AppServer.sendActorUpdates
    fn send_actor_updates(&mut self) {
        let buffer = protocol::encode_actor_updates(&self.model.players);
        self.broadcast_binary(buffer);

        // record timing
        let now_time = now_ms();
        let send_gap = now_time.saturating_sub(self.au_send_metric.0);
        self.au_send_metric.0 = now_time;
        self.au_send_metric.2 += if send_gap > 100 { 1 } else { 0 };
    }

    /// logServerStatus (every ~15 seconds)
    fn log_server_status_nth(&mut self, start: Instant) {
        self.status_tick_counter += 1;
        let nth = (self.cfg.status_log_delay / self.cfg.tick_fast_interval).max(1);
        if self.status_tick_counter % nth != 0 {
            return;
        }

        let tick_time = start.elapsed().as_secs_f64() * 1000.0;
        let real_players = self.model.get_real_player_indexes().len();
        let clients = self.get_client_count();
        let socket_map = self.socket_uuid_map.len();

        self.log(&format!(
            "Tick: {:.3}, Clients: {}, Players: {}, socket_uuid_map: {}",
            tick_time, clients, real_players, socket_map
        ));
    }

    // -----------------------------------------------------------------
    // leaderboards
    // -----------------------------------------------------------------

    /// AppServer.refreshLeaderboards
    fn refresh_leaderboards(&mut self) {
        let limit = self.cfg.leaderboard_length;
        let day_ms = 24 * 60 * 60 * 1000u64;

        let mut backend = self.backend.lock().unwrap_or_else(|e| e.into_inner());
        // keep the in-memory score store bounded (nothing queries past 30 days)
        backend.prune(day_ms * 31, 100_000);
        let l1 = backend.get_leaders_by_date("zorbio", limit, day_ms);
        let l7 = backend.get_leaders_by_date("zorbio", limit, day_ms * 7);
        let l30 = backend.get_leaders_by_date("zorbio", limit, day_ms * 30);
        drop(backend);

        if !l1.is_empty() {
            self.leaders_1_day = l1;
        }
        if !l7.is_empty() {
            self.leaders_7_day = l7;
        }
        if !l30.is_empty() {
            self.leaders_30_day = l30;
        }
    }

    /// AppServer.savePlayerScore
    fn save_player_score(&mut self, name: &str, score: u64, ws: Option<Uuid>) {
        if score > self.cfg.initial_player_score {
            {
                let mut backend = self.backend.lock().unwrap_or_else(|e| e.into_inner());
                backend.save_score("zorbio", name, score);
            }

            if self.is_new_high_score(name, score) {
                // Player score made it on the leaderboard so refresh and send a
                // leaderboard update
                self.refresh_leaderboards();
                if let Some(uuid) = ws {
                    if self.clients.contains_key(&uuid) {
                        self.send_leaderboards_update(&uuid);
                    }
                }
            }
        }
    }

    /// AppServer.isNewHighScore
    fn is_new_high_score(&self, name: &str, score: u64) -> bool {
        let mut all: Vec<&LeaderboardLeader> = self
            .leaders_1_day
            .iter()
            .chain(self.leaders_7_day.iter())
            .chain(self.leaders_30_day.iter())
            .collect();

        if let Some(found) = all.iter().find(|l| l.name == name) {
            // Username already has a high score, see if this one is greater
            score > found.score
        } else {
            if all.is_empty() {
                return false;
            }
            // New username see if it's greater than the smallest high score
            all.sort_by_key(|l| l.score);
            score > all[0].score
        }
    }

    // -----------------------------------------------------------------
    // snapshots (monitoring API)
    // -----------------------------------------------------------------

    fn snapshot_json(&self) -> serde_json::Value {
        serde_json::json!({
            "id": self.id,
            "uuid": self.uuid,
            "clients": self.get_client_count(),
            "players": self.model.players.iter().map(|p| p.to_join_json()).collect::<Vec<_>>(),
            "actors": self.model.players.iter().map(|p| p.sphere.to_json()).collect::<Vec<_>>(),
            "food": self.model.food_model_json(),
            "player_count": self.model.players.len(),
            "bot_count": self.model.get_player_count(PlayerType::Bot),
            "real_player_count": self.model.get_real_player_indexes().len(),
        })
    }
}

/// UTIL.sortedObjectPush for leaders (ascending by score).
fn sorted_push_leader(arr: &mut Vec<Leader>, value: Leader) {
    let pos = arr
        .binary_search_by(|probe| probe.score.cmp(&value.score))
        .unwrap_or_else(|e| e);
    arr.insert(pos, value);
}

/// Borrow two distinct elements of a slice mutably.
fn split_borrow_two<T>(slice: &mut [T], i: usize, j: usize, f: impl FnOnce(&mut T, &mut T)) {
    if i == j {
        return;
    }
    if i < j {
        let (l, r) = slice.split_at_mut(j);
        f(&mut l[i], &mut r[0]);
    } else {
        let (l, r) = slice.split_at_mut(i);
        f(&mut r[0], &mut l[j]);
    }
}
