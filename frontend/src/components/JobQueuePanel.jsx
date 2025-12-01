import React, { useEffect, useState } from "react";
import socket from "../socket"; // adjust path if needed

export default function JobQueuePanel({ jobHistory, setJobHistory }) {

  const [agentMessage, setAgentMessage] = useState(null);

  useEffect(() => {
    // Listen for job status
    socket.on("job_status", (job) => {
      setJobHistory(prev => {
        const idx = prev.findIndex(j => j.id === job.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = job;
          return updated;
        }
        return [job, ...prev].slice(0, 10); // limit history
      });
    });
    // Listen for agent update
    socket.on("agent_update", (msg) => {
      setAgentMessage(msg);
    });
    return () => {
      socket.off("job_status");
      socket.off("agent_update");
    };
  }, []);

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
