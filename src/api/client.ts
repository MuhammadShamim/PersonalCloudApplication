// src/api/client.ts

const BASE_URL = "http://127.0.0.1:8000";

// --- Types ---
// Standard wrapper for all backend responses
export interface BackendResponse<T> {
    data?: T;
    error?: string;
}

// Specific types for our endpoints
export interface HealthCheck {
    message: string;
}

export interface GoogleAuthURL {
    url: string;
}

// --- API Client Class ---
class APIClient {
    /**
     * Generic request handler to standardize error handling and JSON parsing.
     * @param endpoint - The path (e.g., "/login")
     * @param options - Fetch options (method, body, headers)
     */
    private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
        const url = `${BASE_URL}${endpoint}`;
        
        try {
            console.log(`[API] Requesting: ${url}`);
            const response = await fetch(url, options);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            // Successfully parse JSON
            return await response.json() as T;
        } catch (err) {
            console.error(`[API] Failed request to ${endpoint}:`, err);
            throw err; // Re-throw so the UI can show an error message
        }
    }

    // --- Endpoints ---

    // 1. Check if backend is alive
    public async healthCheck(): Promise<HealthCheck> {
        return this.request<HealthCheck>("/");
    }

    // 2. Get Google Login URL (Preparation for Phase 2)
    public async getGoogleAuthUrl(): Promise<GoogleAuthURL> {
        return this.request<GoogleAuthURL>("/login");
    }
}

// Export a singleton instance
export const api = new APIClient();