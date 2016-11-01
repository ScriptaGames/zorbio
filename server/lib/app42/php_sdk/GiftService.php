<?php

include_once 'RestClient.class.php';
include_once 'Util.php';
include_once 'GiftResponseBuilder.php';
include_once 'App42Exception.php';
include_once 'App42Response.php';
include_once 'App42Service.php';
include_once 'App42API.php';

class GiftService extends App42Service {

    protected $resource = "gift";
    protected $apiKey;
    protected $secretKey;
    protected $url;
    protected $version = "1.0";
    protected $content_type = "application/json";
    protected $accept = "application/json";

    /**
     * Constructor that takes
     *
     * @param apiKey
     * @param secretKey
     * @param baseURL
     *
     */
    public function __construct($apiKey, $secretKey) {
        //$this->resource = "charge";
        $this->apiKey = $apiKey;
        $this->secretKey = $secretKey;
        $this->url = $this->version . "/" . $this->resource;
    }

    function createGift($name, $icon, $displayName, $description, $tag) {

        Util::throwExceptionIfNullOrBlank($name, "Name");
        Util::throwExceptionIfNullOrBlank($displayName, "DisplayName");
        Util::throwExceptionIfNullOrBlank($icon, "icon");
        Util::throwExceptionIfNullOrBlank($tag, "tag");
        Util::throwExceptionIfNullOrBlank($description, "Description");
        $objUtil = new Util($this->apiKey, $this->secretKey);

        //$file = fopen($filePath, r);
        if (!file_exists($icon)) {
            throw new App42Exception("The file with the name '$icon' not found ");
        }

        $body = null;
        try {
            $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $postParams = array();
            $postParams['name'] = $name;
            $postParams['displayName'] = $displayName;
            $postParams['description'] = $description;
            $postParams['tag'] = $tag;
            $params = array_merge($postParams, $signParams);
            $signature = urlencode($objUtil->sign($params)); //die();
            $params['uploadFile'] = "@" . $icon;
            $headerParams['signature'] = $signature;
            //CONTENT_TYPE == "multipart/form-data"
            $contentType = "multipart/form-data";
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL;
            $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
            $giftResponseObj = new GiftResponseBuilder();
            $giftObj = $giftResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $giftObj;
    }

    function getAllGifts() {

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
            $baseURL = $baseURL . "/all";
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept, $headerParams);
            $giftResponseObj = new GiftResponseBuilder();
            $giftObj = $giftResponseObj->buildArrayResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $giftObj;
    }

