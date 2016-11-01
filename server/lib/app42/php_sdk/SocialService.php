<?php

include_once 'RestClient.class.php';
include_once 'Util.php';
include_once 'SocialResponseBuilder.php';
include_once 'App42Exception.php';
include_once 'App42Service.php';

/**
 * Connect to the User's multiple social accounts. Also used to update the
 * status individually or all at once for the linked social accounts.
 */
class SocialService extends App42Service {

    protected $resource = "social";
    protected $url;
    protected $version = "1.0";
    protected $content_type = "application/json";
    protected $accept = "application/json";

    /**
     * The costructor for the Service
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
        $this->url =  $this->version . "/" . $this->resource;
    }

    /**
     * Links the User Facebook access credentials to the App User account.
     *
     * @param userName
     *            - Name of the user whose Facebook account to be linked
     * @param accessToken
     *            - Facebook Access Token that has been received after
     *            authorization
     * @param appId
     *            - Facebook App Id
     * @param appSecret
     *            - Facebook App Secret
     *
     * @returns The Social object
     */
    function linkUserFacebookAccount($userName, $accessToken, $appId = null, $appSecret = null) {
        $argv = func_get_args();
        if (count($argv) == 4) {
            $response = null;
            $social = null;
            Util::throwExceptionIfNullOrBlank($userName, "userName");
            Util::throwExceptionIfNullOrBlank($appId, "appId");
            Util::throwExceptionIfNullOrBlank($appSecret, "appSecret");
            Util::throwExceptionIfNullOrBlank($accessToken, "accessToken");

            $objUtil = new Util($this->apiKey, $this->secretKey);
            try {
			    $params = null;
                $headerParams = array();
                $queryParams = array();
                $signParams = $this->populateSignParams();
                $metaHeaders = $this->populateMetaHeaderParams();
                $headerParams = array_merge($signParams, $metaHeaders);
                $body = null;
                $body = '{"app42":{"social":{"userName":"' . $userName . '","accessToken":"' . $accessToken . '","appId":"' . $appId . '","appSecret":"' . $appSecret . '"}}}';
                $signParams['body'] = $body;
                $signature = urlencode($objUtil->sign($signParams)); //die();
                $headerParams['signature'] = $signature;
                $contentType = $this->content_type;
                $accept = $this->accept;
                $baseURL = $this->url;
                $baseURL = $baseURL . "/facebook/linkuser";

                $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
                $socialResponseObj = new SocialResponseBuilder();
                $socialObj = $socialResponseObj->buildResponse($response->getResponse());
            } catch (App42Exception $e) {
                throw $e;
            } catch (Exception $e) {
                throw new App42Exception($e);
            }
            return $socialObj;
        } else {
            /**
             * Links the User Facebook access credentials to the App User account.
             *
             * @param userName
             *            - Name of the user whose Facebook account to be linked
             * @param accessToken
             *            - Facebook Access Token that has been received after
             *            authorization
             * 
             * @returns The Social object
             */
            Util::throwExceptionIfNullOrBlank($userName, "userName");
            Util::throwExceptionIfNullOrBlank($accessToken, "accessToken");
            $objUtil = new Util($this->apiKey, $this->secretKey);
            try {
			    $params = null;
                $headerParams = array();
                $queryParams = array();
                $signParams = $this->populateSignParams();
                $metaHeaders = $this->populateMetaHeaderParams();
                $headerParams = array_merge($signParams, $metaHeaders);
                $body = null;
                $body = '{"app42":{"social":{"userName":"' . $userName . '","accessToken":"' . $accessToken . '"}}}';
                $signParams['body'] = $body;
                $signature = urlencode($objUtil->sign($signParams)); //die();
                $headerParams['signature'] = $signature;
                $contentType = $this->content_type;
                $accept = $this->accept;
                $baseURL = $this->url;
                $baseURL = $baseURL . "/facebook/linkuser/accesscredentials";
                $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
                $socialResponseObj = new SocialResponseBuilder();
                $socialObj = $socialResponseObj->buildResponse($response->getResponse());
            } catch (App42Exception $e) {
                throw $e;
            } catch (Exception $e) {
                throw new App42Exception($e);
            }
            return $socialObj;
        }
    }

