<?php

include_once "JSONObject.php";
include_once "User.php";
include_once "App42ResponseBuilder.php";

/**
 *
 * UserResponseBuilder class converts the JSON response retrieved from the
 * server to the value object i.e User
 *
 */
class UserResponseBuilder extends App42ResponseBuilder {

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
        $usersJSONObj = $this->getServiceJSONObject("users", $json);
        $userJSOnObj = $usersJSONObj->__get("user");
        $user = $this->buildUserObject($userJSOnObj);
        $user->setStrResponse($json);
        $user->setResponseSuccess($this->isRespponseSuccess($json));
        return $user;
    }

    /**
     * Converts the User JSON object to the value object i.e User
     *
     * @param userJSONObj
     *            - user data as JSONObject
     *
     * @return User object filled with json data
     *
     */
    private function buildUserObject($userJSONObj) {
        $user = new User();
        $this->buildObjectFromJSONTree($user, $userJSONObj);
        if ($userJSONObj->has("profile")) {
            $profileJSONObj = $userJSONObj->__get("profile");
            $profile = new Profile($user);
            $this->buildObjectFromJSONTree($profile, $profileJSONObj);
        }
        if ($userJSONObj->has("jsonDoc")) {
            if ($userJSONObj->__get("jsonDoc") instanceof JSONObject) {
                // Only One attribute is there
                $jsonObjDoc = $userJSONObj->__get("jsonDoc");
                $document = new UserJSONDocument($user);
                $this->buildJsonDocument($document, $jsonObjDoc);
            } else {
                // There is an Array of attribute
                $jsonObjDocArray = $userJSONObj->getJSONArray("jsonDoc");
                for ($i = 0; $i < count($jsonObjDocArray); $i++) {
                    // Get Individual Attribute Node and set it into Object
                    $jsonObjDoc = $jsonObjDocArray[$i];
                    $document = new UserJSONDocument($user);
                    //$jsonObjDoc = new JSONObject($jsonObjDoc);
                    $this->buildJsonDocument($document, $jsonObjDoc);
                }
            }
        }
        if ($userJSONObj->has("role")) {
            $roleList = array();
            if (is_array($userJSONObj->__get("role"))) {
                $roleArr = $userJSONObj->getJSONArray("role");
                $user->setRoleList($userJSONObj->getJSONArray("role"));
            } else {

                array_push($roleList, $userJSONObj->__get("role"));
                $user->setRoleList($roleList);
            }
        }
        return $user;
    }

    /**
     * Converts the response in JSON format to the list of value objects i.e User
     *
     * @params json
     *            - response in JSON format
     *
     * @return List of User object filled with json data
     *
     */
    public function buildArrayResponse($json) {
        $usersJSONObj = $this->getServiceJSONObject("users", $json);
        $userJSONArray = $usersJSONObj->getJSONArray("user");
        $userList = array();

        if ($userJSONArray instanceof JSONObject) {
            $userJSONObject = new JSONObject($userJSONArray);
            $user = $this->buildUserObject($userJSONObject);
            $user->setStrResponse($json);
            $user->setResponseSuccess($this->isRespponseSuccess($json));
            array_push($userList, $user);
        } else {
            for ($i = 0; $i < count($userJSONArray); $i++) {
                $userJSONObject = $userJSONArray[$i];
                $userJSONObject = new JSONObject($userJSONObject);
                $user = $this->buildUserObject($userJSONObject);
                $this->buildObjectFromJSONTree($user, $userJSONObject);
                $user->setStrResponse($json);
                $user->setResponseSuccess($this->isRespponseSuccess($json));
                array_push($userList, $user);
            }
        }
        return $userList;
    }

    function buildJsonDocument($document, $jsonObjDoc) {
        $jsonObjDoc = new JSONObject($jsonObjDoc);
        if ($jsonObjDoc->has("loc") && $jsonObjDoc->__get("loc") != null) {
            $geoArray = $jsonObjDoc->getJSONArray("loc");
            for ($i = 0; $i < count($geoArray); $i++) {
                 if (count($geoArray) == 2) {
                    $geoTag = new GeoTag();
                    $geoTag->setLat($geoArray[0]);
                    $geoTag->setLng($geoArray[1]);
                    $document->setLocation($geoTag);
                    $jsonObjDoc->remove("loc");
                }
            }
        }

        if ($jsonObjDoc->has("_id") && $jsonObjDoc->__get("_id") != null) {
            $idObj = $jsonObjDoc->__get("_id");
            $oIdObj = $idObj->__get("\$oid");
            $document->setDocId($oIdObj);
            $jsonObjDoc->remove("_id");
        }
        if ($jsonObjDoc->has("_\$updatedAt") && $jsonObjDoc->__get("_\$updatedAt") != null) {
            $updatedObj = $jsonObjDoc->__get("_\$updatedAt");
            $document->setUpdatedAt($updatedObj);
            $jsonObjDoc->remove("_\$updatedAt");
        }
        if ($jsonObjDoc->has("_\$createdAt") && $jsonObjDoc->__get("_\$createdAt") != null) {
            $createdAtObj = $jsonObjDoc->__get("_\$createdAt");
            $document->setCreatedAt($createdAtObj);
            $jsonObjDoc->remove("_\$createdAt");
        }
        if ($jsonObjDoc->has("_\$event") && $jsonObjDoc->__get("_\$event") != null) {
            $eventObj = $jsonObjDoc->__get("_\$event");
            $document->setEvent($eventObj);
            $jsonObjDoc->remove("_\$event");
        }
        if ($jsonObjDoc->has("_\$owner") && $jsonObjDoc->__get("_\$owner") != null) {
            $idObj = $jsonObjDoc->__get("_\$owner");
            $ownerObj = $idObj->__get("owner");
            $document->setOwner($ownerObj);
            $jsonObjDoc->remove("_\$owner");
        }

        $document->setJsonDoc($jsonObjDoc);
    }

}
?>