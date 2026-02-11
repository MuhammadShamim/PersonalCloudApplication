use std::sync::Mutex;

// The Config object we send to the Frontend
#[derive(Clone, serde::Serialize)]
pub struct ServerConfig {
    pub port: u16,
    pub token: String,
}

// The Global State managed by Tauri
pub struct AppState {
    // Mutex allows thread-safe access (even though we only read it mostly)
    pub config: Mutex<ServerConfig>,
}