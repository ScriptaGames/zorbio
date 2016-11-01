<?php
/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

include_once "JSONObject.php";
include_once "Buddy.php";
include_once "App42ResponseBuilder.php";

/**
 *
 * UserResponseBuilder class converts the JSON response retrieved from the
 * server to the value object i.e User
 *
 */
class BuddyResponseBuilder extends App42ResponseBuilder {

    /**
     * Converts the response in JSON format to the value object i.e User
     *
     * @params json
     *            - response in JSON format
     *
     * @return User object filled with json data
     *
     */
    public function buildResponse($json) {
            $buddysJSONObj = $this->getServiceJSONObject("buddies", $json);
        $buddyJSONObject = $buddysJSONObj->__get("buddy");
        $buddy = $this->buildBuddyObject($buddyJSONObject);
        $buddy->setStrResponse($json);
        $buddy->setResponseSuccess($this->isRespponseSuccess($json));
        return $buddy;
    }

 
    private function buildBuddyObject($jsonObject) {
        $buddy = new Buddy();
          $buddysPointObj = new JSONObject($jsonObject);
         $this->buildObjectFromJSONTree($buddy, $buddysPointObj);
        if ($buddysPointObj->has("points") && $buddysPointObj->__get("points")->has("point")) {
            // Fetch Items
            if ($buddysPointObj->__get("points")->__get("point") instanceof JSONObject) {
                $pointJSONObj = $buddysPointObj->__get("points")->__get("point");
                $point = new BuddyPoint($buddy);
              
                $this->buildObjectFromJSONTree($point, $pointJSONObj);
                
                //print_r($point);
            } else {
                //Multiple Items
                $pointJSONArray = $buddysPointObj->__get("points")->getJSONArray("point");
                for ($i = 0; $i < count($pointJSONArray); $i++) {
                    $pointObj = $pointJSONArray[$i];
                    $point = new BuddyPoint($buddy);
                    $pointJSONObject = new JSONObject($pointObj);
                    $this->buildObjectFromJSONTree($point, $pointJSONObject);
                }
            }
        }
       
         return $buddy;
    }

      public function buildArrayResponse($json) {
        $buddysJSONObj = $this->getServiceJSONObject("buddies", $json);
        $buddyJSONArray = $buddysJSONObj->getJSONArray("buddy");
        $buddyList = array();

        if ($buddyJSONArray instanceof JSONObject) {
            $buddyJSONObject = new JSONObject($buddyJSONArray);
            $buddy = $this->buildBuddyObject($buddyJSONObject);
            $buddy->setStrResponse($json);
            $buddy->setResponseSuccess($this->isRespponseSuccess($json));
            array_push($buddyList, $buddy);
        } else {
            for ($i = 0; $i < count($buddyJSONArray); $i++) {
                $buddyJSONObjectArray = $buddyJSONArray[$i];
                $buddyJSONObject1 = new JSONObject($buddyJSONObjectArray);
                $buddy = $this->buildBuddyObject($buddyJSONObject1);
                $this->buildObjectFromJSONTree($buddy, $buddyJSONObject1);
                $buddy->setStrResponse($json);
                $buddy->setResponseSuccess($this->isRespponseSuccess($json));
                array_push($buddyList, $buddy);
            }
        }
        return $buddyList;
    }
}
?>
