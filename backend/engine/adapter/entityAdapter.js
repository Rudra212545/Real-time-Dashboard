 function createEntity({
    id,
    type = "object",
    position = [0, 0, 0],
    rotation = [0, 0, 0],
    scale = [1, 1, 1],
  
    mesh = "cube",
  
    shader = "basic",
    texture = "none",
    color = [1, 1, 1],
  
    collider = "box",
    script = ""
  }) {
    return {
      id,
      type,
  
      transform: {
        position,
        rotation,
        scale
      },
  
      material: {
        shader,
        texture,
        color
      },
  
      components: {
        mesh,
        collider,
        script
      }
    };
  }
  
  module.exports = { createEntity };