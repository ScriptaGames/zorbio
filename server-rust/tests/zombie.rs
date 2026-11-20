//! Memory/lifecycle test: a client that joins and then goes silent (peer
//! presumed dead) is kicked by the heartbeat watchdog, its socket is
//! hard-closed, and every session resource is reclaimed - verified through
//! the monitoring API.

use std::process::{Command, Stdio};
use std::time::{Duration, Instant};

use futures_util::{SinkExt, StreamExt};
use tokio_tungstenite::tungstenite::Message;

const HTTP_PORT: u16 = 18475;
const WS_PORT: u16 = 31475;

struct ServerGuard(std::process::Child);
impl Drop for ServerGuard {
    fn drop(&mut self) {
        let _ = self.0.kill();
        let _ = self.0.wait();
    }
}

fn spawn_server() -> std::process::Child {
    let exe = env!("CARGO_BIN_EXE_zorbio-server");
    let verbose = std::env::var("ZOR_TEST_VERBOSE").is_ok();
    let stdout = if verbose { Stdio::inherit() } else { Stdio::null() };
    Command::new(exe)
        .arg("../client")
        // default config (heartbeat ENABLEd) but a short 2s timeout so the
        // test is fast; default config also enables the origin check
        .env("HEARTBEAT_TIMEOUT", "2000")
        .env("HTTP_PORT", HTTP_PORT.to_string())
        .env("WS_LISTEN_PORT", WS_PORT.to_string())
        .stdout(stdout)
        .stderr(Stdio::null())
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

async fn fetch(path: &str) -> String {
    let mut stream = tokio::net::TcpStream::connect(("127.0.0.1", HTTP_PORT))
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

#[tokio::test]
async fn silent_client_is_kicked_and_fully_reclaimed() {
    let _server = ServerGuard(spawn_server());
    wait_for_server().await;

    // default config has CHECK_ORIGIN=true
    use tokio_tungstenite::tungstenite::client::IntoClientRequest;
    let mut request = format!("ws://127.0.0.1:{}", WS_PORT)
        .into_client_request()
        .unwrap();
    request
        .headers_mut()
        .insert("Origin", "http://uswest.zorb.io".parse().unwrap());

    let (ws, _) = tokio_tungstenite::connect_async(request).await.expect("connect");
    let (mut sink, mut stream) = ws.split();

    // join the game
    let deadline = Instant::now() + Duration::from_secs(20);
    loop {
        let msg = tokio::time::timeout(deadline.saturating_duration_since(Instant::now()), stream.next())
            .await
            .expect("timeout waiting for init")
            .expect("stream closed")
            .expect("ws error");
        if let Message::Binary(b) = msg {
            if b[0] == 1 {
                break; // INIT_GAME
            }
        }
    }
    sink.send(Message::Text(
        r#"{"op":"enter_game","type":"PLAYER","name":"zombie","color":1,"skin":"default","key":"x"}"#.into(),
    ))
    .await
    .unwrap();
    let deadline = Instant::now() + Duration::from_secs(10);
    loop {
        let msg = tokio::time::timeout(deadline.saturating_duration_since(Instant::now()), stream.next())
            .await
            .expect("timeout waiting for welcome")
            .expect("stream closed")
            .expect("ws error");
        if let Message::Binary(b) = msg {
            if b[0] == 6 {
                break; // WELCOME
            }
        }
    }
    sink.send(Message::Text(r#"{"op":"player_ready"}"#.into()))
        .await
        .unwrap();

    // ... and now go completely silent: no pings, no updates. The server's
    // heartbeat watchdog (2s) should kick and hard-close us.

    let mut saw_kick = false;
    let mut saw_close = false;
    let deadline = Instant::now() + Duration::from_secs(8);
    while Instant::now() < deadline {
        match tokio::time::timeout(Duration::from_millis(500), stream.next()).await {
            Ok(Some(Ok(Message::Text(t)))) => {
                let t = t.to_string();
                if t.contains("kick") && t.contains("heartbeat") {
                    saw_kick = true;
                }
            }
            Ok(Some(Ok(Message::Close(_)))) => {
                saw_close = true;
                break;
            }
            Ok(Some(Err(_))) | Ok(None) => {
                // aborted socket shows up as an error or EOF
                saw_close = true;
                break;
            }
            Ok(Some(Ok(_))) => {} // broadcasts keep flowing until the kick
            Err(_) => {}          // timeout, keep waiting
        }
    }

    assert!(saw_kick, "silent client should receive a kick message");
    assert!(saw_close, "silent client's socket should be closed by the server");

    // every session resource must be reclaimed
    tokio::time::sleep(Duration::from_millis(500)).await;
    let body = fetch("/api/games").await;
    assert!(
        body.contains("\"total_clients\":0"),
        "client socket entry not reclaimed: {}",
        body
    );
    assert!(
        body.contains("\"total_players\":0"),
        "player not removed from model: {}",
        body
    );
    // bots replenished the slot
    assert!(body.contains("\"bots\":20"), "expected bots replenished: {}", body);
}
