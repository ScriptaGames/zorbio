var App42 = require("./app42")
var App42Util = require("./app42Util")
var QB= require("./QueryBuilder")

// Initializing Variables.
var sessionId=null,adminKey=null,fbAccessToken=null,
geoTag=null,aclList=null,selectKeys=[],pageOffset=-1,pageMaxRecords=-1,otherMetaHeaders={},event=null,query=null,jsonObject=null,dbName=null;
	function App42Service(){
		// Re Initializing Variables.
		sessionId=null,adminKey=null,fbAccessToken=null,
		geoTag=null,aclList=null,selectKeys=[],pageOffset=-1,pageMaxRecords=-1,otherMetaHeaders={},event=null,query=null,jsonObject=null,dbName=null;
	}

	App42Service.add = function (_service) {
		for (var attrname in module.exports) {
			 _service[attrname] = module.exports[attrname];
		}
	}

  App42Service.setPageMaxRecords = function (_pageMaxRecords) {
    pageMaxRecords = _pageMaxRecords;
	}
  	
	App42Service.getPageMaxRecords = function () {
    return pageMaxRecords;
	}
  	
  App42Service.setOrderByDescending = function (_orderByDescending) {
    orderByDescending = _orderByDescending;
	}
  	
	App42Service.getOrderByDescending = function () {
    return orderByDescending;
	}
  	
  App42Service.getOtherMetaHeaders = function () {
    return otherMetaHeaders;
	}
  	
  App42Service.setOrderByAscending = function (_orderByAscending) {
    orderByAscending = _orderByAscending;
	}
  	
	App42Service.getOrderByAscending = function () {
    return orderByAscending;
	}
	
	App42Service.setAclList = function (_aclList) {
    aclList = _aclList;
	}
  	
	App42Service.getAclList = function () {
    return aclList;
	}
  	
	App42Service.setSelectKeys = function (_selectKeys) {
    selectKeys = _selectKeys;
	}
  	
	App42Service.getSelectKeys = function () {
    return selectKeys;
	}
  	
	App42Service.setEvent = function (_event) {
    event = _event;
	}
  	
	App42Service.getEvent = function () {
    return event;
	}
  	
  App42Service.setPageOffset = function (_pageOffset) {
    pageOffset = _pageOffset;
	}
	
  App42Service.setSessionId = function (_sessionId) {
    sessionId = _sessionId;
	}
	
  App42Service.setAdminKey = function (_adminKey) {
    adminKey = _adminKey;
	}
	
  App42Service.getPageOffset = function () {
    return pageOffset;
	}
  	
  App42Service.getSessionId = function () {
    return sessionId ;
	}
	
  App42Service.getAdminKey = function () {
    return adminKey;
	}
	
	App42Service.setGeoTag = function (_gp) {
    geoTag = _gp;
	}
	
	App42Service.getGeoTag = function (_gp) {
    return geoTag
	}
  	
  App42Service.setQuery = function (_collection_Name,metaInfoQuery) {
		dbName = App42.getDbName();
		collectionName = _collection_Name;
			if(metaInfoQuery){
				query = QB.getStr(metaInfoQuery);
			}else{
				query = null
			}
	}
		
	App42Service.setOtherMetaHeaders = function(_other_metaHeaders) {
    otherMetaHeaders = _other_metaHeaders;
  }
  
  App42Service.setFbAccessToken = function (_fbAccessToken) {
    fbAccessToken = _fbAccessToken;
	}
	
  App42Service.getFbAccessToken = function () {
  	return fbAccessToken;
	}
  	
	
	App42Service.prototype.populateSignParams = function (){
		var signParams = {}
		signParams.apiKey = App42.apiKey;
		signParams.version = App42.version;
		if(adminKey != null)
			signParams.adminKey = adminKey;
		if(sessionId != null)
			signParams.sessionId = sessionId;
		if(fbAccessToken != null)
			signParams.fbAccessToken = fbAccessToken;
		signParams.timeStamp = App42Util.getODataUTCDateFilter();
		return signParams;
	}
	App42Service.prototype.populateMetaHeaderParams = function (){
		var headerParams = {};
		if(aclList !=null){
			var __acl = JSON.stringify(aclList)
			headerParams.dataACL = __acl;
		}
		if(pageOffset != -1){
			headerParams.pageOffset = pageOffset;
		}
		if(pageMaxRecords != -1){
			headerParams.pageMaxRecords = pageMaxRecords;
		}
	
		if(geoTag != null){
			var geoString = JSON.stringify(geoTag)
			headerParams.geoTag = geoString;
		}
		if(selectKeys != null){
			var selectJSONKeys = {}
			for (var i=0; i<selectKeys.length;i++) {
				selectJSONKeys[selectKeys[i]] = "1";
			}
			var selectKeysString = JSON.stringify(selectJSONKeys)
			headerParams.selectKeys = selectKeysString 
		
		}
		if(otherMetaHeaders) {
		for (var key in otherMetaHeaders) {
				var value = otherMetaHeaders[key];
				if (key != null && key !="" && value != null
					&& value != "") {
					headerParams[key] = value;
				
				}
			}
		}
	
		if(App42.getLoggedInUser() !=null && App42.getLoggedInUser() != "") {
			headerParams.loggedInUser = App42.getLoggedInUser();
		}
	
		if (query != null && query !=""){
			headerParams.metaQuery = query;
		}
	
		if (jsonObject != null && jsonObject !=""){
			headerParams.jsonObject = jsonObject;
		}
	
	if(dbName!=null && dbName != "" && collectionName!=null && collectionName != "") {
		 var jsonObject1 = new Object();
		 jsonObject1.dbName = dbName;
		 jsonObject1.collectionName = collectionName;
		 headerParams.dbCredentials = JSON.stringify(jsonObject1);
	}
	headerParams.SDKName = "javascript";
	return headerParams;
}

App42Service.prototype._merge = function (signParams,metaHeaderParams){
	var headerParams = {};
	for (var attrname in signParams) {
		headerParams[attrname] = signParams[attrname];
	}
	for (var attrname in metaHeaderParams) {
		headerParams[attrname] = metaHeaderParams[attrname];
	}
	return headerParams;
}
	
module.exports = App42Service;

