var App42Connection = require("./app42Connection")
var App42 = require("./app42")
var App42Log = require("./app42Log")
var App42Service = require("./app42Service")
App42Service = new App42Service();
var App42Util = require("./app42Util")

module.exports = {
	runJavaCode : function (customCodeName, jsonBody, callback) {
		var requestURL = App42.CustomCodeURL("run/java/"+customCodeName);
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		App42Log.debug("JSON Body is : " +  JSON.stringify(jsonBody))
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executePost(requestURL, queryParams,headerParams,JSON.stringify(jsonBody),callback);
	}
}
