<?php

include_once "JSONObject.php";
include_once "App42ResponseBuilder.php";
include_once "PushNotification.php";

class PushNotificationResponseBuilder extends App42ResponseBuilder {

    function buildResponse($json) {

        $pushObj = new PushNotification();
        $channelList = array();
        $pushObj->setChannelList($channelList);
        $pushObj->setStrResponse($json);
        $jsonObj = new JSONObject($json);
        $jsonObjApp42 = $jsonObj->__get("app42");
        $jsonObjResponse = $jsonObjApp42->__get("response");
        $pushObj->setResponseSuccess($jsonObjResponse->__get("success"));
        $jsonObjPush = $jsonObjResponse->__get("push");

        $this->buildObjectFromJSONTree($pushObj, $jsonObjPush);

        if (!$jsonObjPush->has("channels"))
            return $pushObj;

        $jsonPushChannels = $jsonObjPush->__get("channels");

        if (!$jsonPushChannels->has("channel"))
            return $pushObj;

        if ($jsonPushChannels->__get("channel") instanceof JSONObject) {
            // Only One attribute is there
            $jsonObjchannel = $jsonPushChannels->__get("channel");
            $channelList = new Channel($pushObj);
            $this->buildObjectFromJSONTree($channelList, $jsonObjchannel);
        } else {
            // There is an Array of attribute
            $jsonObjChanelArray = $jsonPushChannels->getJSONArray("channel");
            for ($i = 0; $i < count($jsonObjChanelArray); $i++) {
                // Get Individual Attribute Node and set it into Object
                $jsonObjChannelLi = $jsonObjChanelArray[$i];
                $channelList1 = new Channel($pushObj);
                $jsonObjChann = new JSONObject($jsonObjChannelLi);
                $this->buildObjectFromJSONTree($channelList1, $jsonObjChann);
            }
        }

        return $pushObj;
    }

    function buildArrayResponse($json) {
        $pushListObject = array();
        $channelList = array();
        $jsonObj = new JSONObject($json);
        $jsonObjApp42 = $jsonObj->__get("app42");
        $jsonObjResponse = $jsonObjApp42->__get("response");
        $jsonObjPush = $jsonObjResponse->__get("push");
        if ($jsonObjPush instanceof JSONObject) {
            $pushObj = new PushNotification();
            $pushObj->setChannelList($channelList);
            $this->buildObjectFromJSONTree($pushObj, $jsonObjPush);
            if ($jsonObjPush->has("channels")) {

                $jsonPushChannels = $jsonObjPush->__get("channels");

                if ($jsonPushChannels->__get("channel") instanceof JSONObject) {
                    // Only One attribute is there
                    $jsonObjchannel = $jsonPushChannels->__get("channel");
                    $channelList1 = new Channel($pushObj);
                    $this->buildObjectFromJSONTree($channelList1, $jsonObjchannel);
                } else {
                    // There is an Array of attribute
                    $jsonObjChanelArray = $jsonPushChannels->getJSONArray("channel");
                    for ($i = 0; $i < count($jsonObjChanelArray); $i++) {
                        // Get Individual Attribute Node and set it into Object
                        $jsonObjChannelLi = $jsonObjChanelArray[$i];
                        $channelListObj = new Channel($pushObj);
                        $jsonObjChann = new JSONObject($jsonObjChannelLi);
                        $this->buildObjectFromJSONTree($channelListObj, $jsonObjChann);
                    }
                }
            }
            $pushObj->setStrResponse($json);
            $pushObj->setResponseSuccess($this->isRespponseSuccess($json));
            array_push($pushListObject, $pushObj);
        }
        else {
                
                $pushJSONArray = $jsonObjResponse->getJSONArray("push");
                for ($i = 0; $i < count($pushJSONArray); $i++) {
                    $pushObject = new PushNotification();
                    $pushObject->setChannelList($channelList);
                    $pushJSONObj = $pushJSONArray[$i];
                    $pushJSONObject = new JSONObject($pushJSONObj);
                    $this->buildObjectFromJSONTree($pushObject, $pushJSONObject);
                    
                      if ($pushJSONObject->has("channels")) {
                     $jsonPushChannelss = $pushJSONObject->__get("channels");

                    if ($jsonPushChannelss->has("channel")) {
                    if ($jsonPushChannelss->__get("channel") instanceof JSONObject) {
                        // Only One attribute is there
                        $jsonObjchannelA = $jsonPushChannelss->__get("channel");
                        $channelListObject = new Channel($pushObject);
                        $this->buildObjectFromJSONTree($channelListObject, $jsonObjchannelA);
                    } else {
                        // There is an Array of attribute
                        $jsonObjChanelArray = $jsonPushChannelss->getJSONArray("channel");
                        for ($i = 0; $i < count($jsonObjChanelArray); $i++) {
                            // Get Individual Attribute Node and set it into Object
                            $jsonObjChannelList = $jsonObjChanelArray[$i];
                            $channelList2 = new Channel($pushObject);
                            $jsonObjChannel = new JSONObject($jsonObjChannelList);
                            $this->buildObjectFromJSONTree($channelList2, $jsonObjChannel);
                         //   $pushObj->setChannelList($channelList);
                        }
                       
                    }
                    }
                      }
                     $pushObject->setStrResponse($json);
                    $pushObject->setResponseSuccess($this->isRespponseSuccess($json));
                    array_push($pushListObject, $pushObject);
                }
              
            }
        return $pushListObject;
    }

}

?>