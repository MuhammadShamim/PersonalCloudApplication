import { useState, useEffect, useRef } from "react";
import { Command } from "@tauri-apps/plugin-shell";
import { invoke } from "@tauri-apps/api/core";
import { api } from "./api/client"; // <--- Import the new client
import "./App.css";

function App() {
  const [message, setMessage] = useState("Initializing backend...");
  const [logs, setLogs] = useState<string[]>([]);
  const [backendReady, setBackendReady] = useState(false);
  
  const sidecarSpawned = useRef(false);

  useEffect(() => {
    if (sidecarSpawned.current) return;
    sidecarSpawned.current = true;

    const startSidecar = async () => {
      try {
        const sidecar = Command.sidecar("bin/api");
        const child = await sidecar.spawn();
        console.log("Sidecar spawned PID:", child.pid);
        
        const checkReady = (line: string) => {
          if (line.includes("Application startup complete")) {
            setBackendReady(true);
            setMessage("Backend is Ready!");
            
            console.log("Backend ready. Closing splash screen...");
            invoke("close_splashscreen").catch((err) => 
              console.error("Failed to invoke close_splashscreen:", err)
            );
          }
        };

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
        setMessage("Failed to start backend.");
        setLogs((prev) => [...prev, `[CRITICAL]: ${error}`]);
      }
    };

    startSidecar();
  }, []);

  // --- NEW: Clean API Call ---
  const pingBackend = async () => {
    try {
      setMessage("Pinging...");
      // No more fetch("http://...")! Just a method call.
      const data = await api.healthCheck();
      setMessage(`Response: ${data.message}`);
    } catch (e) {
      setMessage(`Error: ${e}`);
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