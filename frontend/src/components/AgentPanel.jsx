// src/components/AgentPanel.jsx
import React from "react";
import { getPresentationalAgent } from "../state/agentsReducer";

/**
 * Props:
 *  - agents: object from reducer { agentId: { state, lastMessage, reason, ts, cooldownUntil } }
 *  - recentEvents: raw events array (optional)
 */
export default function AgentPanel({ agents = {}, recentEvents = [] }) {
  const rows = Object.entries(agents);

  return (
    <div className="card agent-card" aria-live="polite">
      <h2 className="agent-header">Agent Status (FSM)</h2>

      <div className="agent-grid">
        {rows.map(([name, rawState]) => {
          const a = getPresentationalAgent(rawState);
          return (
            <div key={name} className="agent-block" role="region" aria-label={`${name} status`}>
              <div className="agent-row">
                <div className="agent-name">{name}</div>
                <div className={`agent-tag ${String(a.state).toLowerCase()}`}>{a.state}</div>
              </div>

              <div className="agent-meta">
                <div><strong>Message:</strong> {a.lastMessage || "—"}</div>
                <div><strong>Reason:</strong> {a.reason || "—"}</div>
                <div><strong>Time:</strong> {a.ts ? new Date(a.ts).toLocaleTimeString() : "—"}</div>
              </div>

              <div className="cooldown-wrap" title={`Cooldown ${a.cooldownPct || 0}%`}>
                <div className="cooldown-track">
                  <div className="cooldown-fill" style={{ width: `${a.cooldownPct || 0}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* <div className="agent-log">
        <h4>Recent Events</h4>
        {recentEvents.slice(0,6).map((e, i) => (
          <div key={i} className="ev">
            <small style={{color:"#9fb7ff"}}>{e.agent || e.type || "evt"}</small>
            <span style={{marginLeft:8}}>{e.reason || e.message || JSON.stringify(e).slice(0,60)}</span>
          </div>
        ))}
      </div> */}

      <style>{`
        .agent-grid { display:flex; gap:12px; flex-wrap:wrap; margin-top:12px;}
        .agent-block { background: linear-gradient(135deg,#0f1724,#121827); padding:12px; border-radius:10px; min-width:220px; border:1px solid #2a344c; box-shadow: 0 6px 18px rgba(5,10,20,0.4); }
        .agent-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
        .agent-name { font-weight:700; color:#bfe0ff; }
        .agent-tag { padding:4px 8px; border-radius:999px; font-size:12px; color:white; }
        .agent-tag.idle { background:#475569; }
        .agent-tag.watching { background:#3b82f6; }
        .agent-tag.triggered { background:#ef4444; }
        .agent-tag.cooldown { background:#f59e0b; color:#142018; }
        .agent-meta div { font-size:13px; color:#cfe7ff; margin:4px 0; }
        .cooldown-wrap { margin-top:8px; }
        .cooldown-track { width:100%; height:8px; background:#0b1220; border-radius:6px; overflow:hidden; border:1px solid rgba(255,255,255,0.03); }
        .cooldown-fill { height:100%; background: linear-gradient(90deg,#10b981,#06b6d4); transition: width 300ms linear; }
        .agent-log { margin-top:12px; color:#93b8ff; font-size:13px; max-height:90px; overflow:auto; border-top:1px solid rgba(255,255,255,0.02); padding-top:8px; }
        .ev { padding:6px 0; border-bottom:1px dashed rgba(255,255,255,0.02); }
      `}</style>
    </div>
  );
}
