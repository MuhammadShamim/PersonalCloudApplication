// src/api/client.ts

// --- Types ---

// 1. Configuration Type (New)
// This matches the struct we defined in Rust
export interface ServerConfig {
    port: number;
    token: string;
}

// 2. Response Types (Preserved)
export interface BackendResponse<T> {
    data?: T;
    error?: string;
}

export interface HealthCheck {
    message: string;
}

export interface GoogleAuthURL {
    url: string;
}

// --- API Client Class ---
class APIClient {
    private baseUrl: string = "";
    private token: string = "";
    private isConfigured: boolean = false;

    /**
     * Initialize the client with dynamic config from Rust.
     * This replaces the old setToken() method and hardcoded URL.
     */
    public configure(config: ServerConfig) {
        this.baseUrl = `http://127.0.0.1:${config.port}`;
        this.token = config.token;
        this.isConfigured = true;
        console.log(`[API] Client Configured: ${this.baseUrl} (Token: ${config.token.substring(0,5)}...)`);
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
            "Content-Type": "application/json"
        };

        try {
            console.log(`[API] Requesting: ${url}`);
            
            // 2. Execute Request
            const response = await fetch(url, { ...options, headers });

            // 3. Handle Errors
            if (!response.ok) {
                // If 403, our token was rejected
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

    public async getGoogleAuthUrl(): Promise<GoogleAuthURL> {
        return this.request<GoogleAuthURL>("/login");
    }
}

export const api = new APIClient();