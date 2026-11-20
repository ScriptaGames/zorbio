//! Anti-cheat validation. Port of server/Validators.js.
//!
//! Note: like the original, all checks are no-ops unless
//! `config.ENABLE_VALIDATION` is true (it is false in both the default and
//! prod configurations of the original game).

use crate::config::Config;
use crate::model::{Model, Player};
use crate::util::Vector3;

/// Validators.ErrorCodes
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[allow(dead_code)]
pub enum ErrorCode {
    NoError = 0,
    PlayerNotInModel = 1,
    FoodCaptureTooFar = 2,
    PlayerCaptureTooFar = 3,
    NoChange = 4,
    SpeedTooFast = 5,
    PlayerScaleTooBig = 6,
}

const MS_PER_FRAME: f64 = 1.0 / 60.0 * 1000.0;

/// Validators.movementSampled - the original wraps movement() with
/// UTIL.nth(f, MOVE_VALIDATION_SAMPLE_RATE) using a single shared counter.
pub struct MovementValidator {
    counter: u64,
    sample_rate: u64,
}

impl MovementValidator {
    pub fn new(cfg: &Config) -> Self {
        MovementValidator {
            counter: 0,
            sample_rate: cfg.move_validation_sample_rate.max(1),
        }
    }

    /// Runs the movement validation every `sample_rate`-th call (shared counter
    /// across all players, same as the Node module-level closure).
    pub fn movement_sampled(
        &mut self,
        cfg: &Config,
        player: &Player,
        latest: &crate::model::RecentPosition,
        oldest: Option<&crate::model::RecentPosition>,
    ) -> ErrorCode {
        // UTIL.nth: execute on every Nth call
        if self.counter == self.sample_rate {
            self.counter = 0;
            Self::movement(cfg, player, latest, oldest)
        } else {
            self.counter += 1;
            ErrorCode::NoChange
        }
    }

    /// Validators.movement
    fn movement(
        cfg: &Config,
        player: &Player,
        latest: &crate::model::RecentPosition,
        oldest: Option<&crate::model::RecentPosition>,
    ) -> ErrorCode {
        if !cfg.enable_validation {
            return ErrorCode::NoError;
        }

        // Give the player a grace period while they are loading.
        let cur_time = crate::util::now_ms();
        let time_since_spawn = cur_time.saturating_sub(player.spawn_time);
        if time_since_spawn < cfg.loading_wait_duration {
            return ErrorCode::NoError;
        }

        if let Some(oldest) = oldest {
            let time = latest.time.saturating_sub(oldest.time) as f64;
            let min_time = (cfg.player_positions_window as f64 * MS_PER_FRAME) - 100.0;

            if player.sphere.recent_positions.len() < cfg.player_positions_window
                || time < min_time
            {
                return ErrorCode::NoError; // not enough time has passed to calculate
            }

            // get distance from point A to point B
            let vdist = oldest.position.distance_to(&latest.position);

            // find out what current speed should be based on scale
            let expected_speed = if player.speed_boost.is_active() {
                player.get_speed(cfg)
            } else {
                cfg.player_get_speed(oldest.radius)
            };

            let max_tolerated_speed = expected_speed + cfg.speed_extra_tolerance;
            let measured_speed = vdist / time;
            let actual_speed = MS_PER_FRAME * measured_speed;

            if actual_speed > max_tolerated_speed {
                return ErrorCode::SpeedTooFast;
            }
        }

        ErrorCode::NoError
    }
}

/// Validators.foodCapture
pub fn food_capture(
    cfg: &Config,
    model: &Model,
    fi: u32,
    sphere_position: &Vector3,
    radius: f64,
) -> ErrorCode {
    if !cfg.enable_validation {
        return ErrorCode::NoError;
    }

    // get food position
    let food_index = fi as usize * 3;
    if food_index + 2 >= model.food.len() {
        return ErrorCode::PlayerNotInModel;
    }
    let food_x = model.food[food_index] as f64;
    let food_y = model.food[food_index + 1] as f64;
    let food_z = model.food[food_index + 2] as f64;

    // calculate dist and tolerance
    let food_position = Vector3::new(food_x, food_y, food_z);
    let vdist = food_position.distance_to(sphere_position);
    let tolerance = radius + cfg.food_capture_assist + cfg.food_capture_extra_tolerance;

    // Make sure the sphere is in range of the food being captured
    if vdist > tolerance {
        return ErrorCode::FoodCaptureTooFar;
    }

    ErrorCode::NoError
}
