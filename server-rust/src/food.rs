//! Food map generation. Port of the foodMaps in common/util.js.

use rand::Rng;

use crate::config::Config;
use crate::curves::CurvePaths;
use crate::util::{get_random_int_inclusive_f64, three_pad, Vector3};

/// Generate a food position array ([X,Y,Z,X,Y,Z,...] as int16 values).
///
/// `count` is the number of food particles; the returned vec has count * 3
/// entries.  Mirrors UTIL.getFoodMap(type)(count, density).
pub fn generate_food_map(
    map_type: &str,
    count: usize,
    density: u32,
    cfg: &Config,
    rng: &mut impl Rng,
) -> Vec<i16> {
    match map_type {
        "grid" => food_map_grid(count, density, cfg),
        "curves" => food_map_curves(count, density, cfg, rng),
        _ => food_map_random(count, density, cfg, rng),
    }
}

/// foodMaps.random
fn food_map_random(count: usize, density: u32, cfg: &Config, rng: &mut impl Rng) -> Vec<i16> {
    let half_size = cfg.world_size / 2.0;
    let block_size = cfg.world_size / density as f64;
    let ints = 3usize; // 3 for XYZ
    let mut offset = 0usize;
    let mut positions = vec![0i16; count * 3];

    for i in 1..density as i64 {
        for j in 1..density as i64 {
            for k in 1..density as i64 {
                // set food position
                let x = half_size - (i as f64 * block_size)
                    + get_random_int_inclusive_f64(rng, -block_size, block_size);
                let y = half_size - (j as f64 * block_size)
                    + get_random_int_inclusive_f64(rng, -block_size, block_size);
                let z = half_size - (k as f64 * block_size)
                    + get_random_int_inclusive_f64(rng, -block_size, block_size);
                positions[offset] = x as i16;
                positions[offset + 1] = y as i16;
                positions[offset + 2] = z as i16;

                offset += ints;
            }
        }
    }

    positions
}

/// foodMaps.grid
fn food_map_grid(count: usize, density: u32, cfg: &Config) -> Vec<i16> {
    let half_size = cfg.world_size / 2.0;
    let block_size = cfg.world_size / density as f64;
    let ints = 3usize;
    let mut offset = 0usize;
    let mut positions = vec![0i16; count * 3];

    for i in 1..density as i64 {
        for j in 1..density as i64 {
            for k in 1..density as i64 {
                // set food position
                let x = half_size - (i as f64 * block_size);
                let y = half_size - (j as f64 * block_size);
                let z = half_size - (k as f64 * block_size);
                positions[offset] = x as i16;
                positions[offset + 1] = y as i16;
                positions[offset + 2] = z as i16;

                offset += ints;
            }
        }
    }

    positions
}

/// foodMaps.curves - start with random food positions, then overwrite ~10% of
/// them with points along curated curve paths.
fn food_map_curves(count: usize, density: u32, cfg: &Config, rng: &mut impl Rng) -> Vec<i16> {
    // start with random food positions
    let mut positions = food_map_random(count, density, cfg, rng);
    let ints = 3usize;

    // the percentage of food particles that should be positioned randomly, ie not in a curve
    let random_ratio = 0.9;
    let mut start_index = (positions.len() as f64 * random_ratio) as i64;
    // skip points on each curve to make them less dense (0 = use all points)
    let path_skip = 0usize;
    let mut path_index = 0usize;
    let mut path = CurvePaths::get_random_curve(cfg, rng);
    let mut random_points: Vec<i64> = Vec::new(); // log of used indexes

    // make sure startIndex aligns with the XYZ coordinates of the positions array
    start_index -= start_index % ints as i64;

    /// Return a random point (an index into positions, aligned to XYZ triples)
    /// that hasn't already been used.
    fn get_random_point(rng: &mut impl Rng, positions: &[i16], random_points: &mut Vec<i64>) -> i64 {
        loop {
            let random_point = three_pad(get_random_int_inclusive(
                rng,
                0,
                positions.len() as i64 - 4,
            ));
            if !random_points.contains(&random_point) {
                random_points.push(random_point);
                return random_point;
            }
        }
    }

    let mut i = start_index;
    while i < positions.len() as i64 {
        if path_index >= path.len() {
            path = CurvePaths::get_random_curve(cfg, rng);
            path_index = 0;
        }

        let point: Vector3 = path[path_index];

        let random_point = get_random_point(rng, &positions, &mut random_points);

        positions[random_point as usize] = point.x as i16;
        positions[random_point as usize + 1] = point.y as i16;
        positions[random_point as usize + 2] = point.z as i16;

        path_index += path_skip + 1;

        i += ints as i64;
    }

    positions
}

use crate::util::get_random_int_inclusive;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn food_map_sizes() {
        let cfg = crate::config::Config::default();
        let mut rng = rand::thread_rng();
        // density 32 -> count = 31^3 = 29791
        let count = (32usize - 1).pow(3);
        let food = generate_food_map("random", count, 32, &cfg, &mut rng);
        assert_eq!(food.len(), count * 3);

        // every triple should be within world bounds
        for chunk in food.chunks(3) {
            for v in chunk {
                assert!(v.abs() <= 1100, "food out of bounds: {}", v);
            }
        }
    }

    #[test]
    fn food_map_curves_places_points() {
        let cfg = crate::config::Config::default();
        let mut rng = rand::thread_rng();
        let count = (10usize - 1).pow(3); // dev density
        let food = generate_food_map("curves", count, 10, &cfg, &mut rng);
        assert_eq!(food.len(), count * 3);
    }
}
