var Operator = {
    EQUALS :"$eq",
    NOT_EQUALS : "$ne",
    GREATER_THAN :"$gt",
    LESS_THAN :"$lt",
    GREATER_THAN_EQUALTO :   "$gte",
    LESS_THAN_EQUALTO :   "$lte",
    LIKE : "$lk",
    AND : "$and",
    OR :"$or",
	INLIST : "$in"
};
function checkOperatorType(operatorType){
    if(myObject.EQUALS == operatorType){
        return "$eq"
    }else if(myObject.NOT_EQUALS == operatorType){
        return "$ne"
    }else if(myObject.GREATER_THAN == operatorType){
        return "$gt"
    }else if(myObject.LESS_THAN == operatorType){
        return "$lt"
    }else if(myObject.GREATER_THAN_EQUALTO == operatorType){
        return "$gte"
    }else if(myObject.LESS_THAN_EQUALTO == operatorType){
        return "$lte"
    }else if(myObject.LIKE == operatorType){
        return "$lk"
    }else if(myObject.AND == operatorType){
        return "$and"
    }else if(myObject.OR == operatorType){
        return "$or"
    }else if(myObject.INLIST == operatorType){
        return "$in"
    }
    else{
        return null;
    }
    
}
var GeoOperator = {
    NEAR :"$near",
    WITHIN : "$within"
};

function checkGeoOperatorType(operatorType){
    if(GeoOperator.NEAR == operatorType){
        return "$near"
    }else if(GeoOperator.WITHIN == operatorType){
        return "$within"
    }
    else{
        return null;
    }
}
function getStr(jsonArray){
   if(jsonArray instanceof Array){
 	var getSting = JSON.stringify(jsonArray);
 	return getSting ;
 }else{
 	jsonArray = [jsonArray]
 	var getSting = JSON.stringify(jsonArray);
 	return getSting ;
    }
}
function QueryBuilder() {
    this.build = function(elementKey, elementValue, elementOperator) {
        if(elementKey != null && elementValue != null && elementValue != null){
            elementKey = elementKey.trim();
            elementOperator = elementOperator.trim();
        }
       
		
		if(elementValue instanceof Array){
			elementValue = JSON.stringify(elementValue)
		}
		
		if(elementValue instanceof Date){
			var CDate = new Date(elementValue);
			elementValue = CDate
			console.log(elementValue)
		}
		
        var buildObj = [];
        var buildElement = {
            key: elementKey, 
            operator: elementOperator, 
            value:elementValue
        }
        buildObj.push(buildElement);
        return buildObj ;
    };
	
	this.setLoggedInUser = function(logged) {
        if(logged != null){
            logged = logged.trim();
            
        }
        if(logged == ""  || logged == null){
            App42Fault.throwExceptionIfNullOrBlank(logged, "logged")
            return ;
        }
        var buildObj = [];
        var buildElement = {
            key: "_$owner.owner", 
            operator: Operator.EQUALS, 
            value:logged
        }
        buildObj.push(buildElement);
        return buildObj ;
    };
	
	
    this.buildGeoQuery = function(geoTag, elementOperator,maxDistance) {
	checkGeoOperatorType(elementOperator)
        var buildObj = [];
        var buildElement = {
            lat: geoTag.getLat(), 
            lng: geoTag.getLng(), 
			operator: elementOperator, 
            maxDistance: maxDistance
        }
		
        buildObj.push(buildElement);
		
        return buildObj ;
    };
	
	
    this.compoundOperator = function(query1, operator, query2) {
        var compoundObj = []; 
        var compoundString = {
            compoundOpt: operator 
        }
        for(var i=0; i<query1.length;i++){
            compoundObj.push(query1[i]) 
        }
        compoundObj.push(compoundString)
        for(var j=0; j<query2.length;j++){
            compoundObj.push(query2[j]) 
        }
        return compoundObj;
    };
	
}
exports.QueryBuilder = QueryBuilder;
exports.Operator = Operator;
exports.getStr = getStr;
exports.GeoOperator = GeoOperator;
