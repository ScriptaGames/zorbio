//! Shared utilities: math, randomness, name filtering, logging.
//! Port of common/util.js (server-relevant parts).

use std::collections::VecDeque;
use std::fmt;
use std::time::{SystemTime, UNIX_EPOCH};

use rand::Rng;

use crate::config::Config;

/// Simple 3D vector, equivalent of THREE.Vector3 (f64 internally like JS numbers).
#[derive(Debug, Clone, Copy, PartialEq, Default)]
pub struct Vector3 {
    pub x: f64,
    pub y: f64,
    pub z: f64,
}

impl Vector3 {
    pub fn new(x: f64, y: f64, z: f64) -> Self {
        Vector3 { x, y, z }
    }

    #[allow(dead_code)]
    pub fn set(&mut self, x: f64, y: f64, z: f64) {
        self.x = x;
        self.y = y;
        self.z = z;
    }

    pub fn distance_to(&self, other: &Vector3) -> f64 {
        self.distance_to_squared(other).sqrt()
    }

    pub fn distance_to_squared(&self, other: &Vector3) -> f64 {
        let dx = self.x - other.x;
        let dy = self.y - other.y;
        let dz = self.z - other.z;
        dx * dx + dy * dy + dz * dz
    }

    pub fn length(&self) -> f64 {
        self.length_squared().sqrt()
    }

    pub fn length_squared(&self) -> f64 {
        self.x * self.x + self.y * self.y + self.z * self.z
    }

    /// Returns a normalized copy.  JS Vector3.normalize() divides by length (no zero check,
    /// producing NaN for zero vectors, same as here).
    pub fn normalized(&self) -> Vector3 {
        let len = self.length();
        Vector3::new(self.x / len, self.y / len, self.z / len)
    }
}

/// Milliseconds since the unix epoch (JS `Date.now()`).
pub fn now_ms() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis() as u64
}

fn timestamp() -> String {
    let ms = now_ms();
    let secs = ms / 1000;
    let ms_part = ms % 1000;
    // Format as UTC date-time, similar to console-stamp's mm/dd/yyyy HH:MM:ss.l
    let days = secs / 86400;
    let rem = secs % 86400;
    let (h, m, s) = (rem / 3600, (rem % 3600) / 60, rem % 60);
    // civil-from-days algorithm
    let z = days as i64 + 719_468;
    let era = if z >= 0 { z } else { z - 146_096 } / 146_097;
    let doe = (z - era * 146_097) as u64;
    let yoe = (doe - doe / 1460 + doe / 36524 - doe / 146_096) / 365;
    let y = yoe as i64 + era * 400;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let d = doy - (153 * mp + 2) / 5 + 1;
    let mth = if mp < 10 { mp + 3 } else { mp - 9 };
    let y = if mth <= 2 { y + 1 } else { y };
    format!(
        "{:02}/{:02}/{:04} {:02}:{:02}:{:02}.{:03}",
        mth, d, y, h, m, s, ms_part
    )
}

/// Timestamped log line, port of console-stamp output.
pub fn log_line(args: fmt::Arguments<'_>) {
    println!("[{}] {}", timestamp(), args);
}

#[macro_export]
macro_rules! zlog {
    ($($arg:tt)*) => { $crate::util::log_line(format_args!($($arg)*)) };
}

/// UTIL.clamp
#[allow(dead_code)]
pub fn clamp(n: f64, min: f64, max: f64) -> f64 {
    n.max(min).min(max)
}

/// UTIL.getRandomIntInclusive with f64 bounds (exact JS semantics:
/// Math.floor(Math.random() * (max - min + 1)) + min).
pub fn get_random_int_inclusive_f64(rng: &mut impl Rng, min: f64, max: f64) -> f64 {
    let v: f64 = rng.gen::<f64>();
    (v * (max - min + 1.0)).floor() + min
}

/// UTIL.getRandomIntInclusive with integer bounds.
pub fn get_random_int_inclusive(rng: &mut impl Rng, min: i64, max: i64) -> i64 {
    get_random_int_inclusive_f64(rng, min as f64, max as f64) as i64
}

/// UTIL.getRandomArbitrary: random between min (inclusive) and max (exclusive).
#[allow(dead_code)]
pub fn get_random_arbitrary(rng: &mut impl Rng, min: f64, max: f64) -> f64 {
    let v: f64 = rng.gen::<f64>();
    v * (max - min) + min
}

/// UTIL.safeRandomCoordinate
pub fn safe_random_coordinate(cfg: &Config, d: f64) -> f64 {
    let v: f64 = rand::thread_rng().gen();
    let safe_size = (cfg.world_size / d) - (2.0 * cfg.initial_player_radius);
    v * safe_size - safe_size / 2.0
}

/// UTIL.randomWorldPosition
pub fn random_world_position(cfg: &Config, d: f64) -> Vector3 {
    let divide = if d == 0.0 { 1.0 } else { d };
    Vector3::new(
        safe_random_coordinate(cfg, divide),
        safe_random_coordinate(cfg, divide),
        safe_random_coordinate(cfg, divide),
    )
}

/// UTIL.randomHorizontalPosition - y is fixed at 1
pub fn random_horizontal_position(cfg: &Config) -> Vector3 {
    Vector3::new(safe_random_coordinate(cfg, 1.0), 1.0, safe_random_coordinate(cfg, 1.0))
}

/// UTIL.threePad - next multiple of three greater than n.
pub fn three_pad(n: i64) -> i64 {
    n + (3 - n % 3)
}

/// UTIL.pushShift - push onto array keeping max length.
pub fn push_shift<T: Copy>(arr: &mut VecDeque<T>, value: T, max_length: usize) {
    arr.push_back(value);
    if arr.len() > max_length {
        arr.pop_front();
    }
}

/// Median of a copied slice (UTIL.median).
#[allow(dead_code)]
pub fn median(values: &mut [f64]) -> f64 {
    if values.is_empty() {
        return f64::NAN;
    }
    values.sort_by(|a, b| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal));
    let half = values.len() / 2;
    if values.len() % 2 == 1 {
        values[half]
    } else {
        (values[half - 1] + values[half]) / 2.0
    }
}

