// src/components/Terminal.tsx
import React, { useEffect, useRef } from "react";
import "./Terminal.css"; // We'll move the CSS here later

interface TerminalProps {
  logs: string[];
}

export const Terminal: React.FC<TerminalProps> = ({ logs }) => {
  const endRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="terminal-container">
      <h3>System Logs</h3>
      <div className="terminal-window">
        {logs.map((log, i) => (
          <div key={i} className="terminal-line">{log}</div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
};