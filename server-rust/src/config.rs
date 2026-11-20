//! Server configuration. Port of common/config.js (server-relevant values)
//! plus the ZOR_ENV overrides from common/environment.js and process env vars.

use std::collections::HashMap;

/// Valid player skins (common/SkinCatalog.js keys).
pub const SKIN_CATALOG: [&str; 11] = [
    "default", "earth", "jupiter", "neptune", "uranus", "venus", "mars", "kitten", "boing",
    "reddit", "lyons",
];
/// Player color palette (config.COLORS).  The wire `color` field is an index
/// into this array.
pub const COLORS: [&str; 29] = [
    // new colors
    "#e5353a", "#e53570", "#e535c4", "#7135e5", "#353de5", "#3588e5", "#35dde5", "#35e5a3",
    "#35e569", "#36e535", "#96e535", "#e5bf35", "#e57035", "#e53f35", "#e40000",
    // current colors
    "#38FF4D", "#38FFC3", "#417AFF", "#41ACFF", "#5941FF", "#99FF38", "#A040FF", "#E140FF",
    "#F8FF38", "#FF386A", "#FF6B38", "#FF6DD2", "#FFB638", "#FFF42E",
];

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[allow(dead_code)]
pub enum BotMovement {
    Hold,
    Chase,
    RandomPoint,
    Curve,
}

impl BotMovement {
    #[allow(dead_code)]
    pub fn from_str(s: &str) -> BotMovement {
        match s {
            "hold" => BotMovement::Hold,
            "chase" => BotMovement::Chase,
            "randomPoint" => BotMovement::RandomPoint,
            _ => BotMovement::Curve,
        }
    }
}

#[derive(Debug, Clone)]
#[allow(dead_code)]
pub struct Config {
    /////////////////////////////////////////////////////////////////////
    // world settings
    /////////////////////////////////////////////////////////////////////
    pub world_size: f64,

    /////////////////////////////////////////////////////////////////////
    // bot settings
    /////////////////////////////////////////////////////////////////////
    pub max_bots: usize,
    pub max_bot_radius: f64,
    pub bot_chase_time_min: u64,
    pub bot_chase_time_max: u64,
    pub bot_default_movement: BotMovement,

    /////////////////////////////////////////////////////////////////////
    // network settings
    /////////////////////////////////////////////////////////////////////
    pub enable_web_server: bool,
    pub enable_https: bool,
    pub http_port: u16,
    pub https_port: u16,
    pub ws_listen_port: u16,
    pub ws_connect_port: u16,
    pub num_game_instances: usize,
    pub max_players_per_instance: usize,
    pub heartbeat_enable: bool,
    pub heartbeat_timeout: u64,
    pub tick_slow_interval: u64,
    pub tick_fast_interval: u64,
    pub leaderboard_refresh_interval: u64,
    pub check_version: bool,
    pub check_version_interval: u64,
    pub leaders_length: usize,
    pub check_origin: bool,
    pub recent_client_data_length: usize,
    pub status_log_delay: u64,
    pub enable_rapid_updates: bool,
    pub enable_backend_service: bool,
    pub tls_cert_file: String,
    pub tls_key_file: String,
    /// Extra origins allowed for websocket connections (addition for the Rust port,
    /// configured with the ALLOWED_ORIGINS env var, comma separated host names).
    pub allowed_origins: Vec<String>,

    /////////////////////////////////////////////////////////////////////
    // player settings
    /////////////////////////////////////////////////////////////////////
    pub initial_player_radius: f64,
    pub max_player_radius: f64,
    pub max_player_speed: f64,
    pub stationary_radius: f64,

    /////////////////////////////////////////////////////////////////////
    // ability settings
    /////////////////////////////////////////////////////////////////////
    pub ability_speed_boost_duration: u64,
    pub ability_speed_boost_min_scale: f64,
    pub ability_speed_boost_multiplier: f64,
    pub ability_speed_boost_penalty: f64,

    /////////////////////////////////////////////////////////////////////
    // drain settings
    /////////////////////////////////////////////////////////////////////
    pub drain_max_distance: f64,
    pub drain_pinch_strength: f64,
    pub drain_radio_frequency: u64,
    pub drain_size_influence: f64,

