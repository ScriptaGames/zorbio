var crypto = require('crypto');
var App42 = require("./app42")
var App42Log = require("./app42Log")

function sortAssoc (arrayVal) {
	var aTemp = [];
	for (var sKey in arrayVal){
		aTemp.push([sKey, arrayVal[sKey]]);
		App42Log.debug("Sign Params Key is : " + sKey + " Value is : " + arrayVal[sKey])
	}
	aTemp.sort(function(a,b)
	{
		return ((a[0] > b[0]) ? -1 : ((a[0] < b[0]) ? 1 : 0));
	});

	var aOutPutString = "";
	var aOutput = [];
	for (var nIndex = aTemp.length-1; nIndex >=0; nIndex--){
		aOutput[aTemp[nIndex][0]] = aTemp[nIndex][1];
		aOutPutString+= aTemp[nIndex][0]+aTemp[nIndex][1];
	}
	return aOutPutString;
}
module.exports = {
	signature : function (secretKey, queryParams) {
		var sortedParams = sortAssoc(queryParams);
		var shasum = crypto.createHmac('sha1', secretKey).update(sortedParams);
		var encodedString = shasum.digest(encoding="base64");
		var signatureString = encodeURIComponent(encodedString);
		return signatureString;
	},
	buildQueryString : function (queryParams) {
		var queryString = "?"
		for (var sKey in queryParams){
			queryString = queryString + encodeURIComponent(sKey) + "=" + encodeURIComponent(queryParams[sKey]) + "&";
		}
		return queryString;
	},		
	getODataUTCDateFilter : function () {
		var date = new Date();
		var monthString;
		var rawMonth = (date.getUTCMonth()+1).toString();
		if (rawMonth.length == 1) {
			monthString = "0" + rawMonth;
		}
		else
		{
			monthString = rawMonth;
		}

		var dateString;
		var rawDate = date.getUTCDate().toString();
		if (rawDate.length == 1) {
			dateString = "0" + rawDate;
		}
		else
		{
			dateString = rawDate;
		}
		var hoursString;
		var rawHours = date.getUTCHours().toString();
		if (rawHours.length == 1) {
			hoursString = "0" + rawHours;
		}
		else
		{
			hoursString = rawHours;
		}
		var minutesString;
		var rawMin = date.getUTCMinutes().toString();
		if (rawMin.length == 1) {
			minutesString = "0" + rawMin;
		}
		else
		{
			minutesString = rawMin;
		}
		var secondsString;
		var rawSec = date.getUTCSeconds().toString();
		if (rawSec.length == 1) {
			secondsString = "0" + rawSec;
		}
		else
		{
			secondsString = rawSec;
		}
		var DateFilter = "";
		DateFilter += date.getUTCFullYear() + "-";
		DateFilter += monthString + "-";
		DateFilter += dateString;
		DateFilter += "T" + hoursString + ":";
		DateFilter += minutesString + ":";
		DateFilter += secondsString + ".";
		DateFilter += date.getUTCMilliseconds();
		DateFilter += "Z";
		return DateFilter;
	}
}
