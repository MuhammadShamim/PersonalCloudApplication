# Python Sidecar Setup (Tauri v2)

## 1. Build the Python Binary
To update the backend logic, rebuild the executable using PyInstaller.
```bash
cd python-backend
source venv/bin/activate
pyinstaller --clean --onefile --name api main.py
```

## 2. Bundle for Architecture
Tauri requires the binary to be named with the target triple (e.g., \`-aarch64-apple-darwin\`).
```bash
# 1. Create target directory
mkdir -p ../src-tauri/bin

# 2. Move and Rename (Example for Apple Silicon)
# Check your architecture with: rustc -Vv | grep host
mv dist/api ../src-tauri/bin/api-aarch64-apple-darwin
```

## 3. Tauri Configuration (v2)

### A. \`src-tauri/tauri.conf.json\`
Register the binary in the bundle settings.
```json
{
  "bundle": {
    "externalBin": [
      "bin/api"
    ]
  }
}
```

### B. Rust Dependencies
Add the shell plugin to \`src-tauri/Cargo.toml\`:
```bash
cargo add tauri-plugin-shell
```

Initialize it in \`src-tauri/src/lib.rs\`:
```rust
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init()) // <--- REQUIRED
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### C. Capabilities (Security)
In \`src-tauri/capabilities/default.json\`, explicitly allow the sidecar execution.
```json
{
  "permissions": [
    {
      "identifier": "shell:allow-execute",
      "allow": [
        {
          "name": "bin/api",
          "args": true,
          "sidecar": true
        }
      ]
    }
  ]
}
```