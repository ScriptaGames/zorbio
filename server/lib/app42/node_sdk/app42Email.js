var baseURL_email = "/cloud/1.0/email";
var App42Connection = require("./app42Connection")
var App42 = require("./app42")
var App42Log = require("./app42Log")
var App42Service = require("./app42Service")
App42Service = new App42Service();
var App42Util = require("./app42Util")

module.exports = {

		createMailConfiguration : function (emailHost, emailPort, emailId, password, isSSL, callback) {
			var requestURL = App42.URL("email" +"/" + "configuration");
			var queryParams = {};
			var signParams = App42Service.populateSignParams();
			var meteheaderParams = App42Service.populateMetaHeaderParams();
			var headerParams = App42Service._merge(signParams,meteheaderParams)
			var jsonBody = {"app42": {"email":{"host": emailHost,"port": emailPort, "emailId": emailId, "password": password,"ssl": isSSL}}};
			signParams.body = JSON.stringify(jsonBody);
			App42Log.debug("JSON Body is : " +  JSON.stringify(jsonBody))
			var signature = App42Util.signature(App42.secretKey,signParams)
			headerParams.signature = signature
			App42Log.debug("signature is : " + signature)
			App42Connection.executePost(requestURL, queryParams,headerParams,JSON.stringify(jsonBody),callback);
		},

		getEmailConfiguration : function(callback) {
			var requestURL = App42.URL("email"+ "/" + "configuration");
			var queryParams = {};
			var signParams = App42Service.populateSignParams();
			var meteheaderParams = App42Service.populateMetaHeaderParams();
			var headerParams = App42Service._merge(signParams,meteheaderParams)
			var signature = App42Util.signature(App42.secretKey,signParams)
			headerParams.signature = signature
			App42Log.debug("signature is : " + signature)
			App42Connection.executeGet(requestURL, queryParams,headerParams,callback);
		},

		sendEmail : function (sendTo, sendSubject, sendMsg, senderEmailId, emailMineType, callback) {
			var requestURL = App42.URL("email");
			var queryParams = {};
			var signParams = App42Service.populateSignParams();
			var meteheaderParams = App42Service.populateMetaHeaderParams();
			var headerParams = App42Service._merge(signParams,meteheaderParams)
			var jsonBody = {"app42": {"email":{"to": sendTo,"subject": sendSubject,"msg": sendMsg,"emailId": senderEmailId,"mimeType": emailMineType}}};
			signParams.body = JSON.stringify(jsonBody);
			App42Log.debug("JSON Body is : " +  JSON.stringify(jsonBody))
			var signature = App42Util.signature(App42.secretKey,signParams)
			headerParams.signature = signature
			App42Log.debug("signature is : " + signature)
			App42Connection.executePost(requestURL, queryParams,headerParams,JSON.stringify(jsonBody),callback);
		},

		removeEmailConfiguration : function (emailId, callback) {
			var requestURL = App42.URL("email" + "/" + "configuration" + "/" + emailId);
			var queryParams = {};
			var signParams = App42Service.populateSignParams();
			var meteheaderParams = App42Service.populateMetaHeaderParams();
			var headerParams = App42Service._merge(signParams,meteheaderParams)
			signParams.emailId = emailId
			var signature = App42Util.signature(App42.secretKey,signParams)
			headerParams.signature = signature
			App42Log.debug("signature is : " + signature)
			App42Connection.executeDelete(requestURL, queryParams,headerParams,callback);   
		}
}
