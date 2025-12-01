import React from "react";

export default function ActionLogPanel({ actionLog }) {
  return (
    <div className="card">
      <h2>Action Log</h2>
      {actionLog.length === 0 && <p>No actions yet</p>}
      <div className="action-log-container">
        {actionLog.map((a, idx) => (
          <div key={idx} className="log-item">
            <strong>{a.type}</strong> — {a.userId?.slice(0, 6)}
            <span className="timestamp">{new Date(a.timestamp).toLocaleTimeString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
