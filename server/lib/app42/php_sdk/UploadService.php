<?php

include_once 'RestClient.class.php';
include_once 'App42Response.php';
include_once 'Util.php';
include_once 'UploadResponseBuilder.php';
include_once 'App42Exception.php';
include_once 'App42Service.php';

/**
 * Uploads file on the cloud. Allows access to the files through url.
 * Its especially useful for Mobile/Device apps. It minimizes the App footprint
 * on the device.
 * 
 */
class UploadService extends App42Service {

    protected $resource = "upload";
    protected $apiKey;
    protected $secretKey;
    protected $url;
    protected $version = "1.0";
    protected $content_type = "application/json";
    protected $accept = "application/json";

    /**
     * This is a constructor that takes
     *
     * @params apiKey
     * @params secretKey
     * @params baseURL
     *
     */
    public function __construct($apiKey, $secretKey) {
        $this->apiKey = $apiKey;
        $this->secretKey = $secretKey;
        $this->url = $this->version . "/" . $this->resource;
    }

    /**
     * Uploads file on the cloud for given user.
     *
     * @params name
     *            - The name of the file which has to be saved. It is used to
     *            retrieve the file
     * @params userName
     *            - The name of the user for which file has to be saved.
     * @params filePath
     *            - The local path for the file
     * @params fileType
     *            - The type of the file. File can be either Audio, Video,
     *            Image, Binary, Txt, xml, json, csv or other Use the static
     *            constants e.g. Upload.AUDIO, Upload.XML etc.
     * @params description
     *            - Description of the file to be uploaded.
     *
     * @return Upload object
     */
    function uploadFileForUser($fileName, $userName, $filePath, $uploadFileType, $description) {

        Util::throwExceptionIfNullOrBlank($fileName, "File Name");
        Util::throwExceptionIfNullOrBlank($userName, "User Name");
        Util::throwExceptionIfNullOrBlank($filePath, "FilePath");
        Util::throwExceptionIfNullOrBlank($uploadFileType, "UploadFileType");
        Util::throwExceptionIfNullOrBlank($description, "Description");
        $encodedUserName = Util::encodeParams($userName);
        $objUtil = new Util($this->apiKey, $this->secretKey);

        //$file = fopen($filePath, r);
        if (!file_exists($filePath)) {
            throw new App42Exception("The file with the name '$FilePath' not found ");
        }

        $body = null;
        try {
		    $params = null;
            $uploadTypeObj = new UploadFileType();
            if ($uploadTypeObj->isAvailable($uploadFileType) == "null") {
                throw new App42Exception("The file with  type '$uploadFileType' does not Exist ");
            }
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $postParams = array();
            $postParams['name'] = $fileName;
            $postParams['userName'] = $userName;
            $postParams['type'] = $uploadFileType;
            $postParams['description'] = $description;
            $params = array_merge($postParams, $signParams);
            $signature = urlencode($objUtil->sign($params)); //die();
            $params['uploadFile'] = "@" . $filePath;
            $headerParams['signature'] = $signature;
            //CONTENT_TYPE == "multipart/form-data"
            $contentType = "multipart/form-data";
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/" . $encodedUserName;
            $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
            $uploadResponseObj = new UploadResponseBuilder();
            $uploadObj = $uploadResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $uploadObj;
    }

    /**
     * Gets all the files for the App
     *
     * @return Upload object
     */
    function getAllFiles($max = null, $offset = null) {
        $argv = func_get_args();
        if (count($argv) == 0) {

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
                $baseURL = $baseURL;
                $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept, $headerParams);
                $uploadResponseObj = new UploadResponseBuilder();
                $uploadObj = $uploadResponseObj->buildResponse($response->getResponse());
            } catch (App42Exception $e) {
                throw $e;
            } catch (Exception $e) {
                throw new App42Exception($e);
            }
            return $uploadObj;
        } else {

            /**
             * Gets all the files By Paging for the App
             *
             * @param max
             *            - Maximum number of records to be fetched
             * @param offset
             *            - From where the records are to be fetched
             *
             * @return Upload object
             */
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
                $signParams['max'] = $max;
                $signParams['offset'] = $offset;
                $signature = urlencode($objUtil->sign($signParams)); //die();
                $headerParams['signature'] = $signature;
                $contentType = $this->content_type;
                $accept = $this->accept;
                $baseURL = $this->url;
                $baseURL = $baseURL . "/paging/" . $encodedMax . "/" . $encodedOffset;
                $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept, $headerParams);
                $uploadResponseObj = new UploadResponseBuilder();
                $uploadObj = $uploadResponseObj->buildResponse($response->getResponse());
            } catch (App42Exception $e) {
                throw $e;
            } catch (Exception $e) {
                throw new App42Exception($e);
            }
            return $uploadObj;
        }
    }

    /**
     * Gets count of all the files for the App
     *
     * @return App42Response object
     */
    function getAllFilesCount() {
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		    $params = null;
            $responseObj = new App42Response();
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
            $baseURL = $baseURL . "/count";
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept, $headerParams);
            $responseObj->setStrResponse($response->getResponse());
            $responseObj->setResponseSuccess(true);
            $uploadResponseObj = new UploadResponseBuilder();
            $responseObj->setTotalRecords($uploadResponseObj->getTotalRecords($response->getResponse()));
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $responseObj;
    }

    /**
     * Gets the file based on user and file name.
     *
     * @param name
     *            - The name of the file which has to be retrieved
     * @param userName
     *            - The name of the user for which file has to be retrieved
     *
     * @return Upload object
     */
    function getFileByUser($fileName, $userName) {

        Util::throwExceptionIfNullOrBlank($fileName, "File Name");
        Util::throwExceptionIfNullOrBlank($userName, "User Name");
        $encodedFileName = Util::encodeParams($fileName);
        $encodedUserName = Util::encodeParams($userName);
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $signParams['name'] = $fileName;
            $signParams['userName'] = $userName;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/" . $encodedUserName . "/" . $encodedFileName;
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept, $headerParams);
            $uploadResponseObj = new UploadResponseBuilder();
            $uploadObj = $uploadResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $uploadObj;
    }

    /**
     * Get all the file based on user name.
     *
     * @param userName
     *            - The name of the user for which file has to be retrieved
     *
     * @return Upload object
     */
    function getAllFilesByUser($userName, $max = null, $offset = null) {
        $argv = func_get_args();
        if (count($argv) == 1) {
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
                $baseURL = $baseURL . "/user/" . $encodedUserName;
                $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept, $headerParams);
                $uploadResponseObj = new UploadResponseBuilder();
                $uploadObj = $uploadResponseObj->buildResponse($response->getResponse());
            } catch (App42Exception $e) {
                throw $e;
            } catch (Exception $e) {
                throw new App42Exception($e);
            }
            return $uploadObj;
        } else {

            /**
             * Get all the files based on user name by Paging.
             *
             * @params userName
             *            - The name of the user for which file has to be retrieved
             * @params max
             *            - Maximum number of records to be fetched
             * @params offset
             *            - From where the records are to be fetched
             *
             * @return Upload object
             */
            Util::validateMax($max);
            Util::throwExceptionIfNullOrBlank($userName, "User Name");
            Util::throwExceptionIfNullOrBlank($max, "Max");
            Util::throwExceptionIfNullOrBlank($offset, "Offset");
            $encodedUserName = Util::encodeParams($userName);
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
                $signParams['max'] = $max;
                $signParams['offset'] = $offset;
                $signature = urlencode($objUtil->sign($signParams)); //die();
                $headerParams['signature'] = $signature;
                $contentType = $this->content_type;
                $accept = $this->accept;
                $baseURL = $this->url;
                $baseURL = $baseURL . "/user/" . $encodedUserName . "/" . $encodedMax . "/" . $encodedOffset;
                $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept, $headerParams);
                $uploadResponseObj = new UploadResponseBuilder();
                $uploadObj = $uploadResponseObj->buildResponse($response->getResponse());
            } catch (App42Exception $e) {
                throw $e;
            } catch (Exception $e) {
                throw new App42Exception($e);
            }
            return $uploadObj;
        }
    }

    /**
     * Gets the count of file based on user name.
     *
     * @params userName
     *            - The name of the user for which count of the file has to be
     *            retrieved
     *
     * @return App42Response object
     */
    function getAllFilesCountByUser($userName) {

        Util::throwExceptionIfNullOrBlank($userName, "User Name");
        $encodedUserName = Util::encodeParams($userName);
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		    $params = null;
            $responseObj = new App42Response();
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
            $baseURL = $baseURL . "/user/" . $encodedUserName . "/count";
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept, $headerParams);
            $responseObj->setStrResponse($response->getResponse());
            $responseObj->setResponseSuccess(true);
            $uploadResponseObj = new UploadResponseBuilder();
            $responseObj->setTotalRecords($uploadResponseObj->getTotalRecords($response->getResponse()));
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $responseObj;
    }

    /**
     * Removes the file based on file name and user name.
     *
     * @params name
     *            - The name of the file which has to be removed
     * @params userName
     *            - The name of the user for which file has to be removed
     *
     * @return App42Response if deleted successfully
     */
    function removeFileByUser($fileName, $userName) {

        Util::throwExceptionIfNullOrBlank($fileName, "File Name");
        Util::throwExceptionIfNullOrBlank($userName, "User Name");
        $encodedFileName = Util::encodeParams($fileName);
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
            $signParams['name'] = $fileName;
            $signParams['userName'] = $userName;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/" . $encodedUserName . "/" . $encodedFileName;
            $response = RestClient::delete($baseURL, $params, null, null, $contentType, $accept, $headerParams);
            $uploadResponseObj = new UploadResponseBuilder();
            $uploadObj = $uploadResponseObj->buildResponse($response->getResponse());
            $responseObj->setStrResponse($uploadObj);
            $responseObj->setResponseSuccess(true);
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $responseObj;
    }

    /**
     * Removes the files based on user name.
     *
     * @param userName
     *            - The name of the user for which files has to be removed
     *
     * @return App42Response if deleted successfully
     */
    function removeAllFilesByUser($userName) {

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
            $baseURL = $baseURL . "/user/" . $encodedUserName;
            $response = RestClient::delete($baseURL, $params, null, null, $contentType, $accept, $headerParams);
            $uploadResponseObj = new UploadResponseBuilder();
            $uploadObj = $uploadResponseObj->buildResponse($response->getResponse());
            $responseObj->setStrResponse($uploadObj);
            $responseObj->setResponseSuccess(true);
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $responseObj;
    }

    /**
     * Removes all the files for the App
     *
     * @return App42Response if deleted successfully
     *
     */
    function removeAllFiles() {
        $objUtil = new Util($this->apiKey, $this->secretKey);
        $responseObj = new App42Response();
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

    /**
     * Get the files based on file type.
     *
     * @param uploadFileType
     *            - Type of the file e.g. Upload.AUDIO, Upload.XML etc.
     *
     * @return Upload object
     */
    function getFilesByType($uploadFileType, $max = null, $offset = null) {

        $argv = func_get_args();
        if (count($argv) == 1) {
            Util::throwExceptionIfNullOrBlank($uploadFileType, "UploadFileType");
            $encodedUploadFileType = Util::encodeParams($uploadFileType);
            $objUtil = new Util($this->apiKey, $this->secretKey);
            try {
			    $params = null;
                $uploadTypeObj = new UploadFileType();
                if ($uploadTypeObj->isAvailable($uploadFileType) == "null") {
                    throw new App42Exception("The file with  type '$uploadFileType' does not Exist ");
                }
                $headerParams = array();
                $queryParams = array();
                $signParams = $this->populateSignParams();
                $metaHeaders = $this->populateMetaHeaderParams();
                $headerParams = array_merge($signParams, $metaHeaders);
                $signParams['type'] = $uploadFileType;
                $signature = urlencode($objUtil->sign($signParams)); //die();
                $headerParams['signature'] = $signature;
                $contentType = $this->content_type;
                $accept = $this->accept;
                $baseURL = $this->url;
                $baseURL = $baseURL . "/type/" . $encodedUploadFileType;
                $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept, $headerParams);
                $uploadResponseObj = new UploadResponseBuilder();
                $uploadObj = $uploadResponseObj->buildResponse($response->getResponse());
            } catch (App42Exception $e) {
                throw $e;
            } catch (Exception $e) {
                throw new App42Exception($e);
            }
            return $uploadObj;
        } else {

            /**
             * Get the files based on file type by Paging.
             *
             * @params uploadFileType
             *            - Type of the file e.g. Upload.AUDIO, Upload.XML etc.
             * @params max
             *            - Maximum number of records to be fetched
             * @params offset
             *            - From where the records are to be fetched
             *
             * @return Upload object
             */
            Util::validateMax($max);
            Util::throwExceptionIfNullOrBlank($uploadFileType, "UploadFileType");
            Util::throwExceptionIfNullOrBlank($max, "Max");
            Util::throwExceptionIfNullOrBlank($offset, "Offset");
            $encodedUploadFileType = Util::encodeParams($uploadFileType);
            $encodedMax = Util::encodeParams($max);
            $encodedOffset = Util::encodeParams($offset);
            $objUtil = new Util($this->apiKey, $this->secretKey);
            try {
			    $params = null;
                $uploadTypeObj = new UploadFileType();
                if ($uploadTypeObj->isAvailable($uploadFileType) == "null") {
                    throw new App42Exception("The file with  type '$uploadFileType' does not Exist ");
                }
                $headerParams = array();
                $queryParams = array();
                $signParams = $this->populateSignParams();
                $metaHeaders = $this->populateMetaHeaderParams();
                $headerParams = array_merge($signParams, $metaHeaders);
                $signParams['type'] = $uploadFileType;
                $signParams['max'] = $max;
                $signParams['offset'] = $offset;
                $signature = urlencode($objUtil->sign($signParams)); //die();
                $headerParams['signature'] = $signature;
                $contentType = $this->content_type;
                $accept = $this->accept;
                $baseURL = $this->url;
                $baseURL = $baseURL . "/type/" . $encodedUploadFileType . "/" . $encodedMax . "/" . $encodedOffset;
                $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept, $headerParams);
                $uploadResponseObj = new UploadResponseBuilder();
                $uploadObj = $uploadResponseObj->buildResponse($response->getResponse());
            } catch (App42Exception $e) {
                throw $e;
            } catch (Exception $e) {
                throw new App42Exception($e);
            }
            return $uploadObj;
        }
    }

    /**
     * Get the count of files based on file type.
     *
     * @params uploadFileType
     *            - Type of the file e.g. Upload.AUDIO, Upload.XML etc.
     *
     * @return App42Response object
     */
    function getFilesCountByType($uploadFileType) {
        Util::throwExceptionIfNullOrBlank($uploadFileType, "UploadFileType");
        $encodedUploadFileType = Util::encodeParams($uploadFileType);
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		    $params = null;
            $responseObj = new App42Response();
            $uploadTypeObj = new UploadFileType();
            if ($uploadTypeObj->isAvailable($uploadFileType) == "null") {
                throw new App42Exception("The file with  type '$uploadFileType' does not Exist ");
            }
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $signParams['type'] = $uploadFileType;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/type/" . $encodedUploadFileType . "/count";
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept, $headerParams);
            $responseObj->setStrResponse($response->getResponse());
            $responseObj->setResponseSuccess(true);
            $uploadResponseObj = new UploadResponseBuilder();
            $responseObj->setTotalRecords($uploadResponseObj->getTotalRecords($response->getResponse()));
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $responseObj;
    }

    /**
     * Uploads file on the cloud via Stream.
     *
     * @params name
     *            - The name of the file which has to be saved. It is used to
     *            retrieve the file
     * @params inputStream
     *            - InputStream of the file to be uploaded.
     * @params fileType
     *            - The type of the file. File can be either Audio, Video,
     *            Image, Binary, Txt, xml, json, csv or other Use the static
     *            constants e.g. Upload.AUDIO, Upload.XML etc.
     * @params description
     *            - Description of the file to be uploaded.
     *
     * @return Upload object
     */
    function uploadFile($fileName, $filePath, $uploadFileType, $description) {

        Util::throwExceptionIfNullOrBlank($fileName, "File Name");
        Util::throwExceptionIfNullOrBlank($filePath, "FilePath");
        Util::throwExceptionIfNullOrBlank($uploadFileType, "UploadFileType");
        Util::throwExceptionIfNullOrBlank($description, "Description");

        $objUtil = new Util($this->apiKey, $this->secretKey);

        //$file = fopen($filePath, r);
        if (!file_exists($filePath)) {
            throw new App42Exception("File Not Found");
        }
        //$file = new File($filePath);
        //if(!file_exists($file)){
        //throw Exception
        //}
        try {
		    $params = null;
            $uploadTypeObj = new UploadFileType();
            if ($uploadTypeObj->isAvailable($uploadFileType) == "null") {
                throw new App42Exception("The file with  type '$uploadFileType' does not Exist ");
            }
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $body = null;
            $postParams = array();
            $postParams['name'] = $fileName;
            $postParams['type'] = $uploadFileType;
            $postParams['description'] = $description;
            $params = array_merge($postParams, $signParams);
            $signature = urlencode($objUtil->sign($params)); //die();
            $params['uploadFile'] = "@" . $filePath;
            $params['signature'] = $signature;
            //CONTENT_TYPE == "multipart/form-data"
            $contentType = "multipart/form-data";
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL;
            $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
            $uploadResponseObj = new UploadResponseBuilder();
            $uploadObj = $uploadResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $uploadObj;
    }

    /**
     * Gets the file based on file name.
     *
     * @params name
     *            - The name of the file which has to be retrieved
     *
     * @return Upload object
     */
    function getFileByName($fileName) {

        Util::throwExceptionIfNullOrBlank($fileName, "File Name");
        $encodedFileName = Util::encodeParams($fileName);
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $signParams['name'] = $fileName;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/" . $encodedFileName;
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept, $headerParams);
            $uploadResponseObj = new UploadResponseBuilder();
            $uploadObj = $uploadResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $uploadObj;
    }

    /**
     * Removes the file based on file name.
     *
     * @params name
     *            - The name of the file which has to be removed
     *
     * @return App42Response if deleted successfully
     */
    function removeFileByName($fileName) {

        Util::throwExceptionIfNullOrBlank($fileName, "File Name");
        $encodedFileName = Util::encodeParams($fileName);
        $responseObj = new App42Response();
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $signParams['name'] = $fileName;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/" . $encodedFileName;
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


     function uploadFileForGroup($name, $userName, $ownerName, $groupName, $filePath,$fileType,$description) {

        Util::throwExceptionIfNullOrBlank($name, "File Name");
        Util::throwExceptionIfNullOrBlank($userName, "User Name");
        Util::throwExceptionIfNullOrBlank($filePath, "FilePath");
        Util::throwExceptionIfNullOrBlank($ownerName, "OwnerName");
        Util::throwExceptionIfNullOrBlank($groupName, "GroupName");
        Util::throwExceptionIfNullOrBlank($fileType, "UploadFileType");
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
            $uploadTypeObj = new UploadFileType();
            if ($uploadTypeObj->isAvailable($fileType) == "null") {
                throw new App42Exception("The file with  type '$fileType' does not Exist ");
            }
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $postParams = array();
            $postParams['name'] = $name;
            $postParams['userName'] = $userName;
            $postParams['ownerName'] = $ownerName;
            $postParams['groupName'] = $groupName;
            $postParams['type'] = $fileType;
            $postParams['description'] = $description;
            $params = array_merge($postParams, $signParams);
            $signature = urlencode($objUtil->sign($params)); //die();
            $params['uploadFile'] = "@" . $filePath;
            $headerParams['signature'] = $signature;
            //CONTENT_TYPE == "multipart/form-data"
            $contentType = "multipart/form-data";
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/" . "group/".$encodedUserName;
            $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
            $uploadResponseObj = new UploadResponseBuilder();
            $uploadObj = $uploadResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $uploadObj;
    }


      function uploadFileForFriend($name, $userName, $buddyName, $filePath,$fileType,$description) {

        Util::throwExceptionIfNullOrBlank($name, "File Name");
        Util::throwExceptionIfNullOrBlank($userName, "User Name");
        Util::throwExceptionIfNullOrBlank($filePath, "FilePath");
        Util::throwExceptionIfNullOrBlank($buddyName, "BuddyName");
        Util::throwExceptionIfNullOrBlank($fileType, "UploadFileType");
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
            $uploadTypeObj = new UploadFileType();
            if ($uploadTypeObj->isAvailable($fileType) == "null") {
                throw new App42Exception("The file with  type '$fileType' does not Exist ");
            }
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $postParams = array();
            $postParams['name'] = $name;
            $postParams['userName'] = $userName;
            $postParams['buddyName'] = $buddyName;
            $postParams['type'] = $fileType;
            $postParams['description'] = $description;
            $params = array_merge($postParams, $signParams);
            $signature = urlencode($objUtil->sign($params)); //die();
            $params['uploadFile'] = "@" . $filePath;
            $headerParams['signature'] = $signature;
            //CONTENT_TYPE == "multipart/form-data"
            $contentType = "multipart/form-data";
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/" . "friend/".$encodedUserName;
            $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
            $uploadResponseObj = new UploadResponseBuilder();
            $uploadObj = $uploadResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $uploadObj;
    }



     function uploadFileForFriends($name, $userName, $filePath,$fileType,$description) {

        Util::throwExceptionIfNullOrBlank($name, "File Name");
        Util::throwExceptionIfNullOrBlank($userName, "User Name");
        Util::throwExceptionIfNullOrBlank($filePath, "FilePath");
        Util::throwExceptionIfNullOrBlank($fileType, "UploadFileType");
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
            $uploadTypeObj = new UploadFileType();
            if ($uploadTypeObj->isAvailable($fileType) == "null") {
                throw new App42Exception("The file with  type '$fileType' does not Exist ");
            }
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $postParams = array();
            $postParams['name'] = $name;
            $postParams['userName'] = $userName;
            $postParams['type'] = $fileType;
            $postParams['description'] = $description;
            $params = array_merge($postParams, $signParams);
            $signature = urlencode($objUtil->sign($params)); //die();
            $params['uploadFile'] = "@" . $filePath;
            $headerParams['signature'] = $signature;
            //CONTENT_TYPE == "multipart/form-data"
            $contentType = "multipart/form-data";
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/" . "friendsAll/".$encodedUserName;
            $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
            $uploadResponseObj = new UploadResponseBuilder();
            $uploadObj = $uploadResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $uploadObj;
    }

}
?>