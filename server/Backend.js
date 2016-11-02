var NODEJS = typeof module !== 'undefined' && module.exports;

var config = require('../common/config.js');
var exec   = require('child_process').exec;
var util   = require('util');

// Current implmentating service: App42
var App42 = require("./lib/app42/node_sdk/app42.js");

/**
 * Genetic interface for backend services such as document store, and social auth.
 * Abstraction of implementing service, so implmentation can be switched out if needed.
 * @constructor
 */
var Backend = function () {
    if (!config.ENABLE_BACKEND_SERVICE) return;

    //  Scope
    var self = this;

    App42.initialize(process.env.APP42_API_KEY, process.env.APP42_API_SECRET);

    self.storageService = App42.buildStorageService();
};

Backend.prototype.storageOpCallback = function BackendStorageOpCallback(object) {
    var result_JSON = JSON.parse(object);
    if (result_JSON.app42) {
        // noop
    }
    else {
        console.error("Error storing json data in App42");
        console.error("Error Message is: ", result_JSON.app42Fault.message);
        console.error("Error Detail is: ", result_JSON.app42Fault.details);
        console.error("Error Code is: ", result_JSON.app42Fault.appErrorCode);
    }
};

Backend.prototype.saveGameInstanceStatus = function BackendSaveGameInstanceStatus(uuid, status) {
    if (!config.ENABLE_BACKEND_SERVICE) return;

    // Implementing function
    this.storageService.saveOrUpdateDocumentByKeyValue('zorbio', 'game_instances', 'uuid', uuid, status, this.storageOpCallback);
};

Backend.prototype.saveScore = function BackendSaveScore(gameName, userName, score, successCallback) {
    if (!config.ENABLE_BACKEND_SERVICE) return;

    var result = '';
    var jsonResponse;

    // Build the command
    var command = util.format('server/lib/app42/leaderboard %s %s save %s "%s" %s',
        process.env.APP42_API_KEY, process.env.APP42_API_SECRET, gameName, userName, score);

    var child = exec(command);  // Execute command

    child.stdout.on('data', function (data) {
        result += data;
    });
    child.stderr.on('data', function (data) {
        result += data;
    });
    child.on('close', function () {
        try {
            jsonResponse = JSON.parse(result);
            if (jsonResponse && jsonResponse.app42.response.success === true) {
                console.log("Successfully saved score: ", gameName, userName, score);

                if (typeof successCallback === 'function') {
                    successCallback(jsonResponse);
                }
            }
        } catch (e) {
            console.error('Caught exception parsing json response from leaderboard service: ');
            console.error(result);
            console.error(e);
        }
    });
};

/**
 * Get the list of top players by start and end date.  Dates are in string format following this:
 * http://php.net/manual/en/function.strtotime.php  e.g. "-7 days" or "now"
 * @param gameName
 * @param limit
 * @param startDate
 * @param endDate
 * @param successCallback
 */
Backend.prototype.getLeadersByDate = function BackendgetLeadersByDate(gameName, limit, startDate, endDate, successCallback) {
    if (!config.ENABLE_BACKEND_SERVICE) return;

    var result = '';
    var jsonResponse;

    // Build the command
    var command = util.format('server/lib/app42/leaderboard %s %s get_leaders %s %s "%s" "%s"',
        process.env.APP42_API_KEY, process.env.APP42_API_SECRET, gameName, limit, startDate, endDate);

    var child = exec(command);  // Execute command

    child.stdout.on('data', function (data) {
        result += data;
    });
    child.stderr.on('data', function (data) {
        result += data;
    });
    child.on('close', function () {
        try {
            jsonResponse = JSON.parse(result);
            if (jsonResponse && jsonResponse.app42.response.success === true) {
                var leaders = jsonResponse.app42.response.games.game.scores.score;
                var filteredLeaders = [];

                // Filter out the meta data like date and score id, all we want is the name and the score
                leaders.forEach(function eachLeader(leader) {
                    var filteredLeader = {
                        name: leader.userName,
                        score: leader.value,
                    };
                    filteredLeaders.push(filteredLeader);
                });

                successCallback(filteredLeaders);
            }
        } catch (e) {
            console.error('Caught exception parsing json response from leaderboard service: ');
            console.error(result);
            console.error(e);
        }
    });
};

if (NODEJS) module.exports = Backend;
