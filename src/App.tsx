import { useState, useEffect, useRef } from "react";
import { Command } from "@tauri-apps/plugin-shell";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

function App() {
  const [message, setMessage] = useState("Initializing backend...");
  const [logs, setLogs] = useState<string[]>([]);
  const [backendReady, setBackendReady] = useState(false);
  
  // Ref to prevent double-spawning in React Strict Mode
  const sidecarSpawned = useRef(false);

  useEffect(() => {
    // If we already spawned the sidecar, stop here.
    if (sidecarSpawned.current) return;
    sidecarSpawned.current = true;

    const startSidecar = async () => {
      try {
        const sidecar = Command.sidecar("bin/api");
        const child = await sidecar.spawn();
        console.log("Sidecar spawned with PID:", child.pid);
        
        // Helper to check logs for the "Ready" signal
        const checkReady = (line: string) => {
          // "Application startup complete" is the standard Uvicorn success message
          if (line.includes("Application startup complete")) {
            setBackendReady(true);
            setMessage("Backend is Ready!");
            
            // Signal Tauri to close splash screen and show main window
            console.log("Backend ready. Closing splash screen...");
            invoke("close_splashscreen").catch((err) => 
              console.error("Failed to invoke close_splashscreen:", err)
            );
          }
        };

        // Listen to Standard Output
        sidecar.stdout.on("data", (line) => {
          setLogs((prev) => [...prev, `[OUT]: ${line}`]);
          checkReady(line);
        });

        // Listen to Standard Error (Uvicorn prints here by default)
        sidecar.stderr.on("data", (line) => {
          console.log(`[PY-ERR]: ${line}`); // Log to browser console for debugging
          setLogs((prev) => [...prev, `[ERR]: ${line}`]);
          checkReady(line);
        });

      } catch (error) {
        console.error("Failed to spawn sidecar:", error);
        setMessage("Failed to start backend.");
        setLogs((prev) => [...prev, `[CRITICAL]: ${error}`]);
      }
    };

    startSidecar();
  }, []);

  const pingBackend = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/");
      const data = await response.json();
      setMessage(`Response: ${data.message}`);
    } catch (e) {
      setMessage(`Error fetching data: ${e}`);
    }
  };

  return (
    <div className="container">
      <h1>Personal Cloud App</h1>
      
      <div className="card">
        <p>Status: <strong>{message}</strong></p>
        
        <button onClick={pingBackend} disabled={!backendReady}>
          Ping Python Backend
        </button>
      </div>

      <div className="logs">
        <h3>Backend Logs:</h3>
        <div className="log-box">
          {logs.map((log, i) => <div key={i}>{log}</div>)}
        </div>
      </div>
    </div>
  );
}

export default App;