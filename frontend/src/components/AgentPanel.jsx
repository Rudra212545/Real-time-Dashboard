import React from "react";

export default function AgentPanel({ agentMessage }) {
  return (
    <div className="card">
      <h2>Agent</h2>
      {!agentMessage && <p>No agent activity yet</p>}
      {agentMessage && (
        <div>
          <p><strong>Type:</strong> {agentMessage.type}</p>
          <p><strong>Message:</strong> {agentMessage.message}</p>
          <p><strong>Score:</strong> {agentMessage.score}</p>
        </div>
      )}
    </div>
  );
}
