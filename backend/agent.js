const agent = {
    score: 0,
    actionCounter: 0,
  
    evaluate(action) {
      // RULE 1 — hint after many actions
      if (action.type !== "idle") {
        this.actionCounter++;
        if (this.actionCounter >= 5) {
          this.score += 1;
  
          this.actionCounter = 0;
  
          return {
            type: "hint",
            message: "You're interacting a lot — need help?",
            score: this.score
          };
        }
      }
  
      // RULE 2 — idle → nav assist
      if (action.type === "idle") {
        this.score -= 1;
  
        return {
          type: "nav_assist",
          message: "You've been idle — try exploring something.",
          score: this.score
        };
      }
  
      return null;
    }

  
  };
  
  module.exports = agent;
  
  
  