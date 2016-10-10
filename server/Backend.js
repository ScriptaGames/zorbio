var NODEJS = typeof module !== 'undefined' && module.exports;

var config = require('../common/config.js');

// Current implmentating service: App42
var App42 = require("./lib/app42/app42.js");

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

if (NODEJS) module.exports = Backend;
