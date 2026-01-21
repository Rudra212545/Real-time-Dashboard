// jobQueue.js
const queue = [];
let processing = false;

function addJob(job, onStatus) {
  console.log("[QUEUE RECEIVED]", job.jobType);
  queue.push(job);
  onStatus(job, "queued");
  processQueue(onStatus);
}

function processQueue(onStatus) {
  if (processing || queue.length === 0) return;
  processing = true;

  const job = queue.shift();
  onStatus(job, "started");

  // Simulate heavy build with timeout (e.g., 4 seconds)
  setTimeout(() => {
    onStatus(job, "finished");
    processing = false;
    processQueue(onStatus); // process next job if any
  }, 4000);
}

module.exports = { addJob };
