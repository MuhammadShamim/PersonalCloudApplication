// src-tauri/src/lib.rs
use tauri::Manager; // <--- This import is required!

// Define the command
#[tauri::command]
async fn close_splashscreen(window: tauri::Window) {
  // Close splashscreen
  if let Some(splashscreen) = window.get_webview_window("splashscreen") {
    splashscreen.close().unwrap();
  }
  // Show main window
  if let Some(main_window) = window.get_webview_window("main") {
    main_window.show().unwrap();
  }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_shell::init())
    // REGISTER THE COMMAND HERE:
    .invoke_handler(tauri::generate_handler![close_splashscreen]) 
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}