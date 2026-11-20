//! Bot name pool. The original uses the `datasets` npm package
//! (male-first-names-en + female-first-names-en, 8422 unique names, MIT).

pub fn bot_names() -> &'static [&'static str] {
    static NAMES: std::sync::OnceLock<Vec<&'static str>> = std::sync::OnceLock::new();
    NAMES.get_or_init(|| include_str!("../data/bot_names.txt").lines().collect())
}
