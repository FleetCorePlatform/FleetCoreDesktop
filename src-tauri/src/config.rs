use serde::Deserialize;
use std::fs;

#[derive(Debug, Deserialize, Clone)]
pub struct AppConfig {
    pub backend_url: String,
    pub api_key: String,
}

#[derive(Debug, Deserialize)]
struct Config {
    development: AppConfig,
    production: AppConfig,
}

pub fn load_config() -> AppConfig {
    let config_str = fs::read_to_string("config.toml")
        .expect("Failed to read config.toml");

    let config: Config = toml::from_str(&config_str)
        .expect("Failed to parse config.toml");

    // Select environment based on build type
    #[cfg(debug_assertions)]
    return config.development;

    #[cfg(not(debug_assertions))]
    return config.production;
}