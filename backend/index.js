const express = require('express');
const { createServer } = require('node:http');
const { Server } = require('socket.io');
const cors = require('cors');

const eventBus = require('./eventBus');
const orchestrator = require("./orchestrator/multiAgentOrchestrator");

const { verifyActionSignature } = require("./auth/signature");
const socketAuth = require("./auth/socketAuth");
const authRoutes = require("./routes/authRoutes");
const { checkAndConsumeNonce } = require("./nonceStore");
const { attachHeartbeatHandlers, startHeartbeatMonitor } = require("./heartbeat");
const { addJob } = require('./jobQueue');
require('dotenv').config();
console.log("JWT_SECRET on server start:", process.env.JWT_SECRET);

const { processHeartbeat } = require("./security/heartbeat_monitor");
const { rotateNonce } = require("./security/nonce_registry");
const { registerRSA, registerHMAC } = require("./security/agent_signatures");

const { userStates } = require("./state/userStates");
const { AGENTS } = require("./config");

// Register agent signatures
for (const [agentId, secret] of Object.entries(AGENTS)) {
  registerHMAC(agentId, secret);
  console.log(`Registered agent for : ${agentId}`);
}

// EXPRESS + SERVER + SOCKET.IO
const app = express();
const server = createServer(app);

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());

app.use("/auth", authRoutes);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// JWT middleware
io.use(socketAuth);

// presence map
const presence = {};

function markInactive(userId) {
  if (presence[userId]) {
    presence[userId].state = "inactive";
    io.emit("presence_update", presence);
  }
}

startHeartbeatMonitor({ markInactive, presence });

// ---- USER STATE HELPERS ----
function ensureUserState(userId) {
  if (!userStates[userId]) {
    userStates[userId] = {
      userId,
      actions: [],
      lastActionAt: Date.now(),
      isIdle: false,
      spamCount: 0,
      idleTimer: null
    };
  }
  return userStates[userId];
}

function scheduleIdleCheck(userId, idleMs = 5000) {
  const us = ensureUserState(userId);

  if (us.idleTimer) clearTimeout(us.idleTimer);

  us.idleTimer = setTimeout(() => {
    us.isIdle = true;

    io.to(`user:${userId}`).emit("nav_idle_prompt", { userId, reason: "idle_timeout" });
    console.log(`[NavAgent][${userId}] idle triggered (server-side)`);

    const r = orchestrator.evaluate({ type: "idle", userId });
    if (r) io.to(`user:${userId}`).emit("agent_update", r);

  }, idleMs);
}

