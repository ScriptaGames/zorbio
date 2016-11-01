<?php

include_once "JSONObject.php";
include_once "Review.php";
include_once "App42ResponseBuilder.php";

/**
 *
 * ReviewResponseBuilder class converts the JSON response retrieved from the
 * server to the value object i.e Review
 *
 */
class ReviewResponseBuilder extends App42ResponseBuilder {

    /**
     * Converts the response in JSON format to the value object i.e Review
     *
     * @param json
     *            - response in JSON format
     *
     * @return Review object filled with json data
     *
     */
    function buildResponse($json) {

        $reviewsJSONObject = $this->getServiceJSONObject("reviews", $json);
        $reviewJSONObject = $reviewsJSONObject->__get("review");
        $reviewObj = new Review();
        //$attributeList = array();
        $reviewObj->setStrResponse($json);
        $reviewObj->setResponseSuccess($this->isRespponseSuccess($json));
        $this->buildObjectFromJSONTree($reviewObj, $reviewJSONObject);

        return $reviewObj;
    }

    /**
     * Converts the response in JSON format to the list of value objects i.e
     * Review
     *
     * @param json
     *            - response in JSON format
     *
     * @return List of Review object filled with json data
     *
     */
    function buildArrayResponse($json) {

        $reviewList = array();
        $reviewsJSONObject = $this->getServiceJSONObject("reviews", $json);
        if ($reviewsJSONObject->__get("review") instanceof JSONObject) {
            $reviewJSONObject = $reviewsJSONObject->__get("review");
            $reviewJSONObject = new JSONObject($reviewJSONObject);
            $reviewObj = new Review();
            $reviewObj->setStrResponse($json);
            $reviewObj->setResponseSuccess($this->isRespponseSuccess($json));
            $this->buildObjectFromJSONTree($reviewObj, $reviewJSONObject);
            array_push($reviewList, $reviewObj);
        } else {
            // There is an Array of attribute
            $reviewJSONArray = $reviewsJSONObject->getJSONArray("review");
            for ($i = 0; $i < count($reviewJSONArray); $i++) {
                $reviewJSONObj = $reviewJSONArray[$i];
                $reviewObj = new Review();
                $reviewObj->setStrResponse($json);
                $reviewJSONObj = new JSONObject($reviewJSONObj);
                $reviewObj->setResponseSuccess($this->isRespponseSuccess($json));
                $this->buildObjectFromJSONTree($reviewObj, $reviewJSONObj);
                array_push($reviewList, $reviewObj);
            }
        }

        return $reviewList;
    }

}
?>