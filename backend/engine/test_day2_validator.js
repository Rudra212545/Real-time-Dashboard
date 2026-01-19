const fs = require("fs");
const path = require("path");
const { validateWorldSpec } = require("./world_spec_validator");

// Load sample world
const worldPath = path.join(__dirname, "sample_worlds", "forest.json");
const worldSpec = JSON.parse(fs.readFileSync(worldPath, "utf-8"));

try {
  validateWorldSpec(worldSpec);
  console.log("✅ DAY 2 TEST PASSED: World spec is valid.");
} catch (err) {
  console.error("❌ DAY 2 TEST FAILED:");
  console.error(err.message);
}
