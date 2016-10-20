var NODEJS = typeof module !== 'undefined' && module.exports;

if (NODEJS) global.schemapack = require('schemapack');

var ZOR = ZOR || {};

ZOR.Schemas = function ZORSchemas() {
    var vector3 = {x: "float32", y: "float32", z: "float32"};
    var actor = {
        id: "varuint",
        position: vector3,
        velocity: vector3,
        scale: "float32",
        drain_target_id: "varuint",
        speed_boosting: "boolean",
        type: "string",
        color: "uint8",
        skin: "string",
        playerId: "varuint"
    };

    var tiny_actor = {
        id: "varuint",
        position: vector3,
        velocity: vector3,
        scale: "float32",
        drain_target_id: "varuint",
        speed_boosting: "boolean",
    };

    var player = {
        id: "varuint",
        name: "string",
        type: "string",
        sphere: actor,
    };

    var model = {
        actors: [actor],
        players: [player],
        worldSize: {x: "uint16", y: "uint16", z: "uint16"},
        food: ["int16"],
        foodCount: "uint32",
        foodDensity: "uint8",
        food_respawning: ["varuint"],
        food_respawn_ready_queue: ["varuint"],
        food_respawning_indexes: ["varuint"]
    };

    var leader = {
        player_id: "varuint",
        score: "varuint",
    };

    var tick_slow_data =  {
        fr: ["varuint"],
        fc: ["varuint"],
        sm: "string",
        leaders: [leader],
    };

    var recent_position = {
        position: vector3,
        radius: "float32",
        time: "varuint",
    };

    var food_capture_entry = {
        fi: "varuint",
        radius: "float32",
    };

    var op_init_game = {
        0: "uint8",
        NB_SRVID: "string",
        model: model,
    };

    var op_welcome = {
        0: "uint8",
        player: player,
    };

    var op_actor_updates = {
        0: "uint8",
        actors: [tiny_actor],
    };

    var op_player_update = {
        0: "uint8",
        player_id: "varuint",
        sphere_id: "varuint",
        pp_gap: "varuint",
        au_gap: "varuint",
        buffered_mount: "varuint",
        latest_position: recent_position,
        prev_position_1: recent_position,
        prev_position_2: recent_position,
        prev_position_3: recent_position,
        oldest_position: recent_position,
        food_capture_queue: [food_capture_entry],
    };

    var op_you_died = {
        0: "uint8",
        attacking_player_id: "varuint",
        food_captures: "varuint",
        player_captures: "varuint",
        drain_ammount: "varuint",
        time_alive: "varuint",
        score: "varuint",
    };

    var op_tick_slow = {
        0: "uint8",
        tick_data: tick_slow_data,
    };

    var ops = {
        INIT_GAME: 1,
        ACTOR_UPDATES: 2,
        PLAYER_UPDATE: 3,
        TICK_SLOW: 4,
        YOU_DIED: 5,
        WELCOME: 6,
        CLIENT_POSITION_RAPID: 7,
    };

    return {
        ops: ops,
        initGameSchema: schemapack.build(op_init_game),
        actorUpdatesSchema: schemapack.build(op_actor_updates),
        playerUdateSchema: schemapack.build(op_player_update),
        tickSlowSchema: schemapack.build(op_tick_slow),
        youDied: schemapack.build(op_you_died),
        welcomeSchema: schemapack.build(op_welcome),
    }
}();

if (NODEJS) module.exports = ZOR.Schemas;
