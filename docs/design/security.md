# Security Architecture (Tauri v2)

## 1. Overview
PersonalCloudApplication uses Tauri v2's Capability-based security model.
- **Default:** All permissions are denied.
- **Explicit Allow:** We only grant permissions needed for specific features.

## 2. Sidecar Permissions
The Python backend is a powerful tool, so we restrict how the frontend can interact with it.

### Configuration
File: \`src-tauri/capabilities/default.json\`

| Permission | Scope | Purpose |
| :--- | :--- | :--- |
| \`shell:allow-execute\` | \`bin/api\` | Allows the frontend to start the Python sidecar process. |
| \`shell:sidecar\` | \`true\` | Marks this binary as a bundled resource, not a random system command. |
| \`args\` | \`true\` | Allows passing arguments (e.g., ports) to the python script. |

## 3. Network Permissions
(To be added when we implement Google Login)
- We will need to allow the frontend to make HTTP requests to \`localhost\`.