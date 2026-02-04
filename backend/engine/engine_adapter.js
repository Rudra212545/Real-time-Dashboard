const { buildEngineJobs } = require("./engine_job_queue");

function convertLLMToEngineSchema(llmData) {
  const worldId = `world_${llmData.metadata.level_name
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "")}`;

  const sceneId = `scene_${llmData.environment.type}`;

  const entities = [
    createPlayerEntity(),
    ...convertNPCsToEntities(llmData.npcs)
  ];

  const worldSpec = {
    schema_version: "1.0",

    world: {
      id: worldId,
      name: llmData.metadata.level_name,
      gravity: [0, -9.8, 0]
    },

    scene: {
      id: sceneId,
      ambientLight: parseLighting(llmData.environment.lighting),
      skybox: `${llmData.environment.type}_sky`
    },

    entities,

    quests: Array.isArray(llmData.quests)
      ? convertQuests(llmData.quests)
      : []
  };

  // 🔒 REQUIRED BY FROZEN SCHEMA
  worldSpec.jobs = buildEngineJobs(worldSpec).map(job => ({
    jobId: job.jobId,
    jobType: job.jobType,
    status: "queued",
    submittedAt: Date.now(),
    payload: job.payload
  }));

  return worldSpec;
}


function createPlayerEntity() {
  try {
    return {
      id: "player_1",
      type: "player",
      transform: {
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1]
      },
      material: {
        shader: "standard",
        texture: "player_default",
        color: [1, 1, 1]
      },
      components: {
        mesh: "player",
        collider: "box",
        script: "player_controller"
      }
    };
  } catch (err) {
    console.error("[ADAPTER] Failed to create player entity:", err.message);
    throw new Error("Failed to create player entity");
  }
}

function convertCubeToEngineSchema(cubeConfig) {
  const rgb = hexToRgb(cubeConfig.color);
  const size = cubeConfig.size || 1;

  const worldSpec = {
    schema_version: "1.0",

    world: {
      id: "world_cube_demo",
      name: "Cube Demo",
      gravity: [0, -9.8, 0]
    },

    scene: {
      id: "scene_cube",
      ambientLight: [1, 1, 1],
      skybox: "default"
    },

    entities: [{
      id: "cube_01",
      type: "object",
      transform: {
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [size, size, size]
      },
      material: {
        shader: "standard",
        texture: "none",
        color: rgb
      },
      components: {
        mesh: "cube",
        collider: "box",
        script: ""
      }
    }],

    quests: []
  };

  worldSpec.jobs = buildEngineJobs(worldSpec).map(job => ({
    jobId: job.jobId,
    jobType: job.jobType,
    status: "queued",
    submittedAt: Date.now(),
    payload: job.payload
  }));

  return worldSpec;
}


function convertToEngineSchema(input) {
  if (!input || typeof input !== 'object') {
    throw new Error("Invalid input: expected object");
  }

  if (input.schema_version === "1.0") {
    if (!Array.isArray(input.jobs)) {
      const jobs = buildEngineJobs(input).map(job => ({
        jobId: job.jobId,
        jobType: job.jobType,
        status: "queued",
        submittedAt: Date.now(),
        payload: job.payload
      }));
  
      return { ...input, jobs };
    }
  
    return input;
  }
  
  
  if (input.color && input.size) {
    return convertCubeToEngineSchema(input);
  }
  
  if (input.metadata && input.environment) {
    return convertLLMToEngineSchema(input);
  }

  throw new Error("Unknown input format");
}

function convertNPCsToEntities(npcs) {
  if (!Array.isArray(npcs)) {
    console.warn("[ADAPTER] NPCs is not an array, returning empty array");
    return [];
  }

  return npcs.map((npc, idx) => {
    if (!npc || typeof npc !== 'object') {
      console.warn(`[ADAPTER] Invalid NPC at index ${idx}, skipping`);
      return null;
    }

    const position = parsePosition(npc.location);
    
    return {
      id: npc.id || `npc_${idx + 1}`,
      type: "npc",
      transform: {
        position: position,
        rotation: [0, 0, 0],
        scale: [1, 1, 1]
      },
      material: {
        shader: "standard",
        texture: npc.role || "default",
        color: [1, 1, 1]
      },
      components: {
        mesh: npc.role || "humanoid",
        collider: "box",
        script: npc.behavior || ""
      }
    };
  }).filter(Boolean);
}

