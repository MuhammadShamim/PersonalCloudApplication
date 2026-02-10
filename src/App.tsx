import { useState, useEffect, useRef } from "react";
import { Command } from "@tauri-apps/plugin-shell";
import "./App.css";

function App() {
  const [message, setMessage] = useState("Waiting for backend...");
  const [logs, setLogs] = useState<string[]>([]);
  const [backendReady, setBackendReady] = useState(false);
  
  // Use a ref to ensure we only spawn the sidecar ONCE
  const sidecarSpawned = useRef(false);

  useEffect(() => {
    // If we already spawned it, don't do it again
    if (sidecarSpawned.current) return;
    sidecarSpawned.current = true;

    const startSidecar = async () => {
      try {
        const sidecar = Command.sidecar("bin/api");
        const child = await sidecar.spawn();
        console.log("Sidecar spawned with PID:", child.pid);
        
        // Helper to check lines for success message
        const checkReady = (line: string) => {
          if (line.includes("Application startup complete")) {
            setBackendReady(true);
            setMessage("Backend is Ready!");
          }
        };

        // Listen to stdout
        sidecar.stdout.on("data", (line) => {
          setLogs((prev) => [...prev, `[OUT]: ${line}`]);
          checkReady(line);
        });

        // Listen to stderr (Uvicorn often prints here by default)
        sidecar.stderr.on("data", (line) => {
          console.log(`[PY-ERR]: ${line}`); 
          setLogs((prev) => [...prev, `[ERR]: ${line}`]);
          checkReady(line); // <--- Added this check here!
        });

      } catch (error) {
        console.error("Failed to spawn sidecar:", error);
        setMessage("Failed to start backend.");
        setLogs((prev) => [...prev, `[ERR-SPAWN]: ${error}`]);
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
        <div style={{ 
          textAlign: 'left', 
          background: '#f4f4f4', 
          padding: '10px', 
          borderRadius: '5px',
          fontFamily: 'monospace',
          maxHeight: '200px',
          overflowY: 'auto',
          color: '#333'
        }}>
          {logs.map((log, i) => <div key={i}>{log}</div>)}
        </div>
      </div>
    </div>
  );
}

export default App;