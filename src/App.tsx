import { useState } from "react";
import { useSidecar } from "./hooks/useSidecar";
import { api } from "./api/client";
import { Terminal } from "./components/Terminal"; // Import Component
import "./App.css"; // Import Global Styles

function App() {
  const { message, logs, isReady } = useSidecar();
  const [status, setStatus] = useState("");

  const handlePing = async () => {
    try {
      const res = await api.healthCheck();
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
          <span>System Status: <strong>{message}</strong></span>
          <div className={`indicator-light ${isReady ? "green" : "red"}`}></div>
        </div>
        
        <p className="response-text">{status}</p>
        
        <button onClick={handlePing} disabled={!isReady}>
          Test Secure Connection
        </button>
      </div>

      {/* The logs wrapper controls the width */}
      <div className="logs">
        <Terminal logs={logs} />
      </div>
    </div>
  );
}

export default App;