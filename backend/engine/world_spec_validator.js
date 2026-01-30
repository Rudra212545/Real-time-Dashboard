const Ajv = require("ajv");
const schema = require("./schema/engine_schema.schema.json");

const ajv = new Ajv({ allErrors: true, strict: true });
const validate = ajv.compile(schema);

function validateWorldSpec(data) {
  const { jobs, ...worldOnly } = data;

  const valid = validate(worldOnly);
  if (!valid) {
    throw new Error(
      "World spec validation failed: " +
      JSON.stringify(validate.errors, null, 2)
    );
  }
  return true;
}

module.exports = validateWorldSpec;
