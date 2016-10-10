var http = require("https");
var App42Util = require("./app42Util")
var App42Log = require("./app42Log")
var App42 = require("./app42")

module.exports = {
	executeCustomCode : function (url,queryParams,headerParams,jsonBody, clientCallBack){
		if(App42.protocol == "http"){
			http = require("http")
		}
		var queryString = App42Util.buildQueryString(queryParams);
		var encodedUrl = url + queryString
		headerParams.Accept = "application/json"
		headerParams["Content-Type"] = "application/json"
		var options = {
				hostname: App42.hostName,path: encodedUrl,method: 'POST',port: App42.port,headers : headerParams
		};	
		App42Log.debug("Requested Param is : " + JSON.stringify(options));
		callback = function(response) {
		  var str = ''
		  	response.on('data', function (chunk) {
					str += chunk;
			});
			response.on('end', function () {
					clientCallBack(str);
			});
			response.on('error', function () {
					clientCallBack(str);	  
			});	  
		}	
		var request = http.request(options, callback);
		request.write(jsonBody);
		request.end();	
	},

	executePost : function (url,queryParams,headerParams,jsonBody, clientCallBack){
		if(App42.protocol == "http"){
			http = require("http")
		}
		var queryString = App42Util.buildQueryString(queryParams);
		var encodedUrl = url + queryString
		headerParams.Accept = "application/json"
		headerParams["Content-Type"] = "application/json"
		var options = {
				hostname: App42.hostName,
				path: encodedUrl,
				method: 'POST',
				port: App42.port,
				headers : headerParams
		};	
		App42Log.debug("Requested Param is : " + JSON.stringify(options));
		callback = function(response) {
		  var str = ''
		  
			response.on('data', function (chunk) {
					str += chunk;
			});

			response.on('end', function () {
					clientCallBack(str);
			});

			response.on('error', function () {
					clientCallBack(str);	  
			});	  
		}	

		var request = http.request(options, callback);
		request.write(jsonBody);
		request.end();	
	},

	executeGet : function (url,queryParams,headerParams, clientCallBack){
		if(App42.protocol == "http"){
			http = require("http")
		}
		var queryString = App42Util.buildQueryString(queryParams);
		var encodedUrl = url + queryString
		headerParams.Accept = "application/json"
		headerParams["Content-Type"] = "application/json"
		var options = {
			hostname: App42.hostName,
			path: encodedUrl,
			method: 'GET',
			port : App42.port,
			headers : headerParams
		};	
		App42Log.debug("Requested Connection Param is : " + JSON.stringify(options));
		callback = function(response) {
			var str = ''
			response.on('data', function (chunk) {
				  str += chunk;
			});

			response.on('end', function () {
				clientCallBack(str);
			});
			
			response.on('error', function () {
				clientCallBack(str);
			});	  
		}	
		var request = http.request(options, callback);
		request.end();	
	},
	executeDelete : function (url,queryParams,headerParams, clientCallBack){
		if(App42.protocol == "http"){
			http = require("http")
		}
		var queryString = App42Util.buildQueryString(queryParams);
		var encodedUrl = url + queryString
		headerParams.Accept = "application/json"
		headerParams["Content-Type"] = "application/json"
		var options = {
			hostname: App42.hostName,
			path: encodedUrl,
			method: 'DELETE',
			port: App42.port,
			headers : headerParams
		};	
		App42Log.debug("Requested Connection Param is : " + JSON.stringify(options));
		callback = function(response) {
			var str = ''
			response.on('data', function (chunk) {
				  str += chunk;
			});

			response.on('end', function () {
				clientCallBack(str);
			});
			
			response.on('error', function () {
				clientCallBack(str);
			});	  
		}	
		var request = http.request(options, callback);
		request.end();	
	},
	executePut : function (url,queryParams,headerParams,jsonBody, clientCallBack){
	  	if(App42.protocol == "http"){
			http = require("http")
		}
		var queryString = App42Util.buildQueryString(queryParams);
		var encodedUrl = url + queryString
		headerParams.Accept = "application/json"
		headerParams["Content-Type"] = "application/json"
		var options = {
			hostname: App42.hostName,
			path: encodedUrl,
			method: 'PUT',
			port: App42.port,
			headers : headerParams
		};	
		App42Log.debug("Requested Connection Param is : " + JSON.stringify(options));
		callback = function(response) {
			var str = ''
			response.on('data', function (chunk) {
					str += chunk;
			});

			response.on('end', function () {
				clientCallBack(str);
			});
			
			response.on('error', function () {
				clientCallBack(str);	  
			});	  
		}	
		var request = http.request(options, callback);
		request.write(jsonBody);
		request.end();	
	}
}
