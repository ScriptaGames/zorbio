//! Zorbio game server (Rust port). Port of server/server.js, AppProxy.js and
//! the websocket/static routing of the original Node.js server onto axum.

mod api;
mod backend;
mod bots;
mod config;
mod curves;
mod drain;
mod food;
mod game;
mod model;
mod names;
mod protocol;
mod spack;
mod state;
mod util;
mod validators;

use std::net::SocketAddr;
use std::sync::Arc;

use axum::body::Body;
use axum::extract::ws::{Message, WebSocket, WebSocketUpgrade};
use axum::extract::{FromRequestParts, Path, Request, State};
use axum::http::{header, HeaderMap, StatusCode};
use axum::response::{IntoResponse, Response};
use axum::routing::get;
use axum::Router;
use tokio::sync::mpsc;
use tower_http::services::ServeDir;
use uuid::Uuid;

use backend::{Backend, SharedBackend};
use config::Config;
use game::{GameInstanceHandle, InstanceMsg};
use state::AppState;

const VERSION: &str = "2.2.0";
const BUILD: &str = "2";

#[tokio::main]
async fn main() {
    // Static content root: argv[1] ("client" by default, "dist" in prod)
    let args: Vec<String> = std::env::args().collect();
    let static_dir = args
        .get(1)
        .cloned()
        .unwrap_or_else(|| "client".to_string());

    let cfg = Arc::new(Config::load());
    let server_label = std::env::var("SERVER_LABEL").unwrap_or_else(|_| Uuid::new_v4().to_string());

    // If HTTPS is enabled the WebSocket port is the same as the https port
    let ws_port = cfg.ws_listen_port;
    let web_server_port = if cfg.enable_https { cfg.https_port } else { cfg.http_port };

    zlog!("Starting Zorbio Server v{}-{} (rust)", VERSION, BUILD);
    zlog!("web_server_port={}, ws_port={}", web_server_port, ws_port);

    if cfg.check_version {
        zlog!(
            "CHECK_VERSION is enabled, but the remote zorbio-version check is not \
             implemented in the Rust port; skipping"
        );
    }

    let backend: SharedBackend = Arc::new(std::sync::Mutex::new(Backend::new()));

    // Create game instances (AppProxy)
    let mut instances = Vec::new();
    for i in 0..cfg.num_game_instances {
        instances.push(GameInstanceHandle::spawn(
            cfg.clone(),
            i,
            &server_label,
            ws_port,
            backend.clone(),
        ));
    }

    let state = Arc::new(AppState {
        cfg: cfg.clone(),
        instances,
        static_dir: static_dir.clone(),
    });

    // The app server contains all the logic and state of the WebSocket app +
    // monitoring API (ZorApi) + nodebalancer sticky-session routes.
    let web_app = Router::new()
        .route("/api/games", get(api::games))
        .route("/api/games/{game_id}/players/count", get(api::players_count))
        .route("/api/games/{game_id}/players", get(api::players))
        .route("/api/games/{game_id}/out", get(api::out))
        .route("/api/games/{game_id}/actors", get(api::actors))
        .route("/api/games/{game_id}/food", get(api::food))
        .route("/api/games/{game_id}/clients/count", get(api::clients_count))
        .route("/nbsrv/{nb}/{id}", get(nbsrv))
        .route("/nbsrv_bounce/{id}", get(nbsrv_bounce))
        .route("/", get(index_or_ws))
        .fallback_service(ServeDir::new(static_dir.clone()))
        .with_state(state.clone());

    if cfg.enable_https {
        // Web server and websocket server share the https port
        let addr = SocketAddr::from(([0, 0, 0, 0], cfg.https_port));
        match axum_server::tls_rustls::RustlsConfig::from_pem_file(
            &cfg.tls_cert_file,
            &cfg.tls_key_file,
        )
        .await
        {
            Ok(rustls_config) => {
                zlog!(
                    "Zorbio v{}-{} is listening on https://localhost:{}",
                    VERSION,
                    BUILD,
                    cfg.https_port
                );
                let handle = axum_server::Handle::new();
                let h = handle.clone();
                tokio::spawn(async move {
                    let _ = shutdown_signal(h).await;
                });
                let _ = axum_server::bind_rustls(addr, rustls_config)
                    .handle(handle)
                    .serve(web_app.into_make_service())
                    .await;
            }
            Err(e) => {
                zlog!(
                    "Failed to load TLS cert/key ({} / {}): {}. ENABLE_HTTPS is set; \
                     falling back to plain HTTP on port {}. Terminate TLS upstream if \
                     this was unexpected.",
                    cfg.tls_cert_file,
                    cfg.tls_key_file,
                    e,
                    cfg.https_port
                );
                serve_plain(state, web_app, web_server_port, false).await;
            }
        }
    } else {
        serve_plain(state, web_app, web_server_port, true).await;
    }
}