    /**
     * Updates the Facebook status of the specified user.
     *
     * @param userName
     *            - Name of the user for whom the status needs to be updated
     * @param status
     *            - status that has to be updated
     *
     * @returns The Social object
     */
    function updateFacebookStatus($userName, $status) {

        Util::throwExceptionIfNullOrBlank($userName, "UserName");
        Util::throwExceptionIfNullOrBlank($status, "Status");
        $objUtil = new Util($this->apiKey, $this->secretKey);

        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $body = null;
            $body = '{"app42":{"social":{"userName":"' . $userName . '","status":"' . $status . '"}}}';

            $signParams['body'] = $body;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/facebook/updatestatus";
            $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
            $socialResponseObj = new SocialResponseBuilder();
            $socialObj = $socialResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $socialObj;
    }

    /**
     * Links the User Twitter access credentials to the App User account.
     *
     * @param userName
     *            - Name of the user whose Twitter account to be linked
     * @param consumerKey
     *            - Twitter App Consumer Key
     * @param consumerSecret
     *            - Twitter App Consumer Secret
     * @param accessToken
     *            - Twitter Access Token that has been received after
     *            authorization
     * @param accessTokenSecret
     *            - Twitter Access Token Secret that has been received after
     *            authorization
     *
     * @returns The Social object
     */
    function linkUserTwitterAccount($userName, $accessToken, $accessTokenSecret, $consumerKey = null, $consumerSecret = null) {
        $argv = func_get_args();
        if (count($argv) == 5) {
            $response = null;
            $social = null;
            Util::throwExceptionIfNullOrBlank($userName, "userName");
            Util::throwExceptionIfNullOrBlank($consumerKey, "consumerKey");
            Util::throwExceptionIfNullOrBlank($consumerSecret, "consumerSecret");
            Util::throwExceptionIfNullOrBlank($accessToken, "accessToken");
            Util::throwExceptionIfNullOrBlank($accessTokenSecret, "accessTokenSecret");
            $objUtil = new Util($this->apiKey, $this->secretKey);
            try {
                $params = null;
                $headerParams = array();
                $queryParams = array();
                $signParams = $this->populateSignParams();
                $metaHeaders = $this->populateMetaHeaderParams();
                $headerParams = array_merge($signParams, $metaHeaders);
                $body = null;
                $body = '{"app42":{"social":{"userName":"' . $userName . '","consumerKey":"' . $consumerKey . '","consumerSecret":"' . $consumerSecret . '","accessToken":"' . $accessToken . '","$accessTokenSecret":"' . $accessTokenSecret . '"}}}';

                $signParams['body'] = $body;
                $signature = urlencode($objUtil->sign($signParams)); //die();
                $headerParams['signature'] = $signature;
                $contentType = $this->content_type;
                $accept = $this->accept;
                $baseURL = $this->url;
                $baseURL = $baseURL . "/twitter/linkuser";
                $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
                $socialResponseObj = new SocialResponseBuilder();
                $socialObj = $socialResponseObj->buildResponse($response->getResponse());
            } catch (App42Exception $e) {
                throw e;
            } catch (Exception $e) {
                throw new App42Exception($e);
            }
            return $socialObj;
        } else {
            /**
             * Links the User Twitter access credentials to the App User account.
             *
             * @param userName
             *            - Name of the user whose Twitter account to be linked
             * @param accessToken
             *            - Twitter Access Token that has been received after
             *            authorization
             * @param accessTokenSecret
             *            - Twitter Access Token Secret that has been received after
             *            authorization
             * 
             * @returns The Social object
             */			
            Util::throwExceptionIfNullOrBlank($userName, "userName");
            Util::throwExceptionIfNullOrBlank($accessToken, "accessToken");
            Util::throwExceptionIfNullOrBlank($accessTokenSecret, "accessTokenSecret");
            $objUtil = new Util($this->apiKey, $this->secretKey);
            try {
			
                $params = null;
                $headerParams = array();
                $queryParams = array();
                $signParams = $this->populateSignParams();
                $metaHeaders = $this->populateMetaHeaderParams();
                $headerParams = array_merge($signParams, $metaHeaders);
                $body = null;
                $body = '{"app42":{"social":{"userName":"' . $userName . '","accessToken":"' . $accessToken . '","accessTokenSecret":"' . $accessTokenSecret . '"}}}';
				
                $signParams['body'] = $body;
                $signature = urlencode($objUtil->sign($signParams)); //die();
                $headerParams['signature'] = $signature;
                $contentType = $this->content_type;
                $accept = $this->accept;
                $baseURL = $this->url;
                $baseURL = $baseURL . "/twitter/linkuser/accesscredentials";
                $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
				
                $socialResponseObj = new SocialResponseBuilder();
                $socialObj = $socialResponseObj->buildResponse($response->getResponse());
            } catch (App42Exception $e) {
                throw $e;
            } catch (Exception $e) {
                throw new App42Exception($e);
            }
            return $socialObj;
        }
    }

