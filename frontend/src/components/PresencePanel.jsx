import React from "react";
import { Monitor, Smartphone, Tablet, Laptop, Circle } from "lucide-react";

function timeAgo(ts) {
  if (!ts) return "—";
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 5) return "just now";
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

function getDeviceIcon(device) {
  const deviceLower = device?.toLowerCase() || "";
  if (deviceLower.includes("mobile") || deviceLower.includes("phone")) {
    return <Smartphone size={14} />;
  }
  if (deviceLower.includes("tablet") || deviceLower.includes("ipad")) {
    return <Tablet size={14} />;
  }
  if (deviceLower.includes("laptop")) {
    return <Laptop size={14} />;
  }
  return <Monitor size={14} />;
}

export default function PresencePanel({ presenceList }) {
  const users = Object.values(presenceList || {});

  return (
    <div className="card presence-card">
      <div className="presence-header">
        <h2>User Presence</h2>
        <span className="user-count">{users.length} online</span>
      </div>

      {users.length === 0 ? (
        <div className="empty-state">
          <Circle size={40} className="empty-icon" />
          <p className="muted">No users connected</p>
        </div>
      ) : (
        <div className="presence-grid">
          {users.map((u) => (
            <div key={u.userId} className="presence-item">
              <div className="presence-top">
                <div className="user-info">
                  <div className="user-avatar">
                    {u.userId.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="user-details">
                    <span className="user-id">{u.userId.slice(0, 8)}</span>
                    <div className="status-row">
                      <span className={`status-indicator ${u.state}`}>
                        <span className="pulse" />
                      </span>
                      <span className="user-status">{u.state}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="badges">
                <span className={`badge role ${u.role}`}>
                  <span className="badge-icon">
                    {u.role === "admin" ? "⭐" : "👤"}
                  </span>
                  {u.role}
                </span>
                <span className="badge device">
                  {getDeviceIcon(u.device)}
                  {u.device}
                </span>
              </div>

              <div className="meta">
                <div className="meta-item">
                  <span className="meta-label">Last active:</span>
                  <span className="meta-value">{timeAgo(u.lastActiveAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .presence-card {
          background: linear-gradient(135deg, #1a1f35 0%, #121826 100%);
          border-radius: 16px;
          padding: 24px;
          border: 1px solid #2a3551;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .presence-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid #26304a;
        }

        .presence-header h2 {
          color: #9fc5ff;
          font-size: 20px;
          margin: 0;
          font-weight: 600;
        }

        .user-count {
          background: #2563eb;
          color: white;
          padding: 6px 14px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .empty-state {
          text-align: center;
          padding: 50px 20px;
        }

        .empty-icon {
          color: #475569;
          margin-bottom: 16px;
          opacity: 0.5;
        }

        .presence-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
          max-height: 500px;
          overflow-y: auto;
          padding-right: 8px;
        }

        .presence-grid::-webkit-scrollbar {
          width: 6px;
        }

        .presence-grid::-webkit-scrollbar-track {
          background: #0f1724;
          border-radius: 10px;
        }

        .presence-grid::-webkit-scrollbar-thumb {
          background: #26304a;
          border-radius: 10px;
        }

        .presence-item {
          background: linear-gradient(135deg, #0f1724 0%, #1a1f35 100%);
          padding: 18px;
          border-radius: 12px;
          border: 1px solid #1f2937;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .presence-item::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, #2563eb, #7c3aed);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .presence-item:hover {
          border-color: #2563eb;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
        }

        .presence-item:hover::before {
          opacity: 1;
        }

        .presence-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .user-avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: linear-gradient(135deg, #2563eb, #7c3aed);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 13px;
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
        }

        .user-details {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .user-id {
          font-weight: 600;
          color: #e2e8f0;
          font-size: 15px;
        }

        .status-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .user-status {
          font-size: 12px;
          color: #94a3b8;
          text-transform: capitalize;
          font-weight: 500;
        }

        .status-indicator {
          position: relative;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #64748b;
          box-shadow: 0 0 0 3px rgba(100, 116, 139, 0.2);
          flex-shrink: 0;
        }

        .status-indicator.active {
          background: #22c55e;
          box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.2);
        }

        .status-indicator.idle {
          background: #facc15;
          box-shadow: 0 0 0 3px rgba(250, 204, 21, 0.2);
        }

        .status-indicator.inactive,
        .status-indicator.disconnected {
          background: #ef4444;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
        }

        .status-indicator .pulse {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          height: 100%;
          border-radius: 50%;
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .status-indicator.active .pulse {
          background: #22c55e;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(1.5);
          }
        }

        .badges {
          display: flex;
          gap: 10px;
          margin-bottom: 14px;
          flex-wrap: wrap;
        }

        .badge {
          padding: 6px 12px;
          font-size: 11px;
          border-radius: 6px;
          text-transform: uppercase;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
        }

        .badge:hover {
          transform: scale(1.05);
        }

        .badge-icon {
          font-size: 13px;
        }

        .badge.role.admin {
          background: linear-gradient(135deg, #7c3aed, #a855f7);
          color: white;
          box-shadow: 0 2px 8px rgba(124, 58, 237, 0.3);
        }

        .badge.role.user {
          background: linear-gradient(135deg, #2563eb, #3b82f6);
          color: white;
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
        }

        .badge.device {
          background: #1e293b;
          color: #cbd5e1;
          border: 1px solid #334155;
        }

        .meta {
          font-size: 12px;
          color: #94a3b8;
        }

        .meta-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 10px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 6px;
        }

        .meta-label {
          color: #64748b;
        }

        .meta-value {
          color: #cbd5e1;
          font-weight: 600;
        }

        .muted {
          color: #64748b;
          text-align: center;
          margin: 0;
        }
      `}</style>
    </div>
  );
}
