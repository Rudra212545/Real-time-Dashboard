import { useState, useEffect, useRef, useReducer } from "react";
import socket, { refreshSocketAuth } from "./socket";
import { useNavigate } from "react-router-dom";

import "./index.css";
import "./App.css";
import ActionsPanel from "./components/ActionsPanel";
import ActionLogPanel from "./components/ActionLogPanel";
import PresencePanel from "./components/PresencePanel";
import AgentPanel from "./components/AgentPanel";
import CubePreview from "./components/CubePreview"; 
import JsonConfigPanel from "./components/JsonConfigPanel";
import JobQueuePanel from "./components/JobQueuePanel";
import SecurityPanel from "./components/SecurityPanel";
import UserPreferencePanel from "./components/UserPreferencePanel";
import { agentsReducer, initialAgentsState } from "./state/agentsReducer";

function App() {
  const [status, setStatus] = useState("active");
  const [presenceList, setPresenceList] = useState({});
  const [actionLog, setActionLog] = useState([]);
  const [previewConfig, setPreviewConfig] = useState({ color: "#66ffdd", size: 1 });
  const [cubeConfig, setCubeConfig] = useState({ color: "#66ffdd", size: 1 });
  const [jobHistory, setJobHistory] = useState([]);
  const [agentEvents, setAgentEvents] = useState([]); 
  const [agents, dispatchAgentEvent] = useReducer(agentsReducer, initialAgentsState);
  const [agentNonces, setAgentNonces] = useState({});
  const [signatureLog, setSignatureLog] = useState([]);
  const [replayAlerts, setReplayAlerts] = useState([]);
  const [heartbeatStatus, setHeartbeatStatus] = useState({});
  const [authContext, setAuthContext] = useState(null);
  const navigate = useNavigate(); 

  const lastActiveTime = useRef(Date.now());

  //  JWT AUTH 
  useEffect(() => {
    async function getToken() {
      const res = await fetch("http://localhost:3000/auth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "user" })
      });
  
      const { token } = await res.json();
      localStorage.setItem("jwt", token);
      refreshSocketAuth();
    }
  
    getToken();
  }, []); 
  // IDLE DETECTION
  useEffect(() => {
    const handleActivity = () => {
      if (status !== "active") {
        setStatus("active");
        socket.emit("presence", "active");
      }
      lastActiveTime.current = Date.now();
    };
  
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
  
    const idleCheck = setInterval(() => {
      const now = Date.now();
      if (now - lastActiveTime.current > 5000 && status !== "idle") {
        setStatus("idle");
        socket.emit("presence", "idle");
      }
    }, 1000);
  
    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      clearInterval(idleCheck);
    };
  }, [status]);
  
  
  

  //  Update cube when job finishes 
  useEffect(() => {
    const latestFinished = jobHistory.find(job => job.status === "finished");
    if (latestFinished) {
      setCubeConfig(latestFinished.config);
    }
  }, [jobHistory]);

  //  SOCKET LISTENERS 
  useEffect(() => {
    socket.on("connect_error", (err) => {
      console.error("Socket connect_error:", err.message);
    });

    socket.on("connect", () => {
      console.log("Socket connected! Socket ID:", socket.id);
    });

    // log actions
    socket.on("action_update", (action) => {
      setActionLog(prev => [action, ...prev].slice(0, 200));
    });

    // agent reactions
    socket.on("agent_update", (data) => {
      try {
        console.log("AGENT UPDATE:", JSON.stringify(data, null, 2));
      } catch (e) {
        console.log("AGENT UPDATE (raw):", data);
      }
    
      // keep raw feed (for logs)
      setAgentEvents(prev => [data, ...prev].slice(0, 200));
    
      // dispatch to reducer (your orchestrator returns {agent, message, reason, userId, timestamp})
      dispatchAgentEvent(data);
    });

      // HintAgent deprioritized in spam collision
      socket.on("hint_deprioritized", (data) => {
        // server sends: { lockedFor, reason }
        const normalized = {
          agent: "HintAgent",
          action: "Deprioritized",
          reason: data.reason || "spam_collision",
          ts: Date.now(),
          cooldown: data.cooldownMs || 60
        };
        setAgentEvents(prev => [{ agent: "HintAgent", reason: "spam_collision", ...data }, ...prev]);
        dispatchAgentEvent(normalized);
      });

      // NavAgent idle prompt
      socket.on("nav_idle_prompt", (data) => {
        setAgentEvents(prev => [{ agent: "NavAgent", reason: "idle_timeout", message: data.message || "User is idle", ...data }, ...prev]);
        dispatchAgentEvent({ agent: "NavAgent", action: "idle_prompt", reason: "idle_timeout", ts: Date.now(), cooldown: 40 });
      });

      // Also handle any predictable/predict_update events if present
      socket.on("predict_update", (data) => {
        setAgentEvents(prev => [{ agent: "PredictAgent", ...data }, ...prev]);
        dispatchAgentEvent({ agent: "PredictAgent", ...data });
      });

      // server sends initial nonce per agent
      socket.on("agent_nonce", (data) => {
        setAgentNonces(data); 
      });

      // signature failures
      socket.on("action_error", (err) => {
        if (err?.error === "invalid_signature") {
          setSignatureLog(prev => [
            { ok:false, reason:"invalid_signature", ts:Date.now() },
            ...prev
          ]);
        }
        if (err?.error === "replay_detected") {
          setReplayAlerts(prev => [
            { reason:"replay_detected", ts:Date.now() },
            ...prev
          ]);
        }
      });

      // secure agent heartbeat results
      socket.on("agent_heartbeat_result", (data) => {
        setHeartbeatStatus(prev => ({
          ...prev,
          [data.agentId || "unknown"]: {
            ok: data.ok,
            reason: data.reason || "",
            ts: Date.now()
          }
        }));
      });


    // Job queue event
    socket.on("job_status", (job) => {
      setJobHistory(prev => [job, ...prev]);
    });

    // presence feed
    socket.on("presence_update", (data) => {
      setPresenceList({ ...data });
    });

    socket.on("disconnect", (reason) => {
      console.log("Disconnected:", reason);
    });

    socket.on("pong", (data) => {
      console.log("pong received:", data);
    });

    socket.on("auth_context", (ctx) => {
      console.log("Auth context received:", ctx);
      setAuthContext(ctx);
    });

    socket.on("auth_error", (err) => {
      console.warn("Authorization error:", err);
    });

    // cleanup on unmount
    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("pong");
      socket.off("presence_update");
      socket.off("action_update");
      socket.off("agent_update");
      socket.off("job_status");
      socket.off("hint_deprioritized");
      socket.off("nav_idle_prompt");
      socket.off("predict_update");
      socket.off("agent_nonce");
      socket.off("agent_heartbeat_result");
      socket.off("action_error");
      socket.off("auth_context");
      socket.off("auth_error");

    };
  }, []);

  //  HEARTBEAT 
  useEffect(() => {
    const interval = setInterval(() => {
      socket.emit("heartbeat", { ts: Date.now() });
      console.log("Heartbeat sent");
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container">
      <h1>Real-Time Dashboard</h1>

      <button
        className="nav-btn"
        onClick={() => navigate("/simulate")}
      >
        Open User Simulator (2 Users)
      </button>

      <div className="grid">
        <CubePreview config={cubeConfig} />

        <JsonConfigPanel 
          onConfigChange={setPreviewConfig} 
          previewConfig={previewConfig} 
        />

        <JobQueuePanel 
          jobHistory={jobHistory} 
          setJobHistory={setJobHistory} 
        />

        <ActionsPanel />

        <AgentPanel agents={agents} recentEvents={agentEvents} />

        <ActionLogPanel actionLog={actionLog} />

        <PresencePanel presenceList={presenceList} />

        {authContext?.role === "admin" && (
          <SecurityPanel 
            agentNonces={agentNonces}
            signatureLog={signatureLog}
            replayAlerts={replayAlerts}
            heartbeatStatus={heartbeatStatus}
          />
        )}

      <UserPreferencePanel />

      </div>
      <style>{`
  .nav-btn {
    padding: 10px 16px;
    background: #2b3248;
    color: #dce6ff;
    border: 1px solid #3a4664;
    border-radius: 8px;
    margin-bottom: 20px;
    cursor: pointer;
    font-size: 15px;
  }

  .nav-btn:hover {
    background: #3b4a6a;
    border-color: #4c8bf5;
  }
`}</style>
    </div>
  );
}

export default App;
