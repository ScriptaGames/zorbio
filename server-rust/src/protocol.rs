//! Binary websocket protocol. Port of common/schemas.js.
//!
//! Every message below lists its schemapack schema with fields in the exact
//! order schemapack encodes them (lexicographically sorted keys).  Endianness
//! is big endian; varuint is LEB128; strings/arrays carry varuint length
//! prefixes.  See spack.rs.

use crate::model::{Leader, Model, Player, PlayerSphere};
use crate::spack::{
    put_array_len, put_bool, put_f32, put_i16, put_string, put_u16, put_u32, put_u8, put_varuint,
    Reader, Result,
};
use crate::util::Vector3;

/// ZOR.Schemas.ops
pub mod ops {
    pub const INIT_GAME: u8 = 1;
    pub const ACTOR_UPDATES: u8 = 2;
    pub const PLAYER_UPDATE: u8 = 3;
    pub const TICK_SLOW: u8 = 4;
    pub const YOU_DIED: u8 = 5;
    pub const WELCOME: u8 = 6;
    pub const CLIENT_POSITION_RAPID: u8 = 7;
    pub const LEADERBOARDS_REQUEST: u8 = 8;
    pub const LEADERBOARDS_UPDATE: u8 = 9;
}

/// leader schema {player_id: varuint, score: varuint} (sorted: player_id, score)
pub fn put_leader(buf: &mut Vec<u8>, leader: &Leader) {
    put_varuint(buf, leader.player_id as u64);
    put_varuint(buf, leader.score);
}

/// leaderboard_leader schema {name: string, score: varuint}
pub struct LeaderboardLeader {
    pub name: String,
    pub score: u64,
}

impl LeaderboardLeader {
    pub fn put(&self, buf: &mut Vec<u8>) {
        put_string(buf, &self.name);
        put_varuint(buf, self.score);
    }
}

/// vector3 schema {x,y,z: float32}
fn put_vector3(buf: &mut Vec<u8>, v: &Vector3) {
    put_f32(buf, v.x);
    put_f32(buf, v.y);
    put_f32(buf, v.z);
}

/// full actor schema, sorted keys:
/// color, drain_target_id, id, playerId, position, scale, skin,
/// speed_boosting, type, velocity
fn put_actor_full(buf: &mut Vec<u8>, s: &PlayerSphere) {
    put_u8(buf, s.color);
    put_varuint(buf, s.drain_target_id as u64);
    put_varuint(buf, s.id as u64);
    put_varuint(buf, s.player_id as u64);
    put_vector3(buf, &s.position);
    put_f32(buf, s.scale);
    put_string(buf, &s.skin);
    put_bool(buf, s.speed_boosting);
    put_string(buf, crate::model::ACTOR_TYPE_PLAYER_SPHERE);
    put_vector3(buf, &s.velocity);
}

/// tiny_actor schema, sorted keys:
/// drain_target_id, id, position, scale, speed_boosting, velocity
fn put_actor_tiny(buf: &mut Vec<u8>, s: &PlayerSphere) {
    put_varuint(buf, s.drain_target_id as u64);
    put_varuint(buf, s.id as u64);
    put_vector3(buf, &s.position);
    put_f32(buf, s.scale);
    put_bool(buf, s.speed_boosting);
    put_vector3(buf, &s.velocity);
}

/// player schema, sorted keys: id, name, sphere, type
fn put_player(buf: &mut Vec<u8>, p: &Player) {
    put_varuint(buf, p.id as u64);
    put_string(buf, &p.name);
    put_actor_full(buf, &p.sphere);
    put_string(buf, p.player_type.as_str());
}

/// recent_position schema, sorted keys: position, radius, time
#[cfg(test)]
struct WireRecentPosition<'a> {
    position: &'a Vector3,
    radius: f64,
    time: u64,
}

#[cfg(test)]
fn put_recent_position(buf: &mut Vec<u8>, rp: &WireRecentPosition<'_>) {
    put_vector3(buf, rp.position);
    put_f32(buf, rp.radius);
    put_varuint(buf, rp.time);
}

// ---------------------------------------------------------------------------
// Server -> client messages
// ---------------------------------------------------------------------------

