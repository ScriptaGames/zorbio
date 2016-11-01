<?php
include_once "Logging.php";
include_once "JSONObject.php";
include_once "session.php";
include_once "App42ResponseBuilder.php";


/**
 *
 * LogResponseBuilder class converts the JSON response retrieved from the server
 * to the value object i.e Log
 *
 */
class LogResponseBuilder extends App42ResponseBuilder {

    /**
     * Converts the response in JSON format to the value object i.e Log
     *
     * @param json
     *            - response in JSON format
     *
     * @return Log object filled with json data
     *
     */
    function buildResponse($json) {
        $logObj = new Logging();
        $msgList = array();
        $logObj->setMessageList($msgList);
        $logObj->setStrResponse($json);
        $jsonObj = new JSONObject($json);
        $jsonObjApp42 = $jsonObj->__get("app42");
        $jsonObjResponse = $jsonObjApp42->__get("response");
        $logObj->setResponseSuccess($jsonObjResponse->__get("success"));
        $jsonObjLog = $jsonObjResponse->__get("logs");

        if (!$jsonObjLog->has("log"))
            return $logObj;

        if ($jsonObjLog->__get("log") instanceof JSONObject) {
            // Only One attribute is there
            $jsonObjLogMessage = $jsonObjLog->__get("log");
            $messageItem = new Message($logObj);
            $this->buildObjectFromJSONTree($messageItem, $jsonObjLogMessage);
        } else {
            // There is an Array of attribute
            $jsonObjMessageArray = $jsonObjLog->getJSONArray("log");
            for ($i = 0; $i < count($jsonObjMessageArray); $i++) {
                // Get Individual Attribute Node and set it into Object
                $jsonObjLogMessage = $jsonObjMessageArray[$i];
                $messageItem = new Message($logObj);
                $jsonObjLogMessage = new JSONObject($jsonObjLogMessage);
                $this->buildObjectFromJSONTree($messageItem, $jsonObjLogMessage);
            }
        }

        return $logObj;
    }

}
?>