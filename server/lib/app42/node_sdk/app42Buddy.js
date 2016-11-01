var App42Connection = require("./app42Connection")
var App42 = require("./app42")
var App42Log = require("./app42Log")
var App42Service = require("./app42Service")
App42Service = new App42Service()
var App42Util = require("./app42Util")

module.exports = {
	sendFriendRequest : function (userName,buddyName,message,callback) {
		var requestURL = App42.URL("buddy");
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		var jsonBody = {"app42": {"buddy":{"userName": userName,"buddyName": buddyName,"message": message }}}
		signParams.body = JSON.stringify(jsonBody);
		App42Log.debug("JSON Body is : " +  JSON.stringify(jsonBody))
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executePost(requestURL, queryParams,headerParams,JSON.stringify(jsonBody),callback);
	},
	acceptFriendRequest : function (userName,buddyName,callback) {
		var requestURL = App42.URL("buddy");
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		var jsonBody = {"app42": {"buddy":{"userName": userName,"buddyName": buddyName }}}
		signParams.body = JSON.stringify(jsonBody);
		App42Log.debug("JSON Body is : " +  JSON.stringify(jsonBody))
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executePut(requestURL, queryParams,headerParams,JSON.stringify(jsonBody),callback);
	},
	blockUser : function (userName,buddyName,callback) {
		var requestURL = App42.URL("buddy" + "/block");
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		var jsonBody = {"app42": {"buddy":{"userName": userName,"buddyName": buddyName }}}
		signParams.body = JSON.stringify(jsonBody);
		App42Log.debug("JSON Body is : " +  JSON.stringify(jsonBody))
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executePost(requestURL, queryParams,headerParams,JSON.stringify(jsonBody),callback);
	},
	unblockUser : function (userName,buddyName,callback) {
		var requestURL = App42.URL("buddy" + "/unblock");
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		var jsonBody = {"app42": {"buddy":{"userName": userName,"buddyName": buddyName }}}
		signParams.body = JSON.stringify(jsonBody);
		App42Log.debug("JSON Body is : " +  JSON.stringify(jsonBody))
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executePut(requestURL, queryParams,headerParams,JSON.stringify(jsonBody),callback);
	},
	getFriendRequest : function (userName,callback) {
		var requestURL = App42.URL("buddy" + "/" + userName);
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
	getAllFriends : function (userName,callback) {
		var requestURL = App42.URL("buddy" + "/friends/" + userName);
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
	createGroupByUser : function (userName,groupName,callback) {
		var requestURL = App42.URL("buddy"+"/group");
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		var jsonBody = {"app42": {"buddy":{"userName": userName,"groupName": groupName }}}
		signParams.body = JSON.stringify(jsonBody);
		App42Log.debug("JSON Body is : " +  JSON.stringify(jsonBody))
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executePost(requestURL, queryParams,headerParams,JSON.stringify(jsonBody),callback);
	},
	addFriendToGroup : function (userName,groupName,friendsList,callback) {
		var requestURL = App42.URL("buddy"+"/group/friends");
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		var stringfy = JSON.stringify(friendsList)
		var jsonBody = {"app42": {"buddy":{"userName": userName,"groupName": groupName,"friends":{"friend": stringfy }}}};
		signParams.body = JSON.stringify(jsonBody);
		App42Log.debug("JSON Body is : " +  JSON.stringify(jsonBody))
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executePost(requestURL, queryParams,headerParams,JSON.stringify(jsonBody),callback);
	},
	sendMessageToFriend : function (userName,buddyName,message,callback) {
		var requestURL = App42.URL("buddy"+ "/friendmessage");
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		var jsonBody = {"app42": {"buddy":{"userName": userName,"buddyName": buddyName,"message": message }}}
		signParams.body = JSON.stringify(jsonBody);
		App42Log.debug("JSON Body is : " +  JSON.stringify(jsonBody))
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executePost(requestURL, queryParams,headerParams,JSON.stringify(jsonBody),callback);
	},
	sendMessageToFriends : function (userName,message,callback) {
		var requestURL = App42.URL("buddy"+ "/messageAll");
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		var jsonBody = {"app42": {"buddy":{"userName": userName,"message": message }}}
		signParams.body = JSON.stringify(jsonBody);
		App42Log.debug("JSON Body is : " +  JSON.stringify(jsonBody))
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executePost(requestURL, queryParams,headerParams,JSON.stringify(jsonBody),callback);
	},
	sendMessageToGroup : function (userName,ownerName, groupName,message,callback) {
		var requestURL = App42.URL("buddy"+ "/groupmessage");
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		var jsonBody = {"app42": {"buddy":{"userName": userName,"ownerName": ownerName,"groupName": groupName,"message": message }}}
		signParams.body = JSON.stringify(jsonBody);
		App42Log.debug("JSON Body is : " +  JSON.stringify(jsonBody))
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executePost(requestURL, queryParams,headerParams,JSON.stringify(jsonBody),callback);
	},
	getBlockedBuddyList : function (userName, callback){
		var requestURL = App42.URL("buddy" + "/blockedList/" + userName);
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
	getAllMessages : function (userName,callback) {
		var requestURL = App42.URL("buddy" + "/message/" + userName);
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
	getAllMessagesFromBuddy : function (userName,buddyName,callback) {
		var requestURL = App42.URL("buddy" + "/buddyMessage/" + userName + "/" + buddyName);
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		signParams.userName = userName
		signParams.buddyName = buddyName
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executeGet(requestURL, queryParams,headerParams,callback);
	},
	getAllMessagesFromGroup : function (userName,ownerName, groupName,callback) {
		var requestURL = App42.URL("buddy"+ "/"	+ userName + "/groupMassaage/" + ownerName + "/"+ groupName);
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		signParams.userName = userName
		signParams.ownerName = ownerName
		signParams.groupName = groupName
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executeGet(requestURL, queryParams,headerParams,callback);
	},
	checkedInGeoLocation : function (userName,geoPointsList,callback) {
		var requestURL = App42.URL("buddy"+"/checkedIn");
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		var arrayInArray ={};
        var lat = geoPointsList.lat;
        var lng = geoPointsList.lng;
        var marker = geoPointsList.marker;
        var array={
            lat:lat,
            lng:lng,
            marker:marker
        };
        var stringfy = JSON.stringify(array)
        var signify = '{"point":' + stringfy + '}'
        var jsonBody = {"app42":{"buddy":{"userName":userName ,"points": signify}}};
		signParams.body = JSON.stringify(jsonBody);
		App42Log.debug("JSON Body is : " +  JSON.stringify(jsonBody))
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executePost(requestURL, queryParams,headerParams,JSON.stringify(jsonBody),callback);
	},
	getFriendsByLocation : function (userName,latitude, longitude, maxDistance, max,callback) {
		var requestURL = App42.URL("buddy" +"/friends/location/" + userName + "/" + maxDistance + "/"+ latitude + "/" + longitude + "/" + max);
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		signParams.userName = userName
		signParams.maxDistance = maxDistance
		signParams.latitude = latitude
		signParams.longitude = longitude
		signParams.max = max
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executeGet(requestURL, queryParams,headerParams,callback);
	},
	getAllGroups : function (userName,callback) {
		var requestURL = App42.URL("buddy" + "/groupall/" + userName);
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
	getAllFriendsInGroup : function (userName,ownerName,groupName,callback) {
		var requestURL = App42.URL("buddy" + "/friends/" + userName + "/group/" + ownerName + "/"+ groupName);
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		signParams.userName = userName
		signParams.ownerName = ownerName
		signParams.groupName = groupName
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executeGet(requestURL, queryParams,headerParams,callback);
	},
	rejectFriendRequest : function (userName,buddyName, callback){
		var requestURL = App42.URL("buddy" + "/userName/" + userName + "/buddyName/" + buddyName);
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		signParams.userName = userName
		signParams.buddyName = buddyName
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executeDelete(requestURL, queryParams,headerParams,callback);
	},
	blockFriendRequest : function (userName,buddyName, callback){
		var requestURL = App42.URL("buddy" + "/block/userName/" + userName + "/buddyName/" + buddyName);
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		signParams.userName = userName
		signParams.buddyName = buddyName
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executeDelete(requestURL, queryParams,headerParams,callback);
	},
	unFriend : function (userName,buddyName, callback){
		var requestURL = App42.URL("buddy" + "/unfriend/userName/" + userName + "/buddyName/"+ buddyName);
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		signParams.userName = userName
		signParams.buddyName = buddyName
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executeDelete(requestURL, queryParams,headerParams,callback);
	},
	deleteMessageById : function (userName,messageId, callback){
		var requestURL = App42.URL("buddy" + "/deleteMessageById/" + userName);
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		var messageIds = new Array();
		messageIds.push(messageId)
        signParams.messageIds = "["+messageIds.toString()+"]";
		queryParams = signParams
		signParams.userName = userName
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executeDelete(requestURL, queryParams,headerParams,callback);
	},
	deleteMessageByIds : function (userName,messageIds, callback){
		var requestURL = App42.URL("buddy" + "/deleteMessageById/" + userName);
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		signParams.messageIds = JSON.stringify(messageIds);
		queryParams = signParams
		signParams.userName = userName
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executeDelete(requestURL, queryParams,headerParams,callback);
	},
	deleteAllMessages : function (userName, callback){
		var requestURL = App42.URL("buddy" + "/deleteAllMessages/" + userName);
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		signParams.userName = userName
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executeDelete(requestURL, queryParams,headerParams,callback);
	}
}
