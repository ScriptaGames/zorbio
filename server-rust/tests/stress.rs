//! Multi-client stress test: several concurrent headless clients playing at
//! once, verifying the instance stays healthy under concurrent load.

use std::process::{Command, Stdio};
use std::time::{Duration, Instant};

use futures_util::{SinkExt, StreamExt};
use tokio_tungstenite::tungstenite::Message;

const HTTP_PORT_A: u16 = 18473;
const WS_PORT_A: u16 = 31473;
const HTTP_PORT_B: u16 = 18474;
const WS_PORT_B: u16 = 31474;

struct ServerGuard(std::process::Child);
impl Drop for ServerGuard {
    fn drop(&mut self) {
        let _ = self.0.kill();
        let _ = self.0.wait();
    }
}

fn spawn_server(env: &[(&str, &str)], http_port: u16, ws_port: u16) -> std::process::Child {
    let exe = env!("CARGO_BIN_EXE_zorbio-server");
    let verbose = std::env::var("ZOR_TEST_VERBOSE").is_ok();
    let stdout = if verbose { Stdio::inherit() } else { Stdio::null() };
    let mut cmd = Command::new(exe);
    cmd.arg("../client")
        .env("HTTP_PORT", http_port.to_string())
        .env("WS_LISTEN_PORT", ws_port.to_string())
        .stdout(stdout)
        .stderr(Stdio::null());
    for (k, v) in env {
        cmd.env(k, v);
    }
    cmd.spawn().expect("failed to spawn server")
}

async fn wait_for_server(ws_port: u16) {
    let deadline = Instant::now() + Duration::from_secs(30);
    loop {
        if Instant::now() > deadline {
            panic!("server did not come up in time");
        }
        if tokio::net::TcpStream::connect(("127.0.0.1", ws_port)).await.is_ok() {
            return;
        }
        tokio::time::sleep(Duration::from_millis(100)).await;
    }
}

async fn fetch(path: &str, port: u16) -> String {
    let mut stream = tokio::net::TcpStream::connect(("127.0.0.1", port))
        .await
        .expect("api connect");
    use tokio::io::{AsyncReadExt, AsyncWriteExt};
    stream
        .write_all(format!("GET {} HTTP/1.0\r\nHost: localhost\r\n\r\n", path).as_bytes())
        .await
        .unwrap();
    let mut buf = Vec::new();
    stream.read_to_end(&mut buf).await.unwrap();
    let text = String::from_utf8_lossy(&buf).to_string();
    text.split("\r\n\r\n").nth(1).unwrap_or("").to_string()
}

