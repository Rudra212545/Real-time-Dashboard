const fs = require("fs");
const path = require("path");

const TELEMETRY_PATH = path.join(__dirname, "..", "telemetry_samples.json");

let sequenceNumber = 0;
const eventBuffer = [];


function recordTelemetry(event) {
  const entry = {
    seq: ++sequenceNumber,
    ts: Date.now(),
    event: event.event,
    jobId: event.jobId || null,
    engineId: event.engineId || null,
    userId: event.userId || null,
    payload: event.payload || {},
    _replay: true
  };

  eventBuffer.push(entry);
  try {
    fs.appendFileSync(TELEMETRY_PATH, JSON.stringify(entry) + "\n");
  } catch (err) {
    console.error("[TELEMETRY] Failed to write telemetry:", err.message);
  }
}


function loadTelemetry() {
  if (!fs.existsSync(TELEMETRY_PATH)) return [];
  
  try {
    const lines = fs.readFileSync(TELEMETRY_PATH, "utf-8").split("\n").filter(Boolean);
    return lines.map(line => JSON.parse(line)).sort((a, b) => a.seq - b.seq);
  } catch (err) {
    console.error("[TELEMETRY] Failed to load telemetry:", err.message);
    return [];
  }
}


function replayTelemetry(events, handlers) {
  events.forEach(event => {
    const handler = handlers[event.event];
    if (handler) handler(event);
  });
}


function clearTelemetry() {
  if (fs.existsSync(TELEMETRY_PATH)) fs.unlinkSync(TELEMETRY_PATH);
  sequenceNumber = 0;
  eventBuffer.length = 0;
}

module.exports = { recordTelemetry, loadTelemetry, replayTelemetry, clearTelemetry };
