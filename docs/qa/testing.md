# Testing Strategy & Quality Assurance

## 1. Philosophy
The PersonalCloudApplication follows a **"Defense in Depth"** testing strategy. We do not assume the local environment is secure; we verify it.

### The Testing Pyramid
1.  **Unit Tests (Rust):** Verify the "Foundation" (Port allocation, Token generation).
2.  **Integration Tests (Python):** Verify the "Brain" (Security handshake, API endpoints).
3.  **End-to-End (E2E):** (Planned) verifying the full React -> Rust -> Python flow.

---

## 2. Python Sidecar Testing (The "Brain")
**Location:** \`python-backend/tests/\`

We use **pytest** and **httpx** to simulate both authorized and unauthorized traffic.

### Prerequisites
Ensure your virtual environment is active and dependencies are installed:
\`\`\`bash
cd python-backend
source venv/bin/activate
pip install pytest httpx
\`\`\`

### Running Tests
\`\`\`bash
pytest -v
\`\`\`

### What We Test
| Test File | Scenario | Expectation |
| :--- | :--- | :--- |
| **test_security.py** | **Missing Token** | \`401 Unauthorized\` (FastAPI default) |
| | **Wrong Token** | \`403 Forbidden\` (Our middleware) |
| | **Correct Token** | \`200 OK\` + JSON Payload |
| **test_config.py** | **Env Vars** | Verify \`API_PORT\` and \`API_SECRET_TOKEN\` are loaded correctly. |

---

## 3. Rust Core Testing (The "Body")
**Location:** \`src-tauri/src/lib.rs\` (Unit tests module)

We use Python's \`cargo test\` runner to verify the OS-level operations.

### Running Tests
\`\`\`bash
cd src-tauri
cargo test
\`\`\`

### What We Test
1.  **Port Allocation:**
    - Function: \`get_free_port()\`
    - Verify: Returns a number > 0.
    - Verify: Returns a valid u16 integer (<= 65535).
2.  **Token Generation:**
    - Verify: Random string is exactly 32 characters.
    - Verify: String contains only alphanumeric characters.

---

## 4. Troubleshooting Common Failures

### Python: "AssertionError: 401 != 403"
- **Cause:** You expected a 403 (Forbidden) but got 401 (Unauthorized).
- **Fix:** Remember that **Missing Header = 401** and **Wrong Token = 403**.

### Rust: "failed to parse manifest at..."
- **Cause:** Your \`Cargo.toml\` defines an \`edition\` (e.g., 2024/2026) that your installed Rust toolchain doesn't support yet.
- **Fix:** Open \`Cargo.toml\` and downgrade \`edition\` to \`"2021"\`.

### General: "Connection Refused"
- **Cause:** The tests try to bind to a port that is already in use.
- **Fix:** Our \`get_free_port\` logic handles this dynamically, but if you hardcode ports in tests, ensure they are free.

## 5. Frontend Testing (React)
**Location:** \`src/components/*.test.tsx\`

We use **Vitest** + **React Testing Library** to verify UI components in isolation.

### Prerequisites
\`\`\`bash
npm install
\`\`\`

### Running Tests
\`\`\`bash
npm run test
\`\`\`

### What We Test
1.  **Rendering:** Do components appear with the correct text?
2.  **Props:** If we pass data (e.g., logs), is it displayed?
3.  **State:** (Future) Does clicking a button trigger the correct function?

### Example: Terminal Component
- **Input:** \`logs=["Error 1", "Info 2"]\`
- **Expectation:** The text "Error 1" and "Info 2" must be found in the document.