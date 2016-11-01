<?php
/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
include_once "JSONObject.php";
include_once "Avatar.php";
include_once "App42ResponseBuilder.php";

/**
 *
 * UserResponseBuilder class converts the JSON response retrieved from the
 * server to the value object i.e User
 *
 */
class AvatarResponseBuilder extends App42ResponseBuilder {

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
            $avatarsJSONObj = $this->getServiceJSONObject("avatars", $json);
        $avatarsJSONObject = $avatarsJSONObj->__get("avatar");
        $avatar = $this->buildAvatarObject($avatarsJSONObject);
        $avatar->setStrResponse($json);
        $avatar->setResponseSuccess($this->isRespponseSuccess($json));
        return $avatar;
    }


    private function buildAvatarObject($jsonObject) {
        $avatarObj = new Avatar();
          $this->buildObjectFromJSONTree($avatarObj, $jsonObject);
         return $avatarObj;
    }

      public function buildArrayResponse($json) {
        $avatarsJSONObj = $this->getServiceJSONObject("avatars", $json);
        $avatarsJSONArray = $avatarsJSONObj->getJSONArray("avatar");
        $avatarList = array();

        if ($avatarsJSONArray instanceof JSONObject) {
            $avatarJSONObject = new JSONObject($avatarsJSONArray);
            $avatar = $this->buildAvatarObject($avatarJSONObject);
            $avatar->setStrResponse($json);
            $avatar->setResponseSuccess($this->isRespponseSuccess($json));
            array_push($avatarList, $avatar);
        } else {
            for ($i = 0; $i < count($avatarsJSONArray); $i++) {
                $avatarJSONObjectArray = $avatarsJSONArray[$i];
                $avatarJSONObject1 = new JSONObject($avatarJSONObjectArray);
                $avatarArray = $this->buildAvatarObject($avatarJSONObject1);
                $this->buildObjectFromJSONTree($avatarArray, $avatarJSONObject1);
                $avatarArray->setStrResponse($json);
                $avatarArray->setResponseSuccess($this->isRespponseSuccess($json));
                array_push($avatarList, $avatarArray);
            }
        }
        return $avatarList;
    }
}
?>
