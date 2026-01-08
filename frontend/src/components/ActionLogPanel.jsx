import React from "react";

export default function ActionLogPanel({ actionLog }) {
  const getUserId = (a) => {
    if (typeof a.userId === "string") return a.userId;
    if (a.userId?.userId) return a.userId.userId;
    return "system";
  };

  return (
    <div className="card">
      <h2>Action Log </h2>

      {actionLog.length === 0 && <p>No actions yet</p>}

      <div className="action-log-container">
        {actionLog.map((a) => (
          <div key={a._id || `${a.sessionId}-${a.clientTs}`} className="log-item">
            <div>
              <strong>{a.type}</strong>{" "}
              <span className="category">[{a.category || "—"}]</span>
            </div>

            <div className="meta">
              <span>User: {getUserId(a).slice(0, 6)}</span>
              <span>
                Session: {a.sessionId ? a.sessionId.split(":")[1] : "—"}
              </span>
              <span className="timestamp">
                {new Date(a.serverTs || a.clientTs).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
