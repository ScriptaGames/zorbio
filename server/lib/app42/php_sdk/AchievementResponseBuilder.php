<?php

include_once "JSONObject.php";
include_once "Achievement.php";
include_once "App42ResponseBuilder.php";

/**
 *
 * UserResponseBuilder class converts the JSON response retrieved from the
 * server to the value object i.e User
 *
 */
class AchievementResponseBuilder extends App42ResponseBuilder {

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
        $achievementsJSONObj = $this->getServiceJSONObject("achievements", $json);
        $achievementJSOnObj = $achievementsJSONObj->__get("achievement");
        $achievement = $this->buildAchievementObject($achievementJSOnObj);
        $achievement->setStrResponse($json);
        $achievement->setResponseSuccess($this->isRespponseSuccess($json));
     //   print json_encode($achievement);
        return $achievement;
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
    private function buildAchievementObject($achievementJSONObj) {
      //  print json_encode($achievementJSONObj);
        $achievement = new Achievement();
        $this->buildObjectFromJSONTree($achievement, $achievementJSONObj);
        return $achievement;
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
        $achievementsJSONObj = $this->getServiceJSONObject("achievements", $json);
        $achievementJSONArray = $achievementsJSONObj->getJSONArray("achievement");
        $achievementList = array();

        if ($achievementJSONArray instanceof JSONObject) {
            $avatarJSONObject = new JSONObject($achievementJSONArray);
            $achievement = $this->buildAchievementObject($avatarJSONObject);
            $achievement->setStrResponse($json);
            $achievement->setResponseSuccess($this->isRespponseSuccess($json));
            array_push($achievementList, $achievement);
        } else {
            for ($i = 0; $i < count($achievementJSONArray); $i++) {
                $achievementJSONArrayObject = $achievementJSONArray[$i];
                $achievementJSONObject = new JSONObject($achievementJSONArrayObject);
                $achievement = $this->buildAchievementObject($achievementJSONObject);
                $this->buildObjectFromJSONTree($achievement, $achievementJSONObject);
                $achievement->setStrResponse($json);
                $achievement->setResponseSuccess($this->isRespponseSuccess($json));
                array_push($achievementList, $achievement);
            }
        }
        return $achievementList;
    }

   

}

?>
