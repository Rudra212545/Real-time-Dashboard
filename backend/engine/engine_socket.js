const fs = require("fs");
const path = require("path");

const {
  verifyEngineJWT,
  verifyEngineSignature,
  verifyAndConsumeNonce
} = require("./engine_auth");

const { recordTelemetry } = require("./engine_telemetry");

const LOG_PATH = path.join(__dirname, "engine_event_log.json");

function log(event) {
  fs.appendFileSync(
    LOG_PATH,
    JSON.stringify({ ...event, ts: Date.now() }) + "\n"
  );
}

function setupEngineSocket(io, jobQueue) {
  const engineNS = io.of("/engine");

  engineNS.on("connection", (socket) => {
    try {
      verifyEngineJWT(socket);
    } catch (err) {
      console.error("[ENGINE AUTH FAILED]", err.message);
      return socket.disconnect(true);
    }
  
    console.log("[ENGINE CONNECTED]", socket.id, socket.engineId);
    log({
      type: "ENGINE_CONNECTED",
      socketId: socket.id,
      engineId: socket.engineId
    });

    let lastHeartbeat = Date.now();

    // Heartbeat handler
    socket.on("engine_heartbeat", () => {
      lastHeartbeat = Date.now();
      socket.emit("heartbeat_ack", { ts: Date.now() });
      log({ type: "ENGINE_HEARTBEAT", engineId: socket.engineId });
    });

    // Heartbeat watchdog
    const heartbeatInterval = setInterval(() => {
      if (Date.now() - lastHeartbeat > 10000) {
        console.warn("[ENGINE HEARTBEAT LOST]", socket.engineId);
        log({
          type: "ENGINE_HEARTBEAT_TIMEOUT",
          engineId: socket.engineId
        });
        jobQueue.setEngineConnected(false);
        socket.disconnect(true);
      }
    }, 5000);

    // Engine ready - send pending jobs
    socket.on("engine_ready", () => {
      console.log("[ENGINE READY]", socket.engineId);
      log({ type: "ENGINE_READY", engineId: socket.engineId });
      
      socket.emit("ready_ack", { 
        status: "acknowledged",
        ts: Date.now() 
      });

      const jobs = jobQueue.getPendingEngineJobs();
      console.log(`[ENGINE] Sending ${jobs.length} pending jobs`);

      jobs.forEach(job => {
        socket.emit("engine_job", job);
        log({ type: "JOB_DISPATCHED_TO_ENGINE", jobId: job.jobId });
      });
    });

    // Job acknowledgement from engine
    socket.on("job_ack", (data) => {
      const { jobId, status } = data;
      console.log(`[ENGINE ACK] Job ${jobId}: ${status}`);
      
      log({
        type: "JOB_ACK",
        jobId,
        status,
        engineId: socket.engineId
      });

      socket.emit("ack_received", { jobId, ts: Date.now() });
    });

    // Job progress from engine
    socket.on("job_progress", (data) => {
      const { jobId, progress } = data;
      console.log(`[ENGINE PROGRESS] Job ${jobId}: ${progress}%`);
      
      log({
        type: "JOB_PROGRESS",
        jobId,
        progress,
        engineId: socket.engineId
      });

      recordTelemetry({
        event: "JOB_PROGRESS",
        jobId,
        engineId: socket.engineId,
        payload: { progress }
      });
    });

    // Job status update from engine
    socket.on("job_status", (data) => {
      try {
        verifyEngineSignature(data);
        verifyAndConsumeNonce(data.nonce);
      } catch (err) {
        console.error("[ENGINE PACKET REJECTED]", err.message);
        log({
          type: "ENGINE_PACKET_REJECTED",
          reason: err.message,
          engineId: socket.engineId
        });
        socket.emit("status_rejected", { reason: err.message });
        return;
      }
    
      const { jobId, jobType, status, error } = data.payload;

      console.log(`[ENGINE STATUS] Job ${jobId}: ${status}`);

      log({
        type: "ENGINE_JOB_STATUS",
        jobId,
        status,
        error,
        engineId: socket.engineId
      });

      // Send acknowledgement
      socket.emit("status_ack", { 
        jobId, 
        received: true,
        ts: Date.now() 
      });

      // Record telemetry
      if (status === "completed") {
        recordTelemetry({
          event: "JOB_COMPLETED",
          jobId,
          engineId: socket.engineId,
          payload: { jobType }
        });

        if (jobType === "BUILD_SCENE") {
          recordTelemetry({
            event: "SCENE_LOADED",
            jobId,
            engineId: socket.engineId,
            payload: {}
          });
        } else if (jobType === "SPAWN_ENTITY") {
          recordTelemetry({
            event: "ENTITY_SPAWNED",
            jobId,
            engineId: socket.engineId,
            payload: {}
          });
        }
      } else if (status === "failed") {
        recordTelemetry({
          event: "JOB_FAILED",
          jobId,
          engineId: socket.engineId,
          payload: { jobType, error }
        });
      }
    });

    // Engine error reporting
    socket.on("engine_error", (data) => {
      console.error("[ENGINE ERROR]", data);
      log({
        type: "ENGINE_ERROR",
        error: data.error,
        details: data.details,
        engineId: socket.engineId
      });

      socket.emit("error_ack", { received: true, ts: Date.now() });
    });

    socket.on("disconnect", () => {
      clearInterval(heartbeatInterval);
      console.log("[ENGINE DISCONNECTED]", socket.engineId);
      log({
        type: "ENGINE_DISCONNECTED",
        socketId: socket.id,
        engineId: socket.engineId
      });
      jobQueue.setEngineConnected(false);
    });
  });

  return engineNS;
}

module.exports = { setupEngineSocket };
