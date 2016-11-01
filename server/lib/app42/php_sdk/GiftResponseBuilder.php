<?php
include_once "JSONObject.php";
include_once "Gift.php";
include_once "App42ResponseBuilder.php";
/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of GiftResponseBuilder
 *
 * @author PRAVIN
 */
class GiftResponseBuilder extends App42ResponseBuilder {

    function buildResponse($json) {
        $giftObj = new Gift();
        $giftObj->setStrResponse($json);
        $giftObj->setResponseSuccess($this->isRespponseSuccess($json));
        $giftsJSONObj = $this->getServiceJSONObject("gifts", $json);
        if ($giftsJSONObj->has("gift")) {
            if ($giftsJSONObj->__get("gift") instanceof JSONObject) {

                $giftJSONObject = $giftsJSONObj->__get("gift");
                $this->buildObjectFromJSONTree($giftObj, $giftJSONObject);
                if ($giftJSONObject->has("requests")) {
                    if ($giftJSONObject->__get("requests") instanceof JSONObject) {

                        $jsonObjGiftRequest = $giftJSONObject->__get("requests");
                      
                        $requestObj = new Requests($giftObj);
                        $this->buildObjectFromJSONTree($requestObj, $jsonObjGiftRequest);
                    } else {
                        $jsonObjRequestArray = $giftJSONObject->getJSONArray("requests");
                      for ($i = 0; $i < count($jsonObjRequestArray); $i++) {
                            // Get Individual Attribute Node and set it into Object
                            $jsonObjGiftRequest = $jsonObjRequestArray[$i];
                            $photoJSONObj = new JSONObject($jsonObjGiftRequest);
                            $requestObject = new Requests($giftObj);
                           $this->buildObjectFromJSONTree($requestObject, $photoJSONObj);
                        }
                    }
                }
            }
        }
        return $giftObj;
    }
    
    function buildArrayResponse($json) {
        $giftsJSONObj = $this->getServiceJSONObject("gifts", $json);
        $giftList = array();
        if ($giftsJSONObj->__get("gift") instanceof JSONObject) {

            $giftJSONObj = $giftsJSONObj->__get("gift");
            $giftObj = new Gift();
            $this->buildObjectFromJSONTree($giftObj, $giftJSONObj);     
            $giftObj->setStrResponse($json);
            $giftObj->setResponseSuccess($this->isRespponseSuccess($json));
            array_push($giftList, $giftObj);
        } else {
            $giftJSONArray = $giftsJSONObj->getJSONArray("gift");
            for ($i = 0; $i < count($giftJSONArray); $i++) {
                $giftJSONObj = $giftJSONArray[$i];
                $gift = new Gift();
                $gift->setStrResponse($json);
                $gift->setResponseSuccess($this->isRespponseSuccess($json));
                 $giftJSONObject = new JSONObject($giftJSONObj);
                $this->buildObjectFromJSONTree($gift, $giftJSONObject);                
                array_push($giftList, $gift);
            }
        }
        return $giftList;
    }

}

?>