/// op_init_game: { 0: uint8, NB_SRVID: string, model: model }
///
/// model sorted keys: actors, food, foodCount, foodDensity,
/// food_respawn_ready_queue, food_respawning, food_respawning_indexes,
/// players, worldSize
pub fn encode_init_game(nb_srv_id: &str, model: &Model) -> Vec<u8> {
    let mut buf = Vec::with_capacity(64 * 1024);
    put_u8(&mut buf, ops::INIT_GAME); // key "0"
    put_string(&mut buf, nb_srv_id); // key "NB_SRVID"

    // key "model"
    put_array_len(&mut buf, model.players.len()); // "actors" (all actors are player spheres)
    for p in &model.players {
        put_actor_full(&mut buf, &p.sphere);
    }

    put_array_len(&mut buf, model.food.len()); // "food" (array of int16)
    for v in &model.food {
        put_i16(&mut buf, *v);
    }

    put_u32(&mut buf, model.food_count as u32); // "foodCount"
    put_u8(&mut buf, model.food_density as u8); // "foodDensity"

    put_array_len(&mut buf, model.food_respawn_ready_queue.len()); // "food_respawn_ready_queue"
    for v in &model.food_respawn_ready_queue {
        put_varuint(&mut buf, *v as u64);
    }

    put_array_len(&mut buf, model.food_respawning.len()); // "food_respawning"
    for v in &model.food_respawning {
        put_varuint(&mut buf, *v as u64);
    }

    put_array_len(&mut buf, model.food_respawning_indexes.len()); // "food_respawning_indexes"
    for v in &model.food_respawning_indexes {
        put_varuint(&mut buf, *v as u64);
    }

    put_array_len(&mut buf, model.players.len()); // "players"
    for p in &model.players {
        put_player(&mut buf, p);
    }

    put_u16(&mut buf, model.world_size.x as u16); // "worldSize"
    put_u16(&mut buf, model.world_size.y as u16);
    put_u16(&mut buf, model.world_size.z as u16);

    buf
}

/// op_welcome: { 0: uint8, player: player }
pub fn encode_welcome(player: &Player) -> Vec<u8> {
    let mut buf = Vec::with_capacity(128);
    put_u8(&mut buf, ops::WELCOME);
    put_player(&mut buf, player);
    buf
}

/// op_actor_updates: { 0: uint8, actors: [tiny_actor] }
pub fn encode_actor_updates(players: &[Player]) -> Vec<u8> {
    let mut buf = Vec::with_capacity(16 + players.len() * 40);
    put_u8(&mut buf, ops::ACTOR_UPDATES);
    put_array_len(&mut buf, players.len());
    for p in players {
        put_actor_tiny(&mut buf, &p.sphere);
    }
    buf
}

/// op_you_died, sorted keys: 0, attacking_player_id, drain_ammount,
/// food_captures, player_captures, score, size, time_alive
pub struct YouDiedMsg {
    pub attacking_player_id: u32,
    pub food_captures: u32,
    pub player_captures: u32,
    pub drain_ammount: u64,
    pub time_alive: u64,
    pub score: u64,
    pub size: u64,
}

pub fn encode_you_died(msg: &YouDiedMsg) -> Vec<u8> {
    let mut buf = Vec::with_capacity(32);
    put_u8(&mut buf, ops::YOU_DIED);
    put_varuint(&mut buf, msg.attacking_player_id as u64);
    put_varuint(&mut buf, msg.drain_ammount);
    put_varuint(&mut buf, msg.food_captures as u64);
    put_varuint(&mut buf, msg.player_captures as u64);
    put_varuint(&mut buf, msg.score);
    put_varuint(&mut buf, msg.size);
    put_varuint(&mut buf, msg.time_alive);
    buf
}

/// op_tick_slow: { 0: uint8, tick_data: tick_slow_data }
///
/// tick_slow_data sorted keys: fc, fr, leaders, sm
pub fn encode_tick_slow(
    food_respawn_ready: &[u32],
    food_captured: &[u32],
    server_msg: &str,
    leaders: &[Leader],
) -> Vec<u8> {
    let mut buf = Vec::with_capacity(64 + leaders.len() * 8);
    put_u8(&mut buf, ops::TICK_SLOW);
    put_array_len(&mut buf, food_captured.len()); // "fc"
    for v in food_captured {
        put_varuint(&mut buf, *v as u64);
    }
    put_array_len(&mut buf, food_respawn_ready.len()); // "fr"
    for v in food_respawn_ready {
        put_varuint(&mut buf, *v as u64);
    }
    put_array_len(&mut buf, leaders.len()); // "leaders"
    for l in leaders {
        put_leader(&mut buf, l);
    }
    put_string(&mut buf, server_msg); // "sm"
    buf
}

