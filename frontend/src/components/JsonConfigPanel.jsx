import React, { useState } from "react";
import socket from "../socket/socket"; 
import CubePreview from "./CubePreview";

export default function JsonConfigPanel({ onConfigChange, previewConfig }) {
  const [jsonText, setJsonText] = useState('{"color": "#66ffdd", "size": 1}');
  const [error, setError] = useState(null);

  const handlePreview = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setError(null);
      onConfigChange(parsed);
    } catch (e) {
      setError("Invalid JSON: " + e.message);
    }
  };

  const handleGenerate = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setError(null);
      // Emit a "generate_world" job to backend
      socket.emit("generate_world", {
        config: parsed,
        submittedAt: Date.now()
      });
      // Optionally clear or update UI to show job is sent
    } catch (e) {
      setError("Invalid JSON: " + e.message);
    }
  };

  return (
    <div className="card">
      <h2>Cube Config (JSON)</h2>
      <textarea
        rows={4}
        style={{
          width: "100%",
          color: "#91e7da",
          background: "#2e355a",
          borderRadius: 9,
          border: "none",
          resize: "vertical",
          padding: 10,
          fontSize: 16,
          marginBottom: 9,
          boxShadow: "0 1px 7px #20233455"
        }}
        value={jsonText}
        onChange={e => setJsonText(e.target.value)}
      />
      <button onClick={handlePreview}>Preview Cube</button>
      <CubePreview config={previewConfig} />
      <button onClick={handleGenerate} style={{ background: "#7a42f5", marginTop: 4 }}>
        Generate World
      </button>
      {error && <div style={{ color: "#ff709b", marginTop: 4, fontSize:16 }}>{error}</div>}
      <div style={{ fontSize: 13, color: "#ccc", marginTop: 5 }}>
        Example: {"{ \"color\": \"#B6FF00\", \"size\": 1.3 }"}
      </div>
    </div>
  );
}