    /////////////////////////////////////////////////////////////////////
    // food settings
    /////////////////////////////////////////////////////////////////////
    pub food_density: u32,
    pub food_value: f64,
    pub food_respawn_time: u32,
    pub food_capture_assist: f64,
    pub food_map_type: String,

    /////////////////////////////////////////////////////////////////////
    // validation settings
    /////////////////////////////////////////////////////////////////////
    pub enable_validation: bool,
    pub food_capture_extra_tolerance: f64,
    pub player_capture_extra_tolerance: f64,
    pub speed_extra_tolerance: f64,
    pub player_scale_extra_tolerance: f64,
    pub player_positions_window: usize,
    pub infraction_tolerance_food: u32,
    pub infraction_tolerance_pcap: u32,
    pub infraction_tolerance_scale: u32,
    pub infraction_tolerance_speed: usize,
    pub infraction_tolerance_speed_burst: u32,
    pub move_validation_sample_rate: u64,
    pub infraction_speed_expire: i64,
    pub speed_burst_detection_window: usize,
    pub loading_wait_duration: u64,
    pub max_player_name_length: usize,
    pub max_not_in_model_errors: u32,

    /////////////////////////////////////////////////////////////////////
    // leaderboard settings
    /////////////////////////////////////////////////////////////////////
    pub leaderboard_length: usize,
    pub initial_player_score: u64,

    /////////////////////////////////////////////////////////////////////
    // misc
    /////////////////////////////////////////////////////////////////////
    pub debug: bool,
    pub require_alpha_key: bool,
    pub balancers: HashMap<String, String>,
}

impl Default for Config {
    fn default() -> Self {
        let world_size = 2000.0;
        let initial_player_radius = 5.0;
        let max_player_radius = 150.0;

        let mut balancers = HashMap::new();
        balancers.insert("LOCAL".to_string(), "localhost".to_string());
        balancers.insert("fremont".to_string(), "uswest.zorb.io".to_string());
        balancers.insert("dallas".to_string(), "uscentral.zorb.io".to_string());
        balancers.insert("newark".to_string(), "useast.zorb.io".to_string());
        balancers.insert("london".to_string(), "uk.zorb.io".to_string());
        balancers.insert("frankfurt".to_string(), "eu.zorb.io".to_string());
        balancers.insert("singapore".to_string(), "apac.zorb.io".to_string());
        balancers.insert("zor_bio".to_string(), "zor.bio".to_string());
        balancers.insert("zor_bio_www".to_string(), "www.zor.bio".to_string());
        balancers.insert("zorb_io".to_string(), "zorb.io".to_string());
        balancers.insert("zorb_io_www".to_string(), "www.zorb.io".to_string());

        Config {
            world_size,

            max_bots: 20,
            max_bot_radius: 100.0,
            bot_chase_time_min: 20000,
            bot_chase_time_max: 45000,
            bot_default_movement: BotMovement::Curve,

            enable_web_server: true,
            enable_https: false,
            http_port: 8090,
            https_port: 8443,
            ws_listen_port: 31000,
            ws_connect_port: 31000,
            num_game_instances: 1,
            max_players_per_instance: 40,
            heartbeat_enable: true,
            heartbeat_timeout: 30000,
            tick_slow_interval: 200,
            tick_fast_interval: 50,
            leaderboard_refresh_interval: 900000,
            check_version: false,
            check_version_interval: 30000,
            leaders_length: 10,
            check_origin: true,
            recent_client_data_length: 100,
            status_log_delay: 15000,
            enable_rapid_updates: true,
            enable_backend_service: false,
            tls_cert_file: "/etc/pki/tls/certs/zorb.io.pem".to_string(),
            tls_key_file: "/etc/pki/tls/private/zorb.io.key".to_string(),
            allowed_origins: Vec::new(),

            initial_player_radius,
            max_player_radius,
            max_player_speed: 2.0,
            stationary_radius: max_player_radius + 25.0,

            ability_speed_boost_duration: 500,
            ability_speed_boost_min_scale: initial_player_radius,
            ability_speed_boost_multiplier: 1.75,
            ability_speed_boost_penalty: 0.05,

            drain_max_distance: 300.0,
            drain_pinch_strength: 0.4,
            drain_radio_frequency: 65,
            drain_size_influence: 0.4,

            food_density: 32,
            food_value: 0.5,
            food_respawn_time: 30000,
            food_capture_assist: 1.0,
            food_map_type: "curves".to_string(),

            enable_validation: false,
            food_capture_extra_tolerance: 10.0,
            player_capture_extra_tolerance: 1.0,
            speed_extra_tolerance: 0.4,
            player_scale_extra_tolerance: 0.1,
            player_positions_window: 30,
            infraction_tolerance_food: 20,
            infraction_tolerance_pcap: 1,
            infraction_tolerance_scale: 1,
            infraction_tolerance_speed: 15,
            infraction_tolerance_speed_burst: 3,
            move_validation_sample_rate: 5,
            infraction_speed_expire: 10000,
            speed_burst_detection_window: 4,
            loading_wait_duration: 10000,
            max_player_name_length: 20,
            max_not_in_model_errors: 100,

            leaderboard_length: 20,
            initial_player_score: (initial_player_radius * 10.0) as u64,

            debug: false,
            require_alpha_key: false,
            balancers,
        }
    }
}