/// Run the plain-HTTP web server (and, when HTTPS is disabled, the separate
/// websocket listener like the original WS_LISTEN_PORT).
async fn serve_plain(state: Arc<AppState>, web_app: Router, web_port: u16, separate_ws: bool) {
    let web_addr = SocketAddr::from(([0, 0, 0, 0], web_port));
    let web_listener = tokio::net::TcpListener::bind(web_addr)
        .await
        .expect("failed to bind web port");

    if separate_ws && state.cfg.ws_listen_port != web_port {
        // Separate websocket listener (wss_options.port in server.js)
        let ws_app = Router::new()
            .route("/", get(ws_handler))
            .fallback(get(ws_handler))
            .with_state(state.clone());
        let ws_addr = SocketAddr::from(([0, 0, 0, 0], state.cfg.ws_listen_port));
        let ws_listener = tokio::net::TcpListener::bind(ws_addr)
            .await
            .expect("failed to bind websocket listen port");

        zlog!(
            "Zorbio v{}-{} is listening on http://localhost:{} (ws on {})",
            VERSION,
            BUILD,
            web_port,
            state.cfg.ws_listen_port
        );

        let web = tokio::spawn(async move {
            let _ = axum::serve(web_listener, web_app).await;
        });
        let ws = tokio::spawn(async move {
            let _ = axum::serve(ws_listener, ws_app).await;
        });

        wait_for_shutdown().await;
        let _ = tokio::join!(web, ws);
    } else {
        zlog!(
            "Zorbio v{}-{} is listening on http://localhost:{}",
            VERSION,
            BUILD,
            web_port
        );

        let web = tokio::spawn(async move {
            let _ = axum::serve(web_listener, web_app).await;
        });

        wait_for_shutdown().await;
        let _ = web.await;
    }
}

/// Handle ctrl-c / SIGTERM like the Node termination handlers, then exit.
async fn wait_for_shutdown() {
    let ctrl_c = tokio::signal::ctrl_c();
    #[cfg(unix)]
    {
        let mut sigterm =
            tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate())
                .expect("failed to install SIGTERM handler");
        tokio::select! {
            _ = ctrl_c => {},
            _ = sigterm.recv() => {},
        }
    }
    #[cfg(not(unix))]
    {
        let _ = ctrl_c.await;
    }
    zlog!("Node server stopped. (rust)");
    std::process::exit(0);
}

/// Graceful shutdown signal for axum_server.
async fn shutdown_signal(handle: axum_server::Handle) {
    wait_for_shutdown_quiet().await;
    handle.graceful_shutdown(Some(std::time::Duration::from_secs(5)));
}

async fn wait_for_shutdown_quiet() {
    let ctrl_c = tokio::signal::ctrl_c();
    #[cfg(unix)]
    {
        let mut sigterm =
            tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate())
                .expect("failed to install SIGTERM handler");
        tokio::select! {
            _ = ctrl_c => {},
            _ = sigterm.recv() => {},
        }
    }
    #[cfg(not(unix))]
    {
        let _ = ctrl_c.await;
    }
}

// ---------------------------------------------------------------------------
// Websocket handling (AppProxy.wss.on('connection'))
// ---------------------------------------------------------------------------

/// Dedicated websocket handler (separate ws listener).
async fn ws_handler(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    ws: WebSocketUpgrade,
) -> Response {
    upgrade_or_forbid(state, headers, ws).await
}

