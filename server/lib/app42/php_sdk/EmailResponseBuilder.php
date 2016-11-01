<?php

include_once "JSONObject.php";
include_once "session.php";
include_once "App42ResponseBuilder.php";
include_once "Email.php";

/**
 *
 * EmailResponseBuilder class converts the JSON response retrieved from the
 * server to the value object i.e Email
 *
 */
class EmailResponseBuilder extends App42ResponseBuilder {

    /**
     * Converts the response in JSON format to the value object i.e Email
     *
     * @params json
     *            - response in JSON format
     *
     * @return Email object filled with json data
     *
     */
    function buildResponse($json) {

        $emailObj = new Email();
        $configList = array();
        $emailObj->setConfigList($configList);

        $emailObj->setStrResponse($json);
        $jsonObj = new JSONObject($json);
        $jsonObjApp42 = $jsonObj->__get("app42");
        $jsonObjResponse = $jsonObjApp42->__get("response");
        $emailObj->setResponseSuccess($jsonObjResponse->__get("success"));
        $jsonObjEmail = $jsonObjResponse->__get("email");

        $this->buildObjectFromJSONTree($emailObj, $jsonObjEmail);

        if (!$jsonObjEmail->has("configurations"))
            return $emailObj;

        $jsonEmailConfig = $jsonObjEmail->__get("configurations");

        if (!$jsonEmailConfig->has("config"))
            return $emailObj;

        if ($jsonEmailConfig->__get("config") instanceof JSONObject) {
            // Only One attribute is there
            $jsonObjConfig = $jsonEmailConfig->__get("config");
            $configItem = new Configuration($emailObj);
            $this->buildObjectFromJSONTree($configItem, $jsonObjConfig);
        } else {
            // There is an Array of attribute
            $jsonObjConfigArray = $jsonEmailConfig->getJSONArray("config");
            for ($i = 0; $i < count($jsonObjConfigArray); $i++) {
                // Get Individual Attribute Node and set it into Object
                $jsonObjConfigs = $jsonObjConfigArray[$i];
                $configItem = new Configuration($emailObj);
                $jsonObjConfig = new JSONObject($jsonObjConfigs);
                $this->buildObjectFromJSONTree($configItem, $jsonObjConfig);
            }
        }

        return $emailObj;
    }

}
?>