import React from "react";

export default function ActionLogPanel({ actionLog }) {
  const getUserId = (a) => {
    if (typeof a.userId === "string") return a.userId;
    if (a.userId?.userId) return a.userId.userId;
    return "system";
  };

  return (
    <div className="card">
      <h2>Action Log</h2>
      {actionLog.length === 0 && <p>No actions yet</p>}
      <div className="action-log-container">
        {actionLog.map((a, idx) => (
          <div key={idx} className="log-item">
            <strong>{a.type || a.agent || "event"}</strong> —{" "}
            {getUserId(a).slice(0, 6)}
            <span className="timestamp">
              {new Date(a.timestamp || Date.now()).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
