//! HTTP monitoring API. Port of server/ZorApi.js.

use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use axum::Json;
use std::sync::Arc;

use crate::state::AppState;

/// GET /api/games - current count of players on this server
pub async fn games(State(state): State<Arc<AppState>>) -> Response {
    let mut total_players = 0usize;
    let mut total_bots = 0usize;
    let mut total_clients = 0usize;
    let mut games = Vec::new();

    for instance in &state.instances {
        if let Some(stats) = instance.stats().await {
            total_clients += stats.clients;
            total_players += stats.players;
            total_bots += stats.bots;
            games.push(serde_json::json!({
                "id": stats.id,
                "clients": stats.clients,
                "players": stats.players,
                "bots": stats.bots,
            }));
        }
    }

    let capacity = state.cfg.max_players_per_instance * state.cfg.num_game_instances;
    let response = serde_json::json!({
        "total_players": total_players,
        "total_bots": total_bots,
        "total_clients": total_clients,
        "percent_full": (total_players as f64 / capacity as f64) * 100.0,
        "games": games,
    });

    crate::zlog!("GET /api/games");
    Json(response).into_response()
}

fn instance_snapshot(state: &AppState, game_id: &str) -> Result<serde_json::Value, Response> {
    let id: usize = match game_id.parse() {
        Ok(id) => id,
        Err(_) => return Err(StatusCode::NOT_ACCEPTABLE.into_response()),
    };
    let instance = state
        .instances
        .iter()
        .find(|i| i.id == id)
        .ok_or_else(|| StatusCode::NOT_ACCEPTABLE.into_response())?;
    // snapshot is resolved by the caller (async); return a marker with the id
    Ok(serde_json::json!({ "__instance_id": instance.id }))
}

async fn snapshot_for(state: &Arc<AppState>, game_id: &str) -> Option<serde_json::Value> {
    let id: usize = game_id.parse().ok()?;
    let instance = state.instances.iter().find(|i| i.id == id)?;
    instance.snapshot().await
}

/// GET /api/games/:game_id/players/count
pub async fn players_count(
    State(state): State<Arc<AppState>>,
    Path(game_id): Path<String>,
) -> Response {
    match snapshot_for(&state, &game_id).await {
        Some(snap) => Json(serde_json::json!({"count": snap["player_count"].as_u64().unwrap_or(0)}))
            .into_response(),
        None => StatusCode::NOT_ACCEPTABLE.into_response(),
    }
}

/// GET /api/games/:game_id/players - all the player objects on this server
pub async fn players(State(state): State<Arc<AppState>>, Path(game_id): Path<String>) -> Response {
    match snapshot_for(&state, &game_id).await {
        Some(snap) => Json(snap["players"].clone()).into_response(),
        None => StatusCode::NOT_ACCEPTABLE.into_response(),
    }
}

/// GET /api/games/:game_id/out - the corresponding field does not exist on the
/// Node AppServer either (instance.out is undefined); keep the endpoint.
pub async fn out(State(state): State<Arc<AppState>>, Path(game_id): Path<String>) -> Response {
    let _ = instance_snapshot(&state, &game_id);
    match snapshot_for(&state, &game_id).await {
        Some(_) => Json(serde_json::json!(null)).into_response(),
        None => StatusCode::NOT_ACCEPTABLE.into_response(),
    }
}

/// GET /api/games/:game_id/actors - all the actor objects on this server
pub async fn actors(State(state): State<Arc<AppState>>, Path(game_id): Path<String>) -> Response {
    match snapshot_for(&state, &game_id).await {
        Some(snap) => Json(snap["actors"].clone()).into_response(),
        None => StatusCode::NOT_ACCEPTABLE.into_response(),
    }
}

/// GET /api/games/:game_id/food - food model info
pub async fn food(State(state): State<Arc<AppState>>, Path(game_id): Path<String>) -> Response {
    match snapshot_for(&state, &game_id).await {
        Some(snap) => Json(snap["food"].clone()).into_response(),
        None => StatusCode::NOT_ACCEPTABLE.into_response(),
    }
}

/// GET /api/games/:game_id/clients/count - number of socket connections
pub async fn clients_count(
    State(state): State<Arc<AppState>>,
    Path(game_id): Path<String>,
) -> Response {
    match snapshot_for(&state, &game_id).await {
        Some(snap) => Json(serde_json::json!({"count": snap["clients"].as_u64().unwrap_or(0)}))
            .into_response(),
        None => StatusCode::NOT_ACCEPTABLE.into_response(),
    }
}
