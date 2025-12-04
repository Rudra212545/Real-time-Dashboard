const HintAgent = require("../agents/HintAgent");
const NavAgent = require("../agents/NavAgent");
const PredictAgent = require("../agents/PredictAgent");
const RuleAgent = require("../agents/RuleAgent");

const { userStates } = require("../state/userStates");

// Priority for conflict resolution
const PRIORITY = ["HintAgent", "NavAgent", "PredictAgent", "RuleAgent"];

const agents = [HintAgent, NavAgent, PredictAgent, RuleAgent];

class Orchestrator {
  evaluate(action) {
    const { userId } = action;

    // Pull per-user state (created by index.js)
    const state = userStates[userId];
    if (!state) {
      console.warn(`[Orchestrator] No state found for user ${userId}`);
      return null;
    }

    console.log("\n====================================================");
    console.log(`🌐 ORCHESTRATOR — USER ${userId}`);
    console.log("Incoming Action:");
    console.log(JSON.stringify(action, null, 2));
    console.log("====================================================\n");

    const results = [];

    for (const agent of agents) {
      console.log(`➡️ Evaluating Agent: ${agent.name} (User ${userId})`);

      // Pass per-user state into all agents
      const output = agent.evaluate(action, state);

      if (output) {
        console.log(`   🔥 ${agent.name} TRIGGERED for User ${userId}:`);
        console.log("   " + JSON.stringify(output, null, 2) + "\n");

        results.push({
          agent: output.agent,
          message: output.message,
          reason: output.reason || "",
          userId,
          timestamp: Date.now(),
        });
      } else {
        console.log(`   ❄️ ${agent.name} did NOT trigger for User ${userId}\n`);
      }
    }

    // No agent reacted → return null
    if (results.length === 0) {
      console.log("❌ No agents triggered.\n");
      return null;
    }

    // Apply priority order
    results.sort((a, b) => PRIORITY.indexOf(a.agent) - PRIORITY.indexOf(b.agent));
    const winner = results[0];

    console.log("----------------------------------------------------");
    console.log(`🏆 FINAL DECISION for User ${userId}`);
    console.log(JSON.stringify(winner, null, 2));
    console.log("====================================================\n");

    return winner;
  }
}

module.exports = new Orchestrator();
