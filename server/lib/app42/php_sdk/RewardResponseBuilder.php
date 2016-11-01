<?php

include_once "JSONObject.php";
include_once "session.php";
include_once "App42ResponseBuilder.php";
include_once "Reward.php";

/**
 *
 * RewardResponseBuilder class converts the JSON response retrieved from the
 * server to the value object i.e Reward
 *
 */
class RewardResponseBuilder extends App42ResponseBuilder {

    /**
     * Converts the response in JSON format to the value object i.e Reward
     *
     * @param json
     *            - response in JSON format
     *
     * @return Reward object filled with json data
     *
     */
    function buildResponse($json) {
        $rewardsJSONObj = $this->getServiceJSONObject("rewards", $json);
        $rewardJSONObj = $rewardsJSONObj->__get("reward");
        $reward = $this->buildRewardObject($rewardJSONObj);
        $reward->setStrResponse($json);
        $reward->setResponseSuccess($this->isRespponseSuccess($json));
        return $reward;
    }

    /**
     * Converts the response in JSON format to the list of value objects i.e
     * Reward
     *
     * @param json
     *            - response in JSON format
     *
     * @return List of Reward object filled with json data
     *
     */
    public function buildArrayResponse($json) {
        $rewardList = array();

        $rewardsJSONObj = $this->getServiceJSONObject("rewards", $json);
        if ($rewardsJSONObj->__get("reward") instanceof JSONObject) {

            $rewardJSONObj = $rewardsJSONObj->__get("reward");
            $rewardJSONObj = new JSONObject($rewardJSONObj);
            $reward = $this->buildRewardObject($rewardJSONObj);
            $reward->setStrResponse($json);
            $reward->setResponseSuccess($this->isRespponseSuccess($json));
            array_push($rewardList, $reward);
        } else {
            $rewardsJSONArray = $rewardsJSONObj->getJSONArray("reward");
            for ($i = 0; $i < count($rewardsJSONArray); $i++) {
                $rewardJSONObj1 = $rewardsJSONArray[$i];
                $rewardJSONObj = new JSONObject($rewardJSONObj1);
                $reward = $this->buildRewardObject($rewardJSONObj);
                $reward->setStrResponse($json);
                $reward->setResponseSuccess($this->isRespponseSuccess($json));
                array_push($rewardList, $reward);
            }
        }
        return $rewardList;
    }

    /**
     * Converts the Reward JSON object to the value object i.e Reward
     *
     * @param rewardJSONObj
     *            - Reward data as JSONObject
     *
     * @return Reward object filled with json data
     *
     */
    public function buildRewardObject($rewardJSONObj) {
        $reward = new Reward();
        $this->buildObjectFromJSONTree($reward, $rewardJSONObj);
        return $reward;
    }

}

?>