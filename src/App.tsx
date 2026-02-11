import { useState } from "react";
import { useSidecar } from "./hooks/useSidecar";
import { api } from "./api/client";
import "./App.css";

function App() {
  // Use our new Hook!
  const { message, logs, isReady } = useSidecar();
  const [status, setStatus] = useState("");

  const handlePing = async () => {
    try {
      const res = await api.healthCheck();
      // Correctly accessing the new fields from the Modular Python Backend
      setStatus(`${res.system} is ${res.status} on Port ${res.port}`);
    } catch (e) {
      setStatus(`Error: ${e}`);
    }
  };

  return (
    <div className="container">
      <h1>Personal Cloud</h1>
      
      <div className="card">
        <div className="status-indicator">
          <p>System Status: <strong>{message}</strong></p>
          <div className={`indicator-light ${isReady ? "green" : "red"}`}></div>
        </div>
        
        <p className="response-text">{status}</p>
        
        <button onClick={handlePing} disabled={!isReady}>
          Test Secure Connection
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