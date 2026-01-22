// Engine Job Builder 

const { randomUUID } = require("crypto");

function buildEngineJobs(worldSpec) {
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
      skybox: worldSpec.scene.skybox
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

  console.log(
    "[ENGINE JOBS GENERATED]",
    jobs.map(j => `${j.jobType}:${j.jobId}`)
  );

  return jobs;
}

module.exports = { buildEngineJobs };