    /**
     * Updates the Twitter status of the specified user.
     *
     * @param userName
     *            - Name of the user for whom the status needs to be updated
     * @param status
     *            - status that has to be updated
     *
     * @returns The Social object
     */
    function updateTwitterStatus($userName, $status) {
        $response = null;
        $social = null;
        Util::throwExceptionIfNullOrBlank($userName, "userName");
        Util::throwExceptionIfNullOrBlank($status, "status");
        $objUtil = new Util($this->apiKey, $this->secretKey);
        echo"jjjj";
        try {
             $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $body = null;
            //echo date("Y-m-d\TG:i:s",strtotime($profile->dateOfBirth)).substr((string)microtime(), 1, 4)."Z";
            $body = '{"app42":{"social":{"userName":"' . $userName . '","status":"' . $status . '"}}}';
            $signParams['body'] = $body;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/twitter/updatestatus";
            $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
            $socialResponseObj = new SocialResponseBuilder();
            $socialObj = $socialResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $socialObj;
    }

    /**
     * Links the User LinkedIn access credentials to the App User account.
     *
     * @param userName
     *            - Name of the user whose LinkedIn account to be linked
     * @param apiKey
     *            - LinkedIn App API Key
     * @param secretKey
     *            - LinkedIn App Secret Key
     * @param accessToken
     *            - LinkedIn Access Token that has been received after
     *            authorization
     * @param accessTokenSecret
     *            - LinkedIn Access Token Secret that has been received after
     *            authorization
     *
     * @returns The Social object
     */
    function linkUserLinkedInAccount($userName, $accessToken, $accessTokenSecret, $apiKey = null, $secretKey = null) {
        $argv = func_get_args();
        if (count($argv) == 5) {
            $response = null;
            $social = null;
            Util::throwExceptionIfNullOrBlank($userName, "userName");
            Util::throwExceptionIfNullOrBlank($apiKey, "apiKey");
            Util::throwExceptionIfNullOrBlank($secretKey, "secretKey");
            Util::throwExceptionIfNullOrBlank($accessToken, "accessToken");
            Util::throwExceptionIfNullOrBlank($accessTokenSecret, "accessTokenSecret");
            $objUtil = new Util($this->apiKey, $this->secretKey);
            try {
			    $params = null;
                $headerParams = array();
                $queryParams = array();
                $signParams = $this->populateSignParams();
                $metaHeaders = $this->populateMetaHeaderParams();
                $headerParams = array_merge($signParams, $metaHeaders);
                $body = null;
                $body = '{"app42":{"social":{"userName":"' . $userName . '","apiKey":"' . $apiKey . '","secretKey":"' . $secretKey . '","accessToken":"' . $accessToken . '","accessTokenSecret":"' . $accessTokenSecret . '"}}}';
                $signParams['body'] = $body;
                $signature = urlencode($objUtil->sign($signParams)); //die();
                $headerParams['signature'] = $signature;
                $contentType = $this->content_type;
                $accept = $this->accept;
                $baseURL = $this->url;
                $baseURL = $baseURL . "/linkedin/linkuser";
                $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
                $socialResponseObj = new SocialResponseBuilder();
                $socialObj = $socialResponseObj->buildResponse($response->getResponse());
            } catch (App42Exception $e) {
                throw $e;
            } catch (Exception $e) {
                throw new App42Exception($e);
            }
            return $socialObj;
        } else {
            /**
             * Links the User LinkedIn access credentials to the App User account.
             *
             * @param userName
             *            - Name of the user whose LinkedIn account to be linked
             * @param accessToken
             *            - LinkedIn Access Token that has been received after
             *            authorization
             * @param accessTokenSecret
             *            - LinkedIn Access Token Secret that has been received after
             *            authorization
             *
             * @returns The Social object
             */
            Util::throwExceptionIfNullOrBlank($userName, "userName");
            Util::throwExceptionIfNullOrBlank($accessToken, "accessToken");
            Util::throwExceptionIfNullOrBlank($accessTokenSecret, "accessTokenSecret");
            $objUtil = new Util($this->apiKey, $this->secretKey);
            try {
			    $params = null;
                $headerParams = array();
                $queryParams = array();
                $signParams = $this->populateSignParams();
                $metaHeaders = $this->populateMetaHeaderParams();
                $headerParams = array_merge($signParams, $metaHeaders);
                $body = null;
                $body = '{"app42":{"social":{"userName":"' . $userName . '","accessToken":"' . $accessToken . '","accessTokenSecret":"' . $accessTokenSecret . '"}}}';

                $signParams['body'] = $body;
                $signature = urlencode($objUtil->sign($signParams)); //die();
                $headerParams['signature'] = $signature;
                $contentType = $this->content_type;
                $accept = $this->accept;
                $baseURL = $this->url;
                $baseURL = $baseURL . "/linkedin/linkuser/accesscredentials";
                $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
                $socialResponseObj = new SocialResponseBuilder();
                $socialObj = $socialResponseObj->buildResponse($response->getResponse());
            } catch (App42Exception $e) {
                throw $e;
            } catch (Exception $e) {
                throw new App42Exception($e);
            }
            return $socialObj;
        }
    }

    /**
     * Updates the LinkedIn status of the specified user.
     *
     * @param userName
     *            - Name of the user for whom the status needs to be updated
     * @param status
     *            - status that has to be updated
     *
     * @returns The Social object
     */
    function updateLinkedInStatus($userName, $status) {
        $response = null;
        $social = null;
        Util::throwExceptionIfNullOrBlank($userName, "userName");
        Util::throwExceptionIfNullOrBlank($status, "status");
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $body = null;
            $body = '{"app42":{"social":{"userName":"' . $userName . '","status":"' . $status . '"}}}';
            $signParams['body'] = $body;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/linkedin/updatestatus";
            $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
            $socialResponseObj = new SocialResponseBuilder();
            $socialObj = $socialResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $socialObj;
    }

    /**
     * Updates the status for all linked social accounts of the specified user.
     *
     * @param userName
     *            - Name of the user for whom the status needs to be updated
     * @param status
     *            - status that has to be updated
     *
     * @returns The Social object
     */
    function updateSocialStatusForAll($userName, $status) {
        $response = null;
        $social = null;
        Util::throwExceptionIfNullOrBlank($userName, "userName");
        Util::throwExceptionIfNullOrBlank($status, "status");
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $body = null;
            $body = '{"app42":{"social":{"userName":"' . $userName . '","status":"' . $status . '"}}}';
            $signParams['body'] = $body;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/social/updatestatus/all";
            $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
            $socialResponseObj = new SocialResponseBuilder();
            $socialObj = $socialResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $socialObj;
    }

    /**
     * This function returns a list of facebook friends of the specified user by
     * accessing the facebook account.
     * 
     * @param userName
     *            - Name of the user whose Facebook friends account has to be
     *            retrieve
     * @return Social Object
     */
    function getFacebookFriendsFromLinkUser($userName) {

        Util::throwExceptionIfNullOrBlank($userName, "UserName");
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
            $baseURL = $baseURL . "/facebook/friends/" . $encodedUserName;
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept, $headerParams);
            $socialResponseObj = new SocialResponseBuilder();
            $socialObj = $socialResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $socialObj;
    }

