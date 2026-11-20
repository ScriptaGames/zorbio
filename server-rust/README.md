# Zorbio Server (Rust)

A Rust port of the original Zorbio Node.js game server
(`server/server.js` + `server/AppServer.js` + friends), built on **axum** and
**tokio**. The browser client is unchanged — this server speaks the exact same
wire protocol as the Node server, so the existing `client/` (or built `dist/`)
static assets work as-is.

## What was ported

| Node.js module                        | Rust module                    |
| ------------------------------------- | ------------------------------ |
| `server/server.js`                    | `src/main.rs`                  |
| `server/AppProxy.js`                  | `src/main.rs` (routing)        |
| `server/AppServer.js`                 | `src/game.rs`                  |
| `server/ZorApi.js`                    | `src/api.rs`                   |
| `server/BotController.js`, `Bot.js`   | `src/bots.rs`                  |
| `server/Validators.js`                | `src/validators.rs`            |
| `server/Drain.js`                     | `src/drain.rs`                 |
| `server/Backend.js` (App42)           | `src/backend.rs` (in-memory)   |
| `common/zorbio.js`                    | `src/model.rs`                 |
| `common/config.js`, `environment.js`  | `src/config.rs`                |
| `common/schemas.js` (schemapack)      | `src/protocol.rs` + `src/spack.rs` |
| `common/util.js` (server parts)       | `src/util.rs`, `src/food.rs`   |
| `common/CurveExtras.js`, `CurvePaths.js`, three.js `CatmullRomCurve3` | `src/curves.rs` |

Each game instance runs as a single tokio task that owns all of its state —
the same serialization the original single-threaded Node event loop provided.
WebSocket connections communicate with the instance through channels; there
are no locks on the hot path.

## Protocol compatibility

The binary messages are encoded with a byte-compatible reimplementation of
`schemapack` v1.4.2:

- all multi-byte scalars are **big endian**
- `varuint` is LEB128
- strings/arrays carry varuint length prefixes
- object fields are encoded in **lexicographically sorted key order** (this is
  what `schemapack` does — see `src/protocol.rs` for the sorted field order of
  every message)

JSON (text) messages, the raw `CLIENT_POSITION_RAPID` frames (5 × float32
little-endian), the 50 ms fast tick, the 200 ms slow tick, food respawns,
drains, captures, bot AI, speed boost with penalty, heartbeats, infractions
and kicks all mirror the original logic, including quirks like the 200 ms
player-join delay, the `PAUL LYONS` god mode, and the bot that gets popped
when a real player joins a full instance.

## Building

```bash
cd server-rust
cargo build --release
```

## Running

```bash
# dev config (small world, 10 bots, no origin check) + serve the dev client
ZOR_ENV=dev ./target/release/zorbio-server ../client

# prod-style config + serve the built client (like `npm run start-prod`)
ZOR_ENV=prod ./target/release/zorbio-server ../dist
```

The first positional argument is the static content root (`client` by
default; the production scripts pass `dist`).

### Configuration

Everything the Node server reads is supported:

| Env var             | Meaning                                              | Default (`ZOR_ENV` unset) |
| ------------------- | ---------------------------------------------------- | ------------------------- |
| `ZOR_ENV`           | `dev` or `prod` overrides (see `common/environment.js`) | default config          |
| `HTTP_PORT`         | web server port                                      | 8080                      |
| `HTTPS_PORT`        | https port (only used with `ENABLE_HTTPS`)           | 8443                      |
| `WS_LISTEN_PORT`    | websocket port (http mode)                           | 31000                     |
| `SERVER_LABEL`      | instance label used in server UUIDs                  | random uuid               |
| `HEARTBEAT_TIMEOUT` | heartbeat watchdog timeout in ms (**Rust port addition**) | 30000                 |
| `MAX_BOTS`          | bots per instance                                    | 20 (dev: 10)              |
| `NUM_GAME_INSTANCES`| game instances                                       | 1                         |
| `ALLOWED_ORIGINS`   | extra allowed websocket origin hostnames (comma separated, **Rust port addition**) | — |

Behavior by environment (matching `common/environment.js`):

- `ZOR_ENV=dev`: world 1000, food density 10, 10 bots, heartbeat check off,
  origin check off.
- `ZOR_ENV=prod`: origin check on, HTTPS on, backend service on.
- default: world 2000, food density 32, 20 bots, origin check on, HTTP +
  separate WS port (like the Node defaults).

### TLS

With `ZOR_ENV=prod` (or any config with `ENABLE_HTTPS`), the server loads
`TLS_CERT_FILE` / `TLS_KEY_FILE` (defaults match the Node server:
`/etc/pki/tls/certs/zorb.io.pem` and `/etc/pki/tls/private/zorb.io.key`) and
serves web + websocket on the HTTPS port over TLS. If the files cannot be
loaded it falls back to plain HTTP with a loud warning — terminate TLS
upstream (reverse proxy / ingress) if you prefer that.

