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
  
    console.log("[ENGINE CONNECTED]", socket.id);
    log({
      type: "ENGINE_CONNECTED",
      socketId: socket.id,
      engineId: socket.engineId
    });

    let lastHeartbeat = Date.now();

    socket.on("engine_heartbeat", () => {
      lastHeartbeat = Date.now();
    });

    // Heartbeat watchdog
    const heartbeatInterval = setInterval(() => {
      if (Date.now() - lastHeartbeat > 10000) {
        console.warn("[ENGINE HEARTBEAT LOST]", socket.engineId);
        log({
          type: "ENGINE_HEARTBEAT_TIMEOUT",
          engineId: socket.engineId
        });
        socket.disconnect(true);
      }
    }, 5000);

    socket.on("engine_ready", () => {
      const jobs = jobQueue.getPendingEngineJobs();

      jobs.forEach(job => {
        socket.emit("engine_job", job);
      
        log({ type: "JOB_SENT", jobId: job.jobId });
        
        recordTelemetry({
          event: "JOB_STARTED",
          jobId: job.jobId,
          engineId: socket.engineId,
          payload: {
            jobType: job.jobType
          }
        });
      });
    });

    socket.on("engine_status", (data) => {
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
        return socket.disconnect(true);
      }
    
      const { jobId, jobType, status } = data.payload;

        log({
          type: "ENGINE_STATUS",
          jobId,
          status,
          engineId: socket.engineId
        });

        recordTelemetry({
          event: "JOB_FINISHED",
          jobId,
          engineId: socket.engineId,
          payload: { status }
        });

        if (jobType === "BUILD_SCENE") {
          recordTelemetry({
            event: "SCENE_LOADED",
            jobId,
            engineId: socket.engineId,
            payload: {}
          });
        }
        
        if (jobType === "SPAWN_ENTITY") {
          recordTelemetry({
            event: "ENTITY_SPAWNED",
            jobId,
            engineId: socket.engineId,
            payload: {}
          });
        }
        
        

    });
    
      

    socket.on("disconnect", () => {
      clearInterval(heartbeatInterval);
      log({
        type: "ENGINE_DISCONNECTED",
        socketId: socket.id,
        engineId: socket.engineId
      });
    });
    
  });
}

module.exports = { setupEngineSocket };
