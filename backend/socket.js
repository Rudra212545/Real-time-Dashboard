  const { Server } = require("socket.io");
  const socketAuth = require("./auth/socketAuth");
  const { registerBusSubscribers } = require("./busSubscribers");

  const orchestrator = require("./orchestrator/multiAgentOrchestrator");
  const { userStates } = require("./state/userStates");

  const { verifyActionSignature } = require("./auth/signature");
  const { checkAndConsumeNonce } = require("./security/nonceStore");
  const { attachHeartbeatHandlers, startHeartbeatMonitor } = require("./security/heartbeat");
  const { addJob, setEngineConnected } = require("./jobQueue");
  const { rotateNonce } = require("./security/nonce_registry");
  const { processHeartbeat } = require("./security/heartbeat_monitor");
  const { AGENTS } = require("./config");
  const eventBus = require("./eventBus");
  const {recordBehaviour, getSessionBehaviours} = require("./telemetry/behaviourRecorder");
  const {buildSessionSummary} = require("./telemetry/sessionSummary");
  const { convertToEngineSchema } = require("./engine/engine_adapter");
  const validateWorldSpec = require("./engine/world_spec_validator");
  const { engineMonitor } = require("./engine/engine_monitor");

  function initSocket(server) {

    const io = new Server(server, {
      cors: { origin: "http://localhost:5173" }
    });

    const presence = {};

    io.use(socketAuth);

    registerBusSubscribers(io, orchestrator, userStates);

    startHeartbeatMonitor({
      presence,
      markInactive: (userId) => {
        if (presence[userId]) {
          presence[userId].state = "inactive";
          presence[userId].lastActiveAt = Date.now();
          emitPresenceScoped();
        }
      }
    });

    function emitPresenceScoped() {
      io.sockets.sockets.forEach((s) => {
        if (!s.userId) return;
        s.emit("presence_update",
          s.role === "admin" ? presence : { [s.userId]: presence[s.userId] }
        );
      });
    }

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

    function scheduleIdleCheck(userId, ms = 5000) {
      const us = ensureUserState(userId);
      clearTimeout(us.idleTimer);

      us.idleTimer = setTimeout(() => {
        us.isIdle = true;
        io.to(`user:${userId}`).emit("nav_idle_prompt", { userId });
        const r = orchestrator.evaluate({ type: "idle", userId });
        if (r) io.to(`user:${userId}`).emit("agent_update", r);
      }, ms);
    }

    io.on('connection', (socket) => {
      console.log(`socket connected: ${socket.id} userId=${socket.userId}`);
    
      const rawUserId = socket.userId;
      const userId =
        typeof rawUserId === "object"
          ? rawUserId.userId
          : rawUserId;
      
      socket.userId = userId;
    
      const sessionId = `${userId}:${Date.now()}`;
      socket.sessionId = sessionId;
      socket.sessionStart = Date.now();
    
      if (!userId) {
        console.warn("Unauthenticated socket, disconnecting:", socket.id);
        socket.disconnect(true);
        return;
      }
    
      const userAgent = socket.handshake.headers["user-agent"] || "";
    
      const device =
        /mobile|android|iphone|ipad/i.test(userAgent)
          ? "mobile"
          : "desktop";
    
      socket.emit("auth_context", {
        userId: socket.userId,
        role: socket.role,
        isSimulated: !!socket.isSimulated
      });

      // Send initial engine status
      const currentEngineStatus = engineMonitor.getStatus();
      socket.emit("engine_status", currentEngineStatus);
      if (currentEngineStatus.lastTelemetry) {
        socket.emit("engine_telemetry", currentEngineStatus.lastTelemetry);
      }
    
      socket.join(`user:${userId}`);
    
      const agentNonces = {};
      for (const agentId of Object.keys(AGENTS)) {
        agentNonces[agentId] = rotateNonce(agentId);
      }
      socket.emit("agent_nonce", agentNonces);
    
      socket.on("agent_heartbeat", (hb) => {
        const result = processHeartbeat(hb);
        if (!result.ok) {
          console.warn(`Agent heartbeat rejected (${hb.agentId}): ${result.reason}`);
          return socket.emit("agent_heartbeat_result", { ok: false, reason: result.reason });
        }
        console.log(`Secure heartbeat accepted from ${hb.agentId}`);
        socket.emit("agent_heartbeat_result", { ok: true });
      });
    
      presence[userId] = {
        userId,
        role: socket.role,
        device,
        socketId: socket.id,
        state: "active",
        connectedAt: Date.now(),
        lastActiveAt: Date.now()
      };
    
      emitPresenceScoped();
    
      ensureUserState(userId);
      userStates[userId].lastActionAt = Date.now();
      scheduleIdleCheck(userId);
    
      socket.on("presence", (state) => {
        if (!socket.userId) return;
      
        if (!presence[userId]) {
          console.warn(`[PRESENCE] Missing presence entry for ${userId}`);
          return;
        }
      
        presence[userId].state = state;
        presence[userId].lastActiveAt = Date.now();
      
        emitPresenceScoped();
      
        if (state === "idle") {
          const us = ensureUserState(userId);
          if (us.isIdle === true) return;
      
          us.isIdle = true;
      
          const agentResult = orchestrator.evaluate({
            type: "idle",
            userId
          });
      
          if (agentResult) io.to(`user:${userId}`).emit("agent_update", agentResult);
          return;
        }
      
        const us = ensureUserState(userId);
        us.isIdle = false;
        scheduleIdleCheck(userId);
      });
      
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
    
        const action = {
          userId: socket.userId,
          sessionId: socket.sessionId,
          type,
          payload,
          clientTs: ts
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
    
        if (presence[userId]) {
          presence[userId].lastActiveAt = Date.now();
          emitPresenceScoped();
        }
        
        recordBehaviour({
          sessionId: socket.sessionId,
          userId: socket.userId,
          role: socket.role,
          device,
          actionType: type,
          category: actionData.category || "GENERAL",
          context: {
            payloadKeys: payload ? Object.keys(payload) : []
          },
          ts: Date.now()
        });
    
        eventBus.publish(action);
      });
    
      attachHeartbeatHandlers(socket);
    
  socket.on("generate_world", (payload) => {
    console.log("generate_world event received:", payload);

    if (!payload || typeof payload !== 'object') {
      console.error("[GENERATE_WORLD] Invalid payload");
      return socket.emit("job_error", { error: "invalid_payload" });
    }

    const { config, submittedAt } = payload;
    
    if (!config) {
      console.error("[GENERATE_WORLD] Missing config");
      return socket.emit("job_error", { error: "missing_config" });
    }
    
    let engineSchema;
    try {
      engineSchema = convertToEngineSchema(config);
      validateWorldSpec(engineSchema);
      console.log("[ENGINE SCHEMA VALIDATED]");
    } catch (err) {
      console.error("[SCHEMA CONVERSION/VALIDATION FAILED]", err.message);
      return socket.emit("job_error", { error: "schema_validation_failed", message: err.message });
    }

    const jobBatchId = Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    let completedJobs = 0;
    const totalJobs = engineSchema.jobs.length;

    engineSchema.jobs.forEach((engineJob) => {
      const job = {
        ...engineJob,
        userId: socket.userId
      };

      addJob(job, (jobObj, status, error) => {
        io.to(`user:${jobObj.userId}`).emit("job_status", {
          jobId: jobObj.jobId,
          jobType: jobObj.jobType,
          payload: jobObj.payload,
          status,
          error,
          submittedAt: jobObj.submittedAt,
          userId: jobObj.userId,
          queuedAt: jobObj.queuedAt,
          dispatchedAt: jobObj.dispatchedAt,
          startedAt: jobObj.startedAt,
          completedAt: jobObj.completedAt,
          duration: jobObj.duration,
          retryCount: jobObj.retryCount || 0
        });

        if (status === "completed") {
          completedJobs++;
          
          io.to(`user:${jobObj.userId}`).emit("engine_job_finished", {
            jobType: jobObj.jobType,
            jobId: jobObj.jobId,
            finishedAt: Date.now()
          });

          if (completedJobs === totalJobs) {
            io.to(`user:${jobObj.userId}`).emit("world_update", engineSchema);
          }

          orchestrator.evaluate({
            type: "build_finished",
            jobType: jobObj.jobType,
            userId: jobObj.userId
          });
        }

        if (status === "failed") {
          io.to(`user:${jobObj.userId}`).emit("engine_job_failed", {
            jobType: jobObj.jobType,
            jobId: jobObj.jobId,
            error,
            failedAt: Date.now()
          });
        }
      }, engineSchema);
    });
  });

    socket.on("disconnect", () => {
      console.log(`socket disconnected: ${socket.id}`);
      if (presence[userId]) {
        presence[userId].state = "disconnected";
        emitPresenceScoped();
      }
    });
  });
  return io;
  }

  module.exports = { initSocket };
