var App42Connection = require("./app42Connection")
var App42 = require("./app42")
var App42Log = require("./app42Log")
var App42Service = require("./app42Service")
App42Service = new App42Service();
var App42Util = require("./app42Util")
var userProfile = {}

function _createProfileObj(profile){
  var profileData = {};
  profileData.dateOfBirth = profile.dateOfBirth 
  profileData.lastName = profile.lastName
  profileData.sex = profile.sex
  profileData.officeLandLine = profile.officeLandLine
  profileData.homeLandLine = profile.homeLandLine
  profileData.state = profile.state
  profileData.firstName = profile.firstName
  profileData.country = profile.country
  profileData.city = profile.city
  profileData.mobile = profile.mobile
  return JSON.stringify(profileData);
}
module.exports = {
	createUser : function (userName,password,emailId,callback) {
		var requestURL = App42.URL("user");
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		var jsonBody = {"app42": {"user":{"userName": userName,"password": password,"email": emailId }}}
		signParams.body = JSON.stringify(jsonBody);
		App42Log.debug("JSON Body is : " +  JSON.stringify(jsonBody))
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executePost(requestURL, queryParams,headerParams,JSON.stringify(jsonBody),callback);
	},
	assignRoles : function (userName,roleList,callback) {
		var requestURL = App42.URL("user/assignrole");
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		var jsonBody = {"app42":{"user":{"userName":userName, "roles":{"role":roleList}}}};
		signParams.body = JSON.stringify(jsonBody);
		App42Log.debug("JSON Body is : " +  JSON.stringify(jsonBody))
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executePost(requestURL, queryParams,headerParams,JSON.stringify(jsonBody),callback);
	},
	createUserWithRole : function (userName,password,emailId,roleList,callback) {
		var requestURL = App42.URL("user" + "/" + "role");
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		var jsonBody = {"app42": {"user":{"userName": userName,"password": password,"email": emailId, "roles": { "role": roleList} }}}
		signParams.body = JSON.stringify(jsonBody);
		App42Log.debug("JSON Body is : " +  JSON.stringify(jsonBody))
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executePost(requestURL, queryParams,headerParams,JSON.stringify(jsonBody),callback);
	},
	createOrUpdateProfile : function (userName,callback) {
		var requestURL = App42.URL("user" + "/" + "profile");
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		var profileObj = _createProfileObj(userProfile)
		var jsonBody = {"app42": {"user":{"userName": userName,"profileData": profileObj }}}
		signParams.body = JSON.stringify(jsonBody);
		App42Log.debug("JSON Body is : " +  JSON.stringify(jsonBody))
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executePut(requestURL, queryParams,headerParams,JSON.stringify(jsonBody),callback);
	},
	updateEmail : function (userName,emailId,callback) {
		var requestURL = App42.URL("user");
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		var jsonBody = {"app42": {"user":{"userName": userName,"email": emailId }}}
		signParams.body = JSON.stringify(jsonBody);
		App42Log.debug("JSON Body is : " +  JSON.stringify(jsonBody))
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executePut(requestURL, queryParams,headerParams,JSON.stringify(jsonBody),callback);
	},
	authenticate : function (userName,password,callback) {
		var requestURL = App42.URL("user" + "/" + "authenticate");
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		var jsonBody = {"app42": {"user":{"userName": userName,"password": password}}}
		signParams.body = JSON.stringify(jsonBody);
		App42Log.debug("JSON Body is : " +  JSON.stringify(jsonBody))
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executePost(requestURL, queryParams,headerParams,JSON.stringify(jsonBody),callback);
	},
	lockUser : function (userName,callback) {
		var requestURL = App42.URL("user" + "/" + "lock");
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		var jsonBody = {"app42": {"user":{"userName": userName }}}
		signParams.body = JSON.stringify(jsonBody);
		App42Log.debug("JSON Body is : " +  JSON.stringify(jsonBody))
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executePut(requestURL, queryParams,headerParams,JSON.stringify(jsonBody),callback);
	},
	unlockUser : function (userName,callback) {
		var requestURL = App42.URL("user" + "/" + "unlock");
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		var jsonBody = {"app42": {"user":{"userName": userName }}}
		signParams.body = JSON.stringify(jsonBody);
		App42Log.debug("JSON Body is : " +  JSON.stringify(jsonBody))
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executePut(requestURL, queryParams,headerParams,JSON.stringify(jsonBody),callback);
	},
	changeUserPassword : function (userName,oldPassword,newPassword,callback) {
		var requestURL = App42.URL("user" + "/" + "changeUserPassword");
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		var jsonBody = {"app42": {"user":{"userName": userName,"oldPassword": oldPassword,"newPassword": newPassword}}}
		signParams.body = JSON.stringify(jsonBody);
		App42Log.debug("JSON Body is : " +  JSON.stringify(jsonBody))
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executePut(requestURL, queryParams,headerParams,JSON.stringify(jsonBody),callback);
	},
	resetUserPassword : function (userName,password,callback) {
		var requestURL = App42.URL("user" + "/" + "resetUserPassword");
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		var jsonBody = {"app42": {"user":{"userName": userName,"password": password}}}
		signParams.body = JSON.stringify(jsonBody);
		App42Log.debug("JSON Body is : " +  JSON.stringify(jsonBody))
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executePut(requestURL, queryParams,headerParams,JSON.stringify(jsonBody),callback);
	},
	getUserByEmailId : function (emailId,callback) {
		var requestURL = App42.URL("user" + "/" +"email" + "/" + emailId);
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		signParams.emailId = emailId
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executeGet(requestURL, queryParams,headerParams,callback);
	},
	getUser : function (userName,callback) {
		var requestURL = App42.URL("user" + "/" + userName);
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
	getRolesByUser : function (userName,callback) {
		var requestURL = App42.URL("user" + "/" + userName + "/" + "roles");
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
	getUsersByRole : function (role,callback) {
		var requestURL = App42.URL("user" + "/" + "role" + "/" + role);
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		signParams.role = role
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executeGet(requestURL, queryParams,headerParams,callback);
	},
	getAllUsers : function (callback) {
		var requestURL = App42.URL("user");
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executeGet(requestURL, queryParams,headerParams,callback);
	},
	getAllUsersCount : function (callback) {
		var requestURL = App42.URL("user"+ "/" + "count" + "/" + "all");
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executeGet(requestURL, queryParams,headerParams,callback);
	},
	getAllUsersWithPaging : function (max,offset,callback) {
		var requestURL = App42.URL("user" + "/" + "paging"+ "/" + max + "/" + offset);
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		signParams.max = max
		signParams.offset = offset
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executeGet(requestURL, queryParams,headerParams,callback);
	},
	getLockedUsers : function (callback) {
		var requestURL = App42.URL("user" + "/" + "locked");
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executeGet(requestURL, queryParams,headerParams,callback);
	},
	
	getLockedUsersCount : function (callback) {
		var requestURL = App42.URL("user" + "/" + "count" + "/" +  "locked");
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executeGet(requestURL, queryParams,headerParams,callback);
	},
	getLockedUsersWithPaging : function (max,offset,callback) {
		var requestURL = App42.URL("user" + "/" + "locked" + "/" + max + "/" + offset);
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		signParams.max = max
		signParams.offset = offset
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executeGet(requestURL, queryParams,headerParams,callback);
	},
	logout: function (sessionId, callback) {
		var requestURL = App42.URL("session");
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		var jsonBody = {"app42": {"session":{"id": sessionId}}}
		signParams.body = JSON.stringify(jsonBody);
		App42Log.debug("JSON Body is : " +  JSON.stringify(jsonBody))
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executePut(requestURL, queryParams,headerParams,JSON.stringify(jsonBody),callback);
	},
	revokeAllRoles : function (userName, callback){
		var requestURL = App42.URL("user" + "/" + userName + "/" +"revoke");
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		signParams.userName = userName
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executeDelete(requestURL, queryParams,headerParams,callback);
	},
	revokeRole : function (userName, role, callback){
		var requestURL = App42.URL("user" + "/" + userName + "/" +"revoke" + "/" + role);
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		signParams.role = role
		signParams.userName = userName
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executeDelete(requestURL, queryParams,headerParams,callback);
	},
	addJSONObject : function (collectionName, jsonDoc, callback){
		App42Service.dbName = App42.getDbName()
		App42Service.collectionName = collectionName
		App42Service.jsonObject = JSON.stringify(jsonDoc)
	},
	deleteUser : function (userName, callback){
		var requestURL = App42.URL("user" + "/" + userName);
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		signParams.userName = userName
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executeDelete(requestURL, queryParams,headerParams,callback);
	},
	setFirstName: function (firstName) {
	  userProfile.firstName  = firstName
	},
	setLastName : function (lastName) {
	  userProfile.lastName = lastName
	},
	setSex : function (sex) {
		userProfile.sex = sex
	},
	setState : function (state){
		userProfile.state = state
	},
	setDateOfBirth: function  (dateOfBirth){
		userProfile.dateOfBirth = getODataUTCDateFilter(dateOfBirth);
	},
	setOfficeLandLine : function (officeLandLine){
		userProfile.officeLandLine = officeLandLine
	},
	setCountry : function (country){
		userProfile.country = country
	},
	setCity : function (city){
		userProfile.city = city
	},
	setMobile : function (mobile){
		userProfile.mobile = mobile
	},
	setHomeLandLine : function (homeLandLine){
		userProfile.homeLandLine = homeLandLine
	}
}
