import React, { useEffect, useState } from "react";
import socket from "../socket/socket"; // adjust path if needed

export default function JobQueuePanel({ jobHistory, setJobHistory }) {

  const [agentMessage, setAgentMessage] = useState(null);


  return (
    <div className="card">
      <h2>World Build Jobs</h2>
      {jobHistory.length === 0 && <p>No jobs yet.</p>}
      <ul style={{marginBottom: 12}}>
        {jobHistory.map(job =>
          <li key={job.id} style={{marginBottom: 6}}>
            <span style={{
              color: job.status === 'finished' ? '#3afdca'
                    : job.status === 'started' ? '#ffd556'
                    : '#85aaff',
              fontWeight: 700
            }}>
              {job.status.toUpperCase()}
            </span>
            {" — "}
            {job.config?.color || "default"} | Size: {job.config?.size || 1}
            {" — "}
            <span style={{fontSize: 13, color: "#8fa2c9"}}>
              {new Date(job.submittedAt).toLocaleTimeString()}
            </span>
          </li>
        )}
      </ul>
      <h3 style={{color: "#85aaff", fontSize: 18}}>Agent Feedback</h3>
      {!agentMessage && <p style={{fontSize:15, color: "#dde6fa"}}>No agent message yet.</p>}
      {agentMessage && (
        <div style={{fontSize:15, color: "#b3ceff"}}>
          <strong>Type:</strong> {agentMessage.type}<br />
          <strong>Message:</strong> {agentMessage.message}<br />
          <strong>Score:</strong> {agentMessage.score}
        </div>
      )}
    </div>
  );
}
