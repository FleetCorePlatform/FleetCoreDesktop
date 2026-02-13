use serde::Deserialize;

#[derive(Debug, Deserialize, Clone)]
pub struct AppConfig {
    pub backend_url: String,
    pub build_version: String,
}

#[derive(Debug, Deserialize)]
struct Config {
    development: AppConfig,
    production: AppConfig,
}

pub fn load_config() -> AppConfig {
    let config_str = include_str!("../config.toml");

    let config: Config = toml::from_str(&config_str).expect("Failed to parse config.toml");

    if cfg!(debug_assertions) {
        config.development
    } else {
        config.production
    }
}
