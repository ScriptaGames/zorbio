var App42Connection = require("./app42Connection")
var App42 = require("./app42")
var App42Log = require("./app42Log")
var App42Service = require("./app42Service")
App42Service = new App42Service()
var App42Util = require("./app42Util")
var qB = require("./QueryBuilder");

module.exports = {
	storeDeviceToken : function (userName,deviceToken,deviceType,callback) {
		var requestURL = App42.URL("push" + "/storeDeviceToken/" + userName);
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		var jsonBody = {"app42": {"push":{"userName": userName,"deviceToken": deviceToken,"type": deviceType }}}
		signParams.body = JSON.stringify(jsonBody);
		App42Log.debug("JSON Body is : " +  JSON.stringify(jsonBody))
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executePost(requestURL, queryParams,headerParams,JSON.stringify(jsonBody),callback);
	},
	sendPushMessageToUser : function (userName,message,callback) {
		var requestURL = App42.URL("push" + "/sendMessage/" + userName);
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		var jsonBody = {"app42": {"push": {"message":{"userName": userName,"payload": message,"expiry": App42Util.getODataUTCDateFilter()}}}}
		signParams.body = JSON.stringify(jsonBody);
		App42Log.debug("JSON Body is : " +  JSON.stringify(jsonBody))
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executePost(requestURL, queryParams,headerParams,JSON.stringify(jsonBody),callback);
	},
	sendPushMessageToDevice : function (userName,deviceId,message,callback) {
		var requestURL = App42.URL("push" + "/sendMessageToDevice/" + userName);
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		var jsonBody = {"app42": {"push": {"message":{"userName": userName,"deviceId": deviceId,"payload": message,"expiry": App42Util.getODataUTCDateFilter()}}}}
		signParams.body = JSON.stringify(jsonBody);
		App42Log.debug("JSON Body is : " +  JSON.stringify(jsonBody))
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executePost(requestURL, queryParams,headerParams,JSON.stringify(jsonBody),callback);
	},
	sendPushMessageToChannel : function (channel,message,callback) {
		var requestURL = App42.URL("push" + "/sendPushMessageToChannel/" + channel);
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		var jsonBody = {"app42": {"push": {"message":{"channel": channel,"payload": message,"expiry": App42Util.getODataUTCDateFilter()}}}}
		signParams.body = JSON.stringify(jsonBody);
		App42Log.debug("JSON Body is : " +  JSON.stringify(jsonBody))
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executePost(requestURL, queryParams,headerParams,JSON.stringify(jsonBody),callback);
	},
	sendPushMessageToAllByType : function (message,type,callback) {
		var requestURL = App42.URL("push" + "/sendMessageToAllByType");
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		var jsonBody = {"app42": {"push": {"message":{"type": type,"payload": message,"expiry": App42Util.getODataUTCDateFilter()}}}}
		signParams.body = JSON.stringify(jsonBody);
		App42Log.debug("JSON Body is : " +  JSON.stringify(jsonBody))
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executePost(requestURL, queryParams,headerParams,JSON.stringify(jsonBody),callback);
	},
	sendPushMessageToGroup : function (message,userList,callback) {
		var requestURL = App42.URL("push" + "/sendPushMessageToGroup");
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		var stringfy = JSON.stringify(userList)
		var jsonBody = {"app42": {"push": {"message":{"payload": message,"expiry": App42Util.getODataUTCDateFilter(),"users":{"user":stringfy}}}}}
		signParams.body = JSON.stringify(jsonBody);
		App42Log.debug("JSON Body is : " +  JSON.stringify(jsonBody))
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executePost(requestURL, queryParams,headerParams,JSON.stringify(jsonBody),callback);
	},
	sendPushToTargetUsers : function (message,dbName,collectionName,query,callback) {
		var requestURL = App42.URL("push" + "/sendTargetPush/" + dbName + "/" + collectionName);
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		var stringfy = JSON.stringify(userList)
		var jsonBody = {"app42": {"push": {"message":{"payload": message,"expiry": App42Util.getODataUTCDateFilter()}}}}
		signParams.body = JSON.stringify(jsonBody);
		signParams.jsonQuery =  qB.getStr(query);
		queryParams.jsonQuery =  qB.getStr(query);
		App42Log.debug("JSON Body is : " +  JSON.stringify(jsonBody))
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executePost(requestURL, queryParams,headerParams,JSON.stringify(jsonBody),callback);
	},
	sendMessageToInActiveUsers : function (startDate,endDate,message,callback) {
		var requestURL = App42.URL("push" + "/sendMessageToInActiveUsers");
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		var jsonBody = {"app42": {"push": {"message":{"startDate": startDate,"endDate": endDate,"payload": message,"expiry": App42Util.getODataUTCDateFilter()}}}}
		signParams.body = JSON.stringify(jsonBody);
		signParams.jsonQuery =  qB.getStr(query);
		queryParams.jsonQuery =  qB.getStr(query);
		App42Log.debug("JSON Body is : " +  JSON.stringify(jsonBody))
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executePost(requestURL, queryParams,headerParams,JSON.stringify(jsonBody),callback);
	},
	scheduleMessageToUser : function (userName,message,expiryDate,callback) {
		var requestURL = App42.URL("push" + "/sendMessage/" + userName);
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		var jsonBody = {"app42": {"push": {"message":{"userName": userName,"payload": message,"expiry": expiryDate}}}}
		signParams.body = JSON.stringify(jsonBody);
		App42Log.debug("JSON Body is : " +  JSON.stringify(jsonBody))
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executePost(requestURL, queryParams,headerParams,JSON.stringify(jsonBody),callback);
	},
	sendPushMessageToAll : function (message,callback) {
		var requestURL = App42.URL("push" + "/sendPushMessageToAll");
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		var jsonBody = {"app42": {"push": {"message":{"payload": message,"expiry": App42Util.getODataUTCDateFilter()}}}}
		signParams.body = JSON.stringify(jsonBody);
		App42Log.debug("JSON Body is : " +  JSON.stringify(jsonBody))
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executePost(requestURL, queryParams,headerParams,JSON.stringify(jsonBody),callback);
	},
	clearAllBadgeCount : function (userName,deviceToken,callback) {
		var requestURL = App42.URL("push" + "/resetPushBadgeforDevice");
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		var jsonBody = {"app42": {"push": {"userName": userName,"deviceToken": deviceToken,"increment": 0}}}
		signParams.body = JSON.stringify(jsonBody);
		App42Log.debug("JSON Body is : " +  JSON.stringify(jsonBody))
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executePut(requestURL, queryParams,headerParams,JSON.stringify(jsonBody),callback);
	},
	updatePushBadgeforDevice : function (userName,deviceToken,badges,callback) {
		var requestURL = App42.URL("push" + "/resetPushBadgeforDevice");
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		var jsonBody = {"app42": {"push": {"userName": userName,"deviceToken": deviceToken,"increment": badges}}}
		signParams.body = JSON.stringify(jsonBody);
		App42Log.debug("JSON Body is : " +  JSON.stringify(jsonBody))
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executePut(requestURL, queryParams,headerParams,JSON.stringify(jsonBody),callback);
	},
	updatePushBadgeforUser : function (userName,badges,callback) {
		var requestURL = App42.URL("push" + "/resetPushBadgeforUser");
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		var jsonBody = {"app42": {"push": {"userName": userName,"increment": badges}}}
		signParams.body = JSON.stringify(jsonBody);
		App42Log.debug("JSON Body is : " +  JSON.stringify(jsonBody))
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executePut(requestURL, queryParams,headerParams,JSON.stringify(jsonBody),callback);
	},
	createChannelForApp : function (channel,description,callback) {
		var requestURL = App42.URL("push" + "/createAppChannel");
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		var jsonBody = {"app42": {"push": {"channel":{"name": channel,"description": description }}}}
		signParams.body = JSON.stringify(jsonBody);
		App42Log.debug("JSON Body is : " +  JSON.stringify(jsonBody))
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executePost(requestURL, queryParams,headerParams,JSON.stringify(jsonBody),callback);
	},
	subscribeToChannel : function (channel,userName,callback) {
		var requestURL = App42.URL("push" + "/subscribeToChannel/" + userName);
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		var jsonBody = {"push": {"channel":{"name": channel,"userName": userName }}}
		signParams.body = JSON.stringify(jsonBody);
		App42Log.debug("JSON Body is : " +  JSON.stringify(jsonBody))
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executePost(requestURL, queryParams,headerParams,JSON.stringify(jsonBody),callback);
	},
	getChannelUsersCount : function (channelName, callback){
		var requestURL = App42.URL("push" + "/count/channel");
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		signParams.channelName = channelName
		queryParams.channelName = channelName
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executeGet(requestURL, queryParams,headerParams,callback);
	},
	getChannelUsers : function (channelName,max,offset, callback){
		var requestURL = App42.URL("push"+ "/channel" + "/" + max + "/" + offset);
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		signParams.channelName = channelName
		signParams.max = max
		signParams.offset = offset
		queryParams.channelName = channelName
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executeGet(requestURL, queryParams,headerParams,callback);
	},
	getUserSubscribedChannelsCount : function (userName,max,offset,callback){
		var requestURL = App42.URL("push"+ "/userchannels" + "/" + max + "/" + offset);
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		signParams.userName = userName
		signParams.max = max
		signParams.offset = offset
		queryParams.userName = userName
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executeGet(requestURL, queryParams,headerParams,callback);
	},
	getUserSubscribedChannelsCount : function (userName, callback){
		var requestURL = App42.URL("push"+ "/count/userchannels");
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		signParams.userName = userName
		queryParams.userName = userName
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executeGet(requestURL, queryParams,headerParams,callback);
	},
	getAllDevicesOfUser : function (userName, callback){
		var requestURL = App42.URL("push"+ "/getAllDevices/" + userName);
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		signParams.userName = userName
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executeGet(requestURL, queryParams,headerParams,callback);
	},
	registerAndSubscribe : function (userName,channelName,deviceToken,deviceType,callback) {
		var requestURL = App42.URL("push" + "/subscribeDeviceToChannel");
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		var jsonBody = {"app42":{"push":{"channelName":channelName,"userName": userName,"deviceToken":deviceToken,"type": deviceType }}}
		signParams.body = JSON.stringify(jsonBody);
		App42Log.debug("JSON Body is : " +  JSON.stringify(jsonBody))
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executePost(requestURL, queryParams,headerParams,JSON.stringify(jsonBody),callback);
	},
	unsubscribeDeviceToChannel : function (userName,channelName,deviceToken,callback) {
		var requestURL = App42.URL("push" + "/unsubscribeDeviceToChannel");
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		var jsonBody = {"app42":{"push": {"channel":{"channelName":channelName,"userName": userName,"deviceToken":deviceToken }}}}
		signParams.body = JSON.stringify(jsonBody);
		App42Log.debug("JSON Body is : " +  JSON.stringify(jsonBody))
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executePost(requestURL, queryParams,headerParams,JSON.stringify(jsonBody),callback);
	},
	unsubscribeFromChannel : function (channel,userName,callback) {
		var requestURL = App42.URL("push" + "/unsubscribeToChannel/" + userName);
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		var jsonBody = {"push": {"channel":{"name": channel,"userName": userName }}}
		signParams.body = JSON.stringify(jsonBody);
		App42Log.debug("JSON Body is : " +  JSON.stringify(jsonBody))
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executePut(requestURL, queryParams,headerParams,JSON.stringify(jsonBody),callback);
	},
	unsubscribeDevice : function (userName,deviceToken,callback) {
		var requestURL = App42.URL("push" + "/unsubscribeDevice");
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		var jsonBody = {"push": {"deviceToken": deviceToken,"userName": userName }}
		signParams.body = JSON.stringify(jsonBody);
		App42Log.debug("JSON Body is : " +  JSON.stringify(jsonBody))
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executePut(requestURL, queryParams,headerParams,JSON.stringify(jsonBody),callback);
	},
	reSubscribeDevice : function (userName,deviceToken,callback) {
		var requestURL = App42.URL("push" + "/reSubscribeDevice");
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		var jsonBody = {"push":{"deviceToken": deviceToken,"userName": userName }}
		signParams.body = JSON.stringify(jsonBody);
		App42Log.debug("JSON Body is : " +  JSON.stringify(jsonBody))
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executePut(requestURL, queryParams,headerParams,JSON.stringify(jsonBody),callback);
	},
	deleteDeviceToken : function (userName,deviceToken, callback){
		var requestURL = App42.URL("push");
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		signParams.userName = userName
		signParams.deviceToken = deviceToken
		queryParams.userName = userName
		queryParams.deviceToken = deviceToken
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executeDelete(requestURL, queryParams,headerParams,callback);
	},
	deleteAllDevices : function (userName, callback){
		var requestURL = App42.URL("push"+ "/deleteAll");
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		signParams.userName = userName
		queryParams.userName = userName
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executeDelete(requestURL, queryParams,headerParams,callback);
	},
	deleteChannel : function (channelName, callback){
		var requestURL = App42.URL("push" + "/deleteChannel");
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		signParams.channelName = channelName
		queryParams.channelName = channelName
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executeDelete(requestURL, queryParams,headerParams,callback);
	}
}