/// Route "/" on the web server: websocket upgrade when requested, otherwise
/// the static index page.  (The original only shares the port in HTTPS mode;
/// accepting upgrades here as well is a harmless superset that makes
/// single-port reverse-proxy deployments work.)
async fn index_or_ws(State(state): State<Arc<AppState>>, req: Request) -> Response {
    let (mut parts, _body) = req.into_parts();

    if is_ws_upgrade(&parts.headers) {
        let headers = parts.headers.clone();
        match WebSocketUpgrade::from_request_parts(&mut parts, &()).await {
            Ok(ws) => return upgrade_or_forbid(state, headers, ws).await,
            Err(_) => return (StatusCode::BAD_REQUEST, "expected websocket request").into_response(),
        }
    }

    serve_index(&state).await
}

async fn serve_index(state: &AppState) -> Response {
    let index_path = std::path::Path::new(&state.static_dir).join("index.html");
    match tokio::fs::read(&index_path).await {
        Ok(bytes) => (
            [(header::CONTENT_TYPE, "text/html; charset=utf-8")],
            bytes,
        )
            .into_response(),
        Err(_) => (
            StatusCode::NOT_FOUND,
            format!("index.html not found under {}", state.static_dir),
        )
            .into_response(),
    }
}

fn is_ws_upgrade(headers: &HeaderMap) -> bool {
    headers
        .get(header::UPGRADE)
        .and_then(|v| v.to_str().ok())
        .map(|v| v.eq_ignore_ascii_case("websocket"))
        .unwrap_or(false)
        && headers
            .get(header::CONNECTION)
            .and_then(|v| v.to_str().ok())
            .map(|v| v.to_ascii_lowercase().contains("upgrade"))
            .unwrap_or(false)
}

async fn upgrade_or_forbid(
    state: Arc<AppState>,
    headers: HeaderMap,
    ws: WebSocketUpgrade,
) -> Response {
    // Origin check (wssVerifyClient)
    if state.cfg.check_origin && !origin_allowed(&state.cfg, &headers) {
        let origin = headers
            .get(header::ORIGIN)
            .and_then(|v| v.to_str().ok())
            .unwrap_or("<none>");
        zlog!("Invalid origin: {}", origin);
        return (StatusCode::FORBIDDEN, "invalid origin").into_response();
    }

    // Route the connection to a game instance (AppProxy connection routing)
    let instance = choose_instance(&state).await;

    let uuid = Uuid::new_v4();
    let headers_json = headers_to_json(&headers);
    let nb_srv_id = parse_nb_srv_id_cookie(&headers);

    ws.on_upgrade(move |socket| async move {
        // Spawn the per-connection pump and register with the game instance,
        // carrying the pump's abort handle so the instance can reclaim the
        // connection immediately when it needs to (heartbeat-timeout kicks).
        let (out_tx, out_rx) = mpsc::unbounded_channel::<Message>();
        let pump = tokio::spawn(connection_pump(instance.clone(), uuid, socket, out_rx));

        instance.send(InstanceMsg::Connected {
            uuid,
            out: out_tx,
            abort: pump.abort_handle(),
            headers: headers_json,
            nb_srv_id,
        });
    })
}

/// AppProxy connection routing: first non-full instance, else lowest
/// population instance.
async fn choose_instance(state: &AppState) -> GameInstanceHandle {
    for instance in &state.instances {
        if let Some(stats) = instance.stats().await {
            if stats.clients < state.cfg.max_players_per_instance {
                return instance.clone();
            }
        }
    }

    zlog!("All game instances full!");

    let mut best = state
        .instances
        .first()
        .expect("at least one game instance")
        .clone();
    let mut best_count = usize::MAX;
    for instance in &state.instances {
        if let Some(stats) = instance.stats().await {
            if stats.clients < best_count {
                best_count = stats.clients;
                best = instance.clone();
            }
        }
    }
    best
}

/// The per-connection pump: forwards socket frames into the game instance and
/// instance messages back out to the socket.
async fn connection_pump(
    instance: GameInstanceHandle,
    uuid: Uuid,
    mut socket: WebSocket,
    mut out_rx: mpsc::UnboundedReceiver<Message>,
) {
    loop {
        tokio::select! {
            outbound = out_rx.recv() => {
                match outbound {
                    Some(msg) => {
                        if socket.send(msg).await.is_err() {
                            break;
                        }
                    }
                    None => break, // instance dropped us
                }
            }
            inbound = socket.recv() => {
                match inbound {
                    Some(Ok(msg)) => match msg {
                        Message::Text(text) => {
                            instance.send(InstanceMsg::Text { uuid, text: text.to_string() });
                        }
                        Message::Binary(data) => {
                            instance.send(InstanceMsg::Binary { uuid, data: data.to_vec() });
                        }
                        Message::Close(_) => break,
                        _ => {}
                    },
                    _ => break, // closed or error
                }
            }
        }
    }

    instance.send(InstanceMsg::Disconnected { uuid });
}

