import { useState, useReducer } from "react";
import { useNavigate } from "react-router-dom";

import "./index.css";
import "./App.css";

// panels
import ActionsPanel from "./components/ActionsPanel";
import ActionLogPanel from "./components/ActionLogPanel";
import PresencePanel from "./components/PresencePanel";
import AgentPanel from "./components/AgentPanel";
import CubePreview from "./components/CubePreview";
import JsonConfigPanel from "./components/JsonConfigPanel";
import JobQueuePanel from "./components/JobQueuePanel";
import SecurityPanel from "./components/SecurityPanel";
import UserPreferencePanel from "./components/UserPreferencePanel";

// state
import { agentsReducer, initialAgentsState } from "./state/agentsReducer";

// hooks
import useJwtAuth from "./hooks/useJwtAuth";
import useIdlePresence from "./hooks/useIdlePresence";
import useHeartbeat from "./hooks/useHeartbeat";
import useJobQueue from "./hooks/useJobQueue";
import useSocketCore from "./hooks/useSocketCore";

function App() {
  const navigate = useNavigate();

  // UI + app state
  const [status, setStatus] = useState("active");
  const [presenceList, setPresenceList] = useState({});
  const [actionLog, setActionLog] = useState([]);
  const [jobHistory, setJobHistory] = useState([]);
  const [agentEvents, setAgentEvents] = useState([]);

  // security/admin
  const [agentNonces, setAgentNonces] = useState({});
  const [signatureLog, setSignatureLog] = useState([]);
  const [replayAlerts, setReplayAlerts] = useState([]);
  const [heartbeatStatus, setHeartbeatStatus] = useState({});
  const [authContext, setAuthContext] = useState(null);

  // cube + config
  const [previewConfig, setPreviewConfig] = useState({
    color: "#66ffdd",
    size: 1
  });
  const [cubeConfig, setCubeConfig] = useState({
    color: "#66ffdd",
    size: 1
  });

  // agents
  const [agents, dispatchAgentEvent] = useReducer(
    agentsReducer,
    initialAgentsState
  );

  // side-effect hooks
  useJwtAuth();
  useIdlePresence(status, setStatus);
  useHeartbeat();
  useJobQueue(setJobHistory);

  useSocketCore({
    setActionLog,
    setPresenceList,
    setAgentEvents,
    dispatchAgentEvent,
    setAgentNonces,
    setSignatureLog,
    setReplayAlerts,
    setHeartbeatStatus,
    setAuthContext,
    setCubeConfig
  });

  return (
    <div className="container">
      <h1>Real-Time Dashboard</h1>

      <button className="nav-btn" onClick={() => navigate("/simulate")}>
        Open User Simulator (2 Users)
      </button>

      <div className="grid">
        <CubePreview config={cubeConfig} />

        <JsonConfigPanel
          previewConfig={previewConfig}
          onConfigChange={setPreviewConfig}
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
    </div>
  );
}

export default App;
