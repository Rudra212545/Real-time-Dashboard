import React from "react";

export default function SecurityPanel({
  agentNonces = {},
  signatureLog = [],
  replayAlerts = [],
  heartbeatStatus = {}
}) {
  return (
    <div className="card security-card">
      <h2 className="sec-header">Sovereign Security Indicators</h2>

      <div className="sec-section">
        <h3>🔐 Agent Nonces</h3>
        {Object.entries(agentNonces).map(([agent, nonce]) => (
          <div key={agent} className="sec-row">
            <span>{agent}</span>
            <span className="code">{nonce}</span>
          </div>
        ))}
      </div>

      <div className="sec-section">
        <h3>🖋 Signatures</h3>
        {signatureLog.length === 0 ? (
          <p className="muted">No signature failures</p>
        ) : (
          signatureLog.slice(0,5).map((s, i) => (
            <div key={i} className="sec-row fail">
              {new Date(s.ts).toLocaleTimeString()} – {s.reason}
            </div>
          ))
        )}
      </div>

      <div className="sec-section">
        <h3>⛔ Replay Alerts</h3>
        {replayAlerts.length === 0 ? (
          <p className="muted">No replay attacks detected</p>
        ) : (
          replayAlerts.slice(0,5).map((r, i) => (
            <div key={i} className="sec-row warn">
              {new Date(r.ts).toLocaleTimeString()} – replay detected
            </div>
          ))
        )}
      </div>

      <div className="sec-section">
        <h3>💓 Heartbeats</h3>
        {Object.entries(heartbeatStatus).map(([agent, hb]) => (
          <div key={agent} className={`sec-row ${hb.ok ? "ok" : "fail"}`}>
            <span>{agent}</span>
            <span>
              {hb.ok ? "OK" : hb.reason} ·{" "}
              {hb.ts ? new Date(hb.ts).toLocaleTimeString() : "—"}
            </span>
          </div>
        ))}
      </div>

      <style>{`
        .security-card {
          background: #131a2b;
          border-radius: 14px;
          padding: 18px;
          border: 1px solid #26304a;
        }
        .sec-header {
          text-align: center;
          color: #9fc5ff;
          margin-bottom: 16px;
        }
        .sec-section { margin-bottom: 18px; }
        .sec-row {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          border-bottom: 1px dashed rgba(255,255,255,0.06);
          font-size: 14px;
          color: #dce6ff;
        }
        .sec-row.ok { color: #4ade80; }
        .sec-row.fail { color: #f87171; }
        .sec-row.warn { color: #fbbf24; }
        .muted {
          color: #718096;
          font-size: 13px;
          font-style: italic;
        }
        .code {
          background: #1c2437;
          padding: 2px 8px;
          border-radius: 6px;
          font-family: monospace;
        }
      `}</style>
    </div>
  );
}
