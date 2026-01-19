const { createWorld } = require("./adapter/worldAdapter.js");
const { createScene } = require("./adapter/sceneAdapter.js");
const { createEntity } = require("./adapter/entityAdapter.js");

//  DAY 1 SMOKE TEST 

// World
const world = createWorld({
  id: "world_001",
  name: "TestWorld"
});

// Scene
const scene = createScene({
  id: "scene_001",
  skybox: "default_sky"
});

// Entity (Cube replacement)
const entity = createEntity({
  id: "entity_001",
  mesh: "cube"
});

// Final Engine Payload
const enginePayload = {
  world,
  scene,
  entities: [entity],
  quests: []
};

// Output
console.log("DAY 1 ENGINE ADAPTER OUTPUT:");
console.log(JSON.stringify(enginePayload, null, 2));
