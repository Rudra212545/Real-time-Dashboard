import React from "react";

export default function PresencePanel({ presenceList }) {
  return (
    <div className="card">
      <h2>Users Presence</h2>
      {Object.entries(presenceList).map(([id, info]) => (
        <div key={id} className={`presence-item ${info.state}`}>
          {id.slice(0, 6)} — {info.state}
        </div>
      ))}
    </div>
  );
}
