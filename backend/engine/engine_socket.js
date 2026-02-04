const fs = require("fs");
const path = require("path");

const {
  verifyEngineJWT,
  verifyEngineSignature,
  verifyAndConsumeNonce
} = require("./engine_auth");

const { recordTelemetry } = require("./engine_telemetry");
const { prepareEngineJob } = require("./engine_adapter");
const { jobDispatcher, updateJobStatus, findJobById } = require("../jobQueue");
const { engineMonitor } = require("./engine_monitor");

const LOG_PATH = path.join(__dirname, "engine_event_log.json");

function log(event) {
  fs.appendFileSync(
    LOG_PATH,
    JSON.stringify({ ...event, ts: Date.now() }) + "\n"
  );
}

function verifyEngineMessage(data, socket, eventType) {
  try {
    verifyEngineSignature(data);
    verifyAndConsumeNonce(data.nonce);
    return true;
  } catch (err) {
    console.error(`[ENGINE ${eventType} REJECTED]`, err.message);
    log({
      type: `ENGINE_${eventType}_REJECTED`,
      reason: err.message,
      engineId: socket.engineId
    });
    socket.emit(`${eventType.toLowerCase()}_rejected`, { reason: err.message });
    return false;
  }
}

function setupEngineSocket(io, jobQueue) {
  const engineNS = io.of("/engine");

  // Broadcast engine status to all clients
  engineMonitor.on('status_change', (status) => {
    io.emit('engine_status', status);
  });

  engineMonitor.on('telemetry', (telemetry) => {
    io.emit('engine_telemetry', telemetry);
  });

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

    jobQueue.setEngineConnected(true);
    engineMonitor.setConnected(true);

    let lastHeartbeat = Date.now();

    // Listen for jobs from queue
    const dispatchHandler = ({ job, worldSpec }) => {
      try {
        const engineJob = prepareEngineJob(job, worldSpec);
        socket.emit("engine_job", engineJob);
        
        console.log(`[ENGINE] Dispatched job ${job.jobId} (${job.jobType})`);
        log({ type: "JOB_DISPATCHED_TO_ENGINE", jobId: job.jobId, jobType: job.jobType });
      } catch (err) {
        console.error(`[ENGINE] Failed to dispatch job ${job.jobId}: ${err.message}`);
        updateJobStatus(job.jobId, "failed", { 
          error: `DISPATCH_FAILED: ${err.message}`,
          failedAt: Date.now()
        });
      }
    };

    jobDispatcher.on('dispatch_to_engine', dispatchHandler);

    // Heartbeat handler
    socket.on("engine_heartbeat", () => {
      lastHeartbeat = Date.now();
      engineMonitor.recordHeartbeat();
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

    // Engine ready
    socket.on("engine_ready", () => {
      console.log("[ENGINE READY]", socket.engineId);
      log({ type: "ENGINE_READY", engineId: socket.engineId });
      
      socket.emit("ready_ack", { 
        status: "acknowledged",
        ts: Date.now() 
      });
    });

    // Job acknowledgement from engine
    socket.on("job_ack", (data) => {
      if (!verifyEngineMessage(data, socket, 'JOB_ACK')) return;
      
      const { jobId, status } = data.payload;
      console.log(`[ENGINE ACK] Job ${jobId}: ${status}`);
      
      log({
        type: "JOB_ACK",
        jobId,
        status,
        engineId: socket.engineId
      });

      socket.emit("ack_received", { jobId, ts: Date.now() });
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
      if (!verifyEngineMessage(data, socket, 'ENGINE_ERROR')) return;
      
      console.error("[ENGINE ERROR]", data.payload);
      log({
        type: "ENGINE_ERROR",
        error: data.payload.error,
        details: data.payload.details,
        engineId: socket.engineId
      });

      socket.emit("error_ack", { received: true, ts: Date.now() });
    });

    // Inbound telemetry: job_started
    socket.on("job_started", (data) => {
      if (!verifyEngineMessage(data, socket, 'JOB_STARTED')) return;
      
      if (!engineMonitor.recordTelemetry({ event: 'JOB_STARTED', ...data.payload })) {
        console.warn('[ENGINE] Malformed job_started telemetry');
        return;
      }

      const { job_id, timestamp } = data.payload;
      console.log(`[ENGINE TELEMETRY] Job started: ${job_id}`);

      updateJobStatus(job_id, "running", {
        startedAt: timestamp || Date.now()
      });

      recordTelemetry({
        event: "JOB_STARTED",
        jobId: job_id,
        engineId: socket.engineId,
        payload: {}
      });

      log({ type: "JOB_STARTED", jobId: job_id });
    });

    // Inbound telemetry: job_progress
    socket.on("job_progress", (data) => {
      if (!verifyEngineMessage(data, socket, 'JOB_PROGRESS')) return;
      
      if (!engineMonitor.recordTelemetry({ event: 'JOB_PROGRESS', ...data.payload })) {
        console.warn('[ENGINE] Malformed job_progress telemetry');
        return;
      }

      const { job_id, progress, timestamp } = data.payload;
      console.log(`[ENGINE TELEMETRY] Job ${job_id}: ${progress}%`);

      recordTelemetry({
        event: "JOB_PROGRESS",
        jobId: job_id,
        engineId: socket.engineId,
        payload: { progress }
      });

      log({ type: "JOB_PROGRESS", jobId: job_id, progress });
    });

    // Inbound telemetry: job_completed
    socket.on("job_completed", (data) => {
      if (!verifyEngineMessage(data, socket, 'JOB_COMPLETED')) return;
      
      if (!engineMonitor.recordTelemetry({ event: 'JOB_COMPLETED', ...data.payload })) {
        console.warn('[ENGINE] Malformed job_completed telemetry');
        return;
      }

      const { job_id, result, timestamp } = data.payload;
      console.log(`[ENGINE TELEMETRY] Job completed: ${job_id}`);

      const job = findJobById(job_id);
      const startedAt = job?.startedAt || Date.now();
      const completedAt = timestamp || Date.now();

      updateJobStatus(job_id, "completed", {
        completedAt,
        duration: completedAt - startedAt
      });

      recordTelemetry({
        event: "JOB_COMPLETED",
        jobId: job_id,
        engineId: socket.engineId,
        payload: result || {}
      });

      log({ type: "JOB_COMPLETED", jobId: job_id });
    });

    // Inbound telemetry: job_failed
    socket.on("job_failed", (data) => {
      if (!verifyEngineMessage(data, socket, 'JOB_FAILED')) return;
      
      if (!engineMonitor.recordTelemetry({ event: 'JOB_FAILED', ...data.payload })) {
        console.warn('[ENGINE] Malformed job_failed telemetry');
        return;
      }

      const { job_id, error, details, timestamp } = data.payload;
      console.error(`[ENGINE TELEMETRY] Job failed: ${job_id} - ${error}`);

      updateJobStatus(job_id, "failed", {
        error: `${error}: ${details || ''}`,
        failedAt: timestamp || Date.now()
      });

      recordTelemetry({
        event: "JOB_FAILED",
        jobId: job_id,
        engineId: socket.engineId,
        payload: { error, details }
      });

      log({ type: "JOB_FAILED", jobId: job_id, error });
    });

    socket.on("disconnect", () => {
      clearInterval(heartbeatInterval);
      jobDispatcher.removeListener('dispatch_to_engine', dispatchHandler);
      console.log("[ENGINE DISCONNECTED]", socket.engineId);
      log({
        type: "ENGINE_DISCONNECTED",
        socketId: socket.id,
        engineId: socket.engineId
      });
      jobQueue.setEngineConnected(false);
      engineMonitor.handleDisconnect();
    });
  });

  return engineNS;
}

module.exports = { setupEngineSocket };