### Differences from the Node server

- **Leaderboards backend**: the original talks to the long-dead App42 cloud
  service through a PHP CLI. The Rust port keeps the same leaderboard
  protocol messages (`LEADERBOARDS_UPDATE`, refresh intervals, high-score
  detection) but stores scores in an in-memory store local to the process.
  Scores are not persisted across restarts.
- **Version check**: `CHECK_VERSION` (disabled by default in the original)
  is accepted but does not perform the remote GitHub version check.
- **`/api/games/:id/out`**: returned `undefined` in the original (the field
  does not exist on `AppServer`); the port returns `null` with 200.
- **Ghost player fix**: if a client disconnects within the 200 ms join delay,
  the Node server still broadcast a `player_join` and re-added the player to
  the model. The port skips the join for disconnected sockets.
- **Robustness**: malformed/early messages (e.g. `player_ready` before
  `enter_game`) are ignored instead of throwing.

## Memory behavior

There are steady *transient* allocations while the game runs (per-tick encode
buffers for actor updates / tick-slow, per-message decode buffers, one
short-lived timer task per `player_ready`) — all freed at the end of each
tick, so steady-state memory is flat and independent of uptime. All
per-player structures are hard-capped (`recent_positions` ≤ 30, client
metric series ≤ 100, speed infractions expire in 10 s).

When a player **leaves** (socket close), every session resource is freed
deterministically (no GC):

- the connection pump task ends → the OS socket is closed
- `clients` map entry dropped → the outbound channel is closed
- `states` map entry dropped → the `Player` (name, skin, recent positions,
  all six metric series, infractions, captured headers)
- `model.players` entry removed (if the player had joined)
- `socket_uuid_map` entry removed
- a replacement bot is spawned (bounded by `MAX_BOTS`)

Peers that vanish **without** a TCP FIN/RST are reclaimed by the 30 s
heartbeat watchdog (`HEARTBEAT_TIMEOUT` env to tune): the kick message and a
close frame are queued in order, and a 2 s backstop hard-aborts the
connection even if its TCP send buffer can never drain. The in-memory
leaderboard store is pruned to 31 days / 100 000 entries on every refresh
cycle (leaderboards only ever query the last 30 days).

## Monitoring API

Same endpoints as the original (`server/ZorApi.js`):

- `GET /api/games` — totals + per-instance client/player/bot counts
- `GET /api/games/:id/players/count`
- `GET /api/games/:id/players`
- `GET /api/games/:id/actors`
- `GET /api/games/:id/food`
- `GET /api/games/:id/clients/count`
- `GET /api/games/:id/out`

Plus the Linode nodebalancer sticky-session routes `GET /nbsrv/:nb/:id` and
`GET /nbsrv_bounce/:id`.

## Tests

```bash
cargo test
```

- unit tests for the wire format (schemapack encoding, message layouts,
  curves, food maps)
- an end-to-end integration test that boots the server and drives a headless
  client through the whole protocol: connect → `INIT_GAME` → `enter_game` →
  `WELCOME` → `player_ready` → `game_setup` → `player_join` → heartbeat →
  leaderboards → rapid/player position updates → disconnect
- a stress test with 8 concurrent clients and a production-config boot test
  (world 2000, 29 791 food particles, 20 bots, origin checking)

## Docker

```bash
podman build -t zorbio-rust .
podman run -p 8080:8080 -p 31000:31000 zorbio-rust
```

## Layout

```
server-rust/
├── Cargo.toml
├── Dockerfile
├── data/               # bot names + profanity list (from the npm packages)
├── tests/              # integration + stress tests (headless clients)
└── src/
    ├── main.rs         # entry point, routers, websocket pump, nbsrv routes
    ├── config.rs       # config + env overrides
    ├── game.rs         # game instance: ticks, connection handling, captures
    ├── model.rs        # players, spheres, abilities, metrics
    ├── protocol.rs     # message schemas (schemapack wire format)
    ├── spack.rs        # schemapack primitives (BE, LEB128 varuint)
    ├── bots.rs         # bot controller + movement patterns
    ├── curves.rs       # knot curves + chordal Catmull-Rom (three.js r88)
    ├── food.rs         # food map generation (random / grid / curves)
    ├── drain.rs        # drain mechanics
    ├── validators.rs   # anti-cheat validation
    ├── backend.rs      # in-memory leaderboard store
    ├── api.rs          # monitoring API
    ├── state.rs        # shared app state
    ├── names.rs        # bot name pool
    └── util.rs         # math, name filtering, logging
```
