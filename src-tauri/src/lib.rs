// 1. Import our new modules
mod commands;
mod state;

use rand::Rng;
use std::net::TcpListener;
use std::sync::Mutex;

// Helper: Ask OS for a free port (bind to port 0)
fn get_free_port() -> u16 {
    TcpListener::bind("127.0.0.1:0")
        .unwrap()
        .local_addr()
        .unwrap()
        .port()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // 2. Logic: Generate infrastructure config (Port + Token)
    let token: String = rand::thread_rng()
        .sample_iter(&rand::distributions::Alphanumeric)
        .take(32)
        .map(char::from)
        .collect();
    
    let port = get_free_port();

    println!("Server Config Created -> Port: {}, Token: {}", port, token);

    // 3. State: Initialize global state object
    let config = state::ServerConfig { port, token };
    let app_state = state::AppState {
        config: Mutex::new(config),
    };

    // 4. Builder: Register plugins, state, and commands
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(app_state) // Store the state
        .invoke_handler(tauri::generate_handler![
            // Register our modular commands
            commands::close_splashscreen,
            commands::get_server_config
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}