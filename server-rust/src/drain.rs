//! Drain mechanics. Port of server/Drain.js (ZOR.Drain).

use std::collections::HashMap;

use crate::config::Config;
use crate::model::{Player, PlayerType};

/// A drain target: the id of the player being drained and the surface distance.
#[derive(Debug, Clone, Copy)]
pub struct DrainTarget {
    pub id: u32,
    pub dist: f64,
}

/// ZOR.Drain.findAll - find all pairs of players within drain distance of each
/// other.  Only the closest target for each player is kept (slot [0] in JS).
pub fn find_all(cfg: &Config, players: &[Player]) -> HashMap<u32, Vec<DrainTarget>> {
    let mut drain: HashMap<u32, Vec<DrainTarget>> = HashMap::with_capacity(players.len());

    // init empty arrays for each player
    for p in players {
        drain.insert(p.id, Vec::new());
    }

    let l = players.len() as i64;

    let mut i = l - 1;
    while i >= 0 {
        // JS `while (j--)` starting at i+1: the body sees j = i, i-1, ..., 0
        let p1 = &players[i as usize];

        for j in (0..=i).rev() {
            if i == j {
                continue; // don't compare player to itself
            }

            let p2 = &players[j as usize];

            // bots can't drain each other
            if p1.player_type == PlayerType::Bot && p2.player_type == PlayerType::Bot {
                continue;
            }

            let p1_scale = p1.sphere.scale;
            let p2_scale = p2.sphere.scale;

            let distance =
                p1.sphere.position.distance_to(&p2.sphere.position) - p1_scale - p2_scale;

            // if a player is close enough and small enough, save the other's id
            if distance <= cfg.drain_max_distance {
                let (smaller, bigger) = if p1_scale < p2_scale {
                    (p1.id, p2.id)
                } else if p2_scale < p1_scale {
                    (p2.id, p1.id)
                } else {
                    continue; // equal sizes: neither drains
                };

                // if new drain is better than old drain, it wins (slot [0])
                let entry = drain.get_mut(&smaller).unwrap();
                let target = DrainTarget { id: bigger, dist: distance };
                let better = match entry.first() {
                    Some(cur) => distance < cur.dist,
                    None => true,
                };
                if better {
                    if entry.is_empty() {
                        entry.push(target);
                    } else {
                        entry[0] = target;
                    }
                }
            }
        }

        i -= 1;
    }

    drain
}

/// ZOR.Drain.amount - drain amount based on distance between surfaces.
pub fn amount(distance: f64) -> f64 {
    // see https://www.desmos.com/calculator/wmiuaymrtu
    let n = 0.007;
    let o = 4.0;
    let p = 0.06;
    p / ((n * (distance * distance)) + o)
}

/// ZOR.Drain.bonusAmount - scale factor from the two players' relative sizes.
pub fn bonus_amount(cfg: &Config, drainer_size: f64, drainee_size: f64) -> f64 {
    // https://www.desmos.com/calculator/fzrj7f2b6l
    cfg.drain_size_influence * (drainee_size - drainer_size)
        / (cfg.max_player_radius - cfg.initial_player_radius)
        + 1.0
}
