var App42Connection = require("./app42Connection")
var App42 = require("./app42")
var App42Log = require("./app42Log")
var App42Service = require("./app42Service")
App42Service = new App42Service();
var App42Util = require("./app42Util")
var qB = require("./QueryBuilder");

module.exports = {
	insertJSONDocument : function (dbName, collectionName, json, callback) {
		var requestURL = App42.URL("storage" +"/"+"insert"+"/"+"dbName"+"/"+dbName+"/"+"collectionName"+"/"+collectionName);
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		signParams.dbName = dbName;
		signParams.collectionName = collectionName;
		if(json instanceof Object){
			json = JSON.stringify(json)
		}
		var jsonBody = {"app42": {"storage":{"jsonDoc": json}}}
		signParams.body = JSON.stringify(jsonBody);
		App42Log.debug("JSON Body is : " +  JSON.stringify(jsonBody))
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executePost(requestURL, queryParams,headerParams,JSON.stringify(jsonBody), callback)
	},
	saveOrUpdateDocumentByKeyValue : function (dbName,collectionName,key, value,json,callback) {
		var requestURL = App42.URL("storage" + "/" + "saveorupdate"+ "/" + "dbName" + "/" + dbName + "/" + "collectionName" + "/" + collectionName + "/"+key+"/"+value);
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		signParams.dbName = dbName
		signParams.collectionName = collectionName
		signParams.key = key;
		signParams.value = value;
		if(json instanceof Object){
			json = JSON.stringify(json)
		}
		var jsonBody = {"app42": {"storage":{"jsonDoc": json}}}
		signParams.body = JSON.stringify(jsonBody);
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
		App42Connection.executePut(requestURL, queryParams,headerParams,JSON.stringify(jsonBody),callback);
	},
	addOrUpdateKeys : function (dbName,collectionName,docId,json,callback) {
		var requestURL = App42.URL("storage" + "/" + "updateKeysByDocId"+ "/" + "dbName" + "/" + dbName + "/" + "collectionName" + "/" + collectionName + "/"+"docId"+"/"+docId);
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		signParams.dbName = dbName
		signParams.collectionName = collectionName
		signParams.docId = docId
		if(json instanceof Object){
			json = JSON.stringify(json)
		}
		var jsonBody = {"app42": {"storage":{"jsonDoc": json}}}
		signParams.body = JSON.stringify(jsonBody);
		App42Log.debug("JSON Body is : " +  JSON.stringify(jsonBody))
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executePut(requestURL, queryParams,headerParams,JSON.stringify(jsonBody),callback);
	},
	updateDocumentByKeyValue : function (dbName,collectionName,key, value,json,callback) {
		var requestURL = App42.URL("storage" + "/" + "update"+ "/" + "dbName" + "/" + dbName + "/" + "collectionName" + "/" + collectionName + "/"+key+"/"+value);
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		signParams.dbName = dbName
		signParams.collectionName = collectionName
		signParams.key = key;
		signParams.value = value;
		if(json instanceof Object){
			json = JSON.stringify(json)
		}
		var jsonBody = {"app42": {"storage":{"jsonDoc": json}}}
		signParams.body = JSON.stringify(jsonBody);
		App42Log.debug("JSON Body is : " +  JSON.stringify(jsonBody))
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executePut(requestURL, queryParams,headerParams,JSON.stringify(jsonBody),callback);
	},
	updateDocumentByDocId : function (dbName,collectionName,docId,json,callback) {
		var requestURL = App42.URL("storage" + "/" + "updateByDocId"+ "/" + "dbName" + "/" + dbName + "/" + "collectionName" + "/" + collectionName + "/"+"docId"+"/"+docId);
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		signParams.dbName = dbName
		signParams.collectionName = collectionName
		signParams.docId = docId
		if(json instanceof Object){
			json = JSON.stringify(json)
		}
		var jsonBody = {"app42": {"storage":{"jsonDoc": json}}}
		signParams.body = JSON.stringify(jsonBody);
		App42Log.debug("JSON Body is : " +  JSON.stringify(jsonBody))
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executePut(requestURL, queryParams,headerParams,JSON.stringify(jsonBody),callback);
	},
	updateDocumentByQuery : function (dbName,collectionName,query,json,callback) {
		var requestURL = App42.URL("storage" + "/" + "updateDocsByQuery"+ "/" + "dbName" + "/" + dbName + "/" + "collectionName" + "/" + collectionName );
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		signParams.dbName = dbName
		signParams.collectionName = collectionName
		if(json instanceof Object){
			json = JSON.stringify(json)
		}
		var jsonBody = {"app42": {"storage":{"jsonDoc": json,"jsonQuery" : qB.getStr(query)}}}
		signParams.body = JSON.stringify(jsonBody);
		App42Log.debug("JSON Body is : " +  JSON.stringify(jsonBody))
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executePut(requestURL, queryParams,headerParams,JSON.stringify(jsonBody),callback);
	},
	findAllCollections : function (dbName,callback) {
		var requestURL = App42.URL("storage" + "/" + "findCollections" + "/" + "dbName" + "/" + dbName);
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		signParams.dbName = dbName
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executeGet(requestURL, queryParams,headerParams,callback);
	},
	findAllDocuments : function (dbName,collectionName,callback) {
		var requestURL = App42.URL("storage" + "/" + "findAll" + "/" + "dbName" + "/" + dbName + "/" + "collectionName" + "/" + collectionName);
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		signParams.dbName = dbName
		signParams.collectionName = collectionName
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executeGet(requestURL, queryParams,headerParams,callback);
	},
	findAllDocumentsCount : function (dbName,collectionName,callback) {
		var requestURL = App42.URL("storage" + "/" + "findAll" + "/" + "count"+ "/" + "dbName" + "/" + dbName + "/" + "collectionName" + "/" + collectionName);
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		signParams.dbName = dbName
		signParams.collectionName = collectionName
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executeGet(requestURL, queryParams,headerParams,callback);
	},
	findAllDocumentsByPaging : function (dbName,collectionName,max, offset,callback) {
		var requestURL = App42.URL("storage" + "/" + "findAll"+ "/" + "dbName" + "/" + dbName + "/" + "collectionName" + "/" + collectionName + "/"+max+"/"+offset);
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		signParams.dbName = dbName
		signParams.collectionName = collectionName
		signParams.max = max;
		signParams.offset = offset;
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executeGet(requestURL, queryParams,headerParams,callback);
	},
	findDocumentById : function (dbName,collectionName,docId,callback) {
		var requestURL = App42.URL("storage" + "/" + "findDocById"+ "/" + "dbName" + "/" + dbName + "/" + "collectionName" + "/" + collectionName + "/"+"docId"+"/"+docId);
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		signParams.dbName = dbName
		signParams.collectionName = collectionName
		signParams.docId = docId;
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executeGet(requestURL, queryParams,headerParams,callback);
	},
	findDocumentByKeyValue : function (dbName,collectionName,key, value,callback) {
		var requestURL = App42.URL("storage" + "/" + "findDocByKV"+ "/" + "dbName" + "/" + dbName + "/" + "collectionName" + "/" + collectionName + "/"+key+"/"+value);
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		signParams.dbName = dbName
		signParams.collectionName = collectionName
		signParams.key = key;
		signParams.value = value;
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executeGet(requestURL, queryParams,headerParams,callback);
	},
	findDocumentsByQuery : function (dbName,collectionName,query,callback) {
		var requestURL = App42.URL("storage" + "/" + "findDocsByQuery"+ "/" + "dbName" + "/" + dbName + "/" + "collectionName" + "/" + collectionName);
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		signParams.dbName = dbName
		signParams.collectionName = collectionName
		signParams.jsonQuery = qB.getStr(query);
		queryParams.jsonQuery = qB.getStr(query);
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executeGet(requestURL, queryParams,headerParams,callback);
	},
	findDocumentsByQueryWithPaging : function (dbName, collectionName, query, maxParameter, offset, callback) {
		var requestURL = App42.URL("storage" + "/" + "findDocsByQuery"+ "/" + "dbName" + "/" + dbName + "/" + "collectionName" + "/" + collectionName +"/" + maxParameter + "/" + offset);
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		signParams.dbName = dbName
		signParams.collectionName = collectionName
		signParams["max"] = maxParameter
		signParams.offset = offset
		signParams.jsonQuery = qB.getStr(query);
		queryParams.jsonQuery = qB.getStr(query);
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executeGet(requestURL, queryParams,headerParams,callback);
	},
	findDocsWithQueryPagingOrderBy : function (dbName, collectionName, query, maxParameter, offset,orderByKey,orderByType, callback) {
		var requestURL = App42.URL("storage" + "/" + "findDocsByQuery"+ "/" + "dbName" + "/" + dbName + "/" + "collectionName" + "/" + collectionName +"/" + maxParameter + "/" + offset);
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		queryParams.orderByKey = orderByKey
		queryParams.orderByType = orderByType
		signParams.dbName = dbName
		signParams.collectionName = collectionName
		signParams["max"] = maxParameter
		signParams.offset = offset
		signParams.jsonQuery = qB.getStr(query);
		queryParams.jsonQuery = qB.getStr(query);
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executeGet(requestURL, queryParams,headerParams,callback);
	},
	deleteDocumentById : function (dbName,collectionName,docId,callback) {
		var requestURL = App42.URL("storage" + "/" + "deleteDocById"+ "/" + "dbName" + "/" + dbName + "/" + "collectionName" + "/" + collectionName + "/"+"docId"+"/"+docId);
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		signParams.dbName = dbName
		signParams.collectionName = collectionName
		signParams.docId = docId;
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executeDelete(requestURL, queryParams,headerParams,callback);
	},
	deleteDocumentsByKeyValue : function (dbName,collectionName,key, value,callback) {
		var requestURL = App42.URL("storage" + "/" + "deletebykey"+ "/" + "dbName" + "/" + dbName + "/" + "collectionName" + "/" + collectionName + "/"+key);
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		var jsonObject = new Object()
		jsonObject.key = value
		signParams.value = JSON.stringify(jsonObject)
		queryParams = signParams
		signParams.dbName = dbName
		signParams.collectionName = collectionName
		signParams.key = key;
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executeDelete(requestURL, queryParams,headerParams,callback);
	},
	deleteAllDocuments : function (dbName,collectionName,callback) {
		var requestURL = App42.URL("storage" + "/" + "deleteAll"+ "/" + "dbName" + "/" + dbName + "/" + "collectionName" + "/" + collectionName);
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		signParams.dbName = dbName
		signParams.collectionName = collectionName
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executeDelete(requestURL, queryParams,headerParams,callback);
	},
	
	
	
grantAccessOnDoc : function(dbName, collectionName, docId,aclList,callback) {
        var requestURL = App42.URL("storage/grantAccessOnDoc/"+dbName+"/"+collectionName+"/"+docId);
        var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		signParams.dbName = dbName;
        signParams.collectionName = collectionName;
        signParams.docId = docId;
        var storageAclList = new Array();
        if(aclList instanceof Array){
            for (var i=0;  i<aclList.length; i++){
                var userInArray = aclList[i].user;
                var permissionInArray;
                
                permissionInArray = aclList[i].permission;
                var arrayInArray={
                    user:userInArray,
                    permission:permissionInArray
                };
                storageAclList.push(arrayInArray)
            }
        }else{
            var user = aclList.user;
            var permission ;
            checkPermissionType(permission);
            permission = aclList.permission;
            var array={
                user:user,
                permission:permission
            };
            storageAclList.push(array)
        }
        var encodeJSON = JSON.stringify(storageAclList);
        var signify = '{"acl":' + encodeJSON + '}'
        var stringfy = JSON.stringify(signify)
        var jsonBody = '{"app42":{"storage":{"acls":' + stringfy + '}}}';
        signParams.body = jsonBody;
		App42Log.debug("JSON Body is : " +  JSON.stringify(jsonBody))
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executePut(requestURL, queryParams,headerParams,jsonBody,callback);
    },
    revokeAccessOnDoc : function(dbName, collectionName, docId,aclList,callback) {
        var requestURL = App42.URL("storage/revokeAccessOnDoc/"+dbName+"/"+collectionName+"/"+docId);
        var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		signParams.dbName = dbName;
        signParams.collectionName = collectionName;
        signParams.docId = docId;
        var storageAclList = new Array();
        if(aclList instanceof Array){
            for (var i=0;  i<aclList.length; i++){
                var userInArray = aclList[i].user;
                var permissionInArray;
                
                permissionInArray = aclList[i].permission;
                var arrayInArray={
                    user:userInArray,
                    permission:permissionInArray
                };
                storageAclList.push(arrayInArray)
            }
        }else{
            var user = aclList.user;
            var permission ;
            checkPermissionType(permission);
            permission = aclList.permission;
            var array={
                user:user,
                permission:permission
            };
            storageAclList.push(array)
        }
        var encodeJSON = JSON.stringify(storageAclList);
        var signify = '{"acl":' + encodeJSON + '}'
        var stringfy = JSON.stringify(signify)
        var jsonBody = '{"app42":{"storage":{"acls":' + stringfy + '}}}';
        signParams.body = jsonBody;
		App42Log.debug("JSON Body is : " +  JSON.stringify(jsonBody))
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executePut(requestURL, queryParams,headerParams,jsonBody,callback);
    },
	mapReduce : function (dbName, collectionName, mapFunction,reduceFunction, callback) {
		var requestURL = App42.URL("storage" +"/"+"mapReduce"+"/"+"dbName"+"/"+dbName+"/"+"collectionName"+"/"+collectionName);
		var queryParams = {};
		var signParams = App42Service.populateSignParams();
		var meteheaderParams = App42Service.populateMetaHeaderParams();
		var headerParams = App42Service._merge(signParams,meteheaderParams)
		signParams.dbName = dbName;
		signParams.collectionName = collectionName;
		var jsonBody = {"app42": {"storage":{"map": mapFunction,"reduce":reduceFunction}}}
		signParams.body = JSON.stringify(jsonBody);
		App42Log.debug("JSON Body is : " +  JSON.stringify(jsonBody))
		var signature = App42Util.signature(App42.secretKey,signParams)
		headerParams.signature = signature
		App42Log.debug("signature is : " + signature)
		App42Connection.executePost(requestURL, queryParams,headerParams,JSON.stringify(jsonBody), callback)
	}
}
