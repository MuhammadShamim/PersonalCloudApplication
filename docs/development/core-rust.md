cat <<EOF > docs/development/core-rust.md
# Rust Core Development Guide

## 1. Project Structure
The Rust core is located in \`src-tauri/src/\`. It uses a modular design.

- **\`lib.rs\`**: The application builder.
    - *Responsibility:* Register plugins, initialize global state, finding free ports.
    - *Do not:* Write command logic here.
- **\`commands.rs\`**: The API exposed to React.
    - *Responsibility:* Any function annotated with \`#[tauri::command]\`.
- **\`state.rs\`**: Shared State.
    - *Responsibility:* Structs used for \`manage(State)\`.

## 2. Adding a New Command
To add a new feature (e.g., "Open Folder"):

1.  **Define logic in \`commands.rs\`**:
    \`\`\`rust
    #[tauri::command]
    pub fn open_folder(path: String) { ... }
    \`\`\`
2.  **Register in \`lib.rs\`**:
    \`\`\`rust
    .invoke_handler(tauri::generate_handler![
        commands::close_splashscreen,
        commands::open_folder // <--- Add this
    ])
    \`\`\`
3.  **Call from React**:
    \`\`\`typescript
    invoke("open_folder", { path: "..." })
    \`\`\`

## 3. State Management
We use \`std::sync::Mutex\` for thread-safe state access.
- Access state in commands using \`state: tauri::State<AppState>\`.
EOF