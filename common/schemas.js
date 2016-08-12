var NODEJS = typeof module !== 'undefined' && module.exports;

if (NODEJS) var schemapack = require('schemapack');

var ZOR = ZOR || {};

ZOR.Schemas = function ZORSchemas() {
    var vector3 = {x: "float32", y: "float32", z: "float32"};
    var actor = {
        id: "uint32",
        position: vector3,
        velocity: vector3,
        scale: "uint16",
        type: "string",
        color: "uint8",
        drain_target_id: "uint32",
        speed_boosting: "boolean",
        playerId: "uint32"
    };

    var model = {
        actors: [actor],
        players: [
            {
                id: "uint32",
                name: "string",
                type: "string",
                sphere: actor,
            }
        ],
        worldSize: {x: "uint16", y: "uint16", z: "uint16"},
        food: ["int16"],
        foodCount: "uint32",
        foodDensity: "uint8",
        food_respawning: ["uint32"],
        food_respawn_ready_queue: ["uint32"],
        food_respawning_indexes: ["uint32"]
    };

    return {
        model: model,
        actor: actor,
    }
}();

if (NODEJS) module.exports = ZOR.Schemas;