function convertQuests(quests) {
  return quests.map(q => ({
    id: q.id,
    triggerEntity: extractTriggerEntity(q),
    goal: q.objective || q.goal || "complete"
  }));
}

const LIGHTING_MAP = new Map([
  ["harsh_sunlight", [1, 0.95, 0.8]],
  ["filtered_sunlight", [0.8, 0.9, 0.7]],
  ["dappled_sunlight", [0.9, 0.95, 0.8]],
  ["filtered_moonlight", [0.3, 0.3, 0.4]],
  ["torch_light", [1, 0.7, 0.4]],
  ["ambient_glow", [0.6, 0.6, 0.8]],
  ["dim_flickering", [0.3, 0.3, 0.4]],
  ["starlight", [0.2, 0.2, 0.3]],
  ["artificial_lighting", [0.9, 0.9, 1]],
  ["dynamic_lighting", [0.8, 0.8, 0.8]]
]);

function parseLighting(lighting) {
  return LIGHTING_MAP.get(lighting) || [1, 1, 1];
}

function parsePosition(location) {
  const posMap = {
    "village_center": [0, 0, 0],
    "dark_forest": [10, 0, 5],
    "forest": [5, 0, 3],
    "temple": [0, 0, 10],
    "cave": [-5, 0, 8],
    "desert": [15, 0, 0],
    "mountain": [0, 5, 10],
    "mysterious_location": [0, 0, 5]
  };
  return posMap[location] || [0, 0, 0];
}

function extractTriggerEntity(quest) {
  if (!quest || typeof quest !== 'object') {
    console.warn("[ADAPTER] Invalid quest object, defaulting to player_1");
    return "player_1";
  }

  if (quest.requirements && Array.isArray(quest.requirements) && quest.requirements.length > 0) {
    const req = quest.requirements[0];
    if (typeof req === 'string' && (req.includes("npc") || req.includes("entity"))) {
      return req;
    }
  }
  return "player_1";
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255
  ] : [1, 1, 1];
}

/**
 * Prepare job for engine dispatch
 * Converts internal job format to engine-compatible format
 * 
 * @param {Object} internalJob - Job from jobQueue
 * @param {Object} worldSpec - Complete world specification
 * @returns {Object} Engine-compatible job object
 */
function prepareEngineJob(internalJob, worldSpec) {
  // Security: Validate inputs to prevent unauthorized execution
  if (!internalJob || typeof internalJob !== 'object') {
    throw new Error("Invalid job: must be object");
  }
  
  if (!internalJob.jobId || typeof internalJob.jobId !== 'string') {
    throw new Error("Invalid job: missing or invalid jobId");
  }

  if (!internalJob.jobType || typeof internalJob.jobType !== 'string') {
    throw new Error("Invalid job: missing or invalid jobType");
  }

  if (!worldSpec || typeof worldSpec !== 'object') {
    throw new Error("Invalid job: missing or invalid worldSpec");
  }

  // Validate jobType is from allowed list
  const ALLOWED_JOB_TYPES = ['BUILD_SCENE', 'SPAWN_ENTITY', 'LOAD_ASSETS'];
  if (!ALLOWED_JOB_TYPES.includes(internalJob.jobType)) {
    throw new Error(`Invalid job: unauthorized jobType '${internalJob.jobType}'`);
  }

  // Remove jobs array from world_spec (internal tracking only)
  const cleanWorldSpec = {
    schema_version: worldSpec.schema_version,
    world: worldSpec.world,
    scene: worldSpec.scene,
    entities: worldSpec.entities,
    quests: worldSpec.quests
  };

  // Build engine job
  const engineJob = {
    job_id: internalJob.jobId,
    job_type: internalJob.jobType,
    world_spec: cleanWorldSpec,
    payload: internalJob.payload || {},
    execution_params: {
      priority: "normal",
      timeout_ms: 300000  // 5 minutes
    },
    submitted_at: internalJob.submittedAt || Date.now(),
    user_id: internalJob.userId || "unknown"
  };

  return engineJob;
}

module.exports = {
  convertToEngineSchema,
  convertLLMToEngineSchema,
  convertCubeToEngineSchema,
  prepareEngineJob
};
