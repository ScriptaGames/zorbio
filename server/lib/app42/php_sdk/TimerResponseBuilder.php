<?php
include_once "App42ResponseBuilder.php";
include_once "Timer.php";
/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of TimerResponseBuilder
 *
 * @author PRAVIN
 */
class TimerResponseBuilder extends App42ResponseBuilder {

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
        $timerJSONObj = $this->getServiceJSONObject("timer", $json);
        $timer = $this->buildTimerObject($timerJSONObj);
        $timer->setStrResponse($json);
        $timer->setResponseSuccess($this->isRespponseSuccess($json));
        return $timer;
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
    private function buildTimerObject($timerJSONObj) {
        $timer = new Timer();
        $this->buildObjectFromJSONTree($timer, $timerJSONObj);
        return $timer;
    }
}
?>
