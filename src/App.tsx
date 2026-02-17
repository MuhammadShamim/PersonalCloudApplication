import { useState, useEffect } from "react";
import { listen } from "@tauri-apps/api/event"; // <--- Import Listener
import { useSidecar } from "./hooks/useSidecar";
import { api, DriveFile } from "./api/client";
import { Terminal } from "./components/Terminal";
import { GoogleLogin } from "./components/GoogleLogin";
import { FileExplorer } from "./components/FileExplorer";
import "./App.css";

function App() {
  const { message, logs, isReady } = useSidecar();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [showLogs, setShowLogs] = useState(false);

  const loadFiles = async () => {
    setLoadingFiles(true);
    try {
      const data = await api.listFiles();
      setFiles(data.files || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingFiles(false);
    }
  };

  // --- Listen for Native Menu Events ---
  useEffect(() => {
    // Listen for "menu-event" emitted from Rust
    const unlisten = listen<string>("menu-event", (event) => {
      console.log("Native Menu Event:", event.payload);
      
      switch (event.payload) {
        case "toggle_logs":
          setShowLogs(prev => !prev);
          break;
        case "refresh":
          if (isAuthenticated) loadFiles();
          break;
      }
    });

    return () => {
      unlisten.then(f => f());
    };
  }, [isAuthenticated]); // Re-bind if auth state changes

  return (
    <div className="container">
      {/* NO <MenuBar /> HERE anymore! */}
      
      {!isAuthenticated ? (
        <div className="card">
          <h1>Personal Cloud</h1>
          <div className="status-indicator">
            <span>Status: {message}</span>
            <div className={`indicator-light ${isReady ? "green" : "red"}`}></div>
          </div>
          {isReady && (
            <GoogleLogin onLoginSuccess={() => {
              setIsAuthenticated(true);
              loadFiles();
            }} />
          )}
        </div>
      ) : (
        <FileExplorer 
          files={files} 
          loading={loadingFiles} 
          onRefresh={loadFiles} 
        />
      )}

      {/* Logs Modal */}
      {showLogs && (
        <div className="logs-modal-overlay" onClick={() => setShowLogs(false)}>
          <div className="logs-modal" onClick={e => e.stopPropagation()}>
            <div className="logs-header">
              <h3>System Logs</h3>
              <button onClick={() => setShowLogs(false)}>Close</button>
            </div>
            <Terminal logs={logs} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;