impl Config {
    /// config.PLAYER_CAPTURE_VALUE(r) = r / 2
    pub fn player_capture_value(&self, r: f64) -> f64 {
        r / 2.0
    }

    /// config.PLAYER_GET_SPEED(r) = s - ((r * s) / STATIONARY_RADIUS)
    pub fn player_get_speed(&self, r: f64) -> f64 {
        let s = self.max_player_speed;
        s - ((r * s) / self.stationary_radius)
    }

    /// config.GET_PADDED_INT(radius) = floor(radius * 10)
    pub fn get_padded_int(radius: f64) -> u64 {
        (radius * 10.0).floor().max(0.0) as u64
    }

    /// config.FOOD_GET_VALUE(r) = FOOD_VALUE / (r - 4)
    pub fn food_get_value(&self, r: f64) -> f64 {
        self.food_value / (r - 4.0)
    }

    /// Load config applying ZOR_ENV and environment variable overrides.
    pub fn load() -> Config {
        let mut cfg = Config::default();

        let zor_env = std::env::var("ZOR_ENV").unwrap_or_default();
        match zor_env.as_str() {
            "dev" => {
                cfg.world_size = 1000.0;
                cfg.max_bots = 10;
                cfg.food_density = 10;
                cfg.initial_player_radius = 5.0;
                cfg.food_value = 5.0;
                cfg.debug = true;
                cfg.heartbeat_enable = false;
                cfg.check_origin = false;
                cfg.require_alpha_key = false;
                cfg.num_game_instances = 1;
                cfg.enable_https = false;
                cfg.enable_backend_service = false;
                cfg.bot_default_movement = BotMovement::Curve;
                cfg.ws_connect_port = 31000;
            }
            "prod" => {
                cfg.check_origin = true;
                cfg.enable_https = true;
                cfg.enable_backend_service = true;
                cfg.debug = false;
                cfg.ws_connect_port = 443;
            }
            _ => {}
        }

        // process env var overrides (server.js setupVariables)
        if let Ok(v) = std::env::var("HTTP_PORT") {
            if let Ok(p) = v.parse() {
                cfg.http_port = p;
            }
        }
        if let Ok(v) = std::env::var("HTTPS_PORT") {
            if let Ok(p) = v.parse() {
                cfg.https_port = p;
            }
        }
        if let Ok(v) = std::env::var("WS_LISTEN_PORT") {
            if let Ok(p) = v.parse() {
                cfg.ws_listen_port = p;
            }
        }
        if let Ok(v) = std::env::var("HEARTBEAT_TIMEOUT") {
            if let Ok(n) = v.parse() {
                cfg.heartbeat_timeout = n;
            }
        }
        if let Ok(v) = std::env::var("ALLOWED_ORIGINS") {
            cfg.allowed_origins = v
                .split(',')
                .map(|s| s.trim().to_lowercase())
                .filter(|s| !s.is_empty())
                .collect();
        }
        if let Ok(v) = std::env::var("MAX_BOTS") {
            if let Ok(n) = v.parse() {
                cfg.max_bots = n;
            }
        }
        if let Ok(v) = std::env::var("NUM_GAME_INSTANCES") {
            if let Ok(n) = v.parse() {
                cfg.num_game_instances = n;
            }
        }

        // The websocket port follows the https port when https is enabled (server.js)
        if cfg.enable_https {
            cfg.ws_listen_port = cfg.https_port;
        }

        cfg
    }
}