// ---- SOCKET.IO MAIN CONNECTION ----
io.on('connection', (socket) => {
  console.log(`socket connected: ${socket.id} userId=${socket.userId}`);

  const userId = socket.userId;

  if (!userId) {
    console.warn("Unauthenticated socket, disconnecting:", socket.id);
    socket.disconnect(true);
    return;
  }

  // assign each connection to user room
  socket.join(`user:${userId}`);

  // nonces per agent
  const agentNonces = {};
  for (const agentId of Object.keys(AGENTS)) {
    agentNonces[agentId] = rotateNonce(agentId);
  }
  socket.emit("agent_nonce", agentNonces);

  // secure agent heartbeat
  socket.on("agent_heartbeat", (hb) => {
    const result = processHeartbeat(hb);
    if (!result.ok) {
      console.warn(`Agent heartbeat rejected (${hb.agentId}): ${result.reason}`);
      return socket.emit("agent_heartbeat_result", { ok: false, reason: result.reason });
    }
    console.log(`Secure heartbeat accepted from ${hb.agentId}`);
    socket.emit("agent_heartbeat_result", { ok: true });
  });

  // initialize presence
  presence[userId] = {
    socketId: socket.id,
    connectedAt: Date.now(),
    lastSeen: Date.now(),
    state: "active"
  };

  io.emit("presence_update", presence);

  // ensure user state exists
  ensureUserState(userId);
  userStates[userId].lastActionAt = Date.now();
  scheduleIdleCheck(userId);

  // ---- PRESENCE HANDLER ----
  socket.on("presence", (state) => {
    if (!socket.userId) return;

    presence[userId].state = state;
    presence[userId].lastSeen = Date.now();
    io.emit("presence_update", presence);

    if (state === "idle") {
      const us = ensureUserState(userId);
    
      // If user is already idle, DO NOT retrigger agents
      if (us.isIdle === true) return;
    
      // First time idle → mark idle + trigger agents
      us.isIdle = true;
    
      const agentResult = orchestrator.evaluate({
        type: "idle",
        userId
      });
    
      if (agentResult) io.to(`user:${userId}`).emit("agent_update", agentResult);
      return;
    }
    

    // active → reset idle timer
    const us = ensureUserState(userId);
    us.isIdle = false;
    scheduleIdleCheck(userId);
  });

  // ---- ACTIONS HANDLER ----
  socket.on("action", (actionData) => {
    if (!socket.userId) return;

    const { type, payload, ts, nonce, sig } = actionData;

    if (Math.abs(Date.now() - ts) > 15000) {
      return socket.emit("action_error", { error: "timestamp_expired" });
    }

    if (!verifyActionSignature({ type, payload, ts, nonce, sig })) {
      console.log(`[SECURITY] Signature invalid — user=${socket.userId}`);
      return socket.emit("action_error", { error: "invalid_signature" });
    }

    if (!checkAndConsumeNonce(socket.userId, nonce)) {
      console.log(`[SECURITY] Nonce replay — user=${socket.userId}`);
      return socket.emit("action_error", { error: "replay_detected" });
    }

    // trusted action
    const action = {
      userId: socket.userId,
      type,
      payload,
      timestamp: Date.now(),
    };

    const us = ensureUserState(action.userId);
    us.actions.push(action);

    us.isIdle = false;
    us.lastActionAt = Date.now();
    scheduleIdleCheck(action.userId);

    if (type === "click") {
      const now = Date.now();
      us.actions = us.actions.filter(
        (a) => !(a.type === "click" && now - a.timestamp > 1000)
      );
      us.spamCount = us.actions.filter((a) => a.type === "click").length;
    } else {
      us.spamCount = 0;
    }

    eventBus.publish(action);
  });

  attachHeartbeatHandlers(socket);

  // ---- JOB QUEUE ----
  socket.on("generate_world", (payload) => {
    const { config, submittedAt } = payload;

    const jobId = Date.now().toString(36) + Math.random().toString(36).substring(2, 5);

    const job = {
      id: jobId,
      userId: socket.userId,
      config,
      submittedAt
    };

    addJob(job, (jobObj, status) => {

      // FIXED: per-user job_status emit
      io.to(`user:${jobObj.userId}`).emit("job_status", {
        id: jobObj.id,
        status,
        config: jobObj.config,
        submittedAt: jobObj.submittedAt,
        userId: jobObj.userId
      });

      if (status === "finished") {
        const agentUpdate = orchestrator.evaluate({
          type: "build_finished",
          config: jobObj.config,
          userId: jobObj.userId
        });

        // FIXED: per-user agent update
        if (agentUpdate) {
          io.to(`user:${jobObj.userId}`).emit("agent_update", agentUpdate);
        }
      }
    });
  });

  // ping-pong
  socket.on("ping", (data) => {
    socket.emit("pong", { reply: "pong", received: data });
  });

  // disconnect
  socket.on("disconnect", () => {
    if (!presence[userId]) return;

    presence[userId].state = "disconnected";
    presence[userId].lastSeen = Date.now();
    io.emit("presence_update", presence);

    // clear idle timer
    if (userStates[userId] && userStates[userId].idleTimer) {
      clearTimeout(userStates[userId].idleTimer);
      userStates[userId].idleTimer = null;
    }

    // delete after 10s
    setTimeout(() => {
      if (presence[userId] && presence[userId].state === "disconnected") {
        delete presence[userId];
        io.emit("presence_update", presence);
      }
    }, 10000);
  });
});


eventBus.on("action", (action) => {
  const userId = action.userId;
  console.log(`[action][${userId}] type=${action.type}`);

  // per-user action update
  io.to(`user:${userId}`).emit("action_update", action);

  // spam collision lock
  if (!global.hintLock) {
    global.hintLock = { lockedFor: null, expiresAt: 0 };
  }

  const lock = global.hintLock;
  const now = Date.now();
  const state = userStates[userId];

  if (action.type === "click") {
    if (now > lock.expiresAt) {
      lock.lockedFor = null;
    }

    const spammers = Object.values(userStates).filter(s => s.spamCount >= 3);

    if (!lock.lockedFor && spammers.length >= 2) {
      spammers.sort((a, b) => a.lastActionAt - b.lastActionAt);
      lock.lockedFor = spammers[0].userId;
      lock.expiresAt = now + 300;
      console.log(`[HintAgent] Spam collision → locking to user ${lock.lockedFor}`);
    }

    if (lock.lockedFor && lock.lockedFor !== userId && lock.expiresAt > now) {
      console.log(`[HintAgent][${userId}] click deprioritized (locked for ${lock.lockedFor})`);

      io.to(`user:${userId}`).emit("hint_deprioritized", {
        lockedFor: lock.lockedFor,
        reason: "spam_collision"
      });

      return;
    }
  }

  const result = orchestrator.evaluate(action);

  if (result) {
    io.to(`user:${userId}`).emit("agent_update", result);
    console.log(`[AgentUpdate][${userId}]`, result);
  }
});
// HEALTH CHECK ENDPOINT
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "real-time-micro-bridge",
    uptime: process.uptime(),
    timestamp: Date.now()
  });
});
// SECURITY STATUS ENDPOINT
app.get("/security/status", (req, res) => {
  res.status(200).json({
    jwt: {
      enabled: true,
      issuer: process.env.JWT_ISSUER
    },
    hmac: {
      enabled: true,
      perAgent: true,
      agents: Object.keys(AGENTS)
    },
    nonceProtection: {
      enabled: true,
      windowMs: Number(process.env.HMAC_WINDOW_MS)
    },
    heartbeat: {
      enabled: true,
      agents: Object.keys(AGENTS).reduce((acc, id) => {
        acc[id] = "unknown"; // or "alive" if you track it
        return acc;
      }, {})
    },
    timestamp: Date.now()
  });
});


// START SERVER
server.listen(3000, () => {
  console.log("server running at http://localhost:3000");
});