/// One headless client: connect, join, play for a while, disconnect.
async fn play_client(idx: usize, ws_port: u16) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let (ws, _) = tokio_tungstenite::connect_async(format!("ws://127.0.0.1:{}", ws_port))
        .await
        .expect("connect");
    let (mut sink, mut stream) = ws.split();

    // wait for INIT_GAME
    let deadline = Instant::now() + Duration::from_secs(10);
    loop {
        let msg = tokio::time::timeout(deadline.saturating_duration_since(Instant::now()), stream.next())
            .await
            .map_err(|_| "timeout waiting init")?
            .ok_or("stream closed")?
            .map_err(|e| format!("ws error: {}", e))?;
        if let Message::Binary(b) = msg {
            assert_eq!(b[0], 1);
            break;
        }
    }

    // enter + ready
    sink.send(Message::Text(
        format!(
            r#"{{"op":"enter_game","type":"PLAYER","name":"stress{}","color":1,"skin":"default","key":"x"}}"#,
            idx
        )
        .into(),
    ))
    .await?;
    let deadline = Instant::now() + Duration::from_secs(10);
    loop {
        let msg = tokio::time::timeout(deadline.saturating_duration_since(Instant::now()), stream.next())
            .await
            .map_err(|_| "timeout waiting welcome")?
            .ok_or("stream closed")?
            .map_err(|e| format!("ws error: {}", e))?;
        if let Message::Binary(b) = msg {
            if b[0] == 6 {
                break;
            }
        }
    }
    sink.send(Message::Text(r#"{"op":"player_ready"}"#.into())).await?;

    // simulate the game loop for ~2.5 seconds
    let start = Instant::now();
    let mut i = 0u64;
    while start.elapsed() < Duration::from_millis(2500) {
        i += 1;
        // rapid position (20 bytes f32 LE)
        let mut rapid = Vec::new();
        for v in [7.0f32, 100.0, 5.0, 1.0, 5.0] {
            rapid.extend_from_slice(&v.to_le_bytes());
        }
        sink.send(Message::Binary(rapid.into())).await?;

        // player update every ~50ms
        let mut t = 1000 + i * 50;
        let mut b = Vec::new();
        b.push(3);
        let varuint = |b: &mut Vec<u8>, mut v: u64| {
            while v > 127 {
                b.push(((v & 127) as u8) | 128);
                v >>= 7;
            }
            b.push((v & 127) as u8);
        };
        let rp = |b: &mut Vec<u8>, time: u64| {
            for c in [5.0f64, 1.0, 5.0] {
                b.extend_from_slice(&(c as f32).to_be_bytes());
            }
            b.extend_from_slice(&5.0f32.to_be_bytes());
            varuint(b, time);
        };
        varuint(&mut b, 50); // au_gap
        varuint(&mut b, 0); // buffered
        varuint(&mut b, 0); // food queue len
        rp(&mut b, t); // latest
        rp(&mut b, t - 150); // oldest
        varuint(&mut b, 100); // player_id
        varuint(&mut b, 50); // pp_gap
        rp(&mut b, t - 50);
        rp(&mut b, t - 100);
        rp(&mut b, t - 125);
        varuint(&mut b, 100); // sphere_id
        let _ = &mut t;
        sink.send(Message::Binary(b.into())).await?;

        // heartbeat
        if i % 20 == 0 {
            sink.send(Message::Text(r#"{"op":"zor_ping","lastPing":25,"fps":60}"#.into()))
                .await?;
        }

        // drain incoming broadcasts so we don't backpressure
        while let Ok(Some(Ok(msg))) =
            tokio::time::timeout(Duration::from_millis(1), stream.next()).await
        {
            if matches!(msg, Message::Close(_)) {
                return Err("server closed connection".into());
            }
        }
        tokio::time::sleep(Duration::from_millis(16)).await;
    }

    sink.close().await.ok();
    Ok(())
}

#[tokio::test]
async fn multiple_concurrent_clients() {
    let _server = ServerGuard(spawn_server(&[("ZOR_ENV", "dev")], HTTP_PORT_A, WS_PORT_A));
    wait_for_server(WS_PORT_A).await;

    // 8 concurrent clients
    let mut handles = Vec::new();
    for i in 0..8 {
        handles.push(tokio::spawn(play_client(i, WS_PORT_A)));
    }
    for h in handles {
        h.await.expect("client task panicked").expect("client flow failed");
    }

    // give the server a moment to clean up
    tokio::time::sleep(Duration::from_millis(500)).await;

    // monitoring API should show 0 clients after all disconnects
    let body = fetch("/api/games", HTTP_PORT_A).await;
    assert!(body.contains("\"total_clients\":0"), "clients not cleaned up: {}", body);
    assert!(body.contains("\"games\":["), "unexpected body: {}", body);

    // server is still ticking (bots)
    let players = fetch("/api/games/0/players/count", HTTP_PORT_A).await;
    assert!(players.contains("count"), "unexpected players count body: {}", players);
}

/// Boot with the production-style default config (world 2000, food density 32,
/// 20 bots) and verify a client can join and the init message is large.
#[tokio::test]
async fn prod_default_config_boot() -> Result<(), Box<dyn std::error::Error>> {
    let _server = ServerGuard(spawn_server(&[], HTTP_PORT_B, WS_PORT_B)); // no ZOR_ENV: defaults
    wait_for_server(WS_PORT_B).await;

    // default config has CHECK_ORIGIN=true, so connect with a valid balancer origin
    use tokio_tungstenite::tungstenite::client::IntoClientRequest;
    let mut request = format!("ws://127.0.0.1:{}", WS_PORT_B)
        .into_client_request()
        .unwrap();
    request.headers_mut().insert(
        "Origin",
        "http://uswest.zorb.io".parse().unwrap(),
    );
    let (ws, _) = tokio_tungstenite::connect_async(request)
        .await
        .expect("connect");
    let (mut sink, mut stream) = ws.split();

    // INIT_GAME with density 32: 29791 particles * 3 int16 = ~178KB of food
    let deadline = Instant::now() + Duration::from_secs(20);
    let mut init_len = 0usize;
    loop {
        let msg = tokio::time::timeout(deadline.saturating_duration_since(Instant::now()), stream.next())
            .await
            .map_err(|_| "timeout waiting init")?
            .ok_or("stream closed")?
            .map_err(|e| format!("ws error: {}", e))?;
        if let Message::Binary(b) = msg {
            assert_eq!(b[0], 1, "expected INIT_GAME first");
            init_len = b.len();
            break;
        }
    }
    assert!(init_len > 170_000, "prod init message too small: {} bytes", init_len);
    eprintln!("prod INIT_GAME: {} bytes", init_len);

    // enter the game and make sure the welcome arrives (bots + food all working)
    sink.send(Message::Text(
        r#"{"op":"enter_game","type":"PLAYER","name":"prod","color":1,"skin":"default","key":"x"}"#.into(),
    ))
    .await?;
    let deadline = Instant::now() + Duration::from_secs(10);
    loop {
        let msg = tokio::time::timeout(deadline.saturating_duration_since(Instant::now()), stream.next())
            .await
            .map_err(|_| "timeout waiting welcome")?
            .ok_or("stream closed")?
            .map_err(|e| format!("ws error: {}", e))?;
        if let Message::Binary(b) = msg {
            if b[0] == 6 {
                eprintln!("prod WELCOME ok");
                break;
            }
        }
    }

    // game API sanity: 20 bots spawned at boot
    let body = fetch("/api/games", HTTP_PORT_B).await;
    assert!(body.contains("\"bots\":20"), "expected 20 bots: {}", body);

    sink.close().await.ok();
    Ok(())
}
