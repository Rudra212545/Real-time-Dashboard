const behaviourStore = new Map(); // sessionId → array

function recordBehaviour({
  sessionId,
  userId,
  role,
  device,
  actionType,
  category,
  context,
  ts
}) {
  if (!behaviourStore.has(sessionId)) {
    behaviourStore.set(sessionId, []);
  }

  behaviourStore.get(sessionId).push({
    sessionId,
    userId,
    role,
    device,
    behaviour: {
      type: actionType,
      category
    },
    context,
    ts
  });
}

function getSessionBehaviours(sessionId) {
  return behaviourStore.get(sessionId) || [];
}

module.exports = {
  recordBehaviour,
  getSessionBehaviours
};
