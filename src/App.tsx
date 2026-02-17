import { useState } from "react";
import { useSidecar } from "./hooks/useSidecar";
import { api } from "./api/client";
import { Terminal } from "./components/Terminal";
import { GoogleLogin } from "./components/GoogleLogin"; // <--- Import
import "./App.css";

function App() {
  const { message, logs, isReady } = useSidecar();
  const [status, setStatus] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [files, setFiles] = useState<any[]>([]);

  const handlePing = async () => {
    try {
      const res = await api.healthCheck();
      setStatus(`${res.system} is ${res.status} on Port ${res.port}`);
    } catch (e) {
      setStatus(`Error: ${e}`);
    }
  };

  const loadFiles = async () => {
    try {
      const data = await api.listFiles();
      setFiles(data.files || []);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="container">
      <h1>Personal Cloud</h1>
      
      <div className="card">
        <div className="status-indicator">
          <span>System Status: <strong>{message}</strong></span>
          <div className={`indicator-light ${isReady ? "green" : "red"}`}></div>
        </div>
        
        {/* Only show controls when system is ready */}
        {isReady && (
          <>
            {!isAuthenticated ? (
              <GoogleLogin onLoginSuccess={() => {
                setIsAuthenticated(true);
                loadFiles();
              }} />
            ) : (
              <div>
                <h3 style={{color: "#4caf50"}}>✓ Authenticated with Google</h3>
                <button onClick={loadFiles}>Refresh Files</button>
                <ul style={{textAlign: 'left'}}>
                  {files.map(f => (
                    <li key={f.id}>{f.name}</li>
                  ))}
                </ul>
              </div>
            )}

            <div style={{marginTop: "20px", borderTop: "1px solid #333", paddingTop: "10px"}}>
               <p className="response-text">{status}</p>
               <button onClick={handlePing} className="secondary">
                 Test Connection
               </button>
            </div>
          </>
        )}
      </div>

      <div className="logs">
        <Terminal logs={logs} />
      </div>
    </div>
  );
}

export default App;