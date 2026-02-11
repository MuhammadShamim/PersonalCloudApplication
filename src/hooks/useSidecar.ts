import { useState, useEffect, useRef } from "react";
import { Command } from "@tauri-apps/plugin-shell";
import { invoke } from "@tauri-apps/api/core";
import { api, ServerConfig } from "../api/client";

export function useSidecar() {
  const [message, setMessage] = useState("Initializing System...");
  const [logs, setLogs] = useState<string[]>([]);
  const [isReady, setIsReady] = useState(false);
  
  // Prevent double-spawn in React Strict Mode
  const hasSpawned = useRef(false);

  useEffect(() => {
    if (hasSpawned.current) return;
    hasSpawned.current = true;

    const bootstrap = async () => {
      try {
        // 1. Get Dynamic Config from Rust
        // Rust determines the free port and the security token
        const config = await invoke<ServerConfig>("get_server_config");
        console.log("Received Config:", config);
        
        // 2. Configure API Client
        api.configure(config);
        
        // 3. Spawn Python Sidecar
        // Pass the Port and Token as Environment Variables
        const sidecar = Command.sidecar("bin/api", [], {
          env: { 
            API_PORT: config.port.toString(),
            API_SECRET_TOKEN: config.token
          }
        });

        const child = await sidecar.spawn();
        setLogs(prev => [...prev, `[SYS] Sidecar PID: ${child.pid} | Port: ${config.port}`]);

        // 4. Listen to Logs
        sidecar.stdout.on("data", (line) => {
          setLogs(prev => [...prev, `[OUT] ${line}`]);
          checkReady(line);
        });

        sidecar.stderr.on("data", (line) => {
          setLogs(prev => [...prev, `[ERR] ${line}`]);
          checkReady(line);
        });

      } catch (err) {
        setMessage("Initialization Failed");
        setLogs(prev => [...prev, `[CRITICAL] ${err}`]);
        console.error(err);
      }
    };

    bootstrap();
  }, []);

  // Helper to detect "Ready" state from logs
  const checkReady = (line: string) => {
    if (line.includes("Application startup complete")) {
      setIsReady(true);
      setMessage("System Online");
      
      // Signal Tauri to swap the Splash Screen for the Main Window
      setTimeout(() => {
        invoke("close_splashscreen").catch(console.error);
      }, 500);
    }
  };

  return { message, logs, isReady };
}