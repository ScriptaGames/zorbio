<?php
/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
include_once 'RestClient.class.php';
include_once 'Util.php';
include_once 'App42Response.php';
include_once 'App42Service.php';
include_once 'AchievementResponseBuilder.php';

class AchievementService extends App42Service {

    protected $version = "1.0";
    protected $resource = "achievement";
    protected $content_type = "application/json";
    protected $accept = "application/json";

    /**
     * The costructor for the Service
     *
     * @params apiKey
     * @params secretKey
     * @params baseURL
     *
     */
    public function __construct($apiKey, $secretKey) {
        //$this->resource = "charge";
        $this->apiKey = $apiKey;
        $this->secretKey = $secretKey;
        $this->url =  $this->version . "/" . $this->resource;
    }

   
    function createAchievement($name, $description) {

        Util::throwExceptionIfNullOrBlank($name, "Achievement Name");
        Util::throwExceptionIfNullOrBlank($description, "description");
        $objUtil = new Util($this->apiKey, $this->secretKey);

        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $body = null;
            $body = '{"app42":{"achievement":{"name":"' . $name . '","description":"' . $description . '"}}}';
            $signParams['body'] = $body;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL;
            $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
            $achievementRespObj = new AchievementResponseBuilder();
            $achievementObj = $achievementRespObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $achievementObj;
    }

      function earnAchievement($userName, $achievementName,$gameName, $description) {

        Util::throwExceptionIfNullOrBlank($userName, "User Name");
        Util::throwExceptionIfNullOrBlank($achievementName, "Achievement Name");
        Util::throwExceptionIfNullOrBlank($gameName, "Game Name");
        Util::throwExceptionIfNullOrBlank($description, "description");
        $objUtil = new Util($this->apiKey, $this->secretKey);

        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $body = null;
            $body = '{"app42":{"achievement":{"userName":"' . $userName . '","name":"' . $achievementName .  '","gameName":"' . $gameName . '","description":"' . $description .'"}}}';
            $signParams['body'] = $body;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL. "/earn";
            $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
            $achievementRespObj = new AchievementResponseBuilder();
            $achievementObj = $achievementRespObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $achievementObj;
    }

      function getAllAchievementsForUser($userName) {

        Util::throwExceptionIfNullOrBlank($userName, "User Name");
        $encodedUserName = Util::encodeParams($userName);
        $objUtil = new Util($this->apiKey, $this->secretKey);

        try {
            $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);

            $signParams['userName'] = $userName;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/" . $encodedUserName;
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept,$headerParams);
            $achievementRespObj = new AchievementResponseBuilder();
            $achievementObj = $achievementRespObj->buildArrayResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }

        return $achievementObj;
    }

         function getAllAchievementsForUserInGame($userName,$gameName) {

        Util::throwExceptionIfNullOrBlank($userName, "User Name");
         Util::throwExceptionIfNullOrBlank($gameName, "Game Name");
        $encodedUserName = Util::encodeParams($userName);
         $encodedGameName = Util::encodeParams($gameName);
        $objUtil = new Util($this->apiKey, $this->secretKey);

        try {
            $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);

            $signParams['userName'] = $userName;
            $signParams['gameName'] = $gameName;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/" . $encodedUserName."/".$encodedGameName;
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept,$headerParams);
            $achievementRespObj = new AchievementResponseBuilder();
            $achievementObj = $achievementRespObj->buildArrayResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }

        return $achievementObj;
    }


        function getAllAchievements() {

        $objUtil = new Util($this->apiKey, $this->secretKey);

        try {
            $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL ."/all";
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept,$headerParams);
            $achievementRespObj = new AchievementResponseBuilder();
            $achievementObj = $achievementRespObj->buildArrayResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }

        return $achievementObj;
    }

       function getAchievementByName($achievementName) {

        Util::throwExceptionIfNullOrBlank($achievementName, "Achievement Name");
        $encodedAchievementName = Util::encodeParams($achievementName);
        $objUtil = new Util($this->apiKey, $this->secretKey);

        try {
            $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);

            $signParams['achievementName'] = $achievementName;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/" . "achievementName/".$encodedAchievementName;
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept,$headerParams);
            $achievementRespObj = new AchievementResponseBuilder();
            $achievementObj = $achievementRespObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }

        return $achievementObj;
    }


       function getUsersAchievement($achievementName,$gameName) {

        Util::throwExceptionIfNullOrBlank($achievementName, "Achievement Name");
         Util::throwExceptionIfNullOrBlank($gameName, "Game Name");
         $encodedAchievementName = Util::encodeParams($achievementName);
         $encodedGameName = Util::encodeParams($gameName);
        $objUtil = new Util($this->apiKey, $this->secretKey);

        try {
            $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);

            $signParams['achievementName'] = $achievementName;
            $signParams['game'] = $gameName;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/" ."users"."/". $encodedAchievementName."/".$encodedGameName;
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept,$headerParams);
            $achievementRespObj = new AchievementResponseBuilder();
            $achievementObj = $achievementRespObj->buildArrayResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }

        return $achievementObj;
    }
    
}

?>
