# Development Environment Setup

## Prerequisites (macOS)

### 1. Xcode Command Line Tools
Required for compiling Rust and native dependencies.
\`\`\`bash
xcode-select --install
\`\`\`

### 2. Homebrew
Package manager for macOS.
\`\`\`bash
/bin/bash -c "\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
\`\`\`

### 3. Core Languages
Install Node.js (Frontend) and Python (Backend).
\`\`\`bash
brew install node python
\`\`\`

### 4. Rust (Tauri Core)
Install Rust via rustup.
\`\`\`bash
curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh
\`\`\`
*Restart terminal after installation.*

## Repository Setup
1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/MuhammadShamim/PersonalCloudApplication.git
   \`\`\`
2. Navigate to directory:
   \`\`\`bash
   cd PersonalCloudApplication
   \`\`\`

## Project Structure (Planned)
- \`/src-tauri\`: Rust core
- \`/src\`: React frontend
- \`/python-backend\`: FastAPI sidecar
