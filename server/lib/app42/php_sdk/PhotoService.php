<?php

include_once 'RestClient.class.php';
include_once 'Util.php';
include_once 'AlbumResponseBuilder.php';
include_once 'App42Log.php';
include_once 'App42Response.php';
include_once 'App42Service.php';
/**
 * Adds Photo to the created Album on the Cloud All photos for a given Album can
 * be managed through this service. Photos can be uploaded to the cloud.
 * Uploaded photos are accessible through the generated URL. The service also
 * creates a thumbnail for the Photo which has been uploaded.
 *
 * @see Album
 * @see Photo
 */
class PhotoService extends App42Service {

    protected $version = "1.0";
    protected $resource = "gallery";
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
        $this->url = $this->version . "/" . $this->resource;
    }

    /**
     * Save the JSON document in given database name and collection name.
     * @param dbName Unique handler for storage name
     * @param collectionName Name of collection under which JSON doc has to be saved.
     * @param json Target JSON document to be saved
     * @return Returns the saved document containing Object Id as a unique handler of saved document.
     * 
     */
    public function testUpload($path) {
        return;
    }

    /**
     * Adds Photo for a particular user and album. The Photo is uploaded on the
     * cloud
     *
     * @params userName
     *            - Name of the User whose photo has to be added
     * @params albumName
     *            - Name of the Album in which photo has to be added
     * @params photoName
     *            - Name of the Photo that has to be added
     * @params photoDescription
     *            - Description of the Photo that has to be added
     * @params path
     *            - Path from where Photo has to be picked for addition
     *
     * @return Album object containing the Photo which has been added
     */
    function addPhoto($userName, $albumName, $photoName, $photoDescription, $path) {

        Util::throwExceptionIfNullOrBlank($userName, "User Name");
        Util::throwExceptionIfNullOrBlank($albumName, "Album Name");
        Util::throwExceptionIfNullOrBlank($photoName, "Photo Name");
        Util::throwExceptionIfNullOrBlank($photoDescription, "Description");
        Util::throwExceptionIfNullOrBlank($path, "Path");
        Util::throwExceptionIfNotValidImageExtension($path, "Photo Path");
        $encodedUserName = Util::encodeParams($userName);
        $objUtil = new Util($this->apiKey, $this->secretKey);

        if (!file_exists($path)) {
            throw new App42Exception("File Not Found");
        }
        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $postParams= array();
            $postParams['userName'] = $userName;
            $postParams['albumName'] = $albumName;
            $postParams['name'] = $photoName;
            $postParams['description'] = $photoDescription;
            $params = array_merge($postParams, $signParams);
            $signature = urlencode($objUtil->sign($params)); //die();
            $params['imageFile'] = "@" . $path;
            $headerParams['signature'] = $signature;
            $contentType = "multipart/form-data";
            $body = null;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/" . $encodedUserName;
            $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
            $photoResponseObj = new AlbumResponseBuilder();
            $photoObj = $photoResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $photoObj;
    }

    /**
     * Fetches all the Photos based on the userName
     *
     * @params userName
     *            - Name of the User whose photos have to be fetched
     *
     * @return List of Album object containing all the Photos for the given
     *         userName
     */
    public function getPhotos($userName) {

        Util::throwExceptionIfNullOrBlank($userName, "User Name");
        $encodedUserName = Util::encodeParams($userName);
        $objUtil = new Util($this->apiKey, $this->secretKey);
        $albumList = array();
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
            $photoResponseObj = new AlbumResponseBuilder();
            $albumList = $photoResponseObj->buildArrayResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $albumList;
    }

    /**
     * Fetches all Photos based on the userName and albumName
     *
     * @params userName
     *            - Name of the User whose photos have to be fetched
     * @params albumName
     *            - Name of the Album from which photos have to be fetched
     *
     * @return Album object containing all the Photos for the given userName and
     *         albumName
     */
    public function getPhotosByAlbumName($userName, $albumName, $max = null, $offset = null) {
        $argv = func_get_args();
        if (count($argv) == 2) {
            Util::throwExceptionIfNullOrBlank($userName, "User Name");
            Util::throwExceptionIfNullOrBlank($albumName, "Album Name");
            $encodedUserName = Util::encodeParams($userName);
            $encodedAlbumName = Util::encodeParams($albumName);
            $objUtil = new Util($this->apiKey, $this->secretKey);

            try {
			$params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
                $signParams['albumName'] = $albumName;
                $signParams['userName'] = $userName;
                $signature = urlencode($objUtil->sign($signParams)); //die();
                $headerParams['signature'] = $signature;
                $contentType = $this->content_type;
                $accept = $this->accept;
                $baseURL = $this->url;
                $baseURL = $baseURL . "/" . $encodedUserName . "/" . $encodedAlbumName;
                $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept,$headerParams);
                $photoResponseObj = new AlbumResponseBuilder();
                $photoObj = $photoResponseObj->buildResponse($response->getResponse());
            } catch (App42Exception $e) {
                throw $e;
            } catch (Exception $e) {
                throw new App42Exception($e);
            }
            return $photoObj;
        } else {

            /**
             * Fetches all Photos based on the userName and album name by paging.
             *
             * @params userName
             *            - Name of the User whose photos have to be fetched
             * @params albumName
             *            - Name of the Album from which photos have to be fetched
             * @params max
             *            - Maximum number of records to be fetched
             * @params offset
             *            - From where the records are to be fetched
             *
             * @return Album object containing all the Photos for the given userName and
             *         albumName
             */
            Util::throwExceptionIfNullOrBlank($userName, "User Name");
            Util::throwExceptionIfNullOrBlank($albumName, "Album Name");
            Util::throwExceptionIfNullOrBlank($max, "Max");
            Util::throwExceptionIfNullOrBlank($offset, "Offset");
            Util::validateMax($max);
            $encodedUserName = Util::encodeParams($userName);
            $encodedAlbumName = Util::encodeParams($albumName);
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
                $signParams['albumName'] = $albumName;
                $signParams['userName'] = $userName;
                $signParams['max'] = $max;
                $signParams['offset'] = $offset;
                $signature = urlencode($objUtil->sign($signParams)); //die();
                $headerParams['signature'] = $signature;
                $contentType = $this->content_type;
                $accept = $this->accept;
                $baseURL = $this->url;
                $baseURL = $baseURL . "/album/" . $encodedUserName . "/" . $encodedAlbumName . "/paging/" . $encodedMax . "/" . $encodedOffset;
                $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept,$headerParams);
                $photoResponseObj = new AlbumResponseBuilder();
                $photoObj = $photoResponseObj->buildResponse($response->getResponse());
            } catch (App42Exception $e) {
                throw $e;
            } catch (Exception $e) {
                throw new App42Exception($e);
            }
            return $photoObj;
        }
    }

    /**
     * Fetches the count of all Photos based on the userName and album name
     *
     * @params userName
     *            - Name of the User whose count of photos have to be fetched
     * @params albumName
     *            - Name of the Album from which count of photos have to be
     *            fetched
     *
     * @return App42Response object containing the count of all the Photos for
     *         the given userName and albumName
     */
    public function getPhotosCountByAlbumName($userName, $albumName) {

        Util::throwExceptionIfNullOrBlank($userName, "User Name");
        Util::throwExceptionIfNullOrBlank($albumName, "Album Name");
        $encodedUserName = Util::encodeParams($userName);
        $encodedAlbumName = Util::encodeParams($albumName);
        $objUtil = new Util($this->apiKey, $this->secretKey);

        try {
		    $params = null;
            $photoObj = new App42Response();
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);

            $signParams['albumName'] = $albumName;
            $signParams['userName'] = $userName;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/" . $encodedUserName . "/" . $encodedAlbumName . "/count";
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept,$headerParams);
            $photoObj->setStrResponse($response->getResponse());
            $photoObj->setResponseSuccess(true);
            $photoResponseObj = new AlbumResponseBuilder();
            $photoObj->setTotalRecords($photoResponseObj->getTotalRecords($response->getResponse()));
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $photoObj;
    }

    /**
     * Fetches the particular photo based on the userName, album name and photo
     * name
     *
     * @params userName
     *            - Name of the User whose photo has to be fetched
     * @params albumName
     *            - Name of the Album from which photo has to be fetched
     * @params photoName
     *            - Name of the Photo that has to be fetched
     *
     * @return Album object containing the Photo for the given userName,
     *         albumName and photoName
     */
    public function getPhotosByAlbumAndPhotoName($userName, $albumName, $photoName) {

        Util::throwExceptionIfNullOrBlank($userName, "User Name");
        Util::throwExceptionIfNullOrBlank($albumName, "Album Name");
        Util::throwExceptionIfNullOrBlank($photoName, "Photo Name");
        $encodedUserName = Util::encodeParams($userName);
        $encodedAlbumName = Util::encodeParams($albumName);
        $encodedPhotoName = Util::encodeParams($photoName);

        $objUtil = new Util($this->apiKey, $this->secretKey);

        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $signParams['albumName'] = $albumName;
            $signParams['userName'] = $userName;
            $signParams['name'] = $photoName;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/" . $encodedUserName . "/" . $encodedAlbumName . "/" . $encodedPhotoName;
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept,$headerParams);
            $photoResponseObj = new AlbumResponseBuilder();
            $photoObj = $photoResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $photoObj;
    }

    /**
     * Removes the particular Photo from the specified Album for a particular
     * user. Note: The Photo is removed from the cloud and wont be accessible in
     * future
     *
     * @param userName
     *            - Name of the User whose photo has to be removed
     * @param albumName
     *            - Name of the Album in which photo has to be removed
     * @param photoName
     *            - Name of the Photo that has to be removed
     *
     * @return App42Response if removed successfully

     */
    public function removePhoto($userName, $albumName, $photoName) {

        Util::throwExceptionIfNullOrBlank($userName, "User Name");
        Util::throwExceptionIfNullOrBlank($albumName, "Album Name");
        Util::throwExceptionIfNullOrBlank($photoName, "Photo Name");
        $encodedUserName = Util::encodeParams($userName);
        $encodedAlbumName = Util::encodeParams($albumName);
        $encodedPhotoName = Util::encodeParams($photoName);

        $responseObj = new App42Response();
        $objUtil = new Util($this->apiKey, $this->secretKey);

        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $signParams['albumName'] = $albumName;
            $signParams['userName'] = $userName;
            $signParams['name'] = $photoName;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/" . $encodedUserName . "/" . $encodedAlbumName . "/" . $encodedPhotoName;
            $response = RestClient::delete($baseURL, $params, null, null, $contentType, $accept,$headerParams);
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
     * Add tags to the Photos for the user in the album.
     *
     * @params userName
     *            - Name of the User whose name has to be tagged to photo
     * @params albumName
     *            - Album name whose photo is to be tagged
     * @params photoName
     *            - Photo name to be tagged
     * @params tagList
     *            - List of tages in Photo
     *
     * @return Album object containing the Photo which has been added
     */
    function addTagToPhoto($uName, $albName, $phName, $tagList) {
        Util::throwExceptionIfNullOrBlank($uName, "User Name");
        Util::throwExceptionIfNullOrBlank($albName, "Album Name");
        Util::throwExceptionIfNullOrBlank($phName, "Photo Name");
        Util::throwExceptionIfNullOrBlank($tagList, "Tag");
        $objUtil = new Util($this->apiKey, $this->secretKey);

        try {
            $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $body = null;
            if (is_array($tagList)) {
                $body = '{"app42":{"photo":{"userName":"' . $uName . '","photoName":"' . $phName . '", "albumName":"' . $albName . '", "tags": { "tag": ' . json_encode($tagList) . '}}}}';
            } else {

                $body = '{"app42":{"photo":{"userName":"' . $uName . '","photoName":"' . $phName . '", "albumName":"' . $albName . '", "tags": { "tag": "' . $tagList . '"}}}}';
            }
            $signParams['body'] = $body;
            $signature = urlencode($objUtil->sign($signParams));
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/tag";
            $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body,$headerParams);
           $photoResponseObj = new AlbumResponseBuilder();
            $photoObj = $photoResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {

            throw new App42Exception($e);
        }
        return $photoObj;
    }

    /**
     * Fetches all the Photos based on the userName and tag
     *
     * @params userName
     *            - Name of the User whose photos have to be fetched
     * @params tag
     *            - tag on which basis photos have to be fetched
     *
     * @return List of Album object containing all the Photos for the given
     *         userName
     */
    public function getTaggedPhotos($userName, $tag) {
        Util::throwExceptionIfNullOrBlank($userName, "User Name");
        Util::throwExceptionIfNullOrBlank($tag, "Tag Name");
        $encodedUserName = Util::encodeParams($userName);
        $encodedTag = Util::encodeParams($tag);
        $objUtil = new Util($this->apiKey, $this->secretKey);

        $albumList = array();
        try {
            $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $signParams['userName'] = $userName;
            $signParams['tag'] = $tag;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/tag/" . $encodedTag . "/userName/" . $encodedUserName;
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept,$headerParams);
            $photoResponseObj = new AlbumResponseBuilder();
            $albumList = $photoResponseObj->buildArrayResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $albumList;
    }

    function grantAccess($albName, $uName, $phName, $aclList) {

        Util::throwExceptionIfNullOrBlank($uName, "User Name");
        Util::throwExceptionIfNullOrBlank($albName, "Album Name");
        Util::throwExceptionIfNullOrBlank($phName, "Photo Name");
        Util::throwExceptionIfNullOrBlank($aclList, "ACL List");
        $objUtil = new Util($this->apiKey, $this->secretKey);

        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);

            $aclArray = array();
            foreach ($aclList as $acl) {
                $aclValue = $acl->getJSONObject();
                array_push($aclArray, $aclValue);
            }
            $body = null;
            $body = '{"app42":{"photo":{"acls": { "acl": ' . json_encode($aclArray) . '}}}}';
            print_r($body);

            $signParams['albumName'] = $albName;
            $signParams['photoName'] = $phName;
            $signParams['userName'] = $uName;
            $signParams['body'] = $body;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/grantAccess" . "/" . $uName . "/" . $albName . "/" . $phName;
            $response = RestClient::put($baseURL, $params, null, null, $contentType, $accept, $body,$headerParams);
            $album = new AlbumResponseBuilder();
            $albumObj = $album->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $albumObj;
    }

    function revokeAccess($albName, $uName, $phName, $aclList) {

        Util::throwExceptionIfNullOrBlank($uName, "User Name");
        Util::throwExceptionIfNullOrBlank($albName, "Album Name");
        Util::throwExceptionIfNullOrBlank($phName, "Photo Name");
        Util::throwExceptionIfNullOrBlank($aclList, "ACL List");
        $objUtil = new Util($this->apiKey, $this->secretKey);

        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $aclArray = array();
            foreach ($aclList as $acl) {
                $aclValue = $acl->getJSONObject();
                array_push($aclArray, $aclValue);
            }
            $body = null;
            $body = '{"app42":{"photo":{"acls": { "acl": ' . json_encode($aclArray) . '}}}}';
            print_r($body);

            $signParams['albumName'] = $albName;
            $signParams['photoName'] = $phName;
            $signParams['userName'] = $uName;
            $signParams['body'] = $body;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/revokeAccess" . "/" . $uName . "/" . $albName . "/" . $phName;
            $response = RestClient::put($baseURL, $params, null, null, $contentType, $accept, $body,$headerParams);
            $album = new AlbumResponseBuilder();
            $albumObj = $album->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $albumObj;
    }

     function updatePhoto($userName, $albumName, $photoName, $photoDescription, $path) {

        Util::throwExceptionIfNullOrBlank($userName, "User Name");
        Util::throwExceptionIfNullOrBlank($albumName, "Album Name");
        Util::throwExceptionIfNullOrBlank($photoName, "Photo Name");
        Util::throwExceptionIfNullOrBlank($photoDescription, "Description");
        Util::throwExceptionIfNullOrBlank($path, "Path");
        Util::throwExceptionIfNotValidImageExtension($path, "Photo Path");
        $encodedUserName = Util::encodeParams($userName);
        $objUtil = new Util($this->apiKey, $this->secretKey);

        if (!file_exists($path)) {
            throw new App42Exception("File Not Found");
        }
        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $postParams= array();
            $postParams['userName'] = $userName;
            $postParams['albumName'] = $albumName;
            $postParams['name'] = $photoName;
            $postParams['description'] = $photoDescription;
            $params = array_merge($postParams, $signParams);
            $signature = urlencode($objUtil->sign($params)); //die();
            $params['imageFile'] = "@" . $path;
            $headerParams['signature'] = $signature;
            $contentType = "multipart/form-data";
            $body = null;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/update/" . $encodedUserName;
            $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
            $photoResponseObj = new AlbumResponseBuilder();
            $photoObj = $photoResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $photoObj;
    }


}
?>
