import { useState } from "react";
import { api } from "../api/client";

interface GoogleLoginProps {
  onLoginSuccess: () => void;
}

export const GoogleLogin: React.FC<GoogleLoginProps> = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      // This triggers Python to open the browser
      const res = await api.loginGoogle();
      console.log("Login Result:", res);
      
      if (res.status === "Authenticated") {
        onLoginSuccess();
      }
    } catch (err) {
      setError("Login Failed. Check logs.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: "20px" }}>
      <button onClick={handleLogin} disabled={loading}>
        {loading ? "Waiting for Browser..." : "Login with Google"}
      </button>
      {error && <p style={{ color: "red", fontSize: "0.8em" }}>{error}</p>}
    </div>
  );
};