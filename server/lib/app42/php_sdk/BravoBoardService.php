<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
include_once 'RestClient.class.php';
include_once 'Util.php';
include_once 'BravoBoardResponseBuilder.php';
include_once 'App42Exception.php';
include_once 'App42Response.php';
include_once 'App42Service.php';
include_once 'App42API.php';
/**
 * Description of BravoBoardService
 *
 * @author PRAVIN
 */
class BravoBoardService extends App42Service {

    protected $resource = "bravoboard";
    protected $url;
    protected $version = "1.0";
    protected $content_type = "application/json";
    protected $accept = "application/json";
     public function __construct($apiKey, $secretKey) {
        $this->apiKey = $apiKey;
        $this->secretKey = $secretKey;
        $this->url = $this->version . "/" . $this->resource;
    }

     function postActivityWithItemId($userID, $itemID,$comment) {

       
           	Util::throwExceptionIfNullOrBlank($userID, "User Id");
		Util::throwExceptionIfNullOrBlank($itemID, "Item Id");
		Util::throwExceptionIfNullOrBlank($comment, "Comment");
                $objUtil = new Util($this->apiKey, $this->secretKey);
            try {
                $params = null;
                $headerParams = array();
                $queryParams = array();
                $signParams = $this->populateSignParams();
                $metaHeaders = $this->populateMetaHeaderParams();
                $headerParams = array_merge($signParams, $metaHeaders);
                $body = null;
                $body = '{"app42":{"bravo":{"userId":"' . $userID . '","itemId":"' . $itemID . '","comment":"' . $comment . '"}}}';

                $signParams['body'] = $body;
                $signature = urlencode($objUtil->sign($signParams));
                $headerParams['signature'] = $signature;
                $contentType = $this->content_type;
                $accept = $this->accept;
                $baseURL = $this->url;
                $baseURL = $baseURL."/comment";
                $response = RestClient::post($baseURL,$params, null, null, $contentType, $accept, $body, $headerParams);
                $bravoResponseObj = new BravoBoardResponseBuilder();
                $bravoObj = $bravoResponseObj->buildResponse($response->getResponse());
            } catch (App42Exception $e) {
                throw $e;
            } catch (Exception $e) {
                throw new App42Exception($e);
            }

            return $bravoObj;
        } 
        
