<?php

include_once 'RestClient.class.php';
include_once 'RecommenderSimilarity.php';
include_once 'Util.php';
include_once 'App42Exception.php';
include_once 'App42Response.php';
include_once 'RecommenderResponseBuilder.php';
include_once 'App42Service.php';
/**
 * Recommendation engine which provides recommendation based on customer id, item
 * id and the preference of the customer for a particular Item. Recommendations
 * can be fetched based on User Similarity which finds similarity based on Users
 * and Item Similarity which finds similarity based on Items. The Recommendation
 * Engine currently supports two types of Similarity Algorithms i.e.
 * EuclideanDistanceSimilarity and PearsonCorrelationSimilarity. By default when
 * similarity is not specified PearsonCorrelationSimilarity is used e.g. in the
 * method itemBased(long userId, int howMany), it
 * uses PearsonCorrelationSimilarity. In the method itemBasedBySimilarity(String
 * similarity,long userId, int howMany) one can
 * specify which similarity algorithm has to be used e.g.
 * Recommender.EUCLIDEAN_DISTANCE or Recommender.PEARSON_CORRELATION.
 *
 * Preference file can be loaded using the method loadPreferenceFile(
 * String preferenceFilePath) in csv format. This
 * preferencefile has to be uploaded once which can be a batch process The csv
 * format for the file is given below. customerId, itemId, preference e.g.
 * 1,101,5.0 1,102,3.0 1,103,2.5
 *
 * 2,101,2.0 2,102,2.5 2,103,5.0 2,104,2.0
 *
 * 3,101,2.5 3,104,4.0 3,105,4.5 3,107,5.0
 *
 * 4,101,5.0 4,103,3.0 4,104,4.5 4,106,4.0
 *
 * 5,101,4.0 5,102,3.0 5,103,2.0 5,104,4.0 5,105,3.5 5,106,4.0 The customer Id
 * and item id can be any alphanumaric character(s) and preference values can be
 * in any range.
 *
 * If app developers have used the Review Service. The Recommendation Engine can
 * be used in conjunction with Review. In this case a CSV preference file need
 * not be uploaded. The customerId, itemId and preference will be taken from
 * Review where customerId is mapped with userName, itemId is mapped with itemId
 * and preference with rating. The methods for recommendations based on Reviews
 * are part of the Review service
 *
 *
 * @see ReviewService
 *
 */
class RecommenderService extends App42Service{

    protected $resource = "recommend";
    protected $url;
    protected $version = "1.0";
    protected $content_type = "application/json";
    protected $accept = "application/json";
    public static $EUCLIDEAN_DISTANCE = "EuclideanDistanceSimilarity";
    public static $PEARSON_CORRELATION = "PearsonCorrelationSimilarity";

    /**
     * The costructor for the Service
     * @param  apiKey
     * @param  secretKey
     * @param  baseURL
     *
     */
    public function __construct($apiKey, $secretKey) {
        //$this->resource = "charge";
        $this->apiKey = $apiKey;
        $this->secretKey = $secretKey;
        $this->url = $this->version . "/" . $this->resource;
    }

    /**
     * Uploads peference file on the cloud. The preference file should be in CSV
     * format. This preferencefile has to be uploaded once which can be a batch
     * process. New versions of preference file either can be uploaded in a
     * different name or the older one has to be removed and the uploaded in the
     * same name. The csv format for the file is given below. customerId,
     * itemId, preference e.g. 1,101,5.0 1,102,3.0 1,103,2.5
     *
     * 2,101,2.0 2,102,2.5 2,103,5.0 2,104,2.0
     *
     * 3,101,2.5 3,104,4.0 3,105,4.5 3,107,5.0
     *
     * 4,101,5.0 4,103,3.0 4,104,4.5 4,106,4.0
     *
     * 5,101,4.0 5,102,3.0 5,103,2.0 5,104,4.0 5,105,3.5 5,106,4.0 The customer
     * Id and item id can be any alphanumaric character(s) and preference values
     * can be in any range. If the recommendations have to be done based on
     * Reviews then this file need not be uploaded.
     *
     * @param preferenceFilePath
     *            - Path of the preference file to be loaded
     *
     * @return App42Response object.
     *
     * @throws App42Exception
     *
     */
    function loadPreferenceFile($preferenceFilePath) {

        $responseObj = new App42Response();
        Util::throwExceptionIfNullOrBlank($preferenceFilePath, "Preference File Path");
        $objUtil = new Util($this->apiKey, $this->secretKey);

        if (!file_exists($preferenceFilePath)) {
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
              $params = array_merge($postParams, $signParams);
              $signature = urlencode($objUtil->sign($signParams)); //die();
            $params['preferenceFile'] = "@" . $preferenceFilePath;
            $headerParams['signature'] = $signature;
            $contentType = "multipart/form-data";
            $body = null;
            $accept = $this->accept;
			$baseURL = $this->url;
            $baseURL = $baseURL;
            $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body,$headerParams);
            //$recommendResponseObj = new RecommenderResponseBuilder();
            //$recommendObj = $recommendResponseObj->buildResponse($response->getResponse());
            $responseObj->setStrResponse($response);
            $responseObj->setResponseSuccess(true);
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $responseObj;
    }

