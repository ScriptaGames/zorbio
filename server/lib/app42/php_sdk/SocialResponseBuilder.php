<?php

include_once "JSONObject.php";
include_once "Social.php";
include_once "App42ResponseBuilder.php";

/**
 *
 * SocialResponseBuilder class converts the JSON response retrieved from the
 * server to the value object i.e Social
 *
 */
class SocialResponseBuilder extends App42ResponseBuilder {

    /**
     * Converts the response in JSON format to the value object i.e Social
     *
     * @param json
     *            - response in JSON format
     *
     * @return Social object filled with json data
     *
     */
    public function buildResponse($json) {
        $slJSONObject = $this->getServiceJSONObject("social", $json);
        $sl = new Social();
        $sl->setStrResponse($json);
        $sl->setResponseSuccess($this->isRespponseSuccess($json));
        $this->buildObjectFromJSONTree($sl, $slJSONObject);
        if ($slJSONObject->has("friends")) {
            if ($slJSONObject->__get("friends") instanceof JSONObject) {
                $friendJSONObj = $slJSONObject->__get("friends");
                $friends = new Friends($sl);
                $this->buildJsonFriends($friends, $friendJSONObj);
            } else {
                // There is an Array of attribute
                $friendsJSONArray = $slJSONObject->getJSONArray("friends");
                for ($i = 0; $i < count($friendsJSONArray); $i++) {
                    $friendJSONObj = $friendsJSONArray[$i];
                    $friends = new Friends($sl);
                    $this->buildJsonFriends($friends, $friendJSONObj);
                }
            }
        }
        if ($slJSONObject->has("profile")) {
            if ($slJSONObject->__get("profile") instanceof JSONObject) {
                $publicJSONObject = $slJSONObject->__get("profile");
                $publicfriend = new PublicProfile($sl);
                $this->buildJsonPublicProfile($publicfriend, $publicJSONObject);
            } else {
                // There is an Array of attribute
                $profileJSONArray = $slJSONObject->getJSONArray("profile");
                for ($i = 0; $i < count($profileJSONArray); $i++) {
                    $profileJSONObj = $profileJSONArray[$i];
                    $publicfriends = new PublicProfile($sl);
                    $this->buildJsonPublicProfile($publicfriends, $profileJSONObj);
                }
            }
        }
        if ($slJSONObject->has("me")) {
            if ($slJSONObject->__get("me") instanceof JSONObject) {
                $meJSONObj = $slJSONObject->__get("me");
                $me = new SocialFacebookProfile($sl);
                $this->buildJsonFacebookProfile($me, $meJSONObj);
            }
        }
        
         if ($slJSONObject->has("facebookProfile")) {
            if ($slJSONObject->__get("facebookProfile") instanceof JSONObject) {
                $meJSONObj = $slJSONObject->__get("facebookProfile");
                $me = new SocialFacebookProfile($sl);
                $this->buildJsonFacebookProfileLink($me, $meJSONObj);
            }
        }
        return $sl;
    }

    function buildJsonFriends($friends, $friendJSONObj) {
        $jsonObjFriends = new JSONObject($friendJSONObj);
        if ($jsonObjFriends->has("id") && $jsonObjFriends->__get("id") != null) {
            $friends->setId($jsonObjFriends->__get("id"));
            $friends->setName($jsonObjFriends->__get("name"));
            $friends->setPicture($jsonObjFriends->__get("picture"));
            $friends->setInstalled($jsonObjFriends->__get("installed"));
        }
    }

    function buildJsonPublicProfile($friends, $friendJSONObj) {
        $jsonObjFriends = new JSONObject($friendJSONObj);
        if ($jsonObjFriends->has("id") && $jsonObjFriends->__get("id") != null) {

            $friends->setId($jsonObjFriends->__get("id"));
            $friends->setName($jsonObjFriends->__get("name"));
            $friends->setPicture($jsonObjFriends->__get("picture"));
        }
    }

    function buildJsonFacebookProfile($me, $friendJSONObj) {
        $jsonObjMe = new JSONObject($friendJSONObj);
        if ($jsonObjMe->has("id") && $jsonObjMe->__get("id") != null) {
            $me->setId($jsonObjMe->__get("id"));
            $me->setName($jsonObjMe->__get("name"));
            $me->setPicture($jsonObjMe->__get("picture"));
        }
    }
     function buildJsonFacebookProfileLink($me, $friendJSONObj) {
        $jsonObjMe = new JSONObject($friendJSONObj);
        if ($jsonObjMe->has("id") && $jsonObjMe->__get("id") != null) {
            $me->setId($jsonObjMe->__get("id"));
            $me->setName($jsonObjMe->__get("name"));
            $me->setPicture($jsonObjMe->__get("picture"));
            $me->setFirstName($jsonObjMe->__get("firstName"));
            $me->setLastName($jsonObjMe->__get("lastName"));
            $me->setGender($jsonObjMe->__get("gender"));
            $me->setLink($jsonObjMe->__get("link"));            
            $me->setLocale($jsonObjMe->__get("locale"));                      
            $me->setUserName($jsonObjMe->__get("username"));
        }
    }

}
?>