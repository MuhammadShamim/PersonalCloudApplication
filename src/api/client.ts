// src/api/client.ts
const BASE_URL = "http://127.0.0.1:8000";

// --- Types ---
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
    private token: string = "";

    /**
     * Set the security token received from Rust.
     * This must be called before making any requests.
     */
    public setToken(token: string) {
        this.token = token;
        console.log("[API] Security Token Set");
    }

    /**
     * Generic request handler with Authorization Header
     */
    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = `${BASE_URL}${endpoint}`;
        
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