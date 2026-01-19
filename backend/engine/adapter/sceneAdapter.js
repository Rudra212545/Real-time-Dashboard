function createScene({ id, skybox = "default" }) {
    return {
      id,
      ambientLight: [1, 1, 1],
      skybox
    };
  }


module.exports = { createScene };