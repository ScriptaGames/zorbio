//! Shared application state.

use std::sync::Arc;

use crate::config::Config;
use crate::game::GameInstanceHandle;

pub struct AppState {
    pub cfg: Arc<Config>,
    pub instances: Vec<GameInstanceHandle>,
    pub static_dir: String,
}
