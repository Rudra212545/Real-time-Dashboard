export const SAMPLE_WORLDS = {
  forest: {
    "schema_version": "1.0",
    "world": {
      "id": "world_forest_01",
      "name": "Dark Forest",
      "gravity": [0, -9.8, 0]
    },
    "scene": {
      "id": "forest_scene",
      "ambientLight": [0.4, 0.6, 0.4],
      "skybox": "forest_sky"
    },
    "entities": [
      {
        "id": "player_1",
        "type": "player",
        "transform": {
          "position": [0, 0, 0],
          "rotation": [0, 0, 0],
          "scale": [1, 1, 1]
        },
        "material": {
          "shader": "standard",
          "texture": "player_armor",
          "color": [1, 1, 1]
        },
        "components": {
          "mesh": "player",
          "collider": "box",
          "script": "player_controller"
        }
      },
      {
        "id": "wolf_1",
        "type": "npc",
        "transform": {
          "position": [5, 0, -3],
          "rotation": [0, 0, 0],
          "scale": [1, 1, 1]
        },
        "material": {
          "shader": "standard",
          "texture": "wolf_fur",
          "color": [1, 1, 1]
        },
        "components": {
          "mesh": "wolf",
          "collider": "box",
          "script": "hostile_ai"
        }
      }
    ],
    "quests": [
      {
        "id": "quest_defeat_wolf",
        "triggerEntity": "wolf_1",
        "goal": "defeat"
      }
    ]
  },
  desert: {
    "schema_version": "1.0",
    "world": {
      "id": "world_desert_01",
      "name": "Scorching Desert",
      "gravity": [0, -9.8, 0]
    },
    "scene": {
      "id": "desert_scene",
      "ambientLight": [1.0, 0.9, 0.7],
      "skybox": "desert_sky"
    },
    "entities": [
      {
        "id": "player_1",
        "type": "player",
        "transform": {
          "position": [0, 0, 0],
          "rotation": [0, 0, 0],
          "scale": [1, 1, 1]
        },
        "material": {
          "shader": "standard",
          "texture": "player_desert",
          "color": [1, 1, 1]
        },
        "components": {
          "mesh": "player",
          "collider": "box",
          "script": "player_controller"
        }
      },
      {
        "id": "scorpion_1",
        "type": "npc",
        "transform": {
          "position": [8, 0, 2],
          "rotation": [0, 90, 0],
          "scale": [1.2, 1.2, 1.2]
        },
        "material": {
          "shader": "standard",
          "texture": "scorpion_shell",
          "color": [1, 1, 1]
        },
        "components": {
          "mesh": "scorpion",
          "collider": "box",
          "script": "hostile_ai"
        }
      }
    ],
    "quests": [
      {
        "id": "quest_survive_desert",
        "triggerEntity": "scorpion_1",
        "goal": "defeat"
      }
    ]
  },
  ocean: {
    "schema_version": "1.0",
    "world": {
      "id": "world_ocean_01",
      "name": "Deep Ocean",
      "gravity": [0, -4.5, 0]
    },
    "scene": {
      "id": "ocean_scene",
      "ambientLight": [0.3, 0.5, 0.8],
      "skybox": "ocean_sky"
    },
    "entities": [
      {
        "id": "player_1",
        "type": "player",
        "transform": {
          "position": [0, -5, 0],
          "rotation": [0, 0, 0],
          "scale": [1, 1, 1]
        },
        "material": {
          "shader": "standard",
          "texture": "player_diver",
          "color": [1, 1, 1]
        },
        "components": {
          "mesh": "player",
          "collider": "box",
          "script": "player_controller"
        }
      },
      {
        "id": "shark_1",
        "type": "npc",
        "transform": {
          "position": [10, -8, 5],
          "rotation": [0, 180, 0],
          "scale": [2, 2, 2]
        },
        "material": {
          "shader": "standard",
          "texture": "shark_skin",
          "color": [1, 1, 1]
        },
        "components": {
          "mesh": "shark",
          "collider": "box",
          "script": "hostile_ai"
        }
      }
    ],
    "quests": [
      {
        "id": "quest_ocean_explorer",
        "triggerEntity": "shark_1",
        "goal": "defeat"
      }
    ]
  },
  volcano: {
    "schema_version": "1.0",
    "world": {
      "id": "world_volcano_01",
      "name": "Volcanic Crater",
      "gravity": [0, -9.8, 0]
    },
    "scene": {
      "id": "volcano_scene",
      "ambientLight": [1.0, 0.3, 0.2],
      "skybox": "volcano_sky"
    },
    "entities": [
      {
        "id": "player_1",
        "type": "player",
        "transform": {
          "position": [0, 2, 0],
          "rotation": [0, 0, 0],
          "scale": [1, 1, 1]
        },
        "material": {
          "shader": "standard",
          "texture": "player_fire_armor",
          "color": [1, 1, 1]
        },
        "components": {
          "mesh": "player",
          "collider": "box",
          "script": "player_controller"
        }
      },
      {
        "id": "fire_elemental_1",
        "type": "npc",
        "transform": {
          "position": [-6, 1, -4],
          "rotation": [0, 45, 0],
          "scale": [1.5, 1.5, 1.5]
        },
        "material": {
          "shader": "emissive",
          "texture": "fire_elemental",
          "color": [1, 0.5, 0]
        },
        "components": {
          "mesh": "elemental",
          "collider": "sphere",
          "script": "hostile_ai"
        }
      }
    ],
    "quests": [
      {
        "id": "quest_volcano_challenge",
        "triggerEntity": "fire_elemental_1",
        "goal": "defeat"
      }
    ]
  }
};
