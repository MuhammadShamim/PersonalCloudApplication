use tauri::Manager;
use rand::Rng; // You might need to add `rand` to Cargo.toml or use UUID

// 1. Generate a random token in memory (Global State)
struct AppState {
    api_token: String,
}

#[tauri::command]
fn get_api_token(state: tauri::State<AppState>) -> String {
    state.api_token.clone()
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
    // Generate a secure random token
    let api_token: String = rand::thread_rng()
        .sample_iter(&rand::distributions::Alphanumeric)
        .take(32)
        .map(char::from)
        .collect();
    
    println!("Generated Security Token: {}", api_token);

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        // Store token in state
        .manage(AppState { api_token }) 
        .invoke_handler(tauri::generate_handler![close_splashscreen, get_api_token])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}