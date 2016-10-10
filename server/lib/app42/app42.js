


module.exports = {
    initialize : function (_apiKey, _secretKey) {
    this.apiKey = _apiKey;
		this.secretKey = _secretKey;
		this.hostName = "api.shephertz.com"
		this.port
		this.protocol = ""
		this.baseURL = "/cloud/1.0/"
		this.version = "1.0"
  	},
  	setDbName : function (_dbName) {
       this.dbName = _dbName;
    },
	getDbName : function () {
        return this.dbName;
    },
	setLoggedInUser : function (_loggedInUser) {
       this.loggedInUser = _loggedInUser;
    },
    getLoggedInUser : function () {
        return this.loggedInUser;
    },
    setBaseURL : function (protocol,hostName,port) {
        this.baseURL = "/App42_API_SERVER/cloud/1.0/";
		this.protocol = protocol
		this.hostName = hostName
		this.port = port
    },
    setCustomeCodeURL : function(u) {
        this.customeCodeURL = u;
    },
    URL : function(serviceUrl) {
        var baseURL = this.baseURL;
        var url = baseURL + serviceUrl;
        return url;
    },
    CustomCodeURL : function(serviceUrl) {
		this.hostName = "customcode.shephertz.com"
        var baseURL =  "/1.0/";
        var url = baseURL + encodeURIComponent(serviceUrl);
        return url;
    },
    buildUserService : function() {
        var userService = require("./app42User")
		var App42Service = require("./app42Service");
		App42Service.call(userService)
		return userService;
    },
    buildEmailService : function() {
        var emailService = require("./app42Email");
		var App42Service = require("./app42Service");
		App42Service.add(emailService)
        return emailService;
    },
    buildStorageService : function() {
        var storageService = require("./app42Storage");
		var App42Service = require("./app42Service");
		App42Service.add(storageService)
        return storageService;
    },
    buildBuddyService : function() {
        var buddyService = require("./app42Buddy");
		var App42Service = require("./app42Service");
		App42Service.add(buddyService)
        return buddyService;
    },
    buildPushService : function() {
        var pushService = require("./app42Push");
		var App42Service = require("./app42Service");
		App42Service.add(pushService)
        return pushService;
    },
    buildCustomCodeService : function() {
        var customCodeService = require("./app42CustomCode");
		var App42Service = require("./app42Service");
		App42Service.add(customCodeService)
        return customCodeService;
    }    
}
