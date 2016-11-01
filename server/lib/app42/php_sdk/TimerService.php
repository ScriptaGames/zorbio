<?php


include_once 'RestClient.class.php';
include_once 'Util.php';
include_once 'TimerResponseBuilder.php';
include_once 'App42Exception.php';
include_once 'App42Response.php';
include_once 'App42Log.php';
include_once "JSONObject.php";
include_once 'App42Service.php';

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of TimerService
 *
 * @author PRAVIN
 */
class TimerService extends App42Service {

    protected $resource = "timer";
    protected $url;
    protected $version = "1.0";
    protected $content_type = "application/json";
    protected $accept = "application/json";

    /**
     * The costructor for the Service
     * @param  apiKey
     * @param  secretKey
     * @param  baseURL
     *
     */
    public function __construct($apiKey, $secretKey) {
        $this->apiKey = $apiKey;
        $this->secretKey = $secretKey;
        $this->url = $this->version . "/" . $this->resource;
    }

    function createOrUpdateTimer($name, $timeInSeconds) {
        Util::throwExceptionIfNullOrBlank($name, "Name");
        Util::throwExceptionIfLongValueIsNegativeOrEqualToZero($timeInSeconds, "Times");
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
            $params = null;
             $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $body = null;
            $body = '{"app42":{"timer":{"name":"' . $name . '","timeInSeconds":"' . $timeInSeconds . '"}}}';
            $signParams['body'] = $body;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL ;
            $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
            $timerResponseObj = new TimerResponseBuilder();
            $timerObj = $timerResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $timerObj;
    }
    
     function startTimer($name, $userName) {
        Util::throwExceptionIfNullOrBlank($name, "Name");
        Util::throwExceptionIfNullOrBlank($userName, "UserName");
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
            $params = null;
             $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $body = null;
            $body = '{"app42":{"timer":{"name":"' . $name . '","userName":"' . $userName . '"}}}';
            $signParams['body'] = $body;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL."/startTimer" ;
            $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
            $timerResponseObj = new TimerResponseBuilder();
            $timerObj = $timerResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $timerObj;
    }
    
     function isTimerActive($name, $userName) {
        Util::throwExceptionIfNullOrBlank($name, "Name");
        Util::throwExceptionIfNullOrBlank($userName, "UserName");
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
            $params = null;
             $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $body = null;
            $body = '{"app42":{"timer":{"name":"' . $name . '","userName":"' . $userName . '"}}}';
            $signParams['body'] = $body;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL."/isTimerActive" ;
            $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
            $timerResponseObj = new TimerResponseBuilder();
            $timerObj = $timerResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $timerObj;
    }
    
       function cancelTimer($name, $userName) {
        Util::throwExceptionIfNullOrBlank($name, "Name");
        Util::throwExceptionIfNullOrBlank($userName, "UserName");
       $encodedName = Util::encodeParams($name);
       $encodedUserName = Util::encodeParams($userName);
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
            $params = null;
             $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $body = null;
            $signParams['name'] = $name;
            $signParams['userName'] = $userName;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL."/". $encodedName."/user/".$encodedUserName;
            $response = RestClient::delete($baseURL, $params, null, null, $contentType, $accept, $headerParams);
            $timerResponseObj = new TimerResponseBuilder();
            $timerObj = $timerResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $timerObj;
    }
    
       function deleteTimer($name) {
            $responseObj = new App42Response();
        Util::throwExceptionIfNullOrBlank($name, "Name");
       $encodedName = Util::encodeParams($name);
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
            $params = null;
             $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $body = null;
            $signParams['name'] = $name;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL."/". $encodedName;
            $response = RestClient::delete($baseURL, $params, null, null, $contentType, $accept, $headerParams);
             $responseObj->setStrResponse($response->getResponse());
            $responseObj->setResponseSuccess(true);
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $responseObj;
    }
    
     function getCurrentTime() {

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
            $baseURL = $baseURL . "/currentTime";
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept, $headerParams);
            $timerResponseObj = new TimerResponseBuilder();
            $timerObj = $timerResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $timerObj;
    }
    

}

?>
