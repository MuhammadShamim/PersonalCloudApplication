import { useState, useEffect, useRef } from "react";
import { Command } from "@tauri-apps/plugin-shell";
import { invoke } from "@tauri-apps/api/core";
import { api } from "./api/client";
import "./App.css";

function App() {
  const [message, setMessage] = useState("Initializing Secure Backend...");
  const [logs, setLogs] = useState<string[]>([]);
  const [backendReady, setBackendReady] = useState(false);
  
  // Ref to ensure we only spawn once
  const sidecarSpawned = useRef(false);

  useEffect(() => {
    if (sidecarSpawned.current) return;
    sidecarSpawned.current = true;

    const initSecureBackend = async () => {
      try {
        // 1. Get the Secret Token from Rust (Generated at launch)
        const token = await invoke<string>("get_api_token");
        
        if (!token) {
            throw new Error("Failed to acquire security token from Rust.");
        }
        
        // 2. Configure our API Client with this token
        api.setToken(token);
        setLogs(prev => [...prev, `[SEC]: Acquired Token: ${token.substring(0, 5)}...`]);

        // 3. Spawn Sidecar with Token in Environment
        // "bin/api" matches tauri.conf.json > externalBin
        const sidecar = Command.sidecar("bin/api", [], {
            env: { API_SECRET_TOKEN: token } 
        });

        const child = await sidecar.spawn();
        console.log("Sidecar spawned with PID:", child.pid);
        
        // Helper to check for success signal
        const checkReady = (line: string) => {
          if (line.includes("Application startup complete")) {
            setBackendReady(true);
            setMessage("Backend is Ready & Secure!");
            
            // Close splash screen after brief delay
            console.log("Backend ready. Closing splash screen...");
            setTimeout(() => {
                invoke("close_splashscreen").catch((err) => 
                  console.error("Failed to invoke close_splashscreen:", err)
                );
            }, 500);
          }
        };

        // Listen to logs
        sidecar.stdout.on("data", (line) => {
          setLogs((prev) => [...prev, `[OUT]: ${line}`]);
          checkReady(line);
        });

        sidecar.stderr.on("data", (line) => {
          console.log(`[PY-ERR]: ${line}`);
          setLogs((prev) => [...prev, `[ERR]: ${line}`]);
          checkReady(line);
        });

      } catch (error) {
        console.error("Failed to spawn sidecar:", error);
        setMessage("Security Check Failed.");
        setLogs((prev) => [...prev, `[CRITICAL]: ${error}`]);
      }
    };

    initSecureBackend();
  }, []);

  const pingBackend = async () => {
    try {
      setMessage("Verifying Security Handshake...");
      const data = await api.healthCheck();
      setMessage(`Success: ${data.message}`);
    } catch (e) {
      setMessage(`Security Error: ${e}`);
    }
  };

  return (
    <div className="container">
      <h1>Personal Cloud App</h1>
      
      <div className="card">
        <p>Status: <strong>{message}</strong></p>
        
        <button onClick={pingBackend} disabled={!backendReady}>
          Verify Secure Connection
        </button>
      </div>

      <div className="logs">
        <h3>Secure Logs:</h3>
        <div className="log-box">
          {logs.map((log, i) => <div key={i}>{log}</div>)}
        </div>
      </div>
    </div>
  );
}

export default App;