//! End-to-end integration test: spawns the server binary and drives a
//! headless client through the full connection protocol, mirroring
//! tests/node_client.js from the original repo.
//!
//! The client-side encoding below is written out by hand (independent of the
//! server's spack module) so it doubles as a wire-format check: the field
//! order must match schemapack's sorted-key encoding.

use std::process::{Child, Command, Stdio};
use std::time::{Duration, Instant};

use futures_util::{SinkExt, StreamExt};
use tokio_tungstenite::tungstenite::Message;

const HTTP_PORT: u16 = 18472;
const WS_PORT: u16 = 31472;

fn spawn_server() -> Child {
    let exe = env!("CARGO_BIN_EXE_zorbio-server");
    let verbose = std::env::var("ZOR_TEST_VERBOSE").is_ok();
    let stdout = if verbose { Stdio::inherit() } else { Stdio::null() };
    let stderr = if verbose { Stdio::inherit() } else { Stdio::null() };
    Command::new(exe)
        .arg("../client") // static dir
        .env("ZOR_ENV", "dev")
        .env("HTTP_PORT", HTTP_PORT.to_string())
        .env("WS_LISTEN_PORT", WS_PORT.to_string())
        .env("RUST_LOG", "info")
        .stdout(stdout)
        .stderr(stderr)
        .spawn()
        .expect("failed to spawn server")
}

async fn wait_for_server() {
    let deadline = Instant::now() + Duration::from_secs(30);
    loop {
        if Instant::now() > deadline {
            panic!("server did not come up in time");
        }
        if tokio::net::TcpStream::connect(("127.0.0.1", WS_PORT)).await.is_ok() {
            return;
        }
        tokio::time::sleep(Duration::from_millis(100)).await;
    }
}

// -- hand-rolled schemapack primitives (client side) ------------------------

fn varuint(buf: &mut Vec<u8>, mut v: u64) {
    while v > 127 {
        buf.push(((v & 127) as u8) | 128);
        v >>= 7;
    }
    buf.push((v & 127) as u8);
}

fn f32be(buf: &mut Vec<u8>, v: f64) {
    buf.extend_from_slice(&(v as f32).to_be_bytes());
}

fn recent_position(buf: &mut Vec<u8>, x: f64, y: f64, z: f64, radius: f64, time: u64) {
    // sorted keys: position, radius, time
    f32be(buf, x);
    f32be(buf, y);
    f32be(buf, z);
    f32be(buf, radius);
    varuint(buf, time);
}

/// Encode a PLAYER_UPDATE message (op 3) exactly as the browser client does.
fn player_update(player_id: u32, sphere_id: u32, t: u64) -> Vec<u8> {
    let x = 10.0;
    let y = 1.0;
    let z = 10.0;

    let mut b = Vec::new();
    b.push(3); // op
    // sorted keys: 0, au_gap, buffered_mount, food_capture_queue,
    // latest_position, oldest_position, player_id, pp_gap, prev_position_1..3, sphere_id
    varuint(&mut b, 50); // au_gap
    varuint(&mut b, 0); // buffered_mount
    varuint(&mut b, 0); // food_capture_queue length
    recent_position(&mut b, x, y, z, 5.0, t); // latest_position
    recent_position(&mut b, x, y, z, 5.0, t - 150); // oldest_position
    varuint(&mut b, player_id as u64); // player_id
    varuint(&mut b, 50); // pp_gap
    recent_position(&mut b, x, y, z, 5.0, t - 50); // prev_position_1
    recent_position(&mut b, x, y, z, 5.0, t - 100); // prev_position_2
    recent_position(&mut b, x, y, z, 5.0, t - 125); // prev_position_3
    varuint(&mut b, sphere_id as u64); // sphere_id
    b
}

/// Encode the raw CLIENT_POSITION_RAPID message (5 x float32 LE).
fn rapid_position(actor_id: u32, x: f64, y: f64, z: f64) -> Vec<u8> {
    let mut b = Vec::new();
    for v in [7.0f32, actor_id as f32, x as f32, y as f32, z as f32] {
        b.extend_from_slice(&v.to_le_bytes());
    }
    b
}

// -- test ---------------------------------------------------------------------

struct ServerGuard(Child);
impl Drop for ServerGuard {
    fn drop(&mut self) {
        let _ = self.0.kill();
        let _ = self.0.wait();
    }
}

