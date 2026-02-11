use crate::state::{AppState, ServerConfig};
use tauri::{Manager, Window};

// 1. Return the Port & Token to React
#[tauri::command]
pub fn get_server_config(state: tauri::State<AppState>) -> ServerConfig {
    // Lock the mutex to safely read the config
    state.config.lock().unwrap().clone()
}

// 2. Handle the Window Swap (Splash -> Main)
#[tauri::command]
pub async fn close_splashscreen(window: Window) {
    // Close the splash screen
    if let Some(splashscreen) = window.get_webview_window("splashscreen") {
        splashscreen.close().unwrap();
    }
    // Show the main window
    if let Some(main_window) = window.get_webview_window("main") {
        main_window.show().unwrap();
    }
}