/// op_leaderboards_update, sorted keys: 0, leaders_1_day, leaders_30_day,
/// leaders_7_day  (note: "leaders_30_day" sorts before "leaders_7_day")
pub fn encode_leaderboards_update(
    leaders_1_day: &[LeaderboardLeader],
    leaders_7_day: &[LeaderboardLeader],
    leaders_30_day: &[LeaderboardLeader],
) -> Vec<u8> {
    let mut buf = Vec::with_capacity(128);
    put_u8(&mut buf, ops::LEADERBOARDS_UPDATE);
    put_array_len(&mut buf, leaders_1_day.len());
    for l in leaders_1_day {
        l.put(&mut buf);
    }
    put_array_len(&mut buf, leaders_30_day.len());
    for l in leaders_30_day {
        l.put(&mut buf);
    }
    put_array_len(&mut buf, leaders_7_day.len());
    for l in leaders_7_day {
        l.put(&mut buf);
    }
    buf
}

// ---------------------------------------------------------------------------
// Client -> server messages
// ---------------------------------------------------------------------------

/// Decoded op_player_update.
#[derive(Debug, Clone)]
#[allow(dead_code)]
pub struct PlayerUpdateMsg {
    pub player_id: u32,
    pub sphere_id: u32,
    pub pp_gap: u64,
    pub au_gap: u64,
    pub buffered_mount: u64,
    pub latest_position: crate::model::RecentPosition,
    pub prev_position_1: crate::model::RecentPosition,
    pub prev_position_2: crate::model::RecentPosition,
    pub prev_position_3: crate::model::RecentPosition,
    pub oldest_position: crate::model::RecentPosition,
    pub food_capture_queue: Vec<FoodCaptureEntry>,
}

#[derive(Debug, Clone, Copy)]
pub struct FoodCaptureEntry {
    pub fi: u32,
    pub radius: f64,
}

fn read_recent_position(r: &mut Reader<'_>) -> Result<crate::model::RecentPosition> {
    // sorted keys: position, radius, time
    let x = r.f32()?;
    let y = r.f32()?;
    let z = r.f32()?;
    let radius = r.f32()?;
    let time = r.varuint()?;
    Ok(crate::model::RecentPosition {
        position: Vector3::new(x, y, z),
        radius,
        time: time as u32 as u64,
    })
}

/// Decode an op_player_update message (op byte included).
pub fn decode_player_update(data: &[u8]) -> Result<PlayerUpdateMsg> {
    let mut r = Reader::new(data);

    let op = r.u8()?;
    if op != ops::PLAYER_UPDATE {
        return Err(crate::spack::DecodeError(format!(
            "expected PLAYER_UPDATE op {}, got {}",
            ops::PLAYER_UPDATE, op
        )));
    }

    // sorted keys: 0, au_gap, buffered_mount, food_capture_queue,
    // latest_position, oldest_position, player_id, pp_gap, prev_position_1,
    // prev_position_2, prev_position_3, sphere_id
    let au_gap = r.varuint()?;
    let buffered_mount = r.varuint()?;

    let fc_len = r.varuint()? as usize;
    let mut food_capture_queue = Vec::with_capacity(fc_len.min(1024));
    for _ in 0..fc_len {
        // food_capture_entry sorted keys: fi, radius
        let fi = r.varuint()? as u32;
        let radius = r.f32()?;
        food_capture_queue.push(FoodCaptureEntry { fi, radius });
    }

    let latest_position = read_recent_position(&mut r)?;
    let oldest_position = read_recent_position(&mut r)?;
    let player_id = r.varuint()? as u32;
    let pp_gap = r.varuint()?;
    let prev_position_1 = read_recent_position(&mut r)?;
    let prev_position_2 = read_recent_position(&mut r)?;
    let prev_position_3 = read_recent_position(&mut r)?;
    let sphere_id = r.varuint()? as u32;

    Ok(PlayerUpdateMsg {
        player_id,
        sphere_id,
        pp_gap,
        au_gap,
        buffered_mount,
        latest_position,
        prev_position_1,
        prev_position_2,
        prev_position_3,
        oldest_position,
        food_capture_queue,
    })
}

