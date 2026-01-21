const Ajv = require("ajv");
const schema = require("./schema/engine_schema.schema.json");

const ajv = new Ajv({ allErrors: true, strict: true });
const validate = ajv.compile(schema);

function validateWorldSpec(data) {
  const valid = validate(data);
  if (!valid) {
    throw new Error(
      "World spec validation failed: " +
      JSON.stringify(validate.errors, null, 2)
    );
  }
  return data;
}

module.exports = validateWorldSpec;
