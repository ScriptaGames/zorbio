<?php

include_once "JSONObject.php";
include_once "session.php";
include_once "App42ResponseBuilder.php";

/**
 *
 * SessionResponseBuilder class converts the JSON response retrieved from the
 * server to the value object i.e Session
 *
 */
class SessionResponseBuilder extends App42ResponseBuilder {

    /**
     * Converts the response in JSON format to the value object i.e Session
     *
     * @param json
     *            - response in JSON format
     *
     * @return Session object filled with json data
     *
     */
    public function buildResponse($json) {
        $sessionObj = new Session();
        $attributeList = array();
        $sessionObj->setAttributeList($attributeList);
        $sessionObj->setStrResponse($json);
        $jsonObj = new JSONObject($json);
        $jsonObjApp42 = $jsonObj->__get("app42");
        $jsonObjResponse = $jsonObjApp42->__get("response");
        $sessionObj->setResponseSuccess($jsonObjResponse->__get("success"));
        $jsonObjSession = $jsonObjResponse->__get("session");

        $this->buildObjectFromJSONTree($sessionObj, $jsonObjSession);
        if (!$jsonObjSession->has("attributes"))
            return $sessionObj;
        $jsonObjAttributes = $jsonObjSession->__get("attributes");

        if (!$jsonObjAttributes->has("attribute"))
            return $sessionObj;

        if ($jsonObjAttributes->__get("attribute") instanceof JSONObject) {
            // Only One attribute is there
            $jsonObjAttribute = $jsonObjAttributes->__get("attribute");
            $attribute = new Attribute($sessionObj);
            $this->buildObjectFromJSONTree($attribute, $jsonObjAttribute);
        } else {
            // There is an Array of attribute
            $jsonObjAttributeArray = $jsonObjAttributes->getJSONArray("attribute");
            for ($i = 0; $i < count($jsonObjAttributeArray); $i++) {
                //Get Individual Attribute Node and set it into Object
                $jsonObjAttribute = $jsonObjAttributeArray[$i];
                $attribute = new Attribute($sessionObj);
                $jsonObjAttribute = new JSONObject($jsonObjAttribute);
                $this->buildObjectFromJSONTree($attribute, $jsonObjAttribute);
            }
        }

        return $sessionObj;
    }

}
?>