/// Is this binary message a leaderboards request?
pub fn is_leaderboards_request(data: &[u8]) -> bool {
    !data.is_empty() && data[0] == ops::LEADERBOARDS_REQUEST
}

/// Raw CLIENT_POSITION_RAPID message: 5 float32 LE values
/// [op=7.0, actor_id, x, y, z].
pub fn parse_client_position_rapid(data: &[u8]) -> Option<[f32; 5]> {
    if data.len() < 20 {
        return None;
    }
    let mut view = [0f32; 5];
    for (i, item) in view.iter_mut().enumerate() {
        let bytes = [data[i * 4], data[i * 4 + 1], data[i * 4 + 2], data[i * 4 + 3]];
        *item = f32::from_le_bytes(bytes);
    }
    if view[0] == ops::CLIENT_POSITION_RAPID as f32 {
        Some(view)
    } else {
        None
    }
}

// ---------------------------------------------------------------------------
// JSON (text) messages
// ---------------------------------------------------------------------------

/// Client text messages (JSON with an "op" field).
#[derive(Debug, Clone)]
pub enum ClientTextMsg {
    EnterGame {
        player_type: String,
        name: String,
        color: u8,
        skin: String,
        key: String,
    },
    Respawn,
    PlayerReady,
    ZorPing {
        last_ping: f64,
        fps: f64,
    },
    SpeedBoostStart,
    SpeedBoostStop,
}

pub fn parse_client_text(text: &str) -> Option<ClientTextMsg> {
    let v: serde_json::Value = serde_json::from_str(text).ok()?;
    let op = v.get("op")?.as_str()?;

    match op {
        "enter_game" => Some(ClientTextMsg::EnterGame {
            player_type: v
                .get("type")
                .and_then(|t| t.as_str())
                .unwrap_or("PLAYER")
                .to_string(),
            name: v
                .get("name")
                .and_then(|t| t.as_str())
                .unwrap_or("")
                .to_string(),
            color: v.get("color").and_then(|c| c.as_u64()).unwrap_or(0) as u8,
            skin: v
                .get("skin")
                .and_then(|t| t.as_str())
                .unwrap_or("default")
                .to_string(),
            key: v
                .get("key")
                .and_then(|t| t.as_str())
                .unwrap_or("")
                .to_string(),
        }),
        "respawn" => Some(ClientTextMsg::Respawn),
        "player_ready" => Some(ClientTextMsg::PlayerReady),
        "zor_ping" => Some(ClientTextMsg::ZorPing {
            last_ping: v.get("lastPing").and_then(|x| x.as_f64()).unwrap_or(-1.0),
            fps: v.get("fps").and_then(|x| x.as_f64()).unwrap_or(0.0),
        }),
        "speed_boost_start" => Some(ClientTextMsg::SpeedBoostStart),
        "speed_boost_stop" => Some(ClientTextMsg::SpeedBoostStop),
        _ => None,
    }
}

/// Server text (JSON) message builders.
pub fn json_game_setup() -> String {
    r#"{"op":"game_setup"}"#.to_string()
}

pub fn json_zor_pong() -> String {
    r#"{"op":"zor_pong"}"#.to_string()
}

pub fn json_speeding_warning() -> String {
    r#"{"op":"speeding_warning"}"#.to_string()
}

pub fn json_speed_boost_res() -> String {
    r#"{"op":"speed_boost_res","is_valid":true}"#.to_string()
}

pub fn json_speed_boost_stop() -> String {
    r#"{"op":"speed_boost_stop"}"#.to_string()
}

