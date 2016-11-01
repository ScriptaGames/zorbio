<?php

include_once 'RestClient.class.php';
include_once 'Util.php';
include_once 'App42Exception.php';
include_once "ImageProcessorResponseBuilder.php";
include_once 'App42Service.php';

/**
 * The ImageProcessor service is a Image utility service on the Cloud.
 * Developers can upload files on the cloud and perform various Image
 * Manipulation operations on the Uploaded Images e.g. resize, scale, thumbnail,
 * crop etc. It is especially useful for Mobile Apps when they dont want to
 * store Images locally and dont want to perform processor intensive operations.
 * It is also useful for web applications who want to perform complex Image
 * Operations
 *
 * @see Image
 */
class ImageProcessorService extends App42Service {

    protected $version = "1.0";
    protected $resource = "image";
    protected $content_type = "application/json";
    protected $accept = "application/json";

    /**
     * this is a constructor that takes
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
     * Resize image. Returns the original image url and converted image url.
     * Images are stored on the cloud and can be accessed through the urls
     * Resizing is done based on the width and height provided
     *
     * @param name
     *            - Name of the image to resize
     * @param imagePath
     *            - Path of the local file to resize
     * @param width
     *            - Width of the image to resize
     * @param height
     *            - Height of the image to resize
     *
     * @returns Image object containing urls for the original and converted
     *          images
     */
    function resize($name, $imagePath, $width, $height) {
        Util::throwExceptionIfNullOrBlank($name, "Name");
        Util::throwExceptionIfNullOrBlank($imagePath, "Image Path");
        Util::throwExceptionIfNotValidImageExtension($imagePath, "imagePath");
        Util::throwExceptionIfNullOrBlank($width, "Width");
        Util::throwExceptionIfNullOrBlank($height, "Height");

        $objUtil = new Util($this->apiKey, $this->secretKey);
//       $imageFile = file_get_contents($imagePath);
        //$file = fopen($filePath, r);
        if (!file_exists($imagePath)) {
            throw new App42Exception(" File " . $imagePath . " does not exist");
        }

        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $postParams = array();
            $postParams['name'] = $name;
            $postParams['width'] = $width . "";
            $postParams['height'] = $height . "";
            $params = array_merge($postParams, $signParams);
            $signature = urlencode($objUtil->sign($params)); //die();
            $params['imageFile'] = "@" . $imagePath;
            $headerParams['signature'] = $signature;

            $contentType = "multipart/form-data";
            $body = null;
//            $contentType = "plain/text";
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/resize";
            $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
            $imageResponseObj = new ImageProcessorResponseBuilder();
            $imageObj = $imageResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $imageObj;
    }

    /**
     * Creates a thumbnail of the image. There is a difference between thumbnail
     * and resize The thumbnail operation is optimized for speed, it removes
     * information of the image which is not necessary for a thumbnail e.g
     * header information. Returns the original image url and converted image
     * url. Images are stored on the cloud and can be accessed through the urls
     * Resizing is done based on the width and height provided
     *
     * @param name
     *            - Name of the image file for which thumbnail has to be created
     * @param imagePath
     *            - Path of the local file whose thumbnail has to be created
     * @param width
     *            - Width of the image for thumbnail
     * @param height
     *            - Height of the image for thumbnail
     *
     * @returns Image object containing urls for the original and converted
     *          images
     */
    function thumbnail($name, $imagePath, $width, $height) {

        Util::throwExceptionIfNullOrBlank($name, "Name");
        Util::throwExceptionIfNullOrBlank($imagePath, "Image Path");
        Util::throwExceptionIfNotValidImageExtension($imagePath, "imagePath");
        Util::throwExceptionIfNullOrBlank($width, "Width");
        Util::throwExceptionIfNullOrBlank($height, "Height");


        $objUtil = new Util($this->apiKey, $this->secretKey);

        //$file = fopen($filePath, r);
        if (!file_exists($imagePath)) {
            throw new App42Exception(" File " . $imagePath . " does not exist");
        }

        //$file = new File($filePath);
        //if(!file_exists($file)){
        //throw Exception
        //}
        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $postParams = array();
            $postParams['name'] = $name;
            $postParams['width'] = $width . "";
            $postParams['height'] = $height . "";
            $params = array_merge($postParams, $signParams);
            $signature = urlencode($objUtil->sign($params)); //die();
            $params['imageFile'] = "@" . $imagePath;
            $headerParams['signature'] = $signature;
            //CONTENT_TYPE == "multipart/form-data"
            $contentType = "multipart/form-data";
            $body = null;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/thumbnail";
            $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
            $imageResponseObj = new ImageProcessorResponseBuilder();
            $imageObj = $imageResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $imageObj;
    }

