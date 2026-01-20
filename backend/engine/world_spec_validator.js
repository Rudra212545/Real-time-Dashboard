const fs = require("fs");
const path = require("path");
const Ajv = require("ajv");

// Load schema
const schemaPath = path.join(__dirname, "schema/engine_schema.schema.json");
const schema = JSON.parse(fs.readFileSync(schemaPath, "utf-8"));

// Load world spec file from CLI
const worldFile = process.argv[2];
if (!worldFile) {
  console.error("❌ No world spec file provided");
  process.exit(1);
}

const worldPath = path.join(process.cwd(), worldFile);
const worldData = JSON.parse(fs.readFileSync(worldPath, "utf-8"));

// AJV setup (STRICT)
const ajv = new Ajv({ allErrors: true, strict: false });
const validate = ajv.compile(schema);

// Validate
const valid = validate(worldData);

if (!valid) {
  console.error("❌ World spec validation failed:");
  console.error(validate.errors);
  process.exit(1);
}

console.log("✅ World spec is valid and engine-ready");
