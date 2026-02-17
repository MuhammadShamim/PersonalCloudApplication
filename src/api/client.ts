// src/api/client.ts

// --- Types ---

// 1. Configuration Type (Matches Rust)
export interface ServerConfig {
    port: number;
    token: string;
}

// 2. Response Types
export interface HealthCheck {
    status: string;
    system: string;
    port: number;
}

export interface AuthResponse {
    status: string;
    scopes?: string[];
    error?: string;
}

export interface DriveFile {
    id: string;
    name: string;
    mimeType: string;
}

export interface FileListResponse {
    files: DriveFile[];
}

// --- API Client Class ---
class APIClient {
    private baseUrl: string = "";
    private token: string = "";
    private isConfigured: boolean = false;

    /**
     * Initialize the client with dynamic config from Rust.
     */
    public configure(config: ServerConfig) {
        this.baseUrl = `http://127.0.0.1:${config.port}`;
        this.token = config.token;
        this.isConfigured = true;
        console.log(`[API] Client Configured: ${this.baseUrl} (Token: ${config.token.substring(0, 5)}...)`);
    }

    /**
     * Generic request handler with Authorization Header
     */
    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        // Safety Check: Ensure we don't call API before config exists
        if (!this.isConfigured) {
            throw new Error("API Client not configured! Call configure() first.");
        }

        const url = `${this.baseUrl}${endpoint}`;

        // 1. Prepare Headers (Inject Authorization)
        const headers = {
            ...options.headers,
            "Authorization": `Bearer ${this.token}`,
            "Content-Type": "application/json",
        };

        try {
            console.log(`[API] Requesting: ${url}`);

            // 2. Execute Request (Using Native Browser Fetch)
            const response = await fetch(url, { ...options, headers });

            // 3. Handle Errors
            if (!response.ok) {
                if (response.status === 403) {
                    console.error("[CRITICAL] Security Token Rejected by Backend!");
                }
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            // 4. Return Data
            return await response.json() as T;
        } catch (err) {
            console.error(`[API] Failed request to ${endpoint}:`, err);
            throw err;
        }
    }

    // --- Endpoints ---

    public async healthCheck(): Promise<HealthCheck> {
        return this.request<HealthCheck>("/");
    }

    // New: Triggers the Python backend to open the system browser
    public async loginGoogle(): Promise<AuthResponse> {
        return this.request<AuthResponse>("/auth/login", { 
            method: "POST" 
        });
    }

    // New: Fetches files after successful login
    public async listFiles(): Promise<FileListResponse> {
        return this.request<FileListResponse>("/auth/files");
    }
}

export const api = new APIClient();