    function getGiftByName($name) {

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
            $signParams['name'] = $name;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/" . $encodedName;
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept, $headerParams);
            $giftResponseObj = new GiftResponseBuilder();
            $giftObj = $giftResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $giftObj;
    }

    function getGiftsByTag($tagName) {

        Util::throwExceptionIfNullOrBlank($tagName, "Tag Name");
        $encodedTagName = Util::encodeParams($tagName);
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
            $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $signParams['tagName'] = $tagName;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/tag/" . $encodedTagName;
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept, $headerParams);
            $giftResponseObj = new GiftResponseBuilder();
            $giftObj = $giftResponseObj->buildArrayResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $giftObj;
    }

    function deleteGiftByName($name) {

        Util::throwExceptionIfNullOrBlank($name, "Name");
        $encodedName = Util::encodeParams($name);
        $responseObj = new App42Response();
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
            $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $signParams['name'] = $name;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/" . $encodedName;
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

    function sendGift($name, $sender, $recipients, $message) {
        Util::throwExceptionIfNullOrBlank($name, "Name");
        Util::throwExceptionIfNullOrBlank($sender, "Sender");
        Util::throwExceptionIfNullOrBlank($recipients, "Recipients");
        Util::throwExceptionIfNullOrBlank($message, "Message");
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
            $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $body = null;

            if (is_array($recipients)) {

                $body = '{"app42":{"gift":{"name":"' . $name . '","sender":"' . $sender . '","expiry":"' . date("Y-m-d\TG:i:s") . substr((string) microtime(), 1, 4) . "Z" . '","message":"' . $message . '","recipient":' . json_encode($recipients) . '}}}';
            } else {
                $body = '{"app42":{"gift":{"name":"' . $name . '","sender":"' . $sender . '","expiry":"' . date("Y-m-d\TG:i:s") . substr((string) microtime(), 1, 4) . "Z" . '","message":"' . $message . '","recipient":' . $recipients . '}}}';
            }

            $signParams['body'] = $body;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/send";
            $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
             $giftResponseObj = new GiftResponseBuilder();
            $giftObj = $giftResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $giftObj;
    }

    function requestGift($name, $sender, $recipients, $message) {
        Util::throwExceptionIfNullOrBlank($name, "Name");
        Util::throwExceptionIfNullOrBlank($sender, "Sender");
        Util::throwExceptionIfNullOrBlank($recipients, "Recipients");
        Util::throwExceptionIfNullOrBlank($message, "Message");
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
            $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $body = null;
            if (is_array($recipients)) {
                
                $body = '{"app42":{"gift":{"name":"' . $name . '","sender":"' . $sender . '","expiry":"' . date("Y-m-d\TG:i:s") . substr((string) microtime(), 1, 4) . "Z" . '","message":"' . $message . '","recipient":' . json_encode($recipients) . '}}}';
            } else {
                $body = '{"app42":{"gift":{"name":"' . $name . '","sender":"' . $sender . '","expiry":"' . date("Y-m-d\TG:i:s") . substr((string) microtime(), 1, 4) . "Z" . '","message":"' . $message . '","recipient":' . $recipients . '}}}';
            }

            $signParams['body'] = $body;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/request";
            $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
            $giftResponseObj = new GiftResponseBuilder();
            $giftObj = $giftResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $giftObj;
    }

    function getGiftRequest($name, $userName) {

        Util::throwExceptionIfNullOrBlank($name, "Name");
        Util::throwExceptionIfNullOrBlank($userName, "User Name");
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
            $signParams['name'] = $name;
            $signParams['userName'] = $userName;
            $signParams['requestType'] = "WISHREQUEST";
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL ."/giftrequest/" . $encodedName . "/" . $encodedUserName . "/type/" . "WISHREQUEST";
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept, $headerParams);
            $giftResponseObj = new GiftResponseBuilder();
            $giftObj = $giftResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $giftObj;
    }

    function distributeGifts($name, $recipients, $counts) {
        Util::throwExceptionIfNullOrBlank($name, "Name");
        Util::throwExceptionIfNullOrBlank($recipients, "Recipients");
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
            $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $body = null;

            if (is_array($recipients)) {

                $body = '{"app42":{"gift":{"name":"' . $name . '","counts":"' . $counts . '","expiry":"' . date("Y-m-d\TG:i:s") . substr((string) microtime(), 1, 4) . "Z" . '","recipient":' . json_encode($recipients) . '}}}';
            } else {
                $body = '{"app42":{"gift":{"name":"' . $name . '","sender":"' . $sender . '","expiry":"' . date("Y-m-d\TG:i:s") . substr((string) microtime(), 1, 4) . "Z" . '","recipient":' . json_encode($recipients) . '}}}';
            }
            $signParams['body'] = $body;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/sendtousers";
            $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
            $giftResponseObj = new GiftResponseBuilder();
            $giftObj = $giftResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $giftObj;
    }

    function getGiftCount($name, $userName) {

         $responseObj = new App42Response();
        Util::throwExceptionIfNullOrBlank($name, "Name");
        Util::throwExceptionIfNullOrBlank($userName, "User Name");
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
            $signParams['name'] = $name;
            $signParams['userName'] = $userName;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/giftrequest/" . $encodedName . "/" . $encodedUserName;
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept, $headerParams);
            $responseObj->setStrResponse($response->getResponse());
            $responseObj->setResponseSuccess(true);
            $giftResponseObj = new GiftResponseBuilder();
            $responseObj->setTotalRecords($giftResponseObj->getTotalRecords($response->getResponse()));
            
            
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $responseObj;
    }

    function acceptGiftRequest($requestId, $recipient) {

        Util::throwExceptionIfNullOrBlank($requestId, "RequestId");
        Util::throwExceptionIfNullOrBlank($recipient, "recipient");
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
            $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $body = null;
            $body = '{"app42":{"gift":{"requestId":"' . $requestId . '","recipient":"' . $recipient . '"}}}';
            $signParams['body'] = $body;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/giftRequestAccpeted";
            $response = RestClient::put($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
          $giftResponseObj = new GiftResponseBuilder();
            $giftObj = $giftResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $giftObj;
    }

    function rejectGiftRequest($requestId, $recipient) {

        Util::throwExceptionIfNullOrBlank($requestId, "RequestId");
        Util::throwExceptionIfNullOrBlank($recipient, "recipient");
        $encodedRequestId = Util::encodeParams($requestId);
        $encodedRecipient = Util::encodeParams($recipient);
       $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
            $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $signParams['requestId'] = $requestId;
            $signParams['recipient'] = $recipient;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/rejectedGift" . "/requestId/" . $encodedRequestId . "/recipient/" . $encodedRecipient;
            $response = RestClient::delete($baseURL, $params, null, null, $contentType, $accept, $headerParams);
            $giftResponseObj = new GiftResponseBuilder();
            $giftObj = $giftResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $giftObj;
    }

    function removeGift($requestId, $recipient) {

        Util::throwExceptionIfNullOrBlank($requestId, "RequestId");
        Util::throwExceptionIfNullOrBlank($recipient, "recipient");
        $encodedRequestId = Util::encodeParams($requestId);
        $encodedRecipient = Util::encodeParams($recipient);
        $responseObj = new App42Response();
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
            $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $signParams['requestId'] = $requestId;
            $signParams['recipient'] = $recipient;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/removeGift" . "/requestId/" . $encodedRequestId . "/recipient/" . $encodedRecipient;

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

}

?>
