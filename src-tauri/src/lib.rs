use tauri::Manager;
use rand::Rng;
use std::net::TcpListener; // <--- Import this

// Define the Config Structure
#[derive(Clone, serde::Serialize)]
struct ServerConfig {
    port: u16,
    token: String,
}

// Global State to hold the config
struct AppState {
    config: ServerConfig,
}

// Helper to find a free port
fn get_free_port() -> u16 {
    // Bind to port 0 lets the OS pick a random free port
    let listener = TcpListener::bind("127.0.0.1:0").unwrap();
    listener.local_addr().unwrap().port()
}

// Command for React to get the config
#[tauri::command]
fn get_server_config(state: tauri::State<AppState>) -> ServerConfig {
    state.config.clone()
}

#[tauri::command]
async fn close_splashscreen(window: tauri::Window) {
  if let Some(splashscreen) = window.get_webview_window("splashscreen") {
    splashscreen.close().unwrap();
  }
  if let Some(main_window) = window.get_webview_window("main") {
    main_window.show().unwrap();
  }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // 1. Generate Security Token
    let token: String = rand::thread_rng()
        .sample_iter(&rand::distributions::Alphanumeric)
        .take(32)
        .map(char::from)
        .collect();

    // 2. Find a Free Port
    let port = get_free_port();
    
    println!("Server Config Created -> Port: {}, Token: {}", port, token);

    let config = ServerConfig { port, token };

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(AppState { config }) // Store it in state
        .invoke_handler(tauri::generate_handler![close_splashscreen, get_server_config]) // Register new command
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}