// jobQueue.js
const { recordTelemetry } = require("./engine/engine_telemetry");

const queue = [];
let processing = false;

//NEW: engine-visible pending jobs
const enginePendingJobs = [];

const ENGINE_ID = "engine_local_01";
let engineConnected = true;

function addJob(job, onStatus) {
  console.log("[QUEUE RECEIVED]", job.jobType);

  queue.push(job);

  // expose job to engine layer
  enginePendingJobs.push(job);

  onStatus(job, "queued");
  processQueue(onStatus);
}

function processQueue(onStatus) {
  if (processing || queue.length === 0) return;
  processing = true;

  const job = queue.shift();
  onStatus(job, "started");

  recordTelemetry({
    event: "JOB_STARTED",
    jobId: job.jobId,
    engineId: ENGINE_ID,
    payload: { jobType: job.jobType }
  });

  setTimeout(() => {
    // Simulate failures
    const failureReason = simulateFailure(job);

    if (failureReason) {
      onStatus(job, "failed", failureReason);
      recordTelemetry({
        event: "JOB_FAILED",
        jobId: job.jobId,
        engineId: ENGINE_ID,
        payload: { jobType: job.jobType, error: failureReason }
      });
    } else {
      onStatus(job, "finished");

      // Emit specific telemetry based on job type
      if (job.jobType === "BUILD_SCENE") {
        recordTelemetry({
          event: "SCENE_LOADED",
          jobId: job.jobId,
          engineId: ENGINE_ID,
          payload: job.payload
        });
      } else if (job.jobType === "SPAWN_ENTITY") {
        recordTelemetry({
          event: "ENTITY_SPAWNED",
          jobId: job.jobId,
          engineId: ENGINE_ID,
          payload: job.payload
        });
      } else if (job.jobType === "LOAD_ASSETS") {
        recordTelemetry({
          event: "ASSETS_LOADED",
          jobId: job.jobId,
          engineId: ENGINE_ID,
          payload: job.payload
        });
      }

      recordTelemetry({
        event: "JOB_FINISHED",
        jobId: job.jobId,
        engineId: ENGINE_ID,
        payload: { jobType: job.jobType }
      });
    }

    //  remove from engine-visible list
    const idx = enginePendingJobs.findIndex(j => j.jobId === job.jobId);

    if (idx !== -1) enginePendingJobs.splice(idx, 1);

    processing = false;
    processQueue(onStatus);
  }, 4000);
}


function getPendingEngineJobs() {
  return [...enginePendingJobs];
}

function simulateFailure(job) {
  if (!engineConnected) return "ENGINE_DISCONNECTED";

  if (job.jobType === "LOAD_ASSETS") {
    const assets = job.payload?.assets || [];
    const badAsset = assets.find(a => a.includes("corrupted") || a.includes("missing"));
    if (badAsset) return `BAD_ASSET: ${badAsset}`;
  }

  if (job.jobType === "SPAWN_ENTITY") {
    const entityId = job.payload?.id;
    if (entityId && entityId.includes("invalid")) return `INVALID_ENTITY: ${entityId}`;
    if (!job.payload?.transform) return "INVALID_ENTITY: missing transform";
  }

  if (job.jobType === "BUILD_SCENE") {
    if (!job.payload?.sceneId) return "INVALID_SCENE: missing sceneId";
  }

  return null;
}

function setEngineConnected(connected) {
  engineConnected = connected;
}

module.exports = { addJob, getPendingEngineJobs, setEngineConnected };
