class PredictAgent {
  constructor() {
    this.name = "PredictAgent";
  }

  evaluate(action, state) {
    const now = Date.now();

    // Pattern 1: Rapid interaction
    if (state.spamCount >= 3) {
      return {
        agent: this.name,
        reason: "rapid_click_pattern",
        message: "Prediction: User likely to continue rapid interaction."
      };
    }

    // Pattern 2: Sustained idle
    if (state.isIdle && now - state.lastActionAt > 5000) {
      return {
        agent: this.name,
        reason: "idle_pattern",
        message: "Prediction: User likely to remain idle."
      };
    }

    return null;
  }
}

module.exports = new PredictAgent();
