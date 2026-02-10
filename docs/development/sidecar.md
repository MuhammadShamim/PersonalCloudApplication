# Python Sidecar Development Guide (Tauri v2)

## 1. The Python Server (\`python-backend/main.py\`)
To work as a sidecar, the FastAPI app requires two specific configurations:
1. **CORS:** Must allow requests from the Tauri frontend (localhost).
2. **Output Flushing:** \`print(..., flush=True)\` is required for Tauri to capture logs immediately.

### Code Template
\`\`\`python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI()

# 1. Enable CORS for Tauri
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Hello from Sidecar!"}

if __name__ == "__main__":
    # 2. Flush stdout so Tauri sees it immediately
    print("Starting Backend...", flush=True)
    # 3. Run on localhost only
    uvicorn.run(app, host="127.0.0.1", port=8000)
\`\`\`

## 2. Build & Bundle Process
Every time you change Python code, you must rebuild the binary.

### Build Command
\`\`\`bash
cd python-backend
source venv/bin/activate
# Create the standalone executable
pyinstaller --clean --onefile --name api main.py
\`\`\`

### Bundle Command
Move the binary to the Tauri bin folder with your architecture suffix.
*Run \`rustc -Vv | grep host\` to find your suffix.*
\`\`\`bash
# Example for Mac M1/M2 (Apple Silicon)
mv dist/api ../src-tauri/bin/api-aarch64-apple-darwin

# Example for Mac Intel
# mv dist/api ../src-tauri/bin/api-x86_64-apple-darwin
\`\`\`

## 3. Tauri Configuration (v2)
- **Plugin:** \`tauri-plugin-shell\` must be initialized in \`lib.rs\`.
- **Config:** \`tauri.conf.json\` must list \`"externalBin": ["bin/api"]\`.
- **Capabilities:** \`src-tauri/capabilities/default.json\` must allow \`shell:allow-spawn\` for \`bin/api\`.