fn headers_to_json(headers: &HeaderMap) -> String {
    let mut map = serde_json::Map::new();
    for (name, value) in headers.iter() {
        if let Ok(v) = value.to_str() {
            map.insert(
                name.as_str().to_string(),
                serde_json::Value::String(v.to_string()),
            );
        }
    }
    serde_json::Value::Object(map).to_string()
}

/// AppProxy origin check (validUrl.is_web_uri + BALANCERS hostnames, minus
/// localhost), plus the ALLOWED_ORIGINS env additions.
fn origin_allowed(cfg: &Config, headers: &HeaderMap) -> bool {
    let origin = match headers.get(header::ORIGIN).and_then(|v| v.to_str().ok()) {
        Some(o) => o,
        None => return false,
    };

    // validUrl.is_web_uri approximation: scheme + host required
    let (scheme, rest) = match origin.split_once("://") {
        Some(x) => x,
        None => return false,
    };
    if scheme != "http" && scheme != "https" && scheme != "ws" && scheme != "wss" {
        return false;
    }
    let host_port = rest.split('/').next().unwrap_or("");
    let hostname = match host_port.rsplit_once(':') {
        Some((h, port)) => {
            if port.chars().all(|c| c.is_ascii_digit()) && !port.is_empty() {
                h
            } else {
                host_port
            }
        }
        None => host_port,
    };
    if hostname.is_empty() {
        return false;
    }

    let allowed = cfg
        .balancers
        .values()
        .filter(|v| v.as_str() != "localhost")
        .chain(cfg.allowed_origins.iter());
    for a in allowed {
        if a.eq_ignore_ascii_case(hostname) {
            return true;
        }
    }
    false
}

/// AppServer.parseNbSrvIdCookie
fn parse_nb_srv_id_cookie(headers: &HeaderMap) -> String {
    let cookie_header = match headers.get(header::COOKIE).and_then(|v| v.to_str().ok()) {
        Some(c) => c,
        None => return String::new(),
    };

    for pair in cookie_header.split(';') {
        let pair = pair.trim();
        if let Some((name, value)) = pair.split_once('=') {
            if name.trim() == "NB_SRVID" {
                return value.trim().to_string();
            }
        }
    }

    String::new()
}

// ---------------------------------------------------------------------------
// Linode nodebalancer sticky session routes (AppProxy)
// ---------------------------------------------------------------------------

/// GET /nbsrv/:nb/:id - write sticky session cookie and bounce to the
/// balancer subdomain.
async fn nbsrv(State(state): State<Arc<AppState>>, Path((nb, id)): Path<(String, String)>) -> Response {
    let balancer_domain = state.cfg.balancers.get(&nb).cloned();

    let mut response = Response::new(Body::empty());
    *response.status_mut() = StatusCode::FOUND;

    if let Some(domain) = balancer_domain {
        let bounce_url = format!("http://{}/nbsrv_bounce/{}", domain, id);
        response.headers_mut().insert(
            header::LOCATION,
            bounce_url.parse().unwrap_or(axum::http::HeaderValue::from_static("/")),
        );
    } else {
        *response.status_mut() = StatusCode::NOT_FOUND;
        return response;
    }

    if !id.is_empty() {
        if let Ok(cookie) = format!("NB_SRVID={}; Path=/", id).parse() {
            response.headers_mut().insert(header::SET_COOKIE, cookie);
        }
    }

    response
}

/// GET /nbsrv_bounce/:id - set the cookie at the nodebalancer subdomain and
/// bounce back to the homepage.
async fn nbsrv_bounce(Path(id): Path<String>) -> Response {
    let mut response = Response::new(Body::empty());
    *response.status_mut() = StatusCode::FOUND;

    response.headers_mut().insert(
        header::LOCATION,
        axum::http::HeaderValue::from_static("http://zor.bio/"),
    );

    if !id.is_empty() {
        if let Ok(cookie) = format!("NB_SRVID={}; Path=/", id).parse() {
            response.headers_mut().insert(header::SET_COOKIE, cookie);
        }
    }

    response
}