#[tokio::test]
async fn full_client_lifecycle() -> Result<(), Box<dyn std::error::Error>> {
    let _server = ServerGuard(spawn_server());
    wait_for_server().await;

    // custom names are ignored; the server assigns player_1, player_2, ...
    // from a process-lifetime monotonically increasing counter
    client_flow("rusty", "player_1").await.unwrap();
    client_flow("i-should-be-ignored", "player_2").await.unwrap();

    // --- the server should still be alive and serving the monitoring API
    let body = reqwest_get_json(&format!("http://127.0.0.1:{}/api/games", HTTP_PORT)).await?;
    assert!(body.contains("total_players"), "unexpected /api/games body: {}", body);

    // static file serving
    let index = reqwest_get_text(&format!("http://127.0.0.1:{}/", HTTP_PORT)).await?;
    assert!(index.contains("<html") || index.contains("<!DOCTYPE"), "index.html not served");
    Ok(())
}

async fn client_flow(name: &str, expected_name: &str) -> Result<(), Box<dyn std::error::Error>> {
    let (ws, _resp) = tokio_tungstenite::connect_async(format!("ws://127.0.0.1:{}", WS_PORT))
        .await
        .expect("ws connect failed");
    let (mut sink, mut stream) = ws.split();

    // --- receive INIT_GAME (binary, op 1)
    let init = recv_binary(&mut stream, Duration::from_secs(10)).await?;
    assert_eq!(init[0], 1, "expected INIT_GAME op");
    // op byte + NB_SRVID string + model; in dev mode food count = 9^3 = 729
    // particles => 729*3 int16 = 4374 bytes of food alone
    assert!(init.len() > 4374, "init game message suspiciously small: {}", init.len());
    eprintln!("INIT_GAME received: {} bytes", init.len());

    // --- enter_game (the requested name must be ignored by the server)
    sink.send(Message::Text(
        format!(
            r#"{{"op":"enter_game","type":"PLAYER","name":"{}","color":3,"skin":"default","key":"x"}}"#,
            name
        )
        .into(),
    ))
    .await?;

    // --- receive WELCOME (binary, op 6) - actor updates also flow, so wait
    // for the op like the real client does
    let welcome = recv_binary_until_op(&mut stream, 6, Duration::from_secs(10)).await?;
    eprintln!("WELCOME received: {} bytes", welcome.len());

    // --- player_ready
    sink.send(Message::Text(r#"{"op":"player_ready"}"#.into())).await?;

    // --- receive game_setup (text)
    let setup = recv_text(&mut stream, Duration::from_secs(10)).await?;
    assert!(setup.contains("game_setup"), "expected game_setup, got: {}", setup);

    // --- after ~200ms: player_join broadcast (text)
    let join = recv_text_until(&mut stream, |t| t.contains("player_join"), Duration::from_secs(5)).await?;
    assert!(join.contains("player_join"), "expected player_join, got: {}", join);
    assert!(
        serde_json::from_str::<serde_json::Value>(&join).unwrap()["player"]["name"] == expected_name,
        "server should assign {} (got join: {})",
        expected_name,
        join
    );

    // --- zor_ping -> zor_pong
    sink.send(Message::Text(r#"{"op":"zor_ping","lastPing":42,"fps":60}"#.into()))
        .await?;
    let _pong = recv_text_until(&mut stream, |t| t.contains("zor_pong"), Duration::from_secs(5))
        .await?;

    // --- leaderboards request (binary op 8) -> LEADERBOARDS_UPDATE (op 9)
    sink.send(Message::Binary(vec![8u8].into())).await?;
    let _lb = recv_binary_until_op(&mut stream, 9, Duration::from_secs(5)).await?;

    // --- actor updates keep flowing (op 2) - bots are moving
    let _actors = recv_binary_until_op(&mut stream, 2, Duration::from_secs(2)).await?;

    // --- send a few rapid position updates + player updates like the game loop
    for i in 0..20u64 {
        let t = 1000 + i * 50;
        sink.send(Message::Binary(rapid_position(1, 10.0, 1.0, 10.0).into()))
            .await?;
        sink.send(Message::Binary(player_update(1, 1, t).into())).await?;
        // between our sends the server broadcasts actor updates / tick slow;
        // drain them so the socket buffers don't fill up
        drain_incoming(&mut stream, Duration::from_millis(40)).await;
    }

    // --- tick slow must still be flowing (op 4)
    let tick = recv_binary_until_op(&mut stream, 4, Duration::from_secs(5)).await?;
    assert!(tick.len() > 1, "tick slow message too small");

    // --- speed boost start (invalid: player at min scale) - no response expected,
    //     then disconnect cleanly
    sink.send(Message::Text(r#"{"op":"speed_boost_start"}"#.into())).await?;
    tokio::time::sleep(Duration::from_millis(200)).await;

    // --- close the socket; the server should clean up without crashing
    sink.close().await.ok();
    tokio::time::sleep(Duration::from_millis(300)).await;

    Ok(())
}

// -- helpers ------------------------------------------------------------------

async fn recv_next(
    stream: &mut (impl StreamExt<Item = Result<Message, tokio_tungstenite::tungstenite::Error>> + Unpin),
    timeout: Duration,
) -> Option<Message> {
    let deadline = Instant::now() + timeout;
    loop {
        let remaining = deadline.saturating_duration_since(Instant::now());
        if remaining.is_zero() {
            return None;
        }
        match tokio::time::timeout(remaining, stream.next()).await {
            Ok(Some(Ok(msg))) => return Some(msg),
            Ok(Some(Err(_))) | Ok(None) => return None,
            Err(_) => return None, // timeout
        }
    }
}

async fn recv_binary(
    stream: &mut (impl StreamExt<Item = Result<Message, tokio_tungstenite::tungstenite::Error>> + Unpin),
    timeout: Duration,
) -> Result<Vec<u8>, Box<dyn std::error::Error>> {
    let deadline = Instant::now() + timeout;
    loop {
        let msg = recv_next(stream, deadline.saturating_duration_since(Instant::now()))
            .await
            .ok_or("timed out waiting for binary message")?;
        if let Message::Binary(b) = msg {
            return Ok(b.into());
        }
        // skip text/ping frames while waiting
    }
}

async fn recv_text(
    stream: &mut (impl StreamExt<Item = Result<Message, tokio_tungstenite::tungstenite::Error>> + Unpin),
    timeout: Duration,
) -> Result<String, Box<dyn std::error::Error>> {
    let deadline = Instant::now() + timeout;
    loop {
        let msg = recv_next(stream, deadline.saturating_duration_since(Instant::now()))
            .await
            .ok_or("timed out waiting for text message")?;
        if let Message::Text(t) = msg {
            return Ok(t.to_string());
        }
    }
}

async fn recv_text_until(
    stream: &mut (impl StreamExt<Item = Result<Message, tokio_tungstenite::tungstenite::Error>> + Unpin),
    pred: impl Fn(&str) -> bool,
    timeout: Duration,
) -> Result<String, Box<dyn std::error::Error>> {
    let deadline = Instant::now() + timeout;
    loop {
        let msg = recv_next(stream, deadline.saturating_duration_since(Instant::now()))
            .await
            .ok_or("timed out waiting for text message")?;
        if let Message::Text(t) = msg {
            let t = t.to_string();
            if pred(&t) {
                return Ok(t);
            }
        }
    }
}

async fn recv_binary_until_op(
    stream: &mut (impl StreamExt<Item = Result<Message, tokio_tungstenite::tungstenite::Error>> + Unpin),
    op: u8,
    timeout: Duration,
) -> Result<Vec<u8>, Box<dyn std::error::Error>> {
    let deadline = Instant::now() + timeout;
    loop {
        let msg = recv_next(stream, deadline.saturating_duration_since(Instant::now()))
            .await
            .ok_or("timed out waiting for binary op")?;
        if let Message::Binary(b) = msg {
            if !b.is_empty() && b[0] == op {
                return Ok(b.into());
            }
        }
    }
}

async fn drain_incoming(
    stream: &mut (impl StreamExt<Item = Result<Message, tokio_tungstenite::tungstenite::Error>> + Unpin),
    duration: Duration,
) {
    let deadline = Instant::now() + duration;
    while Instant::now() < deadline {
        let remaining = deadline.saturating_duration_since(Instant::now());
        if tokio::time::timeout(remaining, stream.next()).await.is_err() {
            break;
        }
    }
}

async fn reqwest_get_json(url: &str) -> Result<String, Box<dyn std::error::Error>> {
    // minimal HTTP GET (avoids another http client dependency)
    let (host, path) = split_url(url);
    let mut stream = tokio::net::TcpStream::connect(&host).await?;
    use tokio::io::{AsyncReadExt, AsyncWriteExt};
    stream
        .write_all(format!("GET {} HTTP/1.0\r\nHost: {}\r\n\r\n", path, host).as_bytes())
        .await?;
    let mut buf = Vec::new();
    stream.read_to_end(&mut buf).await?;
    let text = String::from_utf8_lossy(&buf).to_string();
    Ok(text.split("\r\n\r\n").nth(1).unwrap_or("").to_string())
}

fn split_url(url: &str) -> (String, String) {
    let rest = url.trim_start_matches("http://");
    match rest.find('/') {
        Some(i) => (rest[..i].to_string(), rest[i..].to_string()),
        None => (rest.to_string(), "/".to_string()),
    }
}

async fn reqwest_get_text(url: &str) -> Result<String, Box<dyn std::error::Error>> {
    reqwest_get_json(url).await
}