pub fn json_remove_player(player_id: u32) -> String {
    format!(r#"{{"op":"remove_player","playerId":{}}}"#, player_id)
}

pub fn json_captured_player(target_player_id: u32) -> String {
    format!(
        r#"{{"op":"captured_player","targetPlayerId":{}}}"#,
        target_player_id
    )
}

pub fn json_player_died(attacking_player_id: u32, target_player_id: u32) -> String {
    format!(
        r#"{{"op":"player_died","attackingPlayerId":{},"targetPlayerId":{}}}"#,
        attacking_player_id, target_player_id
    )
}

pub fn json_kick(reason: &str) -> String {
    serde_json::to_string(&serde_json::json!({"op": "kick", "reason": reason}))
        .unwrap_or_else(|_| r#"{"op":"kick"}"#.to_string())
}

pub fn json_player_join(player: &Player) -> String {
    serde_json::to_string(&serde_json::json!({
        "op": "player_join",
        "player": player.to_join_json(),
    }))
    .unwrap_or_default()
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::model::PlayerSphere;

    fn test_sphere() -> PlayerSphere {
        let cfg = crate::config::Config::default();
        let mut s = PlayerSphere::new(&cfg, 42, 7, Vector3::new(1.0, 2.0, 3.0), 5.0, "default");
        s.velocity = Vector3::new(0.5, 0.25, -0.5);
        s.drain_target_id = 13;
        s.speed_boosting = true;
        s
    }

    #[test]
    fn actor_full_wire_format() {
        // verify exact byte layout with hand-computed expectations
        let s = test_sphere();
        let mut buf = Vec::new();
        put_actor_full(&mut buf, &s);

        let mut r = Reader::new(&buf);
        assert_eq!(r.u8().unwrap(), 7); // color
        assert_eq!(r.varuint().unwrap(), 13); // drain_target_id
        assert_eq!(r.varuint().unwrap(), 42); // id
        assert_eq!(r.varuint().unwrap(), 42); // playerId
        assert_eq!(r.f32().unwrap(), 1.0); // position.x
        assert_eq!(r.f32().unwrap(), 2.0);
        assert_eq!(r.f32().unwrap(), 3.0);
        assert_eq!(r.f32().unwrap(), 5.0); // scale
        assert_eq!(r.string().unwrap(), "default"); // skin
        assert!(r.bool().unwrap()); // speed_boosting
        assert_eq!(r.string().unwrap(), "PLAYER_SPHERE"); // type
        assert_eq!(r.f32().unwrap(), 0.5); // velocity.x
        assert_eq!(r.f32().unwrap(), 0.25); // velocity.y
        assert_eq!(r.f32().unwrap(), -0.5); // velocity.z
        assert_eq!(r.remaining(), 0);
    }

    #[test]
    fn actor_tiny_wire_format() {
        let s = test_sphere();
        let mut buf = Vec::new();
        put_actor_tiny(&mut buf, &s);

        let mut r = Reader::new(&buf);
        assert_eq!(r.varuint().unwrap(), 13); // drain_target_id first!
        assert_eq!(r.varuint().unwrap(), 42); // id
        assert_eq!(r.f32().unwrap(), 1.0);
        assert_eq!(r.f32().unwrap(), 2.0);
        assert_eq!(r.f32().unwrap(), 3.0);
        assert_eq!(r.f32().unwrap(), 5.0); // scale
        assert!(r.bool().unwrap());
        assert_eq!(r.f32().unwrap(), 0.5); // velocity.x
        assert_eq!(r.f32().unwrap(), 0.25); // velocity.y
        assert_eq!(r.f32().unwrap(), -0.5); // velocity.z
        assert_eq!(r.remaining(), 0);
    }

    #[test]
    fn player_update_roundtrip() {
        let rp = |t: u64, x: f64| crate::model::RecentPosition {
            position: Vector3::new(x, 0.0, 0.0),
            radius: 5.0,
            time: t,
        };

        // encode a player_update by hand in sorted key order
        let mut buf = Vec::new();
        put_u8(&mut buf, ops::PLAYER_UPDATE);
        put_varuint(&mut buf, 3); // au_gap
        put_varuint(&mut buf, 4); // buffered_mount
        put_array_len(&mut buf, 1); // food_capture_queue
        put_varuint(&mut buf, 77); // fi
        put_f32(&mut buf, 5.5); // radius
        put_recent_position(&mut buf, &WireRecentPosition { position: &rp(100, 1.0).position, radius: 5.0, time: 100 }); // latest
        put_recent_position(&mut buf, &WireRecentPosition { position: &rp(10, 0.1).position, radius: 5.0, time: 10 }); // oldest
        put_varuint(&mut buf, 9); // player_id
        put_varuint(&mut buf, 50); // pp_gap
        put_recent_position(&mut buf, &WireRecentPosition { position: &rp(70, 0.7).position, radius: 5.0, time: 70 }); // prev1
        put_recent_position(&mut buf, &WireRecentPosition { position: &rp(60, 0.6).position, radius: 5.0, time: 60 }); // prev2
        put_recent_position(&mut buf, &WireRecentPosition { position: &rp(50, 0.5).position, radius: 5.0, time: 50 }); // prev3
        put_varuint(&mut buf, 9); // sphere_id

        let msg = decode_player_update(&buf).unwrap();
        assert_eq!(msg.player_id, 9);
        assert_eq!(msg.sphere_id, 9);
        assert_eq!(msg.pp_gap, 50);
        assert_eq!(msg.au_gap, 3);
        assert_eq!(msg.buffered_mount, 4);
        assert_eq!(msg.latest_position.time, 100);
        assert_eq!(msg.oldest_position.time, 10);
        assert_eq!(msg.prev_position_1.time, 70);
        assert_eq!(msg.prev_position_2.time, 60);
        assert_eq!(msg.prev_position_3.time, 50);
        assert_eq!(msg.food_capture_queue.len(), 1);
        assert_eq!(msg.food_capture_queue[0].fi, 77);
        assert!((msg.food_capture_queue[0].radius - 5.5).abs() < 1e-6);
    }

    #[test]
    fn rapid_position_parse() {
        let mut data = Vec::new();
        for v in [7.0f32, 42.0, 1.5, -2.5, 3.25] {
            data.extend_from_slice(&v.to_le_bytes());
        }
        let view = parse_client_position_rapid(&data).unwrap();
        assert_eq!(view[1], 42.0);
        assert_eq!(view[2], 1.5);
        assert_eq!(view[3], -2.5);
        assert_eq!(view[4], 3.25);

        // non-rapid message (first float is not 7.0)
        let mut data = Vec::new();
        for v in [3.0f32, 1.0, 1.0, 1.0, 1.0] {
            data.extend_from_slice(&v.to_le_bytes());
        }
        assert!(parse_client_position_rapid(&data).is_none());
    }

    #[test]
    fn tick_slow_layout() {
        let leaders = vec![Leader { player_id: 5, score: 123 }];
        let buf = encode_tick_slow(&[7, 8], &[1, 2, 3], "hello", &leaders);
        let mut r = Reader::new(&buf);
        assert_eq!(r.u8().unwrap(), ops::TICK_SLOW);
        assert_eq!(r.varuint().unwrap(), 3); // fc len
        assert_eq!(r.varuint().unwrap(), 1);
        assert_eq!(r.varuint().unwrap(), 2);
        assert_eq!(r.varuint().unwrap(), 3);
        assert_eq!(r.varuint().unwrap(), 2); // fr len
        assert_eq!(r.varuint().unwrap(), 7);
        assert_eq!(r.varuint().unwrap(), 8);
        assert_eq!(r.varuint().unwrap(), 1); // leaders len
        assert_eq!(r.varuint().unwrap(), 5); // player_id
        assert_eq!(r.varuint().unwrap(), 123); // score
        assert_eq!(r.string().unwrap(), "hello");
        assert_eq!(r.remaining(), 0);
    }

    #[test]
    fn leaderboards_update_order() {
        let l = |name: &str| LeaderboardLeader { name: name.to_string(), score: 1 };
        let one = vec![l("a")];
        let seven = vec![l("b")];
        let thirty = vec![l("c")];
        let buf = encode_leaderboards_update(&one, &seven, &thirty);
        let mut r = Reader::new(&buf);
        assert_eq!(r.u8().unwrap(), ops::LEADERBOARDS_UPDATE);
        assert_eq!(r.varuint().unwrap(), 1); // leaders_1_day len
        assert_eq!(r.string().unwrap(), "a");
        assert_eq!(r.varuint().unwrap(), 1); // score of "a"
        assert_eq!(r.varuint().unwrap(), 1); // leaders_30_day len (before 7 day!)
        assert_eq!(r.string().unwrap(), "c");
        assert_eq!(r.varuint().unwrap(), 1); // score of "c"
        assert_eq!(r.varuint().unwrap(), 1); // leaders_7_day len
        assert_eq!(r.string().unwrap(), "b");
        assert_eq!(r.varuint().unwrap(), 1); // score of "b"
        assert_eq!(r.remaining(), 0);
    }
}
