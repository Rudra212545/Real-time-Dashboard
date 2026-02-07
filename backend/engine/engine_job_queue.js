// Engine Job Builder 

const { randomUUID } = require("crypto");

function buildEngineJobs(worldSpec, gameParams = null) {
  if (!worldSpec || !worldSpec.scene || !Array.isArray(worldSpec.entities)) {
    throw new Error("Invalid worldSpec passed to buildEngineJobs");
  }

  const jobs = [];

  // 1. BUILD_SCENE
  jobs.push({
    jobId: randomUUID(),
    jobType: "BUILD_SCENE",
    payload: {
      sceneId: worldSpec.scene.id,
      ambientLight: worldSpec.scene.ambientLight,
      skybox: worldSpec.scene.skybox,
      gravity: worldSpec.world?.gravity || [0, -9.8, 0]
    }
  });

  // 2. LOAD_ASSETS 
  const assetSet = new Set();

  worldSpec.entities.forEach(entity => {
    if (entity.components?.mesh) {
      assetSet.add(entity.components.mesh);
    }
    if (entity.material?.texture) {
      assetSet.add(entity.material.texture);
    }
  });

  jobs.push({
    jobId: randomUUID(),
    jobType: "LOAD_ASSETS",
    payload: {
      assets: Array.from(assetSet).sort()
    }
  });

  // 3. SPAWN_ENTITY 
  worldSpec.entities.forEach(entity => {
    jobs.push({
      jobId: randomUUID(),
      jobType: "SPAWN_ENTITY",
      payload: {
        id: entity.id,
        type: entity.type,
        transform: entity.transform,
        material: entity.material,
        components: entity.components
      }
    });
  });

  // 4. START_LOOP (if game params provided)
  if (gameParams) {
    jobs.push({
      jobId: randomUUID(),
      jobType: "START_LOOP",
      payload: gameParams
    });
  }

  console.log(
    "[ENGINE JOBS GENERATED]",
    jobs.map(j => `${j.jobType}:${j.jobId}`)
  );

  return jobs;
}

function createEndGameJob(reason, finalScore, duration) {
  return {
    jobId: randomUUID(),
    jobType: "END_GAME",
    payload: {
      reason: reason || "manual_stop",
      final_score: finalScore || 0,
      duration: duration || 0
    }
  };
}

module.exports = { buildEngineJobs, createEndGameJob };
