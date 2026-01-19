function createWorld({ id, name }) {
    return {
      id,
      name,
      gravity: [0, -9.8, 0]
    };

  }

module.exports = {createWorld};