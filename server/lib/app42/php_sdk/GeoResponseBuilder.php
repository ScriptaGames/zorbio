<?php

include_once "JSONObject.php";
include_once "App42ResponseBuilder.php";
include_once "Geo.php";

/**
 *
 * GeoResponseBuilder class converts the JSON response retrieved from the server
 * to the value object i.e Geo
 *
 */
class GeoResponseBuilder extends App42ResponseBuilder {

    /**
     * Converts the response in JSON format to the value object i.e Geo
     *
     * @param json
     *            - response in JSON format
     *
     * @return Geo object filled with json data
     *
     */
    function buildResponse($json) {
        $geoObj = new Geo();
        $pointList = array();
        $geoObj->setPointList($pointList);

        $geoObj->setStrResponse($json);
        $jsonObj = new JSONObject($json);
        $jsonObjApp42 = $jsonObj->__get("app42");
        $jsonObjResponse = $jsonObjApp42->__get("response");
        $geoObj->setResponseSuccess($jsonObjResponse->__get("success"));
        $jsonObjGeoStorage = $jsonObjResponse->__get("geo")->__get("storage");

        $this->buildObjectFromJSONTree($geoObj, $jsonObjGeoStorage);

        if (!$jsonObjGeoStorage->has("points"))
            return $geoObj;

        $this->buildInternalObj($geoObj, $jsonObjGeoStorage);

        return $geoObj;
    }

    /**
     * Converts the response in JSON format to the list of value objects i.e Geo
     *
     * @param json
     *            - response in JSON format
     *
     * @return List of Geo Points object filled with json data
     *
     */
    public function buildArrayResponse($json) {
        $geoObjList = array();

        $jsonObj = new JSONObject($json);
        $jsonObjApp42 = $jsonObj->__get("app42");
        $jsonObjResponse = $jsonObjApp42->__get("response");

        $jsonObjGeoStorage = $jsonObjResponse->__get("geo");
        if ($jsonObjGeoStorage->__get("storage") instanceof JSONObject) {
            //Single Item
            $jsonObjGeoStorage = $jsonObjGeoStorage->__get("storage");
            $geoObj = new Geo();
            $pointList = array();
            $geoObj->setPointList($pointList);
            $geoObj->setStrResponse($json);
            $geoObj->setResponseSuccess($jsonObjResponse->__get("success"));

            $this->buildObjectFromJSONTree($geoObj, $jsonObjGeoStorage);
            array_push($geoObjList, $geoObj);
            if ($jsonObjGeoStorage->has("points"))
                $this->buildInternalObj($geoObj, $jsonObjGeoStorage);
        } else {
            //Multiple Item
            $jsonStorageArray = $jsonObjGeoStorage->getJSONArray("storage");
            for ($i = 0; $i < count($jsonStorageArray); $i++) {

                $jsonObjStorage = $jsonStorageArray[$i];
                $geoObj = new Geo();
                $pointList = array();
                $geoObj->setPointList($pointList);
                $geoObj->setStrResponse($json);
                $geoObj->setResponseSuccess($jsonObjResponse->__get("success"));
                $jsonObjStorage = new JSONObject($jsonObjStorage);
                $this->buildObjectFromJSONTree($geoObj, $jsonObjStorage);
                array_push($geoObjList, $geoObj);

                if ($jsonObjStorage->has("points"))
                    $this->buildInternalObj($geoObj, $jsonObjStorage);
            }
        }
        return $geoObjList;
    }

    /**
     * Converts the Geo JSON object to the value object i.e Geo
     *
     * @param jsonObjGeoStorage
     *            - geo data as JSONObject
     * @param geoObj
     *            - new geo object
     *
     * @return Geo object filled with json data
     *
     */
    private function buildInternalObj($geoObj, $jsonObjGeoStorage) {

        $jsonGeoPoints = $jsonObjGeoStorage->__get("points");

        if (!$jsonGeoPoints->has("point"))
            return $geoObj;

        if ($jsonGeoPoints->__get("point") instanceof JSONObject) {
            // Only One attribute is there
            $jsonObjPoint = $jsonGeoPoints->__get("point");
            $pointsItem = new Point($geoObj);
            $this->buildObjectFromJSONTree($pointsItem, $jsonObjPoint);
        } else {
            // There is an Array of attribute
            $jsonObjPointsArray = $jsonGeoPoints->getJSONArray("point");
            for ($i = 0; $i < count($jsonObjPointsArray); $i++) {
                // Get Individual Attribute Node and set it into Object
                $jsonObjPoint = $jsonObjPointsArray[$i];
                $pointsItem = new Point($geoObj);
                $jsonObjPoint = new JSONObject($jsonObjPoint);
                $this->buildObjectFromJSONTree($pointsItem, $jsonObjPoint);
            }
        }
        return $geoObj;
    }

}
?>