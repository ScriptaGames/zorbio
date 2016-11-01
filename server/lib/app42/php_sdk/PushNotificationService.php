<?php

include_once 'RestClient.class.php';
include_once 'Util.php';
include_once 'PushNotificationResponseBuilder.php';
include_once 'App42Exception.php';
include_once 'App42Service.php';
include_once 'App42Response.php';

class PushNotificationService extends App42Service {

    protected $resource = "push";
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

    function storeDeviceToken($userName, $deviceToken, $type) {
        Util::throwExceptionIfNullOrBlank($userName, "User Name");
        Util::throwExceptionIfNullOrBlank($deviceToken, "Device Token");
        Util::throwExceptionIfNullOrBlank($type, "Device Type");
        $encodedUserName = Util::encodeParams($userName);
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		    $params = null;
            $deviceTypeObj = new DeviceType();
            if ($deviceTypeObj->isAvailable($type) == "null") {
                throw new App42Exception("The device with  type '$type' does not Exist ");
            }

            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $body = null;
            $body = '{"app42":{"push":{"userName":"' . $userName . '","deviceToken":"' . $deviceToken . '","type":"' . $type . '"}}}';
            $signParams['body'] = $body;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/storeDeviceToken/" . $encodedUserName;
            $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
            $pushResponseObj = new PushNotificationResponseBuilder();
            $pushObj = $pushResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $pushObj;
    }

    function createChannelForApp($channel, $description) {
        Util::throwExceptionIfNullOrBlank($channel, "channel");
        Util::throwExceptionIfNullOrBlank($description, "description");
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $body = '{"app42":{"push":{"channel":{"name":"' . $channel . '","description":"' . $description . '"}}}}';
            $signParams['body'] = $body;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/createAppChannel/";
            $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
            $pushResponseObj = new PushNotificationResponseBuilder();
            $pushObj = $pushResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $pushObj;
    }

    function subscribeToChannel($channel, $userName) {
        Util::throwExceptionIfNullOrBlank($channel, "channel");
        Util::throwExceptionIfNullOrBlank($userName, "userName");
        $encodedUserName = Util::encodeParams($userName);
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $body = '{"push":{"channel":{"userName":"' . $userName . '","name":"' . $channel . '"}}}';
            $signParams['body'] = $body;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/subscribeToChannel/" . $encodedUserName;
            $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
            $pushResponseObj = new PushNotificationResponseBuilder();
            $pushObj = $pushResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $pushObj;
    }