    /**
     * Scales the image based on width and height. Returns the original image
     * url and converted image url. Images are stored in the cloud and can be
     * accessed through the urls Resizing is done based on the width and height
     * provided.
     *
     * @param name
     *            - Name of the image to scale
     * @param imagePath
     *            - Path of the local file to scale
     * @param width
     *            - Width of the image to scale
     * @param height
     *            - Height of the image to scale
     *
     * @returns Image object containing urls for the original and converted
     *          images
     */
    function scale($name, $imagePath, $width, $height) {

        Util::throwExceptionIfNullOrBlank($name, "Name");
        Util::throwExceptionIfNullOrBlank($imagePath, "Image Path");
        Util::throwExceptionIfNotValidImageExtension($imagePath, "imagePath");
        Util::throwExceptionIfNullOrBlank($width, "Width");
        Util::throwExceptionIfNullOrBlank($height, "Height");

        $objUtil = new Util($this->apiKey, $this->secretKey);
        if (!file_exists($imagePath)) {
            throw new App42Exception(" File " . $imagePath . " does not exist");
        }
       try {
	        $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $postParams = array();
            $postParams['name'] = $name;
            $postParams['width'] = $width . "";
            $postParams['height'] = $height . "";
            $params = array_merge($postParams, $signParams);
            $signature = urlencode($objUtil->sign($params));
            $params['imageFile'] = "@" . $imagePath;
            $headerParams['signature'] = $signature;
            //CONTENT_TYPE == "multipart/form-data"
            $contentType = "multipart/form-data";
            $body = null;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/scale";
           $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
             $imageResponseObj = new ImageProcessorResponseBuilder();
            $imageObj = $imageResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $imageObj;
    }

    /**
     * Crops image based on width, height and x, y coordinates. Returns the
     * original image url and converted image url. Images are stored in the
     * cloud and can be accessed through the urls Resizing is done based on the
     * width and height provided.
     *
     * @param name
     *            - Name of the image to crop
     * @param imagePath
     *            - Path of the local file to crop
     * @param width
     *            - Width of the image to crop
     * @param height
     *            - Height of the image to crop
     * @param x
     *            - Coordinate X
     * @param y
     *            - Coordinate Y
     *
     * @returns Image object containing urls for the original and converted
     *          images
     */
    function crop($name, $imagePath, $width, $height, $x, $y) {

        Util::throwExceptionIfNullOrBlank($name, "Name");
        Util::throwExceptionIfNullOrBlank($imagePath, "Image Path");
        Util::throwExceptionIfNotValidImageExtension($imagePath, "imagePath");
        Util::throwExceptionIfNullOrBlank($width, "Width");
        Util::throwExceptionIfNullOrBlank($height, "Height");
        Util::throwExceptionIfNullOrBlank($x, "X Coordinate");
        Util::throwExceptionIfNullOrBlank($y, "Y Coordinate");


        $objUtil = new Util($this->apiKey, $this->secretKey);

        //$file = fopen($filePath, r);
        if (!file_exists($imagePath)) {
            throw new App42Exception(" File " . $imagePath . " does not exist");
        }

        //$file = new File($filePath);
        //if(!file_exists($file)){
        //throw Exception
        //}
        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $postParams = array();
            $postParams['name'] = $name;
            $postParams['width'] = $width . "";
            $postParams['height'] = $height . "";
            $postParams['x'] = $x . "";
            $postParams['y'] = $y . "";
            $params = array_merge($postParams, $signParams);
            $signature = urlencode($objUtil->sign($params)); //die();
            $params['imageFile'] = "@" . $imagePath;
            $headerParams['signature'] = $signature;
            //CONTENT_TYPE == "multipart/form-data"
            $contentType = "multipart/form-data";
            $body = null;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/crop";
            $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
            $imageResponseObj = new ImageProcessorResponseBuilder();
            $imageObj = $imageResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $imageObj;
    }

    /**
     * Resize image by Percentage. Returns the original image url and converted
     * image url. Images are stored in the cloud and can be accessed through the
     * urls Resizing is done based on the width and height provided
     *
     * @param name
     *            - Name of the image to resize
     * @param imagePath
     *            - Path of the local file to resize
     * @param percentage
     *            - Percentage to which image has to be resized
     *
     * @returns Image object containing urls for the original and converted
     *          images
     */
    function resizeByPercentage($name, $imagePath, $percentage) {

        Util::throwExceptionIfNullOrBlank($name, "Name");
        Util::throwExceptionIfNullOrBlank($imagePath, "Image Path");
        Util::throwExceptionIfNotValidImageExtension($imagePath, "imagePath");
        Util::throwExceptionIfNullOrBlank($percentage, "Percentage");

        $objUtil = new Util($this->apiKey, $this->secretKey);

        //$file = fopen($filePath, r);
        if (!file_exists($imagePath)) {
            throw new App42Exception(" File " . $imagePath . " does not exist");
        }

        //$file = new File($filePath);
        //if(!file_exists($file)){
        //throw Exception
        //}
        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $postParams = array();
            $postParams['name'] = $name;
            $postParams['percentage'] = $percentage . "";
            $params = array_merge($postParams, $signParams);
            $signature = urlencode($objUtil->sign($params)); //die();
            $params['imageFile'] = "@" . $imagePath;
            $headerParams['signature'] = $signature;
            //CONTENT_TYPE == "multipart/form-data"
            $contentType = "multipart/form-data";
            $body = null;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/resizePercentage";
            $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
            $imageResponseObj = new ImageProcessorResponseBuilder();
            $imageObj = $imageResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $imageObj;
    }

    /**
     * Creates a thumbnail of the image by Percentage. There is a difference
     * between thumbnail and resize The thumbnail operation is optimized for
     * speed removes information of the image which is not necessary for a
     * thumbnail to reduce size e.g header information. Returns the original
     * image url and converted image url. Images are stored in the cloud and can
     * be accessed through the urls Resizing is done based on the width and
     * height provided
     *
     * @param name
     *            - Name of the image file for which thumbnail has to be created
     * @param imagePath
     *            - Path of the local file whose thumbnail has to be created
     * @param percentage
     *            - Percentage for thumbnail
     *
     * @returns Image object containing urls for the original and converted
     *          images
     */
    function thumbnailByPercentage($name, $imagePath, $percentage) {

        Util::throwExceptionIfNullOrBlank($name, "Name");
        Util::throwExceptionIfNullOrBlank($imagePath, "Image Path");
        Util::throwExceptionIfNotValidImageExtension($imagePath, "imagePath");
        Util::throwExceptionIfNullOrBlank($percentage, "Percentage");


        $objUtil = new Util($this->apiKey, $this->secretKey);

        //$file = fopen($filePath, r);
        if (!file_exists($imagePath)) {
            throw new App42Exception(" File " . $imagePath . " does not exist");
        }

        //$file = new File($filePath);
        //if(!file_exists($file)){
        //throw Exception
        //}
        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $postParams = array();
            $postParams['name'] = $name;
            $postParams['percentage'] = $percentage . "";
            $params = array_merge($postParams, $signParams);
            $signature = urlencode($objUtil->sign($params)); //die();
            $params['imageFile'] = "@" . $imagePath;
            $headerParams['signature'] = $signature;
            //CONTENT_TYPE == "multipart/form-data"
            $contentType = "multipart/form-data";
            $body = null;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/thumbnailPercentage";
            $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
            $imageResponseObj = new ImageProcessorResponseBuilder();
            $imageObj = $imageResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $imageObj;
    }

    /**
     * Scales the image by Percentage. Returns the original image url and
     * converted image url. Images are stored in the cloud and can be accessed
     * through the urls Resizing is done based on the width and height provided
     *
     * @param name
     *            - Name of the image file to scale
     * @param imagePath
     *            - Path of the local file to scale
     * @param percentage
     *            - Percentage to which image has to be scaled
     *
     * @returns Image object containing urls for the original and converted
     *          images
     */
    function scaleByPercentage($name, $imagePath, $percentage) {

        Util::throwExceptionIfNullOrBlank($name, "Name");
        Util::throwExceptionIfNullOrBlank($imagePath, "Image Path");
        Util::throwExceptionIfNotValidImageExtension($imagePath, "imagePath");
        Util::throwExceptionIfNullOrBlank($percentage, "Percentage");


        $objUtil = new Util($this->apiKey, $this->secretKey);

        //$file = fopen($filePath, r);
        if (!file_exists($imagePath)) {
            throw new App42Exception(" File " . $imagePath . " does not exist");
        }

        //$file = new File($filePath);
        //if(!file_exists($file)){
        //throw Exception
        //}
        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $postParams = array();
            $postParams['name'] = $name;
            $postParams['percentage'] = $percentage . "";
            $params = array_merge($postParams, $signParams);
            $signature = urlencode($objUtil->sign($params)); //die();
            $params['imageFile'] = "@" . $imagePath;
            $headerParams['signature'] = $signature;
            //CONTENT_TYPE == "multipart/form-data"
            $contentType = "multipart/form-data";
            $body = null;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/scalePercentage";
            $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
            $imageResponseObj = new ImageProcessorResponseBuilder();
            $imageObj = $imageResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $imageObj;
    }

    /**
     * Converts the format of the image. Returns the original image url and converted image url.
     * Images are stored on the cloud and can be accessed through the urls
     * Conversion is done based on the formatToConvert provided
     *
     * @param name
     *            - Name of the image to convert
     * @param imagePath
     *            - Path of the local file to convert
     * @param formatToConvert
     *            - To which file needs to be converted
     * @return Image object containing urls for the original and converted
     *          images
     *
     * @throws App42Exception
     *
     */
    function convertFormat($name, $imagePath, $formatToConvert) {

        Util::throwExceptionIfNullOrBlank($name, "Name");
        Util::throwExceptionIfNullOrBlank($imagePath, "Image Path");
        Util::throwExceptionIfNotValidImageExtension($imagePath, "imagePath");
        Util::throwExceptionIfNullOrBlank($formatToConvert, "formatToConvert");
        $objUtil = new Util($this->apiKey, $this->secretKey);

        //$file = fopen($filePath, r);
        if (!file_exists($imagePath)) {
            throw new App42Exception(" File " . $imagePath . " does not exist");
        }

        //$file = new File($filePath);
        //if(!file_exists($file)){
        //throw Exception
        //}
        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $postParams= array();
            $postParams['name'] = $name;
            $postParams['formatToConvert'] = $formatToConvert;
            $params = array_merge($postParams, $signParams);
            $signature = urlencode($objUtil->sign($params)); //die();
            $params['imageFile'] = "@" . $imagePath;
            $headerParams['signature'] = $signature;
            //CONTENT_TYPE == "multipart/form-data"
            $contentType = "multipart/form-data";
            $body = null;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/convertformat";
            $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
            $imageResponseObj = new ImageProcessorResponseBuilder();
            $imageObj = $imageResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $imageObj;
    }

}
?>