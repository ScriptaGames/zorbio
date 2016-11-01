<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
include_once 'RestClient.class.php';
include_once 'Util.php';
include_once 'App42Response.php';
include_once 'App42Service.php';
include_once 'BuddyResponseBuilder.php';

class BuddyService extends App42Service {

    protected $version = "1.0";
    protected $resource = "buddy";
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

    function sendFriendRequest($userName, $buddyName, $message) {

        Util::throwExceptionIfNullOrBlank($userName, "UserName");
        Util::throwExceptionIfNullOrBlank($buddyName, "BuddyName");
        $objUtil = new Util($this->apiKey, $this->secretKey);

        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $body = null;
            $body = '{"app42":{"buddy":{"userName":"' . $userName . '","buddyName":"' . $buddyName . '","message":"' . $message . '"}}}';
            $signParams['body'] = $body;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL;
            $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
            $buddyRespObj = new BuddyResponseBuilder();
            $buddyObj = $buddyRespObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $buddyObj;
    }

    function getFriendRequest($userName) {

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
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept, $headerParams);
            $buddyRespObj = new BuddyResponseBuilder();
            $buddyObj = $buddyRespObj->buildArrayResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }

        return $buddyObj;
    }

    function acceptFriendRequest($userName, $buddyName) {

        Util::throwExceptionIfNullOrBlank($userName, "UserName");
        Util::throwExceptionIfNullOrBlank($buddyName, "BuddyName");
        $objUtil = new Util($this->apiKey, $this->secretKey);

        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $body = null;
            $body = '{"app42":{"buddy":{"userName":"' . $userName . '","buddyName":"' . $buddyName . '"}}}';
            $signParams['body'] = $body;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL;
            $response = RestClient::put($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
            $buddyRespObj = new BuddyResponseBuilder();
            $buddyObj = $buddyRespObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $buddyObj;
    }

    function rejectFriendRequest($userName, $buddyName) {

        Util::throwExceptionIfNullOrBlank($userName, "UserName");
        Util::throwExceptionIfNullOrBlank($buddyName, "BuddyName");
        $objUtil = new Util($this->apiKey, $this->secretKey);

        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $signParams['userName'] = $userName;
            $signParams['buddyName'] = $buddyName;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/userName/" . $userName . "/buddyName/" . $buddyName;
            $response = RestClient::delete($baseURL, $params, null, null, $contentType, $accept, $headerParams);
            $buddyRespObj = new BuddyResponseBuilder();
            $buddyObj = $buddyRespObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $buddyObj;
    }

    function getAllFriends($userName) {

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
            $baseURL = $baseURL . "/" . "friends/" . $encodedUserName;
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept, $headerParams);
            $buddyRespObj = new BuddyResponseBuilder();
            $buddyObj = $buddyRespObj->buildArrayResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }

        return $buddyObj;
    }

    function createGroupByUser($userName, $groupName) {

        Util::throwExceptionIfNullOrBlank($userName, "UserName");
        Util::throwExceptionIfNullOrBlank($groupName, "GroupName");
        $objUtil = new Util($this->apiKey, $this->secretKey);

        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $body = null;
            $body = '{"app42":{"buddy":{"userName":"' . $userName . '","groupName":"' . $groupName . '"}}}';
            $signParams['body'] = $body;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url . "/group";
            $baseURL = $baseURL;
            $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
            $buddyRespObj = new BuddyResponseBuilder();
            $buddyObj = $buddyRespObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $buddyObj;
    }

    function addFriendToGroup($userName, $groupName, $friends) {

        Util::throwExceptionIfNullOrBlank($userName, "UserName");
        Util::throwExceptionIfNullOrBlank($groupName, "GroupName");
        Util::throwExceptionIfNullOrBlank($friends, "FriendsList");
        $objUtil = new Util($this->apiKey, $this->secretKey);

        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $body = null;
            if (is_array($friends)) {
                $body = '{"app42" : {"buddy" : {"userName":"' . $userName . '","groupName":"' . $groupName . '","friends": { "friend": ' . json_encode($friends) . '}}}}';
            } else {
                $body = '{"app42" : {"buddy" : {"userName":"' . $userName . '","groupName":"' . $groupName . '","friends": { "friend": ' . $friends . '}}}}';
            }
            $signParams['body'] = $body;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url . "/group/friends";
            $baseURL = $baseURL;
            $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
            $buddyRespObj = new BuddyResponseBuilder();
            $buddyObj = $buddyRespObj->buildArrayResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $buddyObj;
    }

    function checkedInGeoLocation($userName, $point) {

        Util::throwExceptionIfNullOrBlank($userName, "UserName");
        Util::throwExceptionIfNullOrBlank($point, "Point");
        $objUtil = new Util($this->apiKey, $this->secretKey);

        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $body = null;
            $body = '{"app42" : {"buddy" : {"userName":"' . $userName . '","points": { "point": ' . $point->getJSONObject() . '}}}}';

            $signParams['body'] = $body;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url . "/checkedIn";
            $baseURL = $baseURL;
            $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
            $buddyRespObj = new BuddyResponseBuilder();
            $buddyObj = $buddyRespObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $buddyObj;
    }

    function getFriendsByLocation($userName, $latitude, $longitude, $maxDistance, $max) {

        Util::throwExceptionIfNullOrBlank($userName, "User Name");
        Util::throwExceptionIfNullOrBlank($latitude, "Latitude");
        Util::throwExceptionIfNullOrBlank($longitude, "Longitude");
        Util::throwExceptionIfNullOrBlank($maxDistance, "MaxDistance");

        $encodedUserName = Util::encodeParams($userName);
        $encodedLatitude = Util::encodeParams($latitude);
        $encodedLongitude = Util::encodeParams($longitude);
        $encodedMaxDistance = Util::encodeParams($maxDistance);
        $encodedMax = Util::encodeParams($max);
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
            $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);

            $signParams['userName'] = $userName;
            $signParams['maxDistance'] = $maxDistance . "";
            $signParams['latitude'] = $latitude . "";
            $signParams['longitude'] = $longitude + "";
            $signParams['max'] = $max . "";
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/" . "friends/location/" . $encodedUserName . "/" . $encodedMaxDistance . "/"
                    . $encodedLatitude . "/" . $encodedLongitude . "/" . $encodedMax;
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept, $headerParams);
            $buddyRespObj = new BuddyResponseBuilder();
            $buddyObj = $buddyRespObj->buildArrayResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }

        return $buddyObj;
    }

    function getAllGroups($userName) {

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
            $baseURL = $baseURL . "/" . "groupall/" . $encodedUserName;
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept, $headerParams);
            $buddyRespObj = new BuddyResponseBuilder();
            $buddyObj = $buddyRespObj->buildArrayResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $buddyObj;
    }

    function getAllFriendsInGroup($userName, $ownerName, $groupName) {

        Util::throwExceptionIfNullOrBlank($userName, "User Name");
        Util::throwExceptionIfNullOrBlank($ownerName, "OwnerName");
        Util::throwExceptionIfNullOrBlank($groupName, "GroupName");
        $encodedUserName = Util::encodeParams($userName);
        $encodedOwnerName = Util::encodeParams($ownerName);
        $encodedGroupName = Util::encodeParams($groupName);
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
            $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);

            $signParams['userName'] = $userName;
            $signParams['ownerName'] = $ownerName;
            $signParams['groupName'] = $groupName;

            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/" . "friends/" . $encodedUserName . "/group/" . $encodedOwnerName . "/"
                    . $encodedGroupName;
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept, $headerParams);
            $buddyRespObj = new BuddyResponseBuilder();
            $buddyObj = $buddyRespObj->buildArrayResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }

        return $buddyObj;
    }

    function blockFriendRequest($userName, $buddyName) {

        Util::throwExceptionIfNullOrBlank($userName, "UserName");
        Util::throwExceptionIfNullOrBlank($buddyName, "BuddyName");
        $objUtil = new Util($this->apiKey, $this->secretKey);

        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $signParams['userName'] = $userName;
            $signParams['buddyName'] = $buddyName;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/block/userName/" . $userName . "/buddyName/" . $buddyName;
            $response = RestClient::delete($baseURL, $params, null, null, $contentType, $accept, $headerParams);
            $buddyRespObj = new BuddyResponseBuilder();
            $buddyObj = $buddyRespObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $buddyObj;
    }

    function blockUser($userName, $buddyName) {

        Util::throwExceptionIfNullOrBlank($userName, "UserName");
        Util::throwExceptionIfNullOrBlank($buddyName, "BuddyName");
        $objUtil = new Util($this->apiKey, $this->secretKey);

        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $body = null;
            $body = '{"app42":{"buddy":{"userName":"' . $userName . '","buddyName":"' . $buddyName . '"}}}';
            $signParams['body'] = $body;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/block";
            $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
            $buddyRespObj = new BuddyResponseBuilder();
            $buddyObj = $buddyRespObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $buddyObj;
    }

    function unblockUser($userName, $buddyName) {

        Util::throwExceptionIfNullOrBlank($userName, "UserName");
        Util::throwExceptionIfNullOrBlank($buddyName, "BuddyName");
        $objUtil = new Util($this->apiKey, $this->secretKey);

        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $body = null;
            $body = '{"app42":{"buddy":{"userName":"' . $userName . '","buddyName":"' . $buddyName . '"}}}';
            $signParams['body'] = $body;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/unblock";
            $response = RestClient::put($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
            $buddyRespObj = new BuddyResponseBuilder();
            $buddyObj = $buddyRespObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $buddyObj;
    }

    function sendMessageToGroup($userName, $ownerName, $groupName, $message) {

        Util::throwExceptionIfNullOrBlank($userName, "UserName");
        Util::throwExceptionIfNullOrBlank($ownerName, "OwnerName");
        Util::throwExceptionIfNullOrBlank($groupName, "groupName");
        Util::throwExceptionIfNullOrBlank($message, "message");
        $objUtil = new Util($this->apiKey, $this->secretKey);

        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $body = null;
            $body = '{"app42":{"buddy":{"userName":"' . $userName . '","ownerName":"' . $ownerName . '","groupName":"' . $groupName . '","message":"' . $message . '"}}}';
            $signParams['body'] = $body;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/groupmessage";
            $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
            $buddyRespObj = new BuddyResponseBuilder();
            $buddyObj = $buddyRespObj->buildArrayResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $buddyObj;
    }

    function sendMessageToFriend($userName, $buddyName, $message) {

        Util::throwExceptionIfNullOrBlank($userName, "UserName");
        Util::throwExceptionIfNullOrBlank($buddyName, "buddyName");
        Util::throwExceptionIfNullOrBlank($message, "message");
        $objUtil = new Util($this->apiKey, $this->secretKey);

        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $body = null;
            $body = '{"app42":{"buddy":{"userName":"' . $userName . '","buddyName":"' . $buddyName . '","message":"' . $message . '"}}}';
            $signParams['body'] = $body;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/friendmessage";
            $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
            $buddyRespObj = new BuddyResponseBuilder();
            $buddyObj = $buddyRespObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $buddyObj;
    }

    function sendMessageToFriends($userName, $message) {

        Util::throwExceptionIfNullOrBlank($userName, "UserName");
        Util::throwExceptionIfNullOrBlank($message, "message");
        $objUtil = new Util($this->apiKey, $this->secretKey);

        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $body = null;
            $body = '{"app42":{"buddy":{"userName":"' . $userName . '","message":"' . $message . '"}}}';
            $signParams['body'] = $body;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/messageAll";
            $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
            $buddyRespObj = new BuddyResponseBuilder();
            $buddyObj = $buddyRespObj->buildArrayResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $buddyObj;
    }

    function getAllMessages($userName) {

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
            $baseURL = $baseURL . "/" . "message/" . $encodedUserName;
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept, $headerParams);
            $buddyRespObj = new BuddyResponseBuilder();
            $buddyObj = $buddyRespObj->buildArrayResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }

        return $buddyObj;
    }

    function getAllMessagesFromBuddy($userName, $buddyName) {

        Util::throwExceptionIfNullOrBlank($userName, "User Name");
        Util::throwExceptionIfNullOrBlank($buddyName, "BuddyName");
        $encodedUserName = Util::encodeParams($userName);
        $encodedBuddyName = Util::encodeParams($buddyName);
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
            $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);

            $signParams['userName'] = $userName;
            $signParams['buddyName'] = $buddyName;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/" . "buddyMessage/" . $encodedUserName . "/" . $encodedBuddyName;
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept, $headerParams);
            $buddyRespObj = new BuddyResponseBuilder();
            $buddyObj = $buddyRespObj->buildArrayResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }

        return $buddyObj;
    }

    function getAllMessagesFromGroup($userName, $groupOwner, $groupName) {

        Util::throwExceptionIfNullOrBlank($userName, "User Name");
        Util::throwExceptionIfNullOrBlank($groupOwner, "GroupOwner");
        Util::throwExceptionIfNullOrBlank($groupName, "GroupName");
        $encodedUserName = Util::encodeParams($userName);
        $encodedGroupOwner = Util::encodeParams($groupOwner);
        $encodedGroupName = Util::encodeParams($groupName);
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
            $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);

            $signParams['userName'] = $userName;
            $signParams['ownerName'] = $groupOwner;
            $signParams['groupName'] = $groupName;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/" . $encodedUserName . "/groupMassaage/" . $encodedGroupOwner . "/"
                    . $encodedGroupName;
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept, $headerParams);
            $buddyRespObj = new BuddyResponseBuilder();
            $buddyObj = $buddyRespObj->buildArrayResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }

        return $buddyObj;
    }

    function unFriend($userName, $buddyName) {

        Util::throwExceptionIfNullOrBlank($userName, "UserName");
        Util::throwExceptionIfNullOrBlank($buddyName, "BuddyName");
        $objUtil = new Util($this->apiKey, $this->secretKey);
        $responseObj = new App42Response();
        $encodedUserName = Util::encodeParams($userName);
        $encodedBuddyName = Util::encodeParams($buddyName);
        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $signParams['userName'] = $userName;
            $signParams['buddyName'] = $buddyName;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/unfriend/userName/" . $encodedUserName . "/buddyName/" . $encodedBuddyName;
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

    function deleteMessageById($userName, $messageId) {

        Util::throwExceptionIfNullOrBlank($userName, "UserName");
        Util::throwExceptionIfNullOrBlank($messageId, "messageId");
        $objUtil = new Util($this->apiKey, $this->secretKey);
        $responseObj = new App42Response();
        $encodedUserName = Util::encodeParams($userName);
        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            if (is_array($messageId)) {
                $signParams['userName'] = $userName;
                $signParams['messageIds'] = json_encode($messageId);
            } else {
                $arr = array();
                array_push($arr, $messageId);
                $signParams['userName'] = $userName;
                $signParams['messageIds'] = json_encode($arr);
            }
            $params = array_merge($queryParams, $signParams);
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/deleteMessageById/" . $encodedUserName;
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

    function deleteMessageByIds($userName, $messageIds) {

        Util::throwExceptionIfNullOrBlank($userName, "UserName");
        Util::throwExceptionIfNullOrBlank($messageIds, "messageIds");
        $objUtil = new Util($this->apiKey, $this->secretKey);
        $responseObj = new App42Response();
        $encodedUserName = Util::encodeParams($userName);
        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            if (is_array($messageIds)) {
                $signParams['userName'] = $userName;
                $signParams['messageIds'] = json_encode($messageIds);
            } else {
              $arr = array();
                array_push($arr, $messageId);
                $signParams['userName'] = $userName;
                $signParams['messageIds'] = json_encode($arr);
            }
            $params = array_merge($queryParams, $signParams);
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/deleteMessageById/" . $encodedUserName;
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
    
    function deleteAllMessages($userName) {

        Util::throwExceptionIfNullOrBlank($userName, "UserName");
        $objUtil = new Util($this->apiKey, $this->secretKey);
        $responseObj = new App42Response();
        $encodedUserName = Util::encodeParams($userName);
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
            $baseURL = $baseURL . "/deleteAllMessages/" . $encodedUserName ;
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

    function getBlockedBuddyList($userName) {

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
            $baseURL = $baseURL . "/blockedList/" . $encodedUserName;
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept, $headerParams);
            $buddyRespObj = new BuddyResponseBuilder();
            $buddyObj = $buddyRespObj->buildArrayResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }

        return $buddyObj;
    }
}
?>
