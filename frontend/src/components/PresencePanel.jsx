import React from "react";

export default function PresencePanel({ presenceList }) {
  const users = Object.entries(presenceList);

  return (
    <div className="card presence-card">
      <h2 className="presence-header">User Presence</h2>

      {users.length === 0 ? (
        <p className="muted">No users connected</p>
      ) : (
        <div className="presence-grid">
          {users.map(([id, info]) => {
            const shortId = id?.slice(0, 6) || "unknown";
            const lastSeen = info.lastSeen
              ? new Date(info.lastSeen).toLocaleTimeString()
              : "—";

            return (
              <div key={id} className="presence-item">
                <div className="presence-row">
                  <span className="presence-id">{shortId}</span>

                  <span
                    className={`presence-dot ${info.state}`}
                    title={info.state}
                  ></span>
                </div>

                <div className="presence-meta">
                  <div><strong>Status:</strong> {info.state}</div>
                  <div><strong>Last Seen:</strong> {lastSeen}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .presence-card {
          background: #121826;
          border-radius: 14px;
          padding: 16px;
          border: 1px solid #26304a;
        }

        .presence-header {
          text-align: center;
          color: #9fc5ff;
          font-size: 20px;
          margin-bottom: 12px;
        }

        .presence-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .presence-item {
          background: #0f1724;
          padding: 12px;
          border-radius: 10px;
          border: 1px solid #1f2937;
        }

        .presence-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .presence-id {
          color: #bcd4ff;
          font-weight: 600;
        }

        .presence-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #475569;
        }

        .presence-dot.active {
          background: #34d399; /* green */
        }

        .presence-dot.idle {
          background: #facc15; /* yellow */
        }

        .presence-dot.disconnected {
          background: #f87171; /* red */
        }

        .presence-meta {
          margin-top: 8px;
          color: #cbd5e1;
          font-size: 13px;
        }

        .muted {
          color: #64748b;
          text-align: center;
          margin-top: 10px;
        }
      `}</style>
    </div>
  );
}
