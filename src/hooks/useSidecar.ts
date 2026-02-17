import { useState, useEffect, useRef } from "react";
import { Command } from "@tauri-apps/plugin-shell";
import { invoke } from "@tauri-apps/api/core";
import { api, ServerConfig } from "../api/client";

export function useSidecar() {
  const [message, setMessage] = useState("Initializing...");
  const [logs, setLogs] = useState<string[]>([]);
  const [isReady, setIsReady] = useState(false);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    // --- SAFETY TIMEOUT: Force Open after 5 seconds ---
    setTimeout(() => {
      console.warn("Force closing splash screen due to timeout...");
      invoke("close_splashscreen").catch(() => {});
    }, 5000);

    const startSystem = async () => {
      try {
        setMessage("1. Requesting Config...");
        const config = await invoke<ServerConfig>("get_server_config");
        api.configure(config);

        setMessage("2. Spawning Sidecar...");
        const sidecar = Command.sidecar("bin/api", [], {
          env: { 
            API_PORT: config.port.toString(),
            API_SECRET_TOKEN: config.token
          }
        });

        sidecar.stdout.on("data", line => {
          console.log(`[PY] ${line}`);
          setLogs(p => [...p, `[INFO] ${line}`]);
        });

        sidecar.stderr.on("data", line => {
          console.error(`[PY-ERR] ${line}`);
          setLogs(p => [...p, `[ERR] ${line}`]); // <--- THIS IS WHAT WE NEED TO SEE
        });

        await sidecar.spawn();

        setMessage("3. Waiting for Health Check...");
        const interval = setInterval(async () => {
          try {
            await api.healthCheck();
            clearInterval(interval);
            setMessage("System Online");
            setIsReady(true);
            invoke("close_splashscreen").catch(() => {});
          } catch (e) {
            // Keep waiting...
          }
        }, 1000);

      } catch (err: any) {
        setMessage("CRITICAL FAILURE");
        setLogs(p => [...p, `[FATAL] ${err}`]);
        invoke("close_splashscreen").catch(() => {});
      }
    };

    startSystem();
  }, []);

  return { message, logs, isReady };
}