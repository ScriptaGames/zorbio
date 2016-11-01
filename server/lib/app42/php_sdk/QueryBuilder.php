<?php

include_once "JSONObject.php";
include_once "Query.php";
include_once 'App42Exception.php';
include_once 'Util.php';

class Operator {
    const EQUALS = "\$eq";
    const NOT_EQUALS = "\$ne";
    const GREATER_THAN = "\$gt";
    const LESS_THAN = "\$lt";
    const GREATER_THAN_EQUALTO = "\$gte";
    const LESS_THAN_EQUALTO = "\$lte";
    const LIKE = "\$lk";
    const ANDop = "\$and";
    const ORop = "\$or";
    const INLIST="\$in";
    public function enum($string) {
        return constant('Operator::' . $string);
    }

    public function isAvailable($string) {
        if ($string == "\$eq")
            return "\$eq";
        else if ($string == "\$ne")
            return "\$ne";
        else if ($string == "\$gt")
            return "\$gt";
        else if ($string == "\$lt")
            return "\$lt";
        else if ($string == "\$gte")
            return "\$gte";
        else if ($string == "\$lte")
            return "\$lte";
        else if ($string == "\$lk")
            return "\$lk";
        else if ($string == "\$and")
            return "\$and";
        else if ($string == "\$or")
            return "\$or";
         else if ($string == "\$in")
            return "\$in";
        else
            return "null";
    }

}

class GeoOperator {
 const NEAR = "\$near";
    const WITHIN = "\$within";
      public function enum($string) {
        return constant('GeoOperator::' . $string);
    }
    public function isAvailable($string) {
        if ($string == "\$near")
            return "\$near";
        else if ($string == "\$within")
            return "\$within";
        else
            return "null";
    }
}

class QueryBuilder {

    public function build($key, $value, $op) {

        Util::throwExceptionIfNullOrBlank($key, "Key");
      //Util::throwExceptionIfNullOrBlank($value, "Value");
        Util::throwExceptionIfNullOrBlank($op, "Operator");
        try {
            $operatorObj = new Operator();
            if ($operatorObj->isAvailable($op) == "null") {
                throw new App42Exception("The Operator with type '$op' does not Exist ");
            }

            $jsonObj = new JSONObject();
            $jsonObj->value = $value;
            $jsonObj->operator = $op;
            $jsonObj->key = $key;
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $jsonObj;
    }

    	public static function setLoggedInUser($logged) {
		Util::throwExceptionIfNullOrBlank($logged, "logged");
		$query = array();
                $objectArray = array();
		try{
           $params = null;
			$jsonObj = new JSONObject();
			$jsonObj->put("key", "_\$owner.owner");
			$jsonObj->put("value", $logged);
			$jsonObj->put("operator", Operator::EQUALS);
                        array_push($query, $jsonObj);
		}
		catch (Exception $e) {
			throw	new App42Exception($e);
		}
		return $query;
    }
    
    public static function setCreatedOn($date, $op) {
		Util::throwExceptionIfNullOrBlank($date, "date");
		$query = array();
                $objectArray = array();
		try{
                        $params = null;
			$jsonObj = new JSONObject();
			$jsonObj->put("key", "_\$createdAt");
			$jsonObj->put("value", $date);
			$jsonObj->put("operator", $op);
                        array_push($query, $jsonObj);
		}
		catch (Exception $e) {
			throw	new App42Exception($e);
		}
		return $query;
    }

  public static function setUpdatedOn($date, $op) {
		Util::throwExceptionIfNullOrBlank($date, "date");
		$query = array();
                $objectArray = array();
		try{
                        $params = null;
			$jsonObj = new JSONObject();
			$jsonObj->put("key", "_\$updatedAt");
			$jsonObj->put("value", $date);
			$jsonObj->put("operator", $op);
                        array_push($query, $jsonObj);
		}
		catch (Exception $e) {
			throw	new App42Exception($e);
		}
		return $query;
    }
       public static function setDocumentId($docid) {
		Util::throwExceptionIfNullOrBlank($docid, "docid");
		$query = array();
                $objectArray = array();
		try{
                        $params = null;
			$jsonObj = new JSONObject();
			$jsonObj->put("key", "_id");
			$jsonObj->put("value", $docid);
			$jsonObj->put("operator", Operator::EQUALS);
                        array_push($query, $jsonObj);
		}
		catch (Exception $e) {
			throw	new App42Exception($e);
		}
		return $query;
    }
    public function compoundOperator($q1, $op, $q2) {
        Util::throwExceptionIfNullOrBlank($q1, "Query");
        Util::throwExceptionIfNullOrBlank($q2, "Query");
        Util::throwExceptionIfNullOrBlank($op, "Operator");
        try {
            $operatorObj = new Operator();
            if ($operatorObj->isAvailable($op) == "null") {
                throw new App42Exception("The Operator with type '$op' does not Exist ");
            }

            $array = array();
            if ($q1 instanceof JSONObject) {
                array_push($array, $q1);
            } else {
                array_push($array, $q1);
            }
            $jsonObj1 = new JSONObject();
            $jsonObj1->compoundOpt = $op;
            array_push($array, $jsonObj1);
            if ($q2 instanceof JSONObject) {
                array_push($array, $q2);
            } else {
                array_push($array, $q2);
            }
          } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $array;
    }



      public function buildGeoQuery(GeoTag $geoTag, $op, $maxDistance) {
        Util::throwExceptionIfNullOrBlank($op, "Operator");
        try {
            $operatorObj = new GeoOperator();
            if ($operatorObj->isAvailable($op) == "null") {
                throw new App42Exception("The Operator with type '$op' does not Exist ");
            }
                        $location = $geoTag->getJSONObject();
                        $jsonObj = new JSONObject();
                        $jsonObj->lat = $location->__get("lat");
                        $jsonObj->lng = $location->__get("lng");
                        $jsonObj->operator = $op;
                        $jsonObj->maxDistance = $maxDistance;

        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $jsonObj;
    }


}
?>
