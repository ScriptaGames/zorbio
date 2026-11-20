//! Leaderboard backend.
//!
//! The original server talks to the long-dead App42 cloud service
//! (server/Backend.js, driven by the `leaderboard` PHP CLI) when
//! ENABLE_BACKEND_SERVICE is on.  The Rust port replaces it with a local
//! in-memory leaderboard store so the leaderboards feature keeps working
//! without any external service.  It keeps the same interface shape
//! (saveScore / getLeadersByDate / refresh cycle).

use std::collections::HashMap;
use std::sync::Mutex;

use crate::protocol::LeaderboardLeader;
use crate::util::now_ms;

#[derive(Debug, Clone)]
struct ScoreEntry {
    name: String,
    score: u64,
    timestamp: u64,
}

#[derive(Default)]
pub struct Backend {
    scores: Vec<ScoreEntry>,
}

impl Backend {
    pub fn new() -> Self {
        Backend { scores: Vec::new() }
    }

    /// Backend.saveScore(gameName, userName, score, callback)
    pub fn save_score(&mut self, _game_name: &str, user_name: &str, score: u64) {
        self.scores.push(ScoreEntry {
            name: user_name.to_string(),
            score,
            timestamp: now_ms(),
        });
        crate::zlog!("Saved score: {} {} {}", _game_name, user_name, score);
    }

    /// Backend.getLeadersByDate(gameName, limit, startDate, endDate, callback)
    /// Returns the top `limit` leaders whose score was recorded within the
    /// last `since_ms` milliseconds (best score per name).
    pub fn get_leaders_by_date(&self, _game_name: &str, limit: usize, since_ms: u64) -> Vec<LeaderboardLeader> {
        let cutoff = now_ms().saturating_sub(since_ms);

        let mut best: HashMap<&str, u64> = HashMap::new();
        for entry in &self.scores {
            if entry.timestamp >= cutoff && entry.score > 0 {
                let e = best.entry(entry.name.as_str()).or_insert(0);
                if entry.score > *e {
                    *e = entry.score;
                }
            }
        }

        let mut leaders: Vec<LeaderboardLeader> = best
            .into_iter()
            .map(|(name, score)| LeaderboardLeader {
                name: name.to_string(),
                score,
            })
            .collect();

        leaders.sort_by(|a, b| b.score.cmp(&a.score).then_with(|| a.name.cmp(&b.name)));
        leaders.truncate(limit);
        leaders
    }

    /// Drop entries older than `max_age_ms` and enforce a hard cap, keeping
    /// the store bounded.  The leaderboards only ever query the last 30 days,
    /// so pruning at 31 days does not change observable behavior.
    pub fn prune(&mut self, max_age_ms: u64, cap: usize) {
        let cutoff = now_ms().saturating_sub(max_age_ms);
        self.scores.retain(|e| e.timestamp >= cutoff);
        if self.scores.len() > cap {
            let drop_n = self.scores.len() - cap;
            self.scores.drain(0..drop_n);
        }
    }
}

/// Shared across all game instances (the Node server's instances all talked to
/// the same remote store, so scores are global to the process).
pub type SharedBackend = std::sync::Arc<Mutex<Backend>>;
