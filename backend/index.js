const express = require('express');
const { createServer } = require('node:http');
const { Server } = require('socket.io');
const cors = require('cors');

const eventBus = require('./eventBus');
const agent = require("./agent");

const { verifyActionSignature } = require("./auth/signature");
const socketAuth = require("./auth/socketAuth");
const authRoutes = require("./routes/authRoutes");
const { checkAndConsumeNonce } = require("./nonceStore");
const { attachHeartbeatHandlers, startHeartbeatMonitor } = require("./heartbeat");
const { addJob } = require('./jobQueue');
require('dotenv').config();
console.log("JWT_SECRET on server start:", process.env.JWT_SECRET);


const app = express();
const server = createServer(app);


app.use(cors({
  origin: "http://localhost:5173", 
  credentials: true 
}));

app.use(express.json());

// JWT token generator route
app.use("/auth", authRoutes);

const io = new Server(server, { 
  cors: { 
    origin: "http://localhost:5173",
    methods: ["GET","POST"]
  }
});

// Apply JWT middleware
io.use(socketAuth);

// Store presence
const presence = {};


function markInactive(userId) {
  if (presence[userId]) {
    presence[userId].state = "inactive";
    // Optionally broadcast change:
    io.emit("presence_update", presence);
  }
}


startHeartbeatMonitor({ markInactive, presence });

//  SOCKET.IO MAIN LOGIC
io.on('connection', (socket) => {
  console.log(`socket connected: ${socket.id}`);

  const userId = socket.userId;  // From JWT middleware

  // Initialize presence
  if (!presence[userId]) {
    presence[userId] = {
      socketId: socket.id,
      connectedAt: Date.now(),
      lastSeen: Date.now(),
      state: "active",
    };
  } else {
    presence[userId].socketId = socket.id;
    presence[userId].state = "active";
    presence[userId].lastSeen = Date.now();
  }

  io.emit("presence_update", presence);


  // Step 2 — presence updates
  socket.on("presence", (state) => {
    if (!socket.userId) return;

    presence[userId].state = state;
    presence[userId].lastSeen = Date.now();
    io.emit("presence_update", presence);

    if (state === "idle") {
      const agentResult = agent.evaluate({ type: "idle" });
      if (agentResult) io.emit("agent_update", agentResult);
    }
  });


  // Step 3 — actions
  socket.on("action", (actionData) => {
    if (!socket.userId) return;
  
    const { type, payload, ts, nonce, sig } = actionData;
  
    // 1. Timestamp freshness
    if (Math.abs(Date.now() - ts) > 15000) {
      return socket.emit("action_error", { error: "timestamp_expired" });
    }
  
    // 2. Signature validation
    const valid = verifyActionSignature({ type, payload, ts, nonce, sig });
  
    if (!valid) {
      return socket.emit("action_error", { error: "invalid_signature" });
    }
  
    // 3. Nonce anti-replay check
    const ok = checkAndConsumeNonce(socket.userId, nonce);
    if (!ok) {
      return socket.emit("action_error", { error: "replay_detected" });
    }
  
    // 4. Action is trusted → publish
    const action = {
      userId: socket.userId,
      type,
      payload,
      timestamp: Date.now(),
    };
  
    eventBus.publish(action);
  });
  
  // Step 4 — heartbeat
  attachHeartbeatHandlers(socket);

  // Step 5 — job queue: world generation
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
      io.emit("job_status", {
        id: jobObj.id,
        status,
        config: jobObj.config,
        submittedAt: jobObj.submittedAt,
        userId: jobObj.userId
      });
  
      // Agent feedback on job completion
      if (status === "finished") {
        const agentUpdate = agent.evaluate({
          type: "build_finished",
          config: jobObj.config,
          userId: jobObj.userId
        });
        if (agentUpdate) io.emit("agent_update", agentUpdate);
      }
    });
  });
  
  // Step 6 — ping-pong
  socket.on("ping", (data) => {
    console.log("Received ping:", data);
    socket.emit("pong", { reply: "pong", received: data });
  });

  // Step 7 — disconnect
  socket.on("disconnect", () => {
    if (!presence[userId]) return;

    presence[userId].state = "disconnected";
    presence[userId].lastSeen = Date.now();
    io.emit("presence_update", presence);

    setTimeout(() => {
      if (presence[userId] && presence[userId].state === "disconnected") {
        delete presence[userId];
        io.emit("presence_update", presence);
      }
    }, 10000);
  });
});


// Event bus → broadcast to all clients
eventBus.on("action", (action) => {
  io.emit("action_update", action);

  const agentResponse = agent.evaluate(action);
  if (agentResponse) io.emit("agent_update", agentResponse);
});


// Start server
server.listen(3000, () => {
  console.log("server running at http://localhost:3000");
});
