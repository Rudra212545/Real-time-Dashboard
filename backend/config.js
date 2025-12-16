require("dotenv").config();

module.exports = {
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_ISSUER: process.env.JWT_ISSUER,
  JWT_EXP: process.env.JWT_EXP,

  HMAC_SECRET: process.env.HMAC_SECRET,
  HMAC_WINDOW_MS: Number(process.env.HMAC_WINDOW_MS),

  AGENTS: {
    HintAgent: process.env.HINT_AGENT_SECRET,
    NavAgent: process.env.NAV_AGENT_SECRET,
    PredictAgent: process.env.PREDICT_AGENT_SECRET,
    RuleAgent: process.env.RULE_AGENT_SECRET
  }
};
