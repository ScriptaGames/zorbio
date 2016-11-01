<?php

include_once 'RestClient.class.php';
include_once 'Util.php';
include_once 'GameResponseBuilder.php';
include_once 'App42Exception.php';
include_once 'App42Response.php';
include_once 'App42Service.php';
/**
 * The Game service allows Game, User, Score and ScoreBoard Management on the
 * Cloud. The service allows Game Developer to create a Game and then do in Game
 * Scoring using the Score service. It also allows to maintain a Score board
 * across game sessions using the ScoreBoard service. One can query for average
 * or highest score for user for a Game and highest and average score across
 * users for a Game. It also gives ranking of the user against other users for a
 * particular game. The Reward and RewardPoints allows the Game Developer to
 * assign rewards to a user and redeem the rewards. E.g. One can give Swords or
 * Energy etc. The services Game, Score, ScoreBoard, Reward, RewardPoints can be
 * used in Conjunction for complete Game Scoring and Reward Management.
 *
 * @see Reward, RewardPoint, Score, ScoreBoard
 */
class GameService extends App42Service{

    protected $version = "1.0";
    protected $resource = "game";
    protected $content_type = "application/json";
    protected $accept = "application/json";

    /**
     * Constructor that takes
     * @param  apiKey
     * @param  secretKey
     * @param  baseURL
     *
     */
    public function __construct($apiKey, $secretKey) {
        //$this->resource = "charge";
        $this->apiKey = $apiKey;
        $this->secretKey = $secretKey;
        $this->url =  $this->version . "/" . $this->resource;
    }

    /**
     * Creates a game on the cloud
     *
     * @param gameName
     *            - Name of the game that has to be created
     * @param gameDescription
     *            - Description of the game to be created
     *
     * @return Game object containing the game which has been created
     */
    function createGame($gameName, $gameDescription) {
        Util::throwExceptionIfNullOrBlank($gameName, "Game Name");
        Util::throwExceptionIfNullOrBlank($gameDescription, "Game Description");
        $objUtil = new Util($this->apiKey, $this->secretKey);

        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $body = null;
            $body = '{"app42":{"game":{"name":"' . $gameName . '","description":"' . $gameDescription . '"}}}';
            $signParams['body'] = $body;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL;
            $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
            $gameResponseObj = new GameResponseBuilder();
            $gameObj = $gameResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $gameObj;
    }

    /**
     * Fetches all games for the App
     *
     * @return List of Game object containing all the games for the App
     */
    function getAllGames($max = null, $offset = null) {
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
                $gameResponseObj = new GameResponseBuilder();
                $gameObj = $gameResponseObj->buildArrayResponse($response->getResponse());
            } catch (App42Exception $e) {
                throw $e;
            } catch (Exception $e) {
                throw new App42Exception($e);
            }
            return $gameObj;
        } else {


            /**
             * Fetches all games for the App by paging.
             *
             * @param max
             *            - Maximum number of records to be fetched
             * @param offset
             *            - From where the records are to be fetched
             *
             * @return List of Game object containing all the games for the App
             */
            Util::throwExceptionIfNullOrBlank($max, "Max");
            Util::throwExceptionIfNullOrBlank($offset, "Offset");
            Util::validateMax($max);
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
                $gameResponseObj = new GameResponseBuilder();
                $gameObj = $gameResponseObj->buildArrayResponse($response->getResponse());
            } catch (App42Exception $e) {
                throw $e;
            } catch (Exception $e) {
                throw new App42Exception($e);
            }
            return $gameObj;
        }
    }

    /**
     * Fetches the count of all games for the App
     *
     * @return App42Response object containing count of all the Game for the App
     */
    function getAllGamesCount() {

        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
            $params = null;
            $gameObj = new App42Response();
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
            $gameObj->setStrResponse($response->getResponse());
            $gameObj->setResponseSuccess(true);
            $gameResponseObj = new GameResponseBuilder();
            $gameObj->setTotalRecords($gameResponseObj->getTotalRecords($response->getResponse()));
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $gameObj;
    }

    /**
     * Retrieves the game by the specified name
     *
     * @param gameName
     *            - Name of the game that has to be fetched
     *
     * @return Game object containing the game which has been created
     */
    function getGameByName($gameName) {

        Util::throwExceptionIfNullOrBlank($gameName, "Game Name");
        $encodedGameName = Util::encodeParams($gameName);
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $signParams['name'] = $gameName;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/" . $encodedGameName;
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept,$headerParams);
            $gameResponseObj = new GameResponseBuilder();
            $gameObj = $gameResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $gameObj;
    }
    
    
    function deleteUser($gameName) {

        Util::throwExceptionIfNullOrBlank($gameName, "Game Name");
        $encodedUserName = Util::encodeParams($gameName);
        $responseObj = new App42Response();
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
	    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $signParams['gameName'] = $gameName;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/delete/" . $encodedUserName;
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