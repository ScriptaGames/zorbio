let config = require('../common/config.js');
let exec   = require('child_process').exec;
let util   = require('util');

// Current implmentating service: App42
let App42 = require('./lib/app42/node_sdk/app42.js');

/**
 * Genetic interface for backend services such as document store, and social auth.
 * Abstraction of implementing service, so implmentation can be switched out if needed.
 * @constructor
 */
let Backend = function() {
    if (!config.ENABLE_BACKEND_SERVICE) return;

    //  Scope
    let self = this;

    App42.initialize(process.env.APP42_API_KEY, process.env.APP42_API_SECRET);

    self.storageService = App42.buildStorageService();
};

Backend.prototype.storageOpCallback = function BackendStorageOpCallback(object) {
    try {
        let result_JSON = JSON.parse(object);
        if (result_JSON.app42) {
            // noop
        }
        else {
            console.error('Error storing json data in App42');
            console.error('Error Message is: ', result_JSON.app42Fault.message);
            console.error('Error Detail is: ', result_JSON.app42Fault.details);
            console.error('Error Code is: ', result_JSON.app42Fault.appErrorCode);
        }
    }
    catch (e) {
        console.error("Error parsing return object from app42's saveOrUpdateDocumentByKeyValue, value is: ", object);
    }
};

Backend.prototype.saveGameInstanceStatus = function BackendSaveGameInstanceStatus(uuid, status) {
    if (!config.ENABLE_BACKEND_SERVICE) return;

    // Implementing function
    this.storageService.saveOrUpdateDocumentByKeyValue('zorbio', 'game_instances', 'uuid', uuid, status, this.storageOpCallback);
};

Backend.prototype.saveScore = function BackendSaveScore(gameName, userName, score, successCallback) {
    if (!config.ENABLE_BACKEND_SERVICE) return;

    let result = '';
    let jsonResponse;

    // Build the command
    let command = util.format('server/lib/app42/leaderboard %s %s save %s "%s" %s',
        process.env.APP42_API_KEY, process.env.APP42_API_SECRET, gameName, userName, score);

    let child = exec(command);  // Execute command

    child.stdout.on('data', function(data) {
        result += data;
    });
    child.stderr.on('data', function(data) {
        result += data;
    });
    child.on('close', function() {
        try {
            jsonResponse = JSON.parse(result);
            if (jsonResponse && jsonResponse.app42.response.success === true) {
                console.log('Successfully saved score: ', gameName, userName, score);

                if (typeof successCallback === 'function') {
                    successCallback(jsonResponse);
                }
            }
        }
        catch (e) {
            console.error('Caught exception parsing json response from Backend.saveScore service: ');
            console.error(result);
            console.error(e);
        }
    });
};

/**
 * Get the list of top players by start and end date.  Dates are in string format following this:
 * http://php.net/manual/en/function.strtotime.php  e.g. "-7 days" or "now"
 * @param {string} gameName
 * @param {number} limit
 * @param {string} startDate
 * @param {string} endDate
 * @param {Function} callback
 */
Backend.prototype.getLeadersByDate = function BackendgetLeadersByDate(gameName, limit, startDate, endDate, callback) {
    if (!config.ENABLE_BACKEND_SERVICE) return;

    let result = '';
    let jsonResponse;

    // Build the command
    let command = util.format('server/lib/app42/leaderboard %s %s get_leaders %s %s "%s" "%s"',
        process.env.APP42_API_KEY, process.env.APP42_API_SECRET, gameName, limit, startDate, endDate);

    let child = exec(command);  // Execute command

    child.stdout.on('data', function(data) {
        result += data;
    });
    child.stderr.on('data', function(data) {
        result += data;
    });
    child.on('close', function() {
        try {
            jsonResponse = JSON.parse(result);
            if (jsonResponse && jsonResponse.app42.response.success === true) {
                let leaders = jsonResponse.app42.response.games.game.scores.score;
                let filteredLeaders = [];

                if (Array.isArray(leaders)) {
                    // Filter out the meta data like date and score id, all we want is the name and the score
                    leaders.forEach(function eachLeader(leader) {
                        let filteredLeader = {
                            name : leader.userName,
                            score: leader.value,
                        };
                        filteredLeaders.push(filteredLeader);
                    });
                }
                else if (leaders && leaders.userName && leaders.value) {
                    // Handle 1 score for range
                    filteredLeaders.push({
                        name : leaders.userName,
                        score: leaders.value,
                    });
                }

                callback(filteredLeaders, true);
            }
        }
        catch (e) {
            console.error('Caught exception parsing json response from Backend.getLeadersByDate service: ');
            console.error(result);
            console.error(e);
            callback([], false); // If there was an error just return empty array
        }
    });
};

module.exports = Backend;
