class PredictAgent {
  constructor() {
    this.name = "PredictAgent";
  }

  evaluate(action, state) {
    const recent = state.actions.slice(-10); // last 10 actions of THIS user

    // --- Pattern 1: Rapid clicking ---
    const clickCount = recent.filter(a => a.type === "click").length;
    if (clickCount >= 5) {
      return {
        agent: this.name,
        reason: "rapid_click_pattern",
        message: "Prediction: User will click again soon."
      };
    }

    // --- Pattern 2: Idle trend ---
    const lastThree = recent.slice(-3).map(a => a.type);
    if (lastThree.every(t => t === "idle")) {
      return {
        agent: this.name,
        reason: "idle_pattern",
        message: "Prediction: User likely to stay idle."
      };
    }

    // --- Pattern 3: Slow browsing (time gap > 4s) ---
    if (recent.length >= 2) {
      const gap = recent[recent.length - 1].timestamp - recent[recent.length - 2].timestamp;
      if (gap > 4000) {
        return {
          agent: this.name,
          reason: "slow_browsing",
          message: "Prediction: User moving slowly through actions."
        };
      }
    }

    return null;
  }
}

module.exports = new PredictAgent();