    /**
     * User based recommendations based on Neighborhood. Recommendations are
     * found based on similar users in the Neighborhood of the given user. The
     * size of the neighborhood can be found.
     *
     * @param userId
     *            - The user Id for whom recommendations have to be found
     * @param size
     *            - Size of the Neighborhood
     * @param howMany
     *            - Specifies that how many recommendations have to be found
     *
     * @returns Recommender Object
     */
    function userBasedNeighborhood($userId, $size, $howMany) {
        Util::throwExceptionIfNullOrBlank($userId, "User Id");
        Util::throwExceptionIfNullOrBlank($size, "Size");
        Util::throwExceptionIfNullOrBlank($howMany, "How Many");
        Util::throwExceptionIfHowManyNotValid($howMany, "How Many");
        $encodedUserId = Util::encodeParams($userId);
        $encodedSize = Util::encodeParams($size);
        $encodedHowMany = Util::encodeParams($howMany);
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $signParams['userId'] = $userId;
            $signParams['howMany'] = $howMany;
            $signParams['size'] = $size;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
			$baseURL = $this->url;
            $baseURL = $baseURL . "/userBasedNeighborhood/" . $encodedUserId . "/" . $encodedSize . "/" . $encodedHowMany;
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept,$headerParams);
            $recommendResponseObj = new RecommenderResponseBuilder();
            $recommendObj = $recommendResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $recommendObj;
    }

    /**
     * User based neighborhood recommendations based on Threshold.
     * Recommendations are found based on Threshold where thereshold represents
     * similarity threshold where user are at least that similar. Threshold
     * values can vary from -1 to 1
     *
     * @param userId
     *            - The user Id for whom recommendations have to be found
     * @param threshold
     *            - Threshold size. Values can vary from -1 to 1
     * @param howMany
     *            - Specifies that how many recommendations have to be found
     *
     * @returns Recommender Object
     */
    function userBasedThreshold($userId, $threshold, $howMany) {

        Util::throwExceptionIfNullOrBlank($userId, "User Id");
        Util::throwExceptionIfNullOrBlank($threshold, "Threshold");
        Util::throwExceptionIfNullOrBlank($howMany, "How Many");
        Util::throwExceptionIfHowManyNotValid($howMany, "How Many");
        $encodedUserId = Util::encodeParams($userId);
        $encodedThreshold = Util::encodeParams($threshold);
        $encodedHowMany = Util::encodeParams($howMany);
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		   $params = null;
           $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $signParams['userId'] = $userId;
            $signParams['howMany'] = $howMany;
            $signParams['threshold'] = $threshold;
            
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
			$baseURL = $this->url;
            $baseURL = $baseURL . "/userBasedThreshold/" . $encodedUserId . "/" . $encodedThreshold . "/" . $encodedHowMany;
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept,$headerParams);
            $recommendResponseObj = new RecommenderResponseBuilder();
            $recommendObj = $recommendResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $recommendObj;
    }

    /**
     * User based recommendations based on Neighborhood and Similarity.
     * Recommendations and found based on the similar users in the Neighborhood
     * with the specified Similarity Algorithm. Algorithm can be specified using
     * the constants Recommender.EUCLIDEAN_DISTANCE and
     * Recommender.PEARSON_CORRELATION
     *
     * @param recommenderSimilarity
     *            - Similarity algorithm e.g. Recommender.EUCLIDEAN_DISTANCE and
     *            Recommender.PEARSON_CORRELATION
     * @param userId
     *            - The user Id for whom recommendations have to be found
     * @param size
     *            - Size of the Neighborhood
     * @param howMany
     *            - Specifies that how many recommendations have to be found
     *
     * @returns Recommender Object
     */
    function userBasedNeighborhoodBySimilarity($recommenderSimilarity, $userId, $size, $howMany) {

        Util::throwExceptionIfNullOrBlank($recommenderSimilarity, "Recommender Similarity");
        Util::throwExceptionIfNullOrBlank($userId, "User Id");
        Util::throwExceptionIfNullOrBlank($size, "Size");
        Util::throwExceptionIfNullOrBlank($howMany, "How Many");
        Util::throwExceptionIfHowManyNotValid($howMany, "How Many");
        $encodedRecommenderSimilarity = Util::encodeParams($recommenderSimilarity);
        $encodedUserId = Util::encodeParams($userId);
        $encodedSize = Util::encodeParams($size);
        $encodedHowMany = Util::encodeParams($howMany);
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		    $params = null;
            $recommObj = new RecommenderSimilarity();
            if ($recommObj->isAvailable($recommenderSimilarity) == "null") {
                throw new App42Exception("The RecommenderSimilarity '$recommenderSimilarity' does not Exist ");
            }
           $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $signParams['userId'] = $userId;
            $signParams['similarity'] = $recommenderSimilarity;
            $signParams['howMany'] = $howMany;
            $signParams['size'] = $size;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
			$baseURL = $this->url;
            $baseURL = $baseURL . "/userBasedNeighborhood/" . $encodedRecommenderSimilarity . "/" . $encodedUserId . "/" . $encodedSize . "/" . $encodedHowMany;
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept,$headerParams);
            $recommendResponseObj = new RecommenderResponseBuilder();
            $recommendObj = $recommendResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $recommendObj;
    }

    /**
     * User based neighbourhood recommendations based on Threshold.
     * Recommendations are found based on Threshold where threshold represents
     * similarity threshold where user are at least that similar. Threshold
     * values can vary from -1 to 1
     *
     * @param recommenderSimilarity
     *            - Similarity algorithm e.g. Recommender.EUCLIDEAN_DISTANCE and
     *            Recommender.PEARSON_CORRELATION
     * @param userId
     *            - The user Id for whom recommendations have to be found
     * @param threshold
     *            - Threshold size. Values can vary from -1 to 1
     * @param howMany
     *            - Specifies that how many recommendations have to be found
     *
     * @returns Recommender Object
     */
    function userBasedThresholdBySimilarity($recommenderSimilarity, $userId, $threshold, $howMany) {

        Util::throwExceptionIfNullOrBlank($recommenderSimilarity, "Recommender Similarity");
        Util::throwExceptionIfNullOrBlank($userId, "User Id");
        Util::throwExceptionIfNullOrBlank($threshold, "Threshold");
        Util::throwExceptionIfNullOrBlank($howMany, "How Many");
        Util::throwExceptionIfHowManyNotValid($howMany, "How Many");
        $encodedRecommenderSimilarity = Util::encodeParams($recommenderSimilarity);
        $encodedUserId = Util::encodeParams($userId);
        $encodedThreshold = Util::encodeParams($threshold);
        $encodedHowMany = Util::encodeParams($howMany);
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		    $params = null;
            $recommObj = new RecommenderSimilarity();
            if ($recommObj->isAvailable($recommenderSimilarity) == "null") {
                throw new App42Exception("The RecommenderSimilarity '$recommenderSimilarity' does not Exist ");
            }
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $signParams['userId'] = $userId;
            $signParams['similarity'] = $recommenderSimilarity;
            $signParams['howMany'] = $howMany;
            $signParams['threshold'] = $threshold;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
			$baseURL = $this->url;
            $baseURL = $baseURL . "/userBasedThreshold/" . $encodedRecommenderSimilarity . "/" . $encodedUserId . "/" . $encodedThreshold . "/" . $encodedHowMany;
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept,$headerParams);
            $recommendResponseObj = new RecommenderResponseBuilder();
            $recommendObj = $recommendResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $recommendObj;
    }

    /**
     * Item based recommendations. Recommendations and found based item
     * similarity of the given user. The size of the neighborhood can be found.
     *
     * @param userId
     *            - The user Id for whom recommendations have to be found
     * @param howMany
     *            - Specifies that how many recommendations have to be found
     *
     * @returns Recommender Object
     */
    function itemBased($userId, $howMany) {

        Util::throwExceptionIfNullOrBlank($userId, "User Id");
        Util::throwExceptionIfNullOrBlank($howMany, "How Many");
        Util::throwExceptionIfHowManyNotValid($howMany, "How Many");
        $encodedUserId = Util::encodeParams($userId);
        $encodedHowMany = Util::encodeParams($howMany);
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $signParams['userId'] = $userId;
            $signParams['howMany'] = $howMany;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
			$baseURL = $this->url;
            $baseURL = $baseURL . "/itemBased/" . $encodedUserId . "/" . $encodedHowMany;
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept,$headerParams);
            $recommendResponseObj = new RecommenderResponseBuilder();
            $recommendObj = $recommendResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $recommendObj;
    }

    /**
     * Item based recommendations. Recommendations and found based one item
     * similarity. Similarity algorithm can be specified. of the given user. The
     * size of the neighborhood can be found.
     *
     * @param recommenderSimilarity
     *            - Similarity algorithm e.g. Recommender.EUCLIDEAN_DISTANCE and
     *            Recommender.PEARSON_CORRELATION
     * @param userId
     *            - The user Id for whom recommendations have to be found
     * @param howMany
     *            - Specifies that how many recommendations have to be found
     *
     * @returns Recommender Object
     */
    function itemBasedBySimilarity($recommenderSimilarity, $userId, $howMany) {

        Util::throwExceptionIfNullOrBlank($recommenderSimilarity, "Recommender Similarity");
        Util::throwExceptionIfNullOrBlank($userId, "User Id");
        Util::throwExceptionIfNullOrBlank($howMany, "How Many");
        Util::throwExceptionIfHowManyNotValid($howMany, "How Many");
        $encodedRecommenderSimilarity = Util::encodeParams($recommenderSimilarity);
        $encodedUserId = Util::encodeParams($userId);
        $encodedHowMany = Util::encodeParams($howMany);
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		    $params = null;
            $recommObj = new RecommenderSimilarity();
            if ($recommObj->isAvailable($recommenderSimilarity) == "null") {
                throw new App42Exception("The RecommenderSimilarity '$recommenderSimilarity' does not Exist ");
            }
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $signParams['userId'] = $userId;
            $signParams['similarity'] = $recommenderSimilarity;
            $signParams['howMany'] = $howMany;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/itemBased/" . $encodedRecommenderSimilarity . "/" . $encodedUserId . "/" . $encodedHowMany;
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept,$headerParams);
            $recommendResponseObj = new RecommenderResponseBuilder();
            $recommendObj = $recommendResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $recommendObj;
    }

    /**
     * Recommendations based on SlopeOne Algorithm
     *
     * @param userId
     *            - The user Id for whom recommendations have to be found
     * @param howMany
     *            - Specifies that how many recommendations have to be found
     *
     * @returns Recommender Object
     */
    function slopeOne($userId, $howMany) {

        Util::throwExceptionIfNullOrBlank($userId, "User Id");
        Util::throwExceptionIfNullOrBlank($howMany, "How Many");
        Util::throwExceptionIfHowManyNotValid($howMany, "How Many");
        $encodedUserId = Util::encodeParams($userId);
        $encodedHowMany = Util::encodeParams($howMany);
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $signParams['howMany'] = $howMany;
            $signParams['userId'] = $userId;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
			$baseURL = $this->url;
            $baseURL = $baseURL . "/slopeOne/" . $encodedUserId . "/" . $encodedHowMany;
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept,$headerParams);
            $recommendResponseObj = new RecommenderResponseBuilder();
            $recommendObj = $recommendResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $recommendObj;
    }

    /**
     * User based recommendations based on Neighborhood for All Users.
     * Recommendations and found based similar users in the Neighborhood of the
     * given user. The size of the neighborhood can be found.
     *
     * @param size
     *            - Size of the Neighborhood
     * @param howMany
     *            - Specifies that how many recommendations have to be found
     *
     * @returns Recommender Object for All users
     */
    function userBasedNeighborhoodForAll($size, $howMany) {

        Util::throwExceptionIfNullOrBlank($size, "Size");
        Util::throwExceptionIfNullOrBlank($howMany, "How Many");
        Util::throwExceptionIfHowManyNotValid($howMany, "How Many");
        $encodedSize = Util::encodeParams($size);
        $encodedHowMany = Util::encodeParams($howMany);
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $signParams['howMany'] = $howMany;
            $signParams['size'] = $size;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
			$baseURL = $this->url;
            $baseURL = $baseURL . "/userBasedNeighborhood/all/" . $encodedSize . "/" . $encodedHowMany;
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept,$headerParams);
            $recommendResponseObj = new RecommenderResponseBuilder();
            $recommendObj = $recommendResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $recommendObj;
    }

    /**
     * User based neighbourhood recommendations based on Threshold for all
     * Users. Recommendations are found based on Threshold where threshold
     * represents similarity threshold where user are at least that similar.
     * Threshold values can vary from -1 to 1
     *
     * @param threshold
     *            - Threshold size. Values can vary from -1 to 1
     * @param howMany
     *            - Specifies that how many recommendations have to be found
     *
     * @returns Recommender Object for all Users
     */
    function userBasedThresholdForAll($threshold, $howMany) {

        Util::throwExceptionIfNullOrBlank($threshold, "Threshold");
        Util::throwExceptionIfNullOrBlank($howMany, "How Many");
        Util::throwExceptionIfHowManyNotValid($howMany, "How Many");
        $encodedThreshold = Util::encodeParams($threshold);
        $encodedHowMany = Util::encodeParams($howMany);
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
            $params = null;
			$headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $signParams['howMany'] = $howMany;
            $signParams['threshold'] = $threshold;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
			$baseURL = $this->url;
            $baseURL = $baseURL . "/userBasedThreshold/all/" . $encodedThreshold . "/" . $encodedHowMany;
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept,$headerParams);
            $recommendResponseObj = new RecommenderResponseBuilder();
            $recommendObj = $recommendResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $recommendObj;
    }

    /**
     * User based recommendations based on Neighborhood and Similarity for all
     * Users. Recommendations and found based similar users in the Neighborhood
     * with the specified Similarity Algorithm. Algorithm can be specified using
     * the constants Recommender.EUCLIDEAN_DISTANCE and
     * Recommender.PEARSON_CORRELATION
     *
     * @param recommenderSimilarity
     *            - Similarity algorithm e.g. Recommender.EUCLIDEAN_DISTANCE and
     *            Recommender.PEARSON_CORRELATION
     * @param size
     *            - Size of the Neighborhood
     * @param howMany
     *            - Specifies that how many recommendations have to be found
     *
     * @returns Recommender Object for all Users
     */
    function userBasedNeighborhoodBySimilarityForAll($recommenderSimilarity, $size, $howMany) {

        Util::throwExceptionIfNullOrBlank($recommenderSimilarity, "Recommender Similarity");
        Util::throwExceptionIfNullOrBlank($size, "Size");
        Util::throwExceptionIfNullOrBlank($howMany, "How Many");
        Util::throwExceptionIfHowManyNotValid($howMany, "How Many");
        $encodedRecommenderSimilarity = Util::encodeParams($recommenderSimilarity);
        $encodedSize = Util::encodeParams($size);
        $encodedHowMany = Util::encodeParams($howMany);
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		    $params = null;
            $recommObj = new RecommenderSimilarity();
            if ($recommObj->isAvailable($recommenderSimilarity) == "null") {
                throw new App42Exception("The RecommenderSimilarity '$recommenderSimilarity' does not Exist ");
            }
           $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $signParams['howMany'] = $howMany;
            $signParams['size'] = $size;
            $signParams['similarity'] = $recommenderSimilarity;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
			$baseURL = $this->url;
            $baseURL = $baseURL . "/userBasedNeighborhood/all/" . $encodedRecommenderSimilarity . "/" . $encodedSize . "/" . $encodedHowMany;
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept,$headerParams);
            $recommendResponseObj = new RecommenderResponseBuilder();
            $recommendObj = $recommendResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $recommendObj;
    }

    /**
     * User based neighbourhood recommendations based on Threshold for All.
     * Recommendations are found based on Threshold where threshold represents
     * similarity threshold where user are at least that similar. Threshold
     * values can vary from -1 to 1
     *
     * @param recommenderSimilarity
     *            - Similarity algorithm e.g. Recommender.EUCLIDEAN_DISTANCE and
     *            Recommender.PEARSON_CORRELATION
     * @param threshold
     *            - Threshold size. Values can vary from -1 to 1
     * @param howMany
     *            - Specifies that how many recommendations have to be found
     *
     * @returns Recommender Object for All
     */
    function userBasedThresholdBySimilarityForAll($recommenderSimilarity, $threshold, $howMany) {

        Util::throwExceptionIfNullOrBlank($recommenderSimilarity, "Recommender Similarity");
        Util::throwExceptionIfNullOrBlank($threshold, "Threshold");
        Util::throwExceptionIfNullOrBlank($howMany, "How Many");
        Util::throwExceptionIfHowManyNotValid($howMany, "How Many");
        $encodedRecommenderSimilarity = Util::encodeParams($recommenderSimilarity);
        $encodedThreshold = Util::encodeParams($threshold);
        $encodedHowMany = Util::encodeParams($howMany);
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		    $params = null;
            $recommObj = new RecommenderSimilarity();
            if ($recommObj->isAvailable($recommenderSimilarity) == "null") {
                throw new App42Exception("The RecommenderSimilarity '$recommenderSimilarity' does not Exist ");
            }
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $signParams['howMany'] = $howMany;
            $signParams['threshold'] = $threshold;
            $signParams['similarity'] = $recommenderSimilarity;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
			$baseURL = $this->url;
            $baseURL = $baseURL . "/userBasedThreshold/all/" . $encodedRecommenderSimilarity . "/" . $encodedThreshold . "/" . $encodedHowMany;
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept,$headerParams);
            $recommendResponseObj = new RecommenderResponseBuilder();
            $recommendObj = $recommendResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $recommendObj;
    }

    /**
     * Item based recommendations for all Users. Recommendations and found based
     * item similarity of the given user. The size of the neighborhood can be
     * found.
     *
     * @param howMany
     *            - Specifies that how many recommendations have to be found
     *
     * @returns Recommender Object for all Users
     */
    function itemBasedForAll($howMany) {

        Util::throwExceptionIfNullOrBlank($howMany, "How Many");
        Util::throwExceptionIfHowManyNotValid($howMany, "How Many");
        $encodedHowMany = Util::encodeParams($howMany);
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		    $params = null;
             $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $signParams['howMany'] = $howMany;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
			$baseURL = $this->url;
            $baseURL = $baseURL . "/itemBased/all/" . $encodedHowMany;
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept,$headerParams);
            $recommendResponseObj = new RecommenderResponseBuilder();
            $recommendObj = $recommendResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $recommendObj;
    }

    /**
     * Item based recommendations for all Users. Recommendations and found based
     * one item similarity. Similarity algorithm can be specified. of the given
     * user. The size of the neighborhood can be found.
     *
     * @param recommenderSimilarity
     *            - Similarity algorithm e.g. Recommender.EUCLIDEAN_DISTANCE and
     *            Recommender.PEARSON_CORRELATION
     * @param howMany
     *            - Specifies that how many recommendations have to be found
     *
     * @returns Recommender Object for all Users
     */
    function itemBasedBySimilarityForAll($recommenderSimilarity, $howMany) {

        Util::throwExceptionIfNullOrBlank($recommenderSimilarity, "Recommender Similarity");
        Util::throwExceptionIfNullOrBlank($howMany, "How Many");
        Util::throwExceptionIfHowManyNotValid($howMany, "How Many");
        $encodedRecommenderSimilarity = Util::encodeParams($recommenderSimilarity);
        $encodedHowMany = Util::encodeParams($howMany);
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		    $params = null;
            $recommObj = new RecommenderSimilarity();
            if ($recommObj->isAvailable($recommenderSimilarity) == "null") {
                throw new App42Exception("The RecommenderSimilarity '$recommenderSimilarity' does not Exist ");
            }
             $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $signParams['similarity'] = $recommenderSimilarity;
            $signParams['howMany'] = $howMany;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
			$baseURL = $this->url;
            $baseURL = $baseURL . "/itemBased/all/" . $encodedRecommenderSimilarity . "/" . $encodedHowMany;
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept,$headerParams);
            $recommendResponseObj = new RecommenderResponseBuilder();
            $recommendObj = $recommendResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $recommendObj;
    }

    /**
     * Recommendations based on SlopeOne Algorithm for all Users
     *
     * @param howMany
     *            - Specifies that how many recommendations have to be found
     *
     * @returns Recommender Object for all Users
     */
    function slopeOneForAll($howMany) {

        Util::throwExceptionIfNullOrBlank($howMany, "How Many");
        Util::throwExceptionIfHowManyNotValid($howMany, "How Many");
        $encodedHowMany = Util::encodeParams($howMany);
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $signParams['howMany'] = $howMany;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
			$baseURL = $this->url;
            $baseURL = $baseURL . "/slopeOne/all/" . $encodedHowMany;
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept,$headerParams);
            $recommendResponseObj = new RecommenderResponseBuilder();
            $recommendObj = $recommendResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $recommendObj;
    }

    /**
     * Delete existing preference file.
     *
     * @returns App42Response Object.
     */
    function deleteAllPreferences() {

        $responseObj = new App42Response();
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
            $baseURL = $baseURL . "/deleteAllPreferences";
            $response = RestClient::delete($baseURL, $params, null, null, $contentType, $accept,$headerParams);
            //$recommendResponseObj = new RecommenderResponseBuilder();
            // $recommendObj = $recommendResponseObj->buildResponse($response->getResponse());
            $responseObj->setStrResponse($response);
            $responseObj->setResponseSuccess(true);
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $responseObj;
    }

    /**
     * Add or Update preference list on the cloud.
     *
     * @param preferenceDataList
     *            - List of PreferenceData which contains customerId, itemId,
     *            preference
     *
     * @return App42Response object
     */
    function addOrUpdatePreference($preferenceDataList) {

        Util::throwExceptionIfNullOrBlank($preferenceDataList, "Preference Data List");
        $responseObj = new App42Response();
        $objUtil = new Util($this->apiKey, $this->secretKey);
        $dataValue = array();
        $preferenceData = new PreferenceData();
        if (is_array($preferenceDataList)) {
            foreach ($preferenceDataList as $arrayValue) {
                $userId = $arrayValue->getUserId();
                $itemId = $arrayValue->getItemId();
                $preference = $arrayValue->getPreference();
                $array = array(
                    "UserId" => $userId,
                    "itemId" => $itemId,
                    "preference" => $preference,
                );
                array_push($dataValue, $array);
            }
        } else {
            $userId = $preferenceDataList->getUserId();
            $itemId = $preferenceDataList->getItemId();
            $preference = $preferenceDataList->getPreference();
            $array = array(
                "UserId" => $userId,
                "itemId" => $itemId,
                "preference" => $preference,
            );
            array_push($dataValue, $array);
        }
        try {
		     $params = null;
              $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            
            $body = null;
            //$body = '{"app42":{"preferences":{"preference":"' . $preferenceDataList->getUserId() . '","itemId":"' . $preferenceDataList->getItemId() . '","preference":"' . $preferenceDataList->getPreference() . '"}}}}';
            $body = '{"app42":{"preferences":{"preference":' . json_encode($dataValue) . '}}}';
            $signParams['body'] = $body;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
			$baseURL = $this->url;
            $baseURL = $baseURL . "/addOrUpdatePreference";
            $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body,$headerParams);
            $responseObj->setStrResponse($response);
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