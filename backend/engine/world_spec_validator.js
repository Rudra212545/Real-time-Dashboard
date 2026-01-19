function isVec3(v) {
    return Array.isArray(v) &&
      v.length === 3 &&
      v.every(n => typeof n === "number");
  }
  
  function validateWorldSpec(spec) {
    //  WORLD 
    if (!spec.world) throw new Error("Missing world");
    if (typeof spec.world.id !== "string") throw new Error("world.id invalid");
    if (typeof spec.world.name !== "string") throw new Error("world.name invalid");
    if (!isVec3(spec.world.gravity)) throw new Error("world.gravity invalid");
  
    //  SCENE 
    if (!spec.scene) throw new Error("Missing scene");
    if (typeof spec.scene.id !== "string") throw new Error("scene.id invalid");
    if (!isVec3(spec.scene.ambientLight)) throw new Error("scene.ambientLight invalid");
    if (typeof spec.scene.skybox !== "string") throw new Error("scene.skybox invalid");
  
    //  ENTITIES 
    if (!Array.isArray(spec.entities)) throw new Error("entities must be array");
  
    for (const e of spec.entities) {
      if (typeof e.id !== "string") throw new Error("entity.id invalid");
      if (!["player", "npc", "object"].includes(e.type))
        throw new Error(`entity.type invalid: ${e.id}`);
  
      if (!e.transform) throw new Error(`entity.transform missing: ${e.id}`);
      if (!isVec3(e.transform.position)) throw new Error(`position invalid: ${e.id}`);
      if (!isVec3(e.transform.rotation)) throw new Error(`rotation invalid: ${e.id}`);
      if (!isVec3(e.transform.scale)) throw new Error(`scale invalid: ${e.id}`);
  
      if (!e.material) throw new Error(`material missing: ${e.id}`);
      if (typeof e.material.shader !== "string") throw new Error(`shader invalid: ${e.id}`);
      if (typeof e.material.texture !== "string") throw new Error(`texture invalid: ${e.id}`);
      if (!isVec3(e.material.color)) throw new Error(`color invalid: ${e.id}`);
  
      if (!e.components) throw new Error(`components missing: ${e.id}`);
      if (typeof e.components.mesh !== "string") throw new Error(`mesh invalid: ${e.id}`);
      if (!["box", "sphere", "none"].includes(e.components.collider))
        throw new Error(`collider invalid: ${e.id}`);
    }
  
    //  QUESTS 
    if (!Array.isArray(spec.quests)) throw new Error("quests must be array");
  
    for (const q of spec.quests) {
      if (typeof q.id !== "string") throw new Error("quest.id invalid");
      if (typeof q.goal !== "string") throw new Error("quest.goal invalid");
      if (typeof q.triggerEntity !== "string")
        throw new Error("quest.triggerEntity invalid");
    }
  
    return true;
  }
  
  module.exports = { validateWorldSpec };
  