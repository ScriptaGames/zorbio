<?php

include_once "JSONObject.php";
include_once "App42ResponseBuilder.php";
include_once "Game.php";
include_once "MetaResponse.php";

/**
 *
 * GameResponseBuilder class converts the JSON response retrieved from the
 * server to the value object i.e Game
 *
 */
class GameResponseBuilder extends App42ResponseBuilder {

    /**
     * Converts the response in JSON format to the value object i.e Game
     *
     * @params json
     *            - response in JSON format
     *
     * @return Game object filled with json data
     *
     */
    function buildResponse($json) {

        $gamesJSONObj = $this->getServiceJSONObject("games", $json);
        $gameJSONObj = $gamesJSONObj->__get("game");
        $game = new Game();
        $game = $this->buildGameObject($gameJSONObj);
        $game->setResponseSuccess($this->isRespponseSuccess($json));
        $game->setStrResponse($json);
        return $game;
    }

    /**
     * Converts the response in JSON format to the list of value objects i.e
     * Game
     *
     * @params json
     *            - response in JSON format
     *
     * @return List of Game object filled with json data
     *
     */
    public function buildArrayResponse($json) {
        $gamesJSONObj = $this->getServiceJSONObject("games", $json);
        $gameList = array();

        if ($gamesJSONObj->__get("game") instanceof JSONObject) {

            $gameJSONObj = $gamesJSONObj->__get("game");
            $game = new Game();
            $game = $this->buildGameObject($gameJSONObj);
            $game->setResponseSuccess($this->isRespponseSuccess($json));
            $game->setStrResponse($json);
            array_push($gameList, $game);
        } else {
            $gameJSONArray = $gamesJSONObj->getJSONArray("game");
            for ($i = 0; $i < count($gameJSONArray); $i++) {
                $gameJSONObj = $gameJSONArray[$i];
                $game = new Game();
                $game = $this->buildGameObject($gameJSONObj);
                $game->setResponseSuccess($this->isRespponseSuccess($json));
                $game->setStrResponse($json);
                array_push($gameList, $game);
            }
        }
        return $gameList;
    }

    /**
     * Converts the Game JSON object to the value object i.e Game
     *
     * @params gameJSONObject
     *            - Game data as JSONObject
     *
     * @return Game object filled with json data
     *
     */
    public function buildGameObject($gameJSONObject) {
        $game = new Game();
        $gameJSONObject = new JSONObject($gameJSONObject);
        $this->buildObjectFromJSONTree($game, $gameJSONObject);
        if ($gameJSONObject->has("scores") && $gameJSONObject->__get("scores")->has("score")) {
            if ($gameJSONObject->__get("scores")->__get("score") instanceof JSONObject) {
                $scoreJSONObj = $gameJSONObject->__get("scores")->__get("score");
                $score = new Score($game);
                $this->buildObjectFromJSONTree($score, $scoreJSONObj);
                if ($scoreJSONObj->has("facebookProfile")) {
                    $meJsonObject = $scoreJSONObj->__get("facebookProfile");
                    $fbProfile = new FacebookProfile($score);
                    $this->buildJsonFacebookProfile($fbProfile, $meJsonObject);
                }
                if ($scoreJSONObj->has("jsonDoc")) {
                    if ($scoreJSONObj->__get("jsonDoc") instanceof JSONObject) {
                        // Only One attribute is there
                        $jsonObjDoc = $scoreJSONObj->__get("jsonDoc");
                        $document = new ScoreJSONDocument($score);
                        $this->buildJsonDocument($document, $jsonObjDoc);
                    } else {
                        // There is an Array of attribute
                        $jsonObjDocArray = $scoreJSONObj->getJSONArray("jsonDoc");
                        for ($i = 0; $i < count($jsonObjDocArray); $i++) {
                            // Get Individual Attribute Node and set it into Object
                            $jsonObjDoc = $jsonObjDocArray[$i];
                            $document = new ScoreJSONDocument($score);
                            //$jsonObjDoc = new JSONObject($jsonObjDoc);
                            $this->buildJsonDocument($document, $jsonObjDoc);
                        }
                    }
                }
            } else {
               
                //Fetch Array of Game
                $scoreJSONArray = $gameJSONObject->__get("scores")->getJSONArray("score");
                for ($i = 0; $i < count($scoreJSONArray); $i++) {
                    $scoreJSONObj = $scoreJSONArray[$i];
                    $scoreObject = new Score($game);
                    $scoreJSONObject = new JSONObject($scoreJSONObj);
                    $this->buildObjectFromJSONTree($scoreObject, $scoreJSONObject);
                    if ($scoreJSONObject->has("facebookProfile")) {
                         if ($scoreJSONObject->__get("facebookProfile") instanceof JSONObject) {
                        $meJsonObject = $scoreJSONObject->__get("facebookProfile");
                         $fbProfile = new FacebookProfile($scoreObject);
                        $this->buildObjectFromJSONTree($fbProfile, $meJsonObject);
                    }
                    }
                    if ($scoreJSONObject->has("jsonDoc")) {
                        // print_r($scoreJSONObject->__get("jsonDoc"));
                        if ($scoreJSONObject->__get("jsonDoc") instanceof JSONObject) {
                            // Only One attribute is there
                            $jsonObjDocument = $scoreJSONObject->__get("jsonDoc");
                            $documentArr = new ScoreJSONDocument($scoreObject);
                            $this->buildJsonDocument($documentArr, $jsonObjDocument);
                        } else {
                           // There is an Array of attribute
                            $jsonObjDocArray = $scoreJSONObject->getJSONArray("jsonDoc");
                             
                            for ($j = 0; $j < count($jsonObjDocArray); $j++) {
                                // Get Individual Attribute Node and set it into Object
                                $jsonObjDocumentArray = $jsonObjDocArray[$j];
                                 $documentArrayObject = new ScoreJSONDocument($scoreObject);
                                //$jsonObjDoc = new JSONObject($jsonObjDoc);
                                $this->buildJsonDocument($documentArrayObject, $jsonObjDocumentArray);
                            }
                        }
                    }
                }
            }
        }
        return $game;
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

     function buildJsonFacebookProfile($me, $friendJSONObj) {
        $jsonObjMe = new JSONObject($friendJSONObj);
       if ($jsonObjMe->has("id") && $jsonObjMe->__get("id") != null) {
            $me->setId($jsonObjMe->__get("id"));
            $me->setName($jsonObjMe->__get("name"));
            $me->setPicture($jsonObjMe->__get("picture"));
        }
    }

}
?>