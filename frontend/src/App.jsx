import { useState, useEffect, useRef } from "react";
import socket, { connectSocket } from "./socket";
import "./App.css";
import ActionsPanel from "./components/ActionsPanel";
import ActionLogPanel from "./components/ActionLogPanel";
import PresencePanel from "./components/PresencePanel";
import AgentPanel from "./components/AgentPanel";
import CubePreview from "./components/CubePreview"; 
import JsonConfigPanel from "./components/JsonConfigPanel";
import JobQueuePanel from "./components/JobQueuePanel";

function App() {
  const [status, setStatus] = useState("active");
  const [presenceList, setPresenceList] = useState({});
  const [actionLog, setActionLog] = useState([]);
  const [agentMessage, setAgentMessage] = useState(null);
  const [previewConfig, setPreviewConfig] = useState({ color: "#66ffdd", size: 1 });
  const [cubeConfig, setCubeConfig] = useState({ color: "#66ffdd", size: 1 });
  const [jobHistory, setJobHistory] = useState([]);

  const lastActiveTime = useRef(Date.now());

  useEffect(() => {
    async function getToken() {
    
      const res = await fetch("http://localhost:3000/auth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "testuser123" })
      });
      const { token } = await res.json();
      localStorage.setItem("jwt", token);
      connectSocket();

      


    }
    getToken();

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

  useEffect(() => {
    
    const latestFinished = jobHistory.find(job => job.status === "finished");
    if (latestFinished) {
      setCubeConfig(latestFinished.config);
    }
  }, [jobHistory]);

  useEffect(() => {
    socket.on("connect_error", (err) => {
      console.error("Socket connect_error:", err.message);
    });
    socket.on("connect", () => {
      console.log("Socket connected! Socket ID:", socket.id);
    });
    socket.on("action_update", (action) => {
      setActionLog(prev => [action, ...prev].slice(0, 200));
    });
    socket.on("agent_update", (data) => {
      setAgentMessage(data);
    });
    socket.on("disconnect", (reason) => {
      console.log("disconnected:", reason);
    });
    socket.on("pong", (data) => {
      console.log("pong received:", data);
    });
    socket.on("presence_update", (data) => {
      setPresenceList({ ...data });
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("pong");
      socket.off("presence_update");
      socket.off("action_update");
      socket.off("agent_update");
    };
  }, []);

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
            <div className="grid">
        <CubePreview config={cubeConfig} />
        <JsonConfigPanel onConfigChange={setPreviewConfig} previewConfig={previewConfig} />
        <JobQueuePanel jobHistory={jobHistory} setJobHistory={setJobHistory} />
        <ActionsPanel />
        <ActionLogPanel actionLog={actionLog} />
        <PresencePanel presenceList={presenceList} />
        <AgentPanel agentMessage={agentMessage} />
        
      </div>
    </div>
  );
}

export default App;
