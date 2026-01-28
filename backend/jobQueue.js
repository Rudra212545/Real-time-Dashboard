// jobQueue.js - Strict Lifecycle State Machine
const { recordTelemetry } = require("./engine/engine_telemetry");

const queue = [];
const activeJobs = new Map(); // Track running jobs
let processing = false;

const ENGINE_ID = "engine_local_01";
let engineConnected = true;

// Valid state transitions
const VALID_TRANSITIONS = {
  queued: ["dispatched", "failed"],
  dispatched: ["running", "failed"],
  running: ["completed", "failed"],
  completed: [],
  failed: []
};

function validateTransition(currentState, newState) {
  const allowed = VALID_TRANSITIONS[currentState] || [];
  if (!allowed.includes(newState)) {
    throw new Error(`Invalid transition: ${currentState} → ${newState}`);
  }
}

function addJob(job, onStatus) {
  console.log("[QUEUE RECEIVED]", job.jobType);

  // Initialize job with lifecycle tracking
  job.status = "queued";
  job.queuedAt = Date.now();
  job.retryCount = 0;
  job.engineId = ENGINE_ID;

  queue.push(job);
  onStatus(job, "queued");

  recordTelemetry({
    event: "JOB_QUEUED",
    jobId: job.jobId,
    engineId: ENGINE_ID,
    payload: { jobType: job.jobType, userId: job.userId }
  });

  processQueue(onStatus);
}

function processQueue(onStatus) {
  if (processing || queue.length === 0) return;
  processing = true;

  const job = queue.shift();
  
  // Transition: queued → dispatched
  try {
    validateTransition(job.status, "dispatched");
    job.status = "dispatched";
    job.dispatchedAt = Date.now();
    onStatus(job, "dispatched");

    recordTelemetry({
      event: "JOB_DISPATCHED",
      jobId: job.jobId,
      engineId: ENGINE_ID,
      payload: { jobType: job.jobType }
    });
  } catch (err) {
    console.error(`[JOB TRANSITION ERROR] ${err.message}`);
    failJob(job, onStatus, err.message);
    processing = false;
    processQueue(onStatus);
    return;
  }

  // Simulate engine processing
  setTimeout(() => {
    // Transition: dispatched → running
    try {
      validateTransition(job.status, "running");
      job.status = "running";
      job.startedAt = Date.now();
      onStatus(job, "running");

      activeJobs.set(job.jobId, job);

      recordTelemetry({
        event: "JOB_RUNNING",
        jobId: job.jobId,
        engineId: ENGINE_ID,
        payload: { jobType: job.jobType }
      });
    } catch (err) {
      console.error(`[JOB TRANSITION ERROR] ${err.message}`);
      failJob(job, onStatus, err.message);
      processing = false;
      processQueue(onStatus);
      return;
    }

    // Simulate job execution
    setTimeout(() => {
      const failureReason = simulateFailure(job);

      if (failureReason) {
        failJob(job, onStatus, failureReason);
      } else {
        completeJob(job, onStatus);
      }

      activeJobs.delete(job.jobId);
      processing = false;
      processQueue(onStatus);
    }, 3000);
  }, 500);
}

function completeJob(job, onStatus) {
  try {
    validateTransition(job.status, "completed");
    job.status = "completed";
    job.completedAt = Date.now();
    job.duration = job.completedAt - job.startedAt;

    onStatus(job, "completed");

    // Job-specific telemetry
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
      event: "JOB_COMPLETED",
      jobId: job.jobId,
      engineId: ENGINE_ID,
      payload: { jobType: job.jobType, duration: job.duration }
    });
  } catch (err) {
    console.error(`[JOB COMPLETION ERROR] ${err.message}`);
    failJob(job, onStatus, err.message);
  }
}

function failJob(job, onStatus, error) {
  try {
    validateTransition(job.status, "failed");
  } catch (err) {
    // Already in terminal state, log but don't fail again
    console.error(`[JOB ALREADY TERMINAL] ${job.jobId} in ${job.status}`);
    return;
  }

  job.status = "failed";
  job.failedAt = Date.now();
  job.error = error;
  job.duration = job.failedAt - (job.startedAt || job.dispatchedAt || job.queuedAt);

  onStatus(job, "failed", error);

  recordTelemetry({
    event: "JOB_FAILED",
    jobId: job.jobId,
    engineId: ENGINE_ID,
    payload: { jobType: job.jobType, error, duration: job.duration }
  });

  console.error(`[JOB FAILED] ${job.jobId}: ${error}`);
}

function getPendingEngineJobs() {
  return [...queue, ...Array.from(activeJobs.values())];
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
  
  if (!connected) {
    // Fail all active jobs
    activeJobs.forEach((job) => {
      console.error(`[ENGINE DISCONNECT] Failing job ${job.jobId}`);
      job.error = "ENGINE_DISCONNECTED";
      job.status = "failed";
      job.failedAt = Date.now();
    });
    activeJobs.clear();
  }
}

module.exports = { addJob, getPendingEngineJobs, setEngineConnected };
