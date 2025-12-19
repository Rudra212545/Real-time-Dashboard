# HANDOVER — Real-Time Micro-Bridge + Multi-Agent Orchestrator Dashboard



##  What Works

### Core Functionality
- Real-time presence tracking (active / idle / disconnected).
- Frontend dashboard shows live updates of actions, agent decisions, job queue, and presence. 
- Multi-agent orchestration (Hint, Nav, Predict, Rule agents) with priority ordering and deterministic final decisions.
- Action bus and collision handling (e.g., spam click deprioritization).
- JWT authentication for socket connections. 

### Security & Audit
- HMAC signatures on actions validated in backend. 
- Timestamp window ensures action freshness. 
- Per-session nonce rotation and anti-replay protection in place. 
- Heartbeat verification for agent liveness. 
- `/health` and `/security/status` endpoints for integration readiness. 

### Job Queue
- Users can submit jobs (e.g., `generate_world`). 
- Backend processes jobs and reports status via socket events.
- Cube preview updates based on job completion. 

### Frontend UI
- Panels for presence, actions, agent events, job queue, and security indicators. 
- Supports multi-user simulation (`/simulate`). 
- Security panel captures:
  - signature failures
  - replay alerts
  - agent nonces
  - heartbeat status.
---

##  What Does *Not* Work

- In-memory state only — state **does not persist** across server restarts.
- Anti-replay protection is session-scoped; replay across reconnects looks like new sessions. 
- No horizontal scalability (e.g., Redis for shared socket state or queue).
- Socket events cannot be invoked via curl (real-time only).  
  (WebSocket tooling required for interactive tests.)

---

##  Known Limitations

- No automated regression testing suite.
- Nonce replay protection does **not** reject replay across reconnects by design to prevent false positives.
- Agent logic does not support dynamic rule reconfiguration at runtime.
- Frontend notifications for certain agent results (e.g., PredictAgent) may lag under high interaction due to event batching.

---

##  Assumptions Made

- Users are identified by a simple userId from JWT (no role/permission tiers).
- Local environment, single server instance — no distributed cluster support.
- Clients resend the same nonce only within the same socket session.
- Security rating values are moderate and not meant for high-risk production (suitable for internal prototypes).

---

##  Integration Notes

### Endpoints
- **GET** `/health` — service status.
- **GET** `/security/status` — security configuration and agent health.
- **POST** `/auth/token` — issues JWT for test users.

### WebSocket Events
| Event | Direction | Description |
|-------|-----------|-------------|
| `action` | client → server | User action submission (signed). |
| `agent_update` | server → client | Agent reaction to actions. |
| `action_error` | server → client | Invalid signature / replay / timestamp fail. |
| `agent_nonce` | server → client | Initial nonce per agent. |
| `agent_heartbeat` | client → server | Heartbeat from agent. |
| `agent_heartbeat_result` | server → client | Heartbeat validation result. |
| `job_status` | server → client | Job queue progress. |
| `presence` | client → server | User presence state. |

---

##  Dependencies

- Node 18+
- Socket.IO
- express, cors
- dotenv
- React frontend
- (optional) Postman/curl for REST checks.

---

##  Deployment Notes

- Use environment variables for secrets (JWT_SECRET, agent HMAC keys).
- Consider persisting state (Redis/Mongo) for production scaling.
- Use a process manager (PM2/docker) for reliability.

---