    function unsubscribeFromChannel($channel, $userName) {
        Util::throwExceptionIfNullOrBlank($channel, "channel");
        Util::throwExceptionIfNullOrBlank($userName, "userName");
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
            $body = '{"push":{"channel":{"userName":"' . $userName . '","name":"' . $channel . '"}}}';
            $signParams['body'] = $body;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/unsubscribeToChannel/" . $encodedUserName;
            $response = RestClient::put($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
            $pushResponseObj = new PushNotificationResponseBuilder();
            $pushObj = $pushResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $pushObj;
    }

    function sendPushMessageToChannel($channel, $message) {
        Util::throwExceptionIfNullOrBlank($channel, "channel");
        Util::throwExceptionIfNullOrBlank($message, "message");
        $encodedChannel = Util::encodeParams($channel);
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $body = null;
            $body = '{"app42":{"push":{"message":{"channel":"' . $channel . '","payload":"' . $message . '","expiry":"' .Util::getUTCFormattedTimestamp() . '"}}}}';
            $signParams['body'] = $body;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/sendPushMessageToChannel/" . $encodedChannel;
            $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
            $pushResponseObj = new PushNotificationResponseBuilder();
            $pushObj = $pushResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $pushObj;
    }

    function sendPushMessageToAll($message) {
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
            $body = '{"app42":{"push":{"message":{"payload":"' . $message . '","expiry":"' . Util::getUTCFormattedTimestamp() . '"}}}}';
            $signParams['body'] = $body;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/sendPushMessageToAll";
            $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
            $pushResponseObj = new PushNotificationResponseBuilder();
            $pushObj = $pushResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $pushObj;
    }

    function sendPushMessageToUser($userName, $message) {
        Util::throwExceptionIfNullOrBlank($message, "message");
        Util::throwExceptionIfNullOrBlank($userName, "userName");
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
            $body = '{"app42":{"push":{"message":{"userName":"' . $userName . '","payload":"' . $message . '","expiry":"' . Util::getUTCFormattedTimestamp() . '"}}}}';
            $signParams['body'] = $body;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/sendMessage/" . $encodedUserName;
            $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
            $pushResponseObj = new PushNotificationResponseBuilder();
            $pushObj = $pushResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $pushObj;
    }

    function sendPushMessageToAllByType($message, $type) {
        Util::throwExceptionIfNullOrBlank($message, "message");
        Util::throwExceptionIfNullOrBlank($type, "Type");
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		    $params = null;

            $deviceTypeObj = new DeviceType();
            if ($deviceTypeObj->isAvailable($type) == "null") {
                throw new App42Exception("The device with  type '$type' does not Exist ");
            }

            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $body = null;
            $body = '{"app42":{"push":{"message":{"payload":"' . $message . '","type":"' . $type . '","expiry":"' .Util::getUTCFormattedTimestamp() . '"}}}}';
            $signParams['body'] = $body;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/sendMessageToAllByType";
            $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
            $pushResponseObj = new PushNotificationResponseBuilder();
            $pushObj = $pushResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $pushObj;
    }

    function registerAndSubscribe($userName, $channelName, $deviceToken, $deviceType) {
        Util::throwExceptionIfNullOrBlank($userName, "User Name");
        Util::throwExceptionIfNullOrBlank($channelName, "Channel Name");
        Util::throwExceptionIfNullOrBlank($deviceToken, "Device Token");
        Util::throwExceptionIfNullOrBlank($deviceType, "Device Type");
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		    $params = null;
            $deviceTypeObj = new DeviceType();
            if ($deviceTypeObj->isAvailable($deviceType) == "null") {
                throw new App42Exception("The device with  type '$deviceType' does not Exist ");
            }

            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $body = null;
            $body = '{"app42":{"push":{"userName":"' . $userName . '","channelName":"' . $channelName . '","deviceToken":"' . $deviceToken . '","type":"' . $deviceType . '"}}}';
            $signParams['body'] = $body;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/subscribeDeviceToChannel";
            $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
            $pushResponseObj = new PushNotificationResponseBuilder();
            $pushObj = $pushResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $pushObj;
    }

    function unsubscribeDeviceToChannel($userName, $channelName, $deviceToken) {
        Util::throwExceptionIfNullOrBlank($userName, "User Name");
        Util::throwExceptionIfNullOrBlank($channelName, "Channel Name");
        Util::throwExceptionIfNullOrBlank($deviceToken, "Device Token");
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $body = null;
            $body = '{"app42":{"push":{"userName":"' . $userName . '","channelName":"' . $channelName . '","deviceToken":"' . $deviceToken . '"}}}';
            $signParams['body'] = $body;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/unsubscribeDeviceToChannel";
            $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
            $pushResponseObj = new PushNotificationResponseBuilder();
            $pushObj = $pushResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $pushObj;
    }

    function deleteDeviceToken($userName, $deviceToken) {

        Util::throwExceptionIfNullOrBlank($userName, "User Name");
        Util::throwExceptionIfNullOrBlank($deviceToken, "DeviceToken");
        $responseObj = new App42Response();
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $signParams['userName'] = $userName;
            $signParams['deviceToken'] = $deviceToken;

            $queryParams['userName'] = $userName;
            $queryParams['deviceToken'] = $deviceToken;

            $params = array_merge($queryParams, $signParams);
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL;
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

    function sendPushMessageToGroup($message, $userList) {
        Util::throwExceptionIfNullOrBlank($message, "message");
        Util::throwExceptionIfNullOrBlank($userList, "userList");
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $body = null;
            if (is_array($userList)) {
                $body = '{"app42":{"push":{"message":{"payload":"' . $message . '","expiry":"' . Util::getUTCFormattedTimestamp() . '","users": { "user": ' . json_encode($userList) . '}}}}}';
            } else {
                $body = '{"app42":{"push":{"message":{"payload":"' . $message . '","expiry":"' . Util::getUTCFormattedTimestamp() . '","users": { "user": "' . $userList . '"}}}}}';
            }
            $signParams['body'] = $body;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/sendPushMessageToGroup";
            $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
            $pushResponseObj = new PushNotificationResponseBuilder();
            $pushObj = $pushResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $pushObj;
    }

    function sendPushToTargetUsers($message, $dbName, $collectionName, $query) {
        Util::throwExceptionIfNullOrBlank($message, "Message");
        Util::throwExceptionIfNullOrBlank($dbName, "DbName");
        Util::throwExceptionIfNullOrBlank($collectionName, "Collection Name");
        Util::throwExceptionIfNullOrBlank($query, "Query");
        $encodedDbName = Util::encodeParams($dbName);
        $encodedCollectionName = Util::encodeParams($collectionName);
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $body = null;
            $body = '{"app42":{"push":{"message":{"payload":"' . $message . '","expiry":"' . Util::getUTCFormattedTimestamp() . '"}}}}';
            $signParams['body'] = $body;
            if ($query instanceof JSONObject) {
                $queryObject = array();
                array_push($queryObject, $query);
                $signParams['jsonQuery'] = json_encode($queryObject);
                $queryParams['jsonQuery'] = json_encode($queryObject);
            } else {
                $signParams['jsonQuery'] = json_encode($queryObject);
                $queryParams['jsonQuery'] = json_encode($queryObject);
            }

            $params = array_merge($queryParams, $signParams);
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/sendTargetPush/" . $encodedDbName . "/" . $encodedCollectionName;
            $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
            $pushResponseObj = new PushNotificationResponseBuilder();
            $pushObj = $pushResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $pushObj;
    }

    function sendMessageToInActiveUsers($startDate, $endDate, $message) {
        Util::throwExceptionIfNullOrBlank($message, "Message");
        Util::throwExceptionIfNullOrBlank($startDate, "startDate");
        Util::throwExceptionIfNullOrBlank($endDate, "endDate");
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		    $params = null;
            $strStartDate = (date("Y-m-d\TG:i:s", strtotime($startDate)) . substr((string) microtime(), 1, 4) . "Z");
            $strEndDate = (date("Y-m-d\TG:i:s", strtotime($endDate)) . substr((string) microtime(), 1, 4) . "Z");
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $body = null;
            $body = '{"app42":{"push":{"message":{"startDate":"' . $strStartDate . '","endDate":"' . $strEndDate . '","payload":"' . $message . '","expiry":"' . Util::getUTCFormattedTimestamp() . '"}}}}';
            $signParams['body'] = $body;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/sendMessageToInActiveUsers";
            $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
            $pushResponseObj = new PushNotificationResponseBuilder();
            $pushObj = $pushResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $pushObj;
    }

    function scheduleMessageToUser($userName, $message, $expiryDate) {
        Util::throwExceptionIfNullOrBlank($message, "Message");
        Util::throwExceptionIfNullOrBlank($userName, "UserName");
        Util::throwExceptionIfNullOrBlank($expiryDate, "expiryDate");
        $encodedUserName = Util::encodeParams($userName);
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		    $params = null;
            $strStartDate = (date("Y-m-d\TG:i:s", strtotime($startDate)) . substr((string) microtime(), 1, 4) . "Z");
            $strEndDate = (date("Y-m-d\TG:i:s", strtotime($endDate)) . substr((string) microtime(), 1, 4) . "Z");
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $body = null;
            $body = '{"app42":{"push":{"message":{"userName":"' . $userName . '","payload":"' . $message . '","expiry":"' .Util::getUTCFormattedTimestamps($expiryDate) . '"}}}}';
            $signParams['body'] = $body;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/sendMessage/" . $encodedUserName;
            $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
            $pushResponseObj = new PushNotificationResponseBuilder();
            $pushObj = $pushResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $pushObj;
    }

    function unsubscribeDevice($userName, $deviceToken) {
        Util::throwExceptionIfNullOrBlank($userName, "User Name");
        Util::throwExceptionIfNullOrBlank($deviceToken, "Device Token");
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $body = null;
            $body = '{"push":{"userName":"' . $userName . '","deviceToken":"' . $deviceToken . '"}}}';
            $signParams['body'] = $body;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/unsubscribeDevice";
            $response = RestClient::put($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
            $pushResponseObj = new PushNotificationResponseBuilder();
            $pushObj = $pushResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $pushObj;
    }

    function resubscribeDevice($userName, $deviceToken) {
        Util::throwExceptionIfNullOrBlank($userName, "User Name");
        Util::throwExceptionIfNullOrBlank($deviceToken, "Device Token");
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $body = null;
            $body = '{"push":{"userName":"' . $userName . '","deviceToken":"' . $deviceToken . '"}}}';
            $signParams['body'] = $body;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/reSubscribeDevice";
            $response = RestClient::put($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
            $pushResponseObj = new PushNotificationResponseBuilder();
            $pushObj = $pushResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $pushObj;
    }

    function deleteAllDevices($userName) {
        Util::throwExceptionIfNullOrBlank($userName, "User Name");
        $responseObj = new App42Response();
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $body = null;
            $signParams['userName'] = $userName;
            $queryParams['userName'] = $userName;
            $params = array_merge($queryParams, $signParams);
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/deleteAll";
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

    function sendPushMessageToDevice($username, $deviceId, $message) {
        Util::throwExceptionIfNullOrBlank($username, "username");
        Util::throwExceptionIfNullOrBlank($message, "message");
        Util::throwExceptionIfNullOrBlank($deviceId, "deviceId");
        $encodedUsername = Util::encodeParams($username);
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $body = null;
            $body = '{"app42":{"push":{"message":{"username":"' . $username . '","payload":"' . $message . '","deviceId":"' . $deviceId . '","expiry":"' .Util::getUTCFormattedTimestamp() . '"}}}}';
            $signParams['body'] = $body;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/sendMessageToDevice/" . $encodedUsername;
            $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
            $pushResponseObj = new PushNotificationResponseBuilder();
            $pushObj = $pushResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $pushObj;
    }


     function updatePushBadgeforDevice($userName,$deviceToken,$badges) {
        Util::throwExceptionIfNullOrBlank($userName, "User Name");
        Util::throwExceptionIfNullOrBlank($deviceToken, "Device Token");
        Util::throwExceptionIfNullOrBlank($badges, "badges");
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $body = null;
             $body = '{"app42":{"push":{"userName":"' . $userName . '","deviceToken":"' . $deviceToken . '","increment":"' . $badges . '"}}}';
             $signParams['body'] = $body;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/resetPushBadgeforDevice";
            $response = RestClient::put($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
            $pushResponseObj = new PushNotificationResponseBuilder();
            $pushObj = $pushResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $pushObj;
    }


      function updatePushBadgeforUser($userName,$badges) {
        Util::throwExceptionIfNullOrBlank($userName, "User Name");
        Util::throwExceptionIfNullOrBlank($badges, "badges");
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $body = null;
             $body = '{"app42":{"push":{"userName":"' . $userName . '","increment":"' . $badges . '"}}}';
             $signParams['body'] = $body;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/resetPushBadgeforUser";
            $response = RestClient::put($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
            $pushResponseObj = new PushNotificationResponseBuilder();
            $pushObj = $pushResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $pushObj;
    }
    
       function clearAllBadgeCount($userName,$deviceToken) {
        Util::throwExceptionIfNullOrBlank($userName, "User Name");
        Util::throwExceptionIfNullOrBlank($deviceToken, "Device Token");
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $body = null;
             $body = '{"app42":{"push":{"userName":"' . $userName . '","deviceToken":"' . $deviceToken . '","increment":"' . 0 . '"}}}';
             $signParams['body'] = $body;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/resetPushBadgeforDevice";
            $response = RestClient::put($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
            $pushResponseObj = new PushNotificationResponseBuilder();
            $pushObj = $pushResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $pushObj;
    }
    /**
     * Delete a particular channel from app.
     * @param  $channelName - Name of the channel which you want to delete.
     * @return App42Response
     * @throws App42Exception
     */
       function deleteChannel($channelName){

        Util::throwExceptionIfNullOrBlank($channelName, "ChannelName");
        $responseObj = new App42Response();
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
            $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $signParams['channelName'] = $channelName;
            $queryParams['channelName'] = $channelName;
            $params = array_merge($queryParams, $signParams);
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/deleteChannel" ;
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
    
    /**
     * Gets the count of the users who are subscribed on a particular channel.
     * @param  $channelName - Name of channel for which you want to get the count.
     * @return App42Response
     * @throws App42Exception
     */
    function getChannelUsersCount($channelName) {
         Util::throwExceptionIfNullOrBlank($channelName, "ChannelName");
        $pushObj = new App42Response();
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
            $params = null;
           ;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
             $signParams['channelName'] = $channelName;
              $queryParams['channelName'] = $channelName;
              $params = array_merge($queryParams, $signParams);
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/count/channel";
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept, $headerParams);
            $pushObj->setStrResponse($response->getResponse());
            $pushObj->setResponseSuccess(true);
            $pushResponseObj = new PushNotificationResponseBuilder();
            $pushObj->setTotalRecords($pushResponseObj->getTotalRecords($response->getResponse()));
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $pushObj;
    }
    
    /**
     * Gets the users list for a particular channel by paging.
     * @param $channelName - Name of channel for which you want to get users.
     * @param $max - Maximum number of users to be fetched.
     * @param  $offset - From where the users are to be fetched. 
     * @return Array Of PushNotification
     * @throws App42Exception
     */
     function getChannelUsers($channelName,$max,$offset) {

        Util::throwExceptionIfNullOrBlank($channelName, "ChannelName");
        Util::validateMax($max);
        Util::throwExceptionIfNullOrBlank($max, "Max");
        Util::throwExceptionIfNullOrBlank($offset, "Offset");
        $encodedMax = Util::encodeParams($max);
        $encodedOffset = Util::encodeParams($offset);
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
            $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $signParams['channelName'] = $channelName;
            $queryParams['channelName'] = $channelName;
            $signParams['max'] = $max;
            $signParams['offset'] = $offset;
            $params = array_merge($queryParams, $signParams);
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/channel" . "/" . $encodedMax . "/" . $encodedOffset;
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept, $headerParams);
            $pushResponseObj = new PushNotificationResponseBuilder();
           $pushObj = $pushResponseObj->buildArrayResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $pushObj;
    }
    
    
    /**
     * Gets the count of all the subscribed channels of a particular user.
     * @param  $userName - Name of the user for which you want to get a count of the subscribed channels.
     * @return App42Response
     * @throws App42Exception
     */
     function getUserSubscribedChannelsCount($userName) {
          Util::throwExceptionIfNullOrBlank($userName, "UserName");
        $objUtil = new Util($this->apiKey, $this->secretKey);
         $pushObj = new App42Response();
        try {
            $params = null;
           
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $signParams['userName'] = $userName;
            $queryParams['userName'] = $userName;
            $params = array_merge($queryParams, $signParams);
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/count/userchannels";
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept, $headerParams);
            $pushObj->setStrResponse($response->getResponse());
            $pushObj->setResponseSuccess(true);
            $pushResponseObj = new PushNotificationResponseBuilder();
            $pushObj->setTotalRecords($pushResponseObj->getTotalRecords($response->getResponse()));
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $pushObj;
    }
    
    /**
     * Gets the list of subscribed channels for a particular user by paging.
     * @param $userName - Name of the user for which you want to get the subscribed channels.
     * @param $max - Maximum number of channels to be fetched.
     * @param type $offset - From where the channels are to be fetched. 
     * @return PushNotification Object
     * @throws App42Exception
     */
       function getUserSubscribedChannels($userName,$max,
			$offset) {

        Util::throwExceptionIfNullOrBlank($userName, "User Name");
        Util::validateMax($max);
            Util::throwExceptionIfNullOrBlank($max, "Max");
            Util::throwExceptionIfNullOrBlank($offset, "Offset");
        $encodedMax = Util::encodeParams($max);
        $encodedOffset = Util::encodeParams($offset);
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
            $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $signParams['userName'] = $userName;
            $queryParams['userName'] = $userName;
            $signParams['max'] = $max;
            $signParams['offset'] = $offset;
            $params = array_merge($queryParams, $signParams);
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/userchannels" . "/" . $encodedMax . "/" . $encodedOffset;
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept, $headerParams);
            $pushResponseObj = new PushNotificationResponseBuilder();
            $pushObj = $pushResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $pushObj;
    }
    
     function getAllDevicesOfUser($userName) {  
          Util::throwExceptionIfNullOrBlank($userName, "User Name");
        $encodedUserName= Util::encodeParams($userName);
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
                $baseURL = $baseURL."/getAllDevices/".$encodedUserName;
                $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept, $headerParams);
               $pushResponseObj = new PushNotificationResponseBuilder();
               $pushObj = $pushResponseObj->buildArrayResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $pushObj;
    }
    
}
?>
