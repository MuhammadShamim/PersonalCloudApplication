// 1. Import modules
mod commands;
mod state;
mod menu; // <--- Ensure this is here

use rand::Rng;
use std::net::TcpListener;
use std::sync::Mutex;
use tauri::Manager; // This will now be used by the setup block below

// Helper: Ask OS for a free port
fn get_free_port() -> u16 {
    TcpListener::bind("127.0.0.1:0")
        .unwrap()
        .local_addr()
        .unwrap()
        .port()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // 2. Logic: Generate infrastructure config
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

    // 4. Builder
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .manage(app_state)
        
        // --- THIS IS THE MISSING PART ---
        .setup(|app| {
            // A. Initialize the Native Menu
            let handle = app.handle();
            let app_menu = menu::init(handle)?;
            app.set_menu(app_menu)?; // <--- This uses 'Manager'

            // B. Listen for Menu Events
            app.on_menu_event(move |app_handle, event| {
                menu::handle_event(app_handle, event.id().as_ref());
            });

            Ok(())
        })
        // --------------------------------

        .invoke_handler(tauri::generate_handler![
            commands::close_splashscreen,
            commands::get_server_config
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_free_port_finds_valid_port() {
        let port = get_free_port();
        assert!(port > 0);
    }

    #[test]
    fn test_token_generation_length() {
        let token: String = rand::thread_rng()
            .sample_iter(&rand::distributions::Alphanumeric)
            .take(32)
            .map(char::from)
            .collect();
        assert_eq!(token.len(), 32);
        assert!(!token.is_empty());
    }
}