    /**
     * This function returns a list of facebook friends of the specified user
     * using a given authorization token. To get the friend list here, user
     * needs not to log into the facebook account.
     * 
     * @param accessToken
     *            - Facebook Access Token that has been received after authorization
     * @return Social Object
     */
    function getFacebookFriendsFromAccessToken($accessToken) {

        Util::throwExceptionIfNullOrBlank($accessToken, "AccessToken");
        $encodedAccessToken = Util::encodeParams($accessToken);
        $objUtil = new Util($this->apiKey, $this->secretKey);

        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $signParams['accessToken'] = $accessToken;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/facebook/friends/OAuth/" . $encodedAccessToken;
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept, $headerParams);
            $socialResponseObj = new SocialResponseBuilder();
            $socialObj = $socialResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $socialObj;
    }

    function facebookPublishStream($accessToken, $name, $filePath, $message) {

        Util::throwExceptionIfNullOrBlank($name, "File Name");
        Util::throwExceptionIfNullOrBlank($accessToken, "Access Token");
        Util::throwExceptionIfNullOrBlank($filePath, "FilePath");
        Util::throwExceptionIfNullOrBlank($message, "Message");
        $objUtil = new Util($this->apiKey, $this->secretKey);
        $responseObj = new App42Response();
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
            $postParams = array();
            $postParams['name'] = $name;
            $postParams['accessToken'] = $accessToken;
            if ($message != null && $message != "") {
                $postParams['message'] = $message;
            }
            $params = array_merge($postParams, $signParams);
            $signature = urlencode($objUtil->sign($params)); //die();
            $params['uploadFile'] = "@" . $filePath;
            $headerParams['signature'] = $signature;
            //CONTENT_TYPE == "multipart/form-data"
            $contentType = "multipart/form-data";
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/facebook/wallpost";
            $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
            $responseObj->setStrResponse($response->getResponse());
            $responseObj->setResponseSuccess(true);
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $responseObj;
    }

    function facebookLinkPost($accessToken, $link, $message) {

        Util::throwExceptionIfNullOrBlank($accessToken, "Access Token");
        Util::throwExceptionIfNullOrBlank($link, "Link");
        Util::throwExceptionIfNullOrBlank($message, "Message");
        $objUtil = new Util($this->apiKey, $this->secretKey);
        $responseObj = new App42Response();
        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $body = null;
            $body = '{"app42":{"social":{"link":"' . $link . '","accessToken":"' . $accessToken . '","message":"' . $message . '"}}}';
            $signParams['body'] = $body;
             $signature = urlencode($objUtil->sign($signParams));
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/facebook/publishstream";
            $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
            $responseObj->setStrResponse($response->getResponse());
            $responseObj->setResponseSuccess(true);
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $responseObj;
    }

     function facebookLinkPostWithCustomThumbnail($accessToken, $link, $message,$pictureUrl,
			$name, $description) {

        Util::throwExceptionIfNullOrBlank($accessToken, "Access Token");
        Util::throwExceptionIfNullOrBlank($link, "Link");
        Util::throwExceptionIfNullOrBlank($message, "Message");
        Util::throwExceptionIfNullOrBlank($pictureUrl, "PictureUrl");
        Util::throwExceptionIfNullOrBlank($name, "File Name");
        Util::throwExceptionIfNullOrBlank($description, "Description");
        $objUtil = new Util($this->apiKey, $this->secretKey);
        $responseObj = new App42Response();
        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $body = null;
            $body = '{"app42":{"social":{"link":"' . $link . '","accessToken":"' . $accessToken . '","message":"' . $message . '","picture":"' . $pictureUrl . '","name":"' . $name . '","description":"' . $description . '"}}}';
            $signParams['body'] = $body;
             $signature = urlencode($objUtil->sign($signParams));
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/facebook/publishstream";
            $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
            $responseObj->setStrResponse($response->getResponse());
            $responseObj->setResponseSuccess(true);
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $responseObj;
    }

    function getFacebookProfile($accessToken) {

       Util::throwExceptionIfNullOrBlank($accessToken, "Access Token");
        $encodedAccessToken = Util::encodeParams($accessToken);
        $objUtil = new Util($this->apiKey, $this->secretKey);
       $body=null;
        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $signParams['accessToken'] = $accessToken;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL. "/facebook/me/OAuth/" . $encodedAccessToken;
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept,$headerParams);
            $socialResponseObj = new SocialResponseBuilder();
            $socialObj = $socialResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $socialObj;
    }

     function getFacebookProfilesFromIds($facebookIds) {
       Util::throwExceptionIfNullOrBlank($facebookIds, "FacebookIds");
        $objUtil = new Util($this->apiKey, $this->secretKey);
       $body=null;
        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            if (is_array($facebookIds)) {
            $headerParams['userList'] = json_encode($facebookIds);
            }
            else{
                $headerParams['userList'] = $facebookIds;
            }
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL. "/facebook/ids";
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept,$headerParams);
            $socialResponseObj = new SocialResponseBuilder();
            $socialObj = $socialResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $socialObj;
    }

}
?>
