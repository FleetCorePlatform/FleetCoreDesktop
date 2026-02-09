use crate::config::AppConfig;
use serde::Serialize;
use serde_json::json;
use std::collections::HashMap;
use tauri::command;
use tauri::{Manager, State};
use tauri_plugin_http::reqwest::Client;

mod config;

#[derive(Serialize)]
struct ApiResponse {
    status: u16,
    data: serde_json::Value,
}

#[command]
async fn get_build_version(config: State<'_, AppConfig>) -> Result<String, String> {
    let version = config.build_version.clone();
    Ok(version)
}

#[command]
async fn proxy_request(
    path: String,
    query_param: Option<HashMap<String, String>>,
    method: String,
    token: String,
    body: Option<serde_json::Value>,
    config: State<'_, AppConfig>,
) -> Result<ApiResponse, String> {
    let base_url = &config.backend_url;
    let mut url = format!("{}{}", base_url, path);

    if let Some(params) = query_param {
        let query_string: Vec<String> =
            params.iter().map(|(k, v)| format!("{}={}", k, v)).collect();

        if !query_string.is_empty() {
            url = format!("{}?{}", url, query_string.join("&"));
        }
    }

    let client = Client::new();

    let mut request_builder = match method.as_str() {
        "GET" => client.get(&url),
        "POST" => client.post(&url),
        "PUT" => client.put(&url),
        "DELETE" => client.delete(&url),
        _ => return Err("Invalid method".to_string()),
    };

    request_builder = request_builder.header("Authorization", format!("Bearer {}", token));

    if let Some(b) = body {
        request_builder = request_builder
            .header("Content-Type", "application/json")
            .body(b.to_string());
    }

    let response = request_builder.send().await.map_err(|e| e.to_string())?;

    let status = response.status().as_u16();

    let text = response.text().await.map_err(|e| e.to_string())?;

    let data: serde_json::Value = if text.is_empty() {
        json!(null)
    } else {
        serde_json::from_str(&text).map_err(|e| e.to_string())?
    };

    Ok(ApiResponse { status, data })
}

pub fn run() {
    let app_config = config::load_config();

    tauri::Builder::default()
        .setup(move |app| {
            app.manage(app_config.clone());
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_geolocation::init())
        .invoke_handler(tauri::generate_handler![proxy_request, get_build_version])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
