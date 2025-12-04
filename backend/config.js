module.exports = {
  JWT_SECRET: "JWT_SECRET_123456789",
  JWT_ISSUER: "microbridge.internal",
  JWT_EXP: "1h",

  // User action signing
  HMAC_SECRET: "HMAC_SECRET_987654321",
  HMAC_WINDOW_MS: 15000,

  // AGENT SECRETS 
  AGENTS: {
    HintAgent: "HINT_AGENT_SECRET_123",
    NavAgent: "NAV_AGENT_SECRET_123",
    PredictAgent: "PREDICT_AGENT_SECRET_123",
    RuleAgent: "RULE_AGENT_SECRET_123"
  }
};
