use tauri::{
    menu::{Menu, MenuItem, Submenu},
    Wry,
};
use tauri::Emitter; // For sending events to React

pub fn init(handle: &tauri::AppHandle) -> tauri::Result<Menu<Wry>> {
    // 1. "App" Menu (Standard macOS requirement)
    let app_menu = Submenu::with_items(
        handle,
        "Personal Cloud",
        true,
        &[
            &MenuItem::with_id(handle, "quit", "Quit", true, None::<&str>)?,
        ],
    )?;

    // 2. "File" Menu
    let file_menu = Submenu::with_items(
        handle,
        "File",
        true,
        &[
            &MenuItem::with_id(handle, "refresh", "Refresh Files", true, Some("cmd+r"))?,
        ],
    )?;

    // 3. "View" Menu
    let view_menu = Submenu::with_items(
        handle,
        "View",
        true,
        &[
            &MenuItem::with_id(handle, "toggle_logs", "Toggle System Logs", true, Some("cmd+l"))?,
        ],
    )?;

    // 4. Build the Menu Bar
    let menu = Menu::with_items(
        handle,
        &[&app_menu, &file_menu, &view_menu],
    )?;

    Ok(menu)
}

// Helper to handle menu clicks
pub fn handle_event(app: &tauri::AppHandle, event_id: &str) {
    match event_id {
        "quit" => app.exit(0),
        "refresh" => {
            // Send signal to React
            app.emit("menu-event", "refresh").unwrap();
        }
        "toggle_logs" => {
            app.emit("menu-event", "toggle_logs").unwrap();
        }
        _ => {}
    }
}