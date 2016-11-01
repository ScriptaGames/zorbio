<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


include_once 'RestClient.class.php';
include_once 'Util.php';
include_once 'App42Response.php';
include_once 'App42Service.php';
include_once 'AvatarResponseBuilder.php';
include_once 'App42Config.php';

class AvatarService extends App42Service {

    protected $version = "1.0";
    protected $resource = "avatar";
    protected $content_type = "application/json";
    protected $accept = "application/json";
    protected $config="";

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
        $this->config = App42Config::getInstance()->getBaseURL();
    }

      function createAvatar($name, $userName, $filePath,$description) {

        Util::throwExceptionIfNullOrBlank($name, "Avatar Name");
        Util::throwExceptionIfNullOrBlank($userName, "User Name");
        Util::throwExceptionIfNullOrBlank($filePath, "FilePath");
        Util::throwExceptionIfNullOrBlank($description, "Description");
        $encodedUserName = Util::encodeParams($userName);
        $objUtil = new Util($this->apiKey, $this->secretKey);

        //$file = fopen($filePath, r);
        if (!file_exists($filePath)) {
            throw new App42Exception("The file with the name '$filePath' not found ");
        }
        $body = null;
        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $postParams= array();
            $postParams['avatarName'] = $name;
            $postParams['userName'] = $userName;
            $postParams['description'] = $description;
            $params = array_merge($postParams, $signParams);            
            $signature = urlencode($objUtil->sign($params)); //die();
            $params['createAvatar'] = "@" . $filePath;
            $headerParams['signature'] = $signature;         
            //CONTENT_TYPE == "multipart/form-data"
            $contentType = "multipart/form-data";
            $accept = $this->accept;
            $baseURL = $this->url;
              $baseURL = $baseURL . "/file/" . $encodedUserName;
            $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
             $avatarRespObj = new AvatarResponseBuilder();
            $avatarObj = $avatarRespObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
      return $avatarObj;
    }



    function createAvatarFromFacebook($avatarName, $userName, $accessToken, $description) {

        Util::throwExceptionIfNullOrBlank($avatarName, "Avatar Name");
        Util::throwExceptionIfNullOrBlank($userName, "User Name");
        Util::throwExceptionIfNullOrBlank($accessToken, "AccessToken");
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
            $body = '{"app42":{"avatar":{"userName":"' . $userName . '","avatarName":"' . $avatarName . '","accessToken":"' . $accessToken . '","description":"' . $description . '"}}}';
            $signParams['body'] = $body;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/facebook";
            $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
            $avatarRespObj = new AvatarResponseBuilder();
            $avatarObj = $avatarRespObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
       return $avatarObj;
    }

    function createAvatarFromWebURL($avatarName, $userName, $webUrl, $description) {

        Util::throwExceptionIfNullOrBlank($avatarName, "Avatar Name");
        Util::throwExceptionIfNullOrBlank($userName, "User Name");
        Util::throwExceptionIfNullOrBlank($webUrl, "WebUrl");
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
            $body = '{"app42":{"avatar":{"userName":"' . $userName . '","avatarName":"' . $avatarName . '","webUrl":"' . $webUrl . '","description":"' . $description . '"}}}';
            $signParams['body'] = $body;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/weburl";
            $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
            $avatarRespObj = new AvatarResponseBuilder();
            $avatarObj = $avatarRespObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
         return $avatarObj;
    }

    function getAvatarByName($avatarName, $userName) {
        Util::throwExceptionIfNullOrBlank($avatarName, "Avatar Name");
        Util::throwExceptionIfNullOrBlank($userName, "User Name");
        $encodedAvatarName = Util::encodeParams($avatarName);
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
            $signParams['avatarName'] = $avatarName;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/" . $encodedUserName . "/" . $encodedAvatarName;
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept, $headerParams);
            $avatarRespObj = new AvatarResponseBuilder();
            $avatarObj = $avatarRespObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }

        return $avatarObj;
    }


    function getAllAvatars($userName) {
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
            $baseURL = $baseURL . "/" . $encodedUserName ;
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept, $headerParams);
            $avatarRespObj = new AvatarResponseBuilder();
            $avatarObj = $avatarRespObj->buildArrayResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }

        return $avatarObj;
    }

    function getCurrentAvatar($userName) {
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
            $baseURL = $baseURL . "/" ."current/". $encodedUserName ;
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept, $headerParams);
            $avatarRespObj = new AvatarResponseBuilder();
            $avatarObj = $avatarRespObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }

        return $avatarObj;
    }


      function changeCurrentAvatar($userName,$avatarName) {

        Util::throwExceptionIfNullOrBlank($avatarName, "Avatar Name");
        Util::throwExceptionIfNullOrBlank($userName, "User Name");
        $objUtil = new Util($this->apiKey, $this->secretKey);

        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $body = null;
            $body = '{"app42":{"avatar":{"userName":"' . $userName . '","avatarName":"' . $avatarName . '"}}}';
            $signParams['body'] = $body;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL ;
            $response = RestClient::put($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
            $avatarRespObj = new AvatarResponseBuilder();
            $avatarObj = $avatarRespObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
         return $avatarObj;
    }
    
    /**
     * Updates avatar name and description of existing avatars from app.
     * @param  $avatarName - Name of the avatar for which you want to update.
     * @param  $userName - Name of the user for which you want to update his avatar.
     * @param  $newAvatarName - Name of the new avatar.
     * @param  $description - Add New description about the avatar or put null to remain old.
     *  @return Avatar Object
     * @throws App42Exception
     */
     function updateAvatar($avatarName, $userName,
			$newAvatarName, $description) {

        Util::throwExceptionIfNullOrBlank($avatarName, "Avatar Name");
        Util::throwExceptionIfNullOrBlank($userName, "User Name");
        Util::throwExceptionIfNullOrBlank($newAvatarName, "NewAvatarName");
        $objUtil = new Util($this->apiKey, $this->secretKey);

        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $body = null;
            $body = '{"app42":{"avatar":{"userName":"' . $userName . '","avatarName":"' . $avatarName . '","newAvatarName":"' . $newAvatarName . '","newDescription":"' . $newDescription . '"}}}';
            $signParams['body'] = $body;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL ."/edit";;
            $response = RestClient::put($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
            $avatarRespObj = new AvatarResponseBuilder();
            $avatarObj = $avatarRespObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
         return $avatarObj;
    }
    
    /**
     * Delete a particular avatar based on name.
     * @param  $userName - Name of the user who want to delete his/her avatar.
     * @param  $avatarName - Name of the avatar to be deleted.
     * @return App42Response
     * @throws App42Exception
     */
    function deleteAvatarByName($userName, $avatarName){

        Util::throwExceptionIfNullOrBlank($userName, "User Name");
         Util::throwExceptionIfNullOrBlank($avatarName, "Avatar Name");
        $encodedUserName = Util::encodeParams($userName);
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
            $queryParams['avatarName'] = $avatarName;
             $params = array_merge($queryParams, $signParams);
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/deleteAvatar/userName/" . $encodedUserName;
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
     * Delete all avatars of a particular user.
     * @param  $userName - Name of the user who wants to delete his/her all avatars.
     * @return App42Response
     * @throws App42Exception
     */
 function deleteAllAvatars($userName){

        Util::throwExceptionIfNullOrBlank($userName, "User Name");
        $encodedUserName = Util::encodeParams($userName);
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
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/deleteAllAvatars/userName/" . $encodedUserName;
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