         function postActivityWithItemIdAndTag($userID, $itemID,$comment,$tagName) {

       
           	Util::throwExceptionIfNullOrBlank($userID, "User Id");
		Util::throwExceptionIfNullOrBlank($itemID, "Item Id");
		Util::throwExceptionIfNullOrBlank($comment, "Comment");
		Util::throwExceptionIfNullOrBlank($tagName, "TagName");
                $otherMetaHeaders = array();
                $otherMetaHeaders['tag'] =$tagName;
                $this->setOtherMetaHeaders($otherMetaHeaders);
                $objUtil = new Util($this->apiKey, $this->secretKey);
            try {
                $params = null;
                $headerParams = array();
                $queryParams = array();
                $signParams = $this->populateSignParams();
                $metaHeaders = $this->populateMetaHeaderParams();
                $headerParams = array_merge($signParams, $metaHeaders);
                $body = null;
                $body = '{"app42":{"bravo":{"userId":"' . $userID . '","itemId":"' . $itemID . '","comment":"' . $comment . '"}}}';

                $signParams['body'] = $body;
                $signature = urlencode($objUtil->sign($signParams));
                $headerParams['signature'] = $signature;
                $contentType = $this->content_type;
                $accept = $this->accept;
                $baseURL = $this->url;
                $baseURL = $baseURL."/comment";
                $response = RestClient::post($baseURL,$params, null, null, $contentType, $accept, $body, $headerParams);
                $bravoResponseObj = new BravoBoardResponseBuilder();
                $bravoObj = $bravoResponseObj->buildResponse($response->getResponse());
            } catch (App42Exception $e) {
                throw $e;
            } catch (Exception $e) {
                throw new App42Exception($e);
            }

            return $bravoObj;
        } 
        
        
        function postActivity($userID,$comment) {       
           	Util::throwExceptionIfNullOrBlank($userID, "User Id");
		Util::throwExceptionIfNullOrBlank($comment, "Comment");
                $objUtil = new Util($this->apiKey, $this->secretKey);
            try {
                $params = null;
				$headerParams = array();
                $queryParams = array();
                $signParams = $this->populateSignParams();
                $metaHeaders = $this->populateMetaHeaderParams();
                $headerParams = array_merge($signParams, $metaHeaders);
                $body = null;
                for ($itemID = '', $i = 0, $z = strlen($a = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789')-1; $i != 16; $x = rand(0,$z), $itemID .= $a{$x}, $i++); 
    
                $body = '{"app42":{"bravo":{"userId":"' . $userID . '","itemId":"' . $itemID . '","comment":"' . $comment . '"}}}';

                $signParams['body'] = $body;
                $signature = urlencode($objUtil->sign($signParams));
                $headerParams['signature'] = $signature;
                $contentType = $this->content_type;
                $accept = $this->accept;
                $baseURL = $this->url;
                $baseURL = $baseURL."/comment";
                $response = RestClient::post($baseURL,$params, null, null, $contentType, $accept, $body, $headerParams);
                $bravoResponseObj = new BravoBoardResponseBuilder();
                $bravoObj = $bravoResponseObj->buildResponse($response->getResponse());
            } catch (App42Exception $e) {
                throw $e;
            } catch (Exception $e) {
                throw new App42Exception($e);
            }

            return $bravoObj;
        } 
         function postActivityWithTag($userID,$comment,$tagName) {       
           	Util::throwExceptionIfNullOrBlank($userID, "User Id");
		Util::throwExceptionIfNullOrBlank($comment, "Comment");
                	Util::throwExceptionIfNullOrBlank($tagName, "TagName");
                $otherMetaHeaders = array();
                $otherMetaHeaders['tag'] =$tagName;
                $this->setOtherMetaHeaders($otherMetaHeaders);
                $objUtil = new Util($this->apiKey, $this->secretKey);
            try {
                $params = null;
				$headerParams = array();
                $queryParams = array();
                $signParams = $this->populateSignParams();
                $metaHeaders = $this->populateMetaHeaderParams();
                $headerParams = array_merge($signParams, $metaHeaders);
                $body = null;
                for ($itemID = '', $i = 0, $z = strlen($a = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789')-1; $i != 16; $x = rand(0,$z), $itemID .= $a{$x}, $i++); 
    
                $body = '{"app42":{"bravo":{"userId":"' . $userID . '","itemId":"' . $itemID . '","comment":"' . $comment . '"}}}';

                $signParams['body'] = $body;
                $signature = urlencode($objUtil->sign($signParams));
                $headerParams['signature'] = $signature;
                $contentType = $this->content_type;
                $accept = $this->accept;
                $baseURL = $this->url;
                $baseURL = $baseURL."/comment";
                $response = RestClient::post($baseURL,$params, null, null, $contentType, $accept, $body, $headerParams);
                $bravoResponseObj = new BravoBoardResponseBuilder();
                $bravoObj = $bravoResponseObj->buildResponse($response->getResponse());
            } catch (App42Exception $e) {
                throw $e;
            } catch (Exception $e) {
                throw new App42Exception($e);
            }

            return $bravoObj;
        } 
        
        
        function getActivityByItem($itemId) {
            Util::throwExceptionIfNullOrBlank($itemId, "Item Id");           
            $encodedItemId = Util::encodeParams($itemId); 
            $objUtil = new Util($this->apiKey, $this->secretKey);
            try {
                $params = null;
                $headerParams = array();
                $queryParams = array();
                $signParams = $this->populateSignParams();
                $metaHeaders = $this->populateMetaHeaderParams();
                $headerParams = array_merge($signParams, $metaHeaders);
                $signParams['itemId'] = $itemId;                    
                $signature = urlencode($objUtil->sign($signParams)); //die();
                $headerParams['signature'] = $signature;
                $contentType = $this->content_type;
                $accept = $this->accept;
                $baseURL = $this->url;
                $baseURL = $baseURL ."/comment/item" . "/" . $encodedItemId;
                $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept, $headerParams);
                $bravoResponseObj = new BravoBoardResponseBuilder();
                $bravoObj = $bravoResponseObj->buildArrayResponse($response->getResponse());
            } catch (App42Exception $e) {
                throw $e;
            } catch (Exception $e) {
                throw new App42Exception($e);
            }
            return $bravoObj;
        }
        
        function getActivityByItemByPaging($itemId, $max,$offset) {
          Util::throwExceptionIfNullOrBlank($itemId, "Item Id");
            Util::validateMax($max);
            Util::throwExceptionIfNullOrBlank($max, "Max");
            Util::throwExceptionIfNullOrBlank($offset, "Offset");
            $encodedItemId = Util::encodeParams($itemId); 
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
                  $signParams['itemId'] = $itemId;           
                $signParams['max'] = $max;
                $signParams['offset'] = $offset;
                $signature = urlencode($objUtil->sign($signParams)); //die();
                $headerParams['signature'] = $signature;
                $contentType = $this->content_type;
                $accept = $this->accept;
                $baseURL = $this->url;
                $baseURL = $baseURL .  "/comment/item/" . $encodedItemId ."/" . $encodedMax . "/" . $encodedOffset;
                $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept, $headerParams);
                $bravoResponseObj = new BravoBoardResponseBuilder();
                $bravoObj = $bravoResponseObj->buildArrayResponse($response->getResponse());
            } catch (App42Exception $e) {
                throw $e;
            } catch (Exception $e) {
                throw new App42Exception($e);
            }
            return $bravoObj;
        } 
        
         function getActivityCountByItem($itemId) {
        Util::throwExceptionIfNullOrBlank($itemId, "Item Id");
        $encodedItemId = Util::encodeParams($itemId); 
        $objUtil = new Util($this->apiKey, $this->secretKey);        
        $bravoObj = new App42Response();
        try {
            $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $signParams['itemId'] = $itemId;         
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/comment/item/" . $encodedItemId . "/count";
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept, $headerParams);
            $bravoObj->setStrResponse($response->getResponse());
            $bravoObj->setResponseSuccess(true);
            $bravoResponseObj = new BravoBoardResponseBuilder();
            $bravoObj->setTotalRecords($bravoResponseObj->getTotalRecords($response->getResponse()));
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $bravoObj;
    }
    
     function getActivityByTag($tagName, $max,$offset) {
          Util::throwExceptionIfNullOrBlank($tagName, "Tag Name");
            Util::validateMax($max);
            Util::throwExceptionIfNullOrBlank($max, "Max");
            Util::throwExceptionIfNullOrBlank($offset, "Offset");
            $encodedTagName = Util::encodeParams($tagName); 
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
                $signParams['tagName'] = $tagName;               
                $signParams['max'] = $max;
                $signParams['offset'] = $offset;                
                $signature = urlencode($objUtil->sign($signParams)); //die();
                $headerParams['signature'] = $signature;
                $contentType = $this->content_type;
                $accept = $this->accept;
                $baseURL = $this->url;
                $baseURL = $baseURL . "/comment/paging/tag/" . $encodedTagName . "/" . $encodedMax . "/"
					. $encodedOffset;
                $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept, $headerParams);
                $bravoResponseObj = new BravoBoardResponseBuilder();
                $bravoObj = $bravoResponseObj->buildArrayResponse($response->getResponse());
            } catch (App42Exception $e) {
                throw $e;
            } catch (Exception $e) {
                throw new App42Exception($e);
            }
            return $bravoObj;
        } 
        
        
       function getActivityCountByTag($tagName) {
        Util::throwExceptionIfNullOrBlank($tagName, "Tag Name");
        $encodedTagName = Util::encodeParams($tagName); 
        $objUtil = new Util($this->apiKey, $this->secretKey);     
        $bravoObj = new App42Response();
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
            $baseURL = $baseURL . "/comment/tag/" . $encodedTagName . "/count";
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept, $headerParams);
            $bravoObj->setStrResponse($response->getResponse());
            $bravoObj->setResponseSuccess(true);
            $bravoResponseObj = new BravoBoardResponseBuilder();
            $bravoObj->setTotalRecords($bravoResponseObj->getTotalRecords($response->getResponse()));
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $bravoObj;
    }
    
   
           function addTagToActivity($tag, $activityId,$userId) {

                Util::throwExceptionIfNullOrBlank($tag, "tag");
		Util::throwExceptionIfNullOrBlank($activityId, "commentId");
		Util::throwExceptionIfNullOrBlank($userId, "userId");
                $objUtil = new Util($this->apiKey, $this->secretKey);
            try {
                $params = null;
				$headerParams = array();
                $queryParams = array();
                $signParams = $this->populateSignParams();
                $metaHeaders = $this->populateMetaHeaderParams();
                $headerParams = array_merge($signParams, $metaHeaders);
                $body = null;
                $body = '{"app42":{"bravo":{"tag":"' . $tag . '","commentId":"' . $activityId . '","userId":"' . $userId . '"}}}';

                $signParams['body'] = $body;
                $signature = urlencode($objUtil->sign($signParams));
                $headerParams['signature'] = $signature;
                $contentType = $this->content_type;
                $accept = $this->accept;
                $baseURL = $this->url;
                $baseURL = $baseURL."/addtagtocomment";;
                $response = RestClient::put($baseURL,$params, null, null, $contentType, $accept, $body, $headerParams);
                $bravoResponseObj = new BravoBoardResponseBuilder();
                $bravoObj = $bravoResponseObj->buildResponse($response->getResponse());
            } catch (App42Exception $e) {
                throw $e;
            } catch (Exception $e) {
                throw new App42Exception($e);
            }

            return $bravoObj;
        } 
        
        function deleteActivityById($activityId){

     Util::throwExceptionIfNullOrBlank($activityId, "activityId");
        $encodedActivityId = Util::encodeParams($activityId);
        $responseObj = new App42Response();
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $signParams['commentId'] = $activityId;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL ."/deleteComment/" . $encodedActivityId;
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
    
     function deleteTag($activityId, $userId,$tagName){

     Util::throwExceptionIfNullOrBlank($activityId, "activityId");
     Util::throwExceptionIfNullOrBlank($userId, "userId");
     Util::throwExceptionIfNullOrBlank($tagName, "tagName");
        $encodedActivityId = Util::encodeParams($activityId);
        $encodedUserID = Util::encodeParams($userId);
        $encodedTagName = Util::encodeParams($tagName);
        $responseObj = new App42Response();
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $signParams['commentId'] = $activityId;
             $signParams['userId'] = $userId;
              $signParams['tagName'] = $tagName;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/deleteTag/" . $encodedActivityId . "/" . $encodedUserID . "/" . $encodedTagName;
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
    
     
     function getActivityByUser($userId, $max,$offset) {
          Util::throwExceptionIfNullOrBlank($userId, "UserId");
            Util::validateMax($max);
            Util::throwExceptionIfNullOrBlank($max, "Max");
            Util::throwExceptionIfNullOrBlank($offset, "Offset");
            $encodedUserId = Util::encodeParams($userId); 
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
                $signParams['userId'] = $userId;               
                $signParams['max'] = $max;
                $signParams['offset'] = $offset;                
                $signature = urlencode($objUtil->sign($signParams)); //die();
                $headerParams['signature'] = $signature;
                $contentType = $this->content_type;
                $accept = $this->accept;
                $baseURL = $this->url;
                $baseURL = $baseURL .  "/activities" . "/" . $encodedUserId . "/" . $encodedMax . "/" . $encodedOffset;
                $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept, $headerParams);
                $bravoResponseObj = new BravoBoardResponseBuilder();
                $bravoObj = $bravoResponseObj->buildArrayResponse($response->getResponse());
            } catch (App42Exception $e) {
                throw $e;
            } catch (Exception $e) {
                throw new App42Exception($e);
            }
            return $bravoObj;
        } 
        
        
       function getActivityCountByUser($userId) {
        Util::throwExceptionIfNullOrBlank($userId, "UserId");
        $encodedUserId = Util::encodeParams($userId); 
        $objUtil = new Util($this->apiKey, $this->secretKey);     
        $bravoObj = new App42Response();
        try {
            $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
             $signParams['userId'] = $userId;       
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL .  "/activity/userId/" . $encodedUserId . "/count";
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept, $headerParams);
            $bravoObj->setStrResponse($response->getResponse());
            $bravoObj->setResponseSuccess(true);
            $bravoResponseObj = new BravoBoardResponseBuilder();
            $bravoObj->setTotalRecords($bravoResponseObj->getTotalRecords($response->getResponse()));
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $bravoObj;
    }
    
}
?>
