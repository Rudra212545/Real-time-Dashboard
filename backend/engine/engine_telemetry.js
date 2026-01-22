const fs = require("fs");
const path = require("path");

const TELEMETRY_PATH = path.join(
    process.cwd(),
    "telemetry_samples.json"
  );

/**
 * Append-only telemetry logger
 */
function recordTelemetry(event) {
    console.log("[TELEMETRY DEBUG] Writing telemetry");
  const entry = {
    ...event,
    ts: Date.now()
  };

  fs.appendFileSync(
    TELEMETRY_PATH,
    JSON.stringify(entry) + "\n"
  );
}

module.exports = { recordTelemetry };
