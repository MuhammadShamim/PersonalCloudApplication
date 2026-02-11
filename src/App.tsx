import { useState, useEffect, useRef } from "react";
import { Command } from "@tauri-apps/plugin-shell";
import { invoke } from "@tauri-apps/api/core";
import { api, ServerConfig } from "./api/client"; // Import Type
import "./App.css";

function App() {
  const [message, setMessage] = useState("Initializing Dynamic Infrastructure...");
  const [logs, setLogs] = useState<string[]>([]);
  const [backendReady, setBackendReady] = useState(false);
  const sidecarSpawned = useRef(false);

  useEffect(() => {
    if (sidecarSpawned.current) return;
    sidecarSpawned.current = true;

    const initDynamicBackend = async () => {
      try {
        // 1. Get Config (Port + Token) from Rust
        const config = await invoke<ServerConfig>("get_server_config");
        console.log("Received Config from Rust:", config);

        // 2. Configure Frontend Client
        api.configure(config);
        
        // 3. Spawn Sidecar with Dynamic Port & Token
        const sidecar = Command.sidecar("bin/api", [], {
            env: { 
                API_PORT: config.port.toString(), // <--- Pass Port
                API_SECRET_TOKEN: config.token    // <--- Pass Token
            } 
        });

        const child = await sidecar.spawn();
        setLogs(prev => [...prev, `[SYS]: Spawned Sidecar (PID: ${child.pid}) on Port ${config.port}`]);
        
        const checkReady = (line: string) => {
          if (line.includes("Application startup complete")) {
            setBackendReady(true);
            setMessage(`Backend Ready on Port ${config.port}!`);
            
            setTimeout(() => {
                invoke("close_splashscreen").catch(err => console.error(err));
            }, 500);
          }
        };

        sidecar.stdout.on("data", (line) => {
          setLogs((prev) => [...prev, `[OUT]: ${line}`]);
          checkReady(line);
        });

        sidecar.stderr.on("data", (line) => {
          setLogs((prev) => [...prev, `[ERR]: ${line}`]);
          checkReady(line);
        });

      } catch (error) {
        console.error("Initialization Failed:", error);
        setMessage("Critical Init Error");
        setLogs((prev) => [...prev, `[CRITICAL]: ${error}`]);
      }
    };

    initDynamicBackend();
  }, []);

  const pingBackend = async () => {
    try {
      const data = await api.healthCheck();
      // UPDATE THIS LINE:
      setMessage(`Response: ${data.system} is ${data.status} on Port ${data.port}`);
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
          Test Dynamic Connection
        </button>
      </div>
      <div className="logs">
        <h3>System Logs:</h3>
        <div className="log-box">
          {logs.map((log, i) => <div key={i}>{log}</div>)}
        </div>
      </div>
    </div>
  );
}

export default App;