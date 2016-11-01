<?php

include_once 'RestClient.class.php';
include_once 'Util.php';
include_once 'GameResponseBuilder.php';
include_once 'App42Exception.php';
include_once 'App42Service.php';
include_once 'App42API.php';

/**
 * ScoreBoard allows storing, retrieving, querying and ranking scores for users
 * and Games across Game Session. The Game service allows Game, User, Score and
 * ScoreBoard Management on the Cloud. The service allows Game Developer to
 * create a Game and then do in Game Scoring using the Score service. It also
 * allows to maintain a Scoreboard across game sessions using the ScoreBoard
 * service. One can query for average or highest score for user for a Game and
 * highest and average score across users for a Game. It also gives ranking of
 * the user against other users for a particular game. The Reward and
 * RewardPoints allows the Game Developer to assign rewards to a user and redeem
 * the rewards. E.g. One can give Swords or Energy etc. The services Game,
 * Score, ScoreBoard, Reward, RewardPoints can be used in Conjunction for
 * complete Game Scoring and Reward Management.
 * 
 * @see Game, RewardPoint, RewardPoint, Score
 *
 */
class ScoreBoardService extends App42Service {

    protected $version = "1.0";
    protected $resource = "game/scoreboard";
    protected $content_type = "application/json";
    protected $accept = "application/json";

    /**
     * this is a constructor that takes
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
     * Saves the User score for a game
     *
     * @param gameName
     *            - Name of the game for which score has to be saved
     * @param gameUserName
     *            - The user for which score has to be saved
     * @param gameScore
     *            - The sore that has to be saved
     *
     * @return the saved score for a game
     */
    function saveUserScore($gameName, $gameUserName, $gameScore) {

        Util::throwExceptionIfNullOrBlank($gameName, "Game Name");
        Util::throwExceptionIfNullOrBlank($gameUserName, "User Name");
        Util::throwExceptionIfNullOrBlank($gameScore, "Score");


        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
            $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $body = null;
            $body = '{"app42":{"game":{"name":"' . $gameName . '", "scores":{"score":{"userName":"' . $gameUserName . '","value":"' . $gameScore . '"}}}}}';

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
     * Retrieves the scores for a game for the specified name
     *
     * @param gameName
     *            - Name of the game for which score has to be fetched
     * @param userName
     *            - The user for which score has to be fetched
     *
     * @return the game score for the specified user
     */
    function getScoresByUser($gameName, $userName) {

        Util::throwExceptionIfNullOrBlank($gameName, "Game Name");
        Util::throwExceptionIfNullOrBlank($userName, "User Name");
        $encodedGameName = Util::encodeParams($gameName);
        $encodedUserName = Util::encodeParams($userName);

        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $signParams['name'] = $gameName;
            $signParams['userName'] = $userName;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/" . $encodedGameName . "/" . $encodedUserName;
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept, $headerParams);
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
     * Retrieves the highest game score for the specified user
     *
     * @param gameName
     *            - Name of the game for which highest score has to be fetched
     * @param userName
     *            - The user for which highest score has to be fetched
     *
     * @return the highest game score for the specified user
     */
    function getHighestScoreByUser($gameName, $userName) {

        Util::throwExceptionIfNullOrBlank($gameName, "Game Name");
        Util::throwExceptionIfNullOrBlank($userName, "User Name");
        $encodedGameName = Util::encodeParams($gameName);
        $encodedUserName = Util::encodeParams($userName);
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		     $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $signParams['name'] = $gameName;
            $signParams['userName'] = $userName;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/" . $encodedGameName . "/" . $encodedUserName . "/highest";
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept, $headerParams);
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
     * Retrieves the lowest game score for the specified user
     *
     * @param gameName
     *            - Name of the game for which lowest score has to be fetched
     * @param userName
     *            - The user for which lowest score has to be fetched
     *
     * @return the lowest game score for the specified user

     */
    function getLowestScoreByUser($gameName, $userName) {

        Util::throwExceptionIfNullOrBlank($gameName, "Game Name");
        Util::throwExceptionIfNullOrBlank($userName, "User Name");
        $encodedGameName = Util::encodeParams($gameName);
        $encodedUserName = Util::encodeParams($userName);
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $signParams['name'] = $gameName;
            $signParams['userName'] = $userName;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/" . $encodedGameName . "/" . $encodedUserName . "/lowest";
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept, $headerParams);
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
     * Retrieves the Top Rankings for the specified game
     *
     * @param gameName
     *            - Name of the game for which ranks have to be fetched
     *
     * @return the Top rankings for a game
     */
    function getTopRankings($gameName, $startDate = null, $endDate = null) {
        $argv = func_get_args();
        if (count($argv) == 1) {
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
                $baseURL = $baseURL . "/" . $encodedGameName . "/ranking";
                $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept, $headerParams);
                $gameResponseObj = new GameResponseBuilder();
                $gameObj = $gameResponseObj->buildResponse($response->getResponse());
            } catch (App42Exception $e) {
                throw $e;
            } catch (Exception $e) {
                throw new App42Exception($e);
            }
            return $gameObj;
        } else {

            /**
             * Retrieves the Top Rankings for the specified game
             * 
             * @param gameName
             *            - Name of the game for which ranks have to be fetched
             * @param startDate
             *            -Start date from which the ranking have to be fetched
             * @param endDate
             *            - End date up to which the ranking have to be fetched
             * @return the Top rankings for a game
             */
            Util::throwExceptionIfNullOrBlank($gameName, "Game Name");
            Util::throwExceptionIfNullOrBlank($startDate, "Start Date");
            Util::throwExceptionIfNullOrBlank($endDate, "End Date");
            $encodedGameName = Util::encodeParams($gameName);
            $encodedStartDate = Util::encodeParams($startDate);
            $encodedEndDate = Util::encodeParams($endDate);
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
                $signParams['name'] = $gameName;
                $signParams['startDate'] = $strStartDate;
                $signParams['endDate'] = $strEndDate;
                $signature = urlencode($objUtil->sign($signParams)); //die();
                $headerParams['signature'] = $signature;
                $contentType = $this->content_type;
                $accept = $this->accept;
                $baseURL = $this->url;
                $baseURL = $baseURL . "/" . $encodedGameName . "/ranking" . "/" . $strStartDate . "/" . $strEndDate;
                $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept, $headerParams);
                $gameResponseObj = new GameResponseBuilder();
                $gameObj = $gameResponseObj->buildResponse($response->getResponse());
            } catch (App42Exception $e) {
                throw $e;
            } catch (Exception $e) {
                throw new App42Exception($e);
            }
            return $gameObj;
        }
    }

    /**
     * Retrieves the Top Rankings for the specified game
     *
     * @param gameName
     *            - Name of the game for which ranks have to be fetched
     * @param max
     *            - Maximum number of records to be fetched
     *
     * @return the Top rankings for a game
     */
    function getTopNRankings($gameName, $max) {

        Util::throwExceptionIfNullOrBlank($gameName, "Game Name");
        Util::throwExceptionIfNullOrBlank($max, "Max");
        Util::validateMax($max);
        $encodedGameName = Util::encodeParams($gameName);
        $encodedMax = Util::encodeParams($max);
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $signParams['name'] = $gameName;
            $signParams['max'] = $max;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/" . $encodedGameName . "/ranking/" . $encodedMax;
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept, $headerParams);
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
     * Retrieves the User Ranking for the specified game
     *
     * @param gameName
     *            - Name of the game for which ranks have to be fetched
     * @param userName
     *            - Name of the user for which ranks have to be fetched
     *
     * @return the rank of the User
     *
     */
    function getUserRanking($gameName, $userName) {

        Util::throwExceptionIfNullOrBlank($gameName, "Game Name");
        Util::throwExceptionIfNullOrBlank($userName, "User Name");
        $encodedGameName = Util::encodeParams($gameName);
        $encodedUserName = Util::encodeParams($userName);
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $signParams['name'] = $gameName;
            $signParams['userName'] = $userName;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/" . $encodedGameName . "/" . $encodedUserName . "/ranking";
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept, $headerParams);
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
     * Retrieves the average game score for the specified user
     *
     * @param gameName
     *            - Name of the game for which average score has to be fetched
     * @param userName
     *            - The user for which average score has to be fetched
     *
     * @return the average game score for the specified user
     */
    function getAverageScoreByUser($gameName, $userName) {

        Util::throwExceptionIfNullOrBlank($gameName, "Game Name");
        Util::throwExceptionIfNullOrBlank($userName, "User Name");
        $encodedGameName = Util::encodeParams($gameName);
        $encodedUserName = Util::encodeParams($userName);
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $signParams['name'] = $gameName;
            $signParams['userName'] = $userName;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/" . $encodedGameName . "/" . $encodedUserName . "/average";
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept, $headerParams);
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
     * This function returns the top ranking based on user score
     * 
     * @param gameName
     *            - Name of the game
     * @param userList
     *            - List of the user for which ranking has to retrieve
     * @return Game oObject
     */
    function getTopRankingsByGroup($gameName, $userList) {

        Util::throwExceptionIfNullOrBlank($gameName, "Game Name");
        Util::throwExceptionIfNullOrBlank($userList, "User List");
        $encodedGameName = Util::encodeParams($gameName);
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);  
            if (is_array($userList)) {
                $signParams['userList'] = json_encode($userList);
            } else {
                $signParams['userList'] = $userList;
            }            
            $signParams['name'] = $gameName;
            $params= array_merge($queryParams,$signParams);
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/" . $encodedGameName . "/group";
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept, $headerParams);
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
     * This function returns the score attained by the specified user in the
     * last game session.
     * 
     * @param userName
     *            - Name of the for which score has to retrieve.
     * @return Game Object
     */
    function getLastGameScore($userName) {

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
            $baseURL = $baseURL . "/" . $encodedUserName . "/lastgame";
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept, $headerParams);
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
     * This function returns the top score attained by the specified user in the
     * game.
     * 
     * @param gameName
     *            - Name of the game
     * @param userName
     *            - Name of the user for which score has to retrieve
     * @return Game Object
     */
    function getLastScoreByUser($gameName, $userName) {

        Util::throwExceptionIfNullOrBlank($gameName, "Game Name");
        Util::throwExceptionIfNullOrBlank($userName, "User Name");
        $encodedGameName = Util::encodeParams($gameName);
        $encodedUserName = Util::encodeParams($userName);
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $signParams['name'] = $gameName;
            $signParams['userName'] = $userName;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/" . $encodedGameName . "/" . $encodedUserName . "/lastscore";
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept, $headerParams);
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
     * This function returns the specified number of top rankers in a specific
     * game.
     * 
     * @param gameName
     *            - Name of the game
     * @param max
     *            - Maximum number of records to be fetched
     * @return Game Object
     */
    function getTopNRankers($gameName, $max, $startDate = null, $endDate = null) {
        $argv = func_get_args();
        if (count($argv) == 2) {
            Util::throwExceptionIfNullOrBlank($gameName, "Game Name");
            Util::throwExceptionIfNullOrBlank($max, "Max");
            $encodedGameName = Util::encodeParams($gameName);
            $encodedMax = Util::encodeParams($max);
            Util::validateMax($max);
            $objUtil = new Util($this->apiKey, $this->secretKey);
            try {
			    $params = null;
                $headerParams = array();
                $queryParams = array();
                $signParams = $this->populateSignParams();
                $metaHeaders = $this->populateMetaHeaderParams();
                $headerParams = array_merge($signParams, $metaHeaders);
                $signParams['name'] = $gameName;
                $signParams['max'] = $max;
                $signature = urlencode($objUtil->sign($signParams)); //die();
                $headerParams['signature'] = $signature;
                $contentType = $this->content_type;
                $accept = $this->accept;
                $baseURL = $this->url;
                $baseURL = $baseURL . "/" . $encodedGameName . "/rankers/" . $encodedMax;
                $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept, $headerParams);
                $gameResponseObj = new GameResponseBuilder();
                $gameObj = $gameResponseObj->buildResponse($response->getResponse());
            } catch (App42Exception $e) {
                throw $e;
            } catch (Exception $e) {
                throw new App42Exception($e);
            }
            return $gameObj;
        } else {
            /**
             * 
             * @param gameName
             * @param startDate
             * @param endDate
             * @param max
             * @return
             */
            Util::throwExceptionIfNullOrBlank($gameName, "Game Name");
            Util::throwExceptionIfNullOrBlank($startDate, "Start Date");
            Util::throwExceptionIfNullOrBlank($endDate, "End Date");
            Util::throwExceptionIfNullOrBlank($max, "Max");
            Util::validateMax($max);
            $encodedGameName = Util::encodeParams($gameName);
            $encodedMax = Util::encodeParams($max);
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
                $signParams['name'] = $gameName;
                $signParams['startDate'] = $strStartDate;
                $signParams['endDate'] = $strEndDate;
                $signParams['max'] = $max;
                $signature = urlencode($objUtil->sign($signParams)); //die();
                $headerParams['signature'] = $signature;
                $contentType = $this->content_type;
                $accept = $this->accept;
                $baseURL = $this->url;
                $baseURL = $baseURL . "/" . $encodedGameName . "/rankers/" . $strStartDate . "/" . $strEndDate . "/" . $encodedMax;
                $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept, $headerParams);
                $gameResponseObj = new GameResponseBuilder();
                $gameObj = $gameResponseObj->buildResponse($response->getResponse());
            } catch (App42Exception $e) {
                throw $e;
            } catch (Exception $e) {
                throw new App42Exception($e);
            }
            return $gameObj;
        }
    }

    /**
     * 
     * @param gameName
     * @param userList
     * @return
     */
    function getTopNRankersByGroup($gameName, $userList) {

        Util::throwExceptionIfNullOrBlank($gameName, "Game Name");
        Util::throwExceptionIfNullOrBlank($userList, "User List");
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
            if (is_array($userList)) {
                $signParams['userList'] = json_encode($userList);
            } else {
                $signParams['userList'] = $userList;
            }
            $params = array_merge($queryParams, $signParams);
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/" . $encodedGameName . "/rankers/group";
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept, $headerParams);
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
     * 
     * @param scoreId
     * @param gameScore
     * @return
     * @throws App42Exception
     */
    function editScoreValueById($scoreId, $gameScore) {

        Util::throwExceptionIfNullOrBlank($scoreId, "Score Id");
        Util::throwExceptionIfNullOrBlank($gameScore, "Game Score");

        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $body = null;
            $body = '{"app42":{"game":{"scores":{"score":{"scoreId":"' . $scoreId . '","value":"' . $gameScore . '"}}}}}';
            $signParams['body'] = $body;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/editscore";
            $response = RestClient::put($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
            $scoreObj = new GameResponseBuilder();
            $scoreObj1 = $scoreObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $scoreObj1;
    }

 function getTopRankersFromBuddyGroup($gameName,$userName,$ownerName, $groupName) {

        Util::throwExceptionIfNullOrBlank($gameName, "Game Name");
        Util::throwExceptionIfNullOrBlank($userName, "User Name");
         Util::throwExceptionIfNullOrBlank($ownerName, "Owner Name");
          Util::throwExceptionIfNullOrBlank($groupName, "Group Name");
        $encodedGameName = Util::encodeParams($gameName);
         $encodedUserName = Util::encodeParams($userName);
          $encodedOwnerName = Util::encodeParams($ownerName);
           $encodedGroupName = Util::encodeParams($groupName);
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		    $params = null;
           $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $signParams['name'] = $gameName;
            $signParams['userName'] = $userName;
             $signParams['ownerName'] = $ownerName;
              $signParams['groupName'] = $groupName;
                     
            
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/" . $encodedGameName . "/rankers" . "/" . $encodedUserName . "/group/"
					. $encodedOwnerName . "/" . $encodedGroupName;
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept, $headerParams);
            $gameResponseObj = new GameResponseBuilder();
            $gameObj = $gameResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $gameObj;
    }



    function getTopNRankersFromFacebook($gameName, $fbAccessToken, $max) {

        Util::throwExceptionIfNullOrBlank($gameName, "Game Name");
        Util::throwExceptionIfNullOrBlank($fbAccessToken, "fbAccessToken");
        Util::validateMax($max);
        Util::throwExceptionIfNullOrBlank($max, "Max");
        $encodedGameName = Util::encodeParams($gameName);
        $encodedMax = Util::encodeParams($max);
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		     $params = null;
            $this->setFbAccessToken($fbAccessToken);
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $signParams['name'] = $gameName;
            $signParams['max'] = $max;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/" . $encodedGameName . "/rankers/facebook/" . $encodedMax;
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept, $headerParams);
            $gameResponseObj = new GameResponseBuilder();
            $gameObj = $gameResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $gameObj;
    }

    function getTopNRankersFromFacebookByDateRange($gameName, $fbAccessToken, $startDate, $endDate, $max) {

        Util::throwExceptionIfNullOrBlank($gameName, "Game Name");
        Util::throwExceptionIfNullOrBlank($fbAccessToken, "fbAccessToken");
        Util::validateMax($max);
        Util::throwExceptionIfNullOrBlank($max, "Max");
        $encodedGameName = Util::encodeParams($gameName);
        $encodedMax = Util::encodeParams($max);
        $encodedStartDate = Util::encodeParams($startDate);
        $encodedEndDate = Util::encodeParams($endDate);
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		    $params = null;
            $strStartDate = (date("Y-m-d\TG:i:s", strtotime($startDate)) . substr((string) microtime(), 1, 4) . "Z");
            $strEndDate = (date("Y-m-d\TG:i:s", strtotime($endDate)) . substr((string) microtime(), 1, 4) . "Z");
            $this->setFbAccessToken($fbAccessToken);
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $signParams['name'] = $gameName;
            $signParams['startDate'] = $strStartDate;
            $signParams['endDate'] = $strEndDate;
            $signParams['max'] = $max;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/" . $encodedGameName . "/rankers/facebook/".$strStartDate."/".$strEndDate."/" . $encodedMax;
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept, $headerParams);
            $gameResponseObj = new GameResponseBuilder();
            $gameObj = $gameResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $gameObj;
    }


     function getTopNTargetRankers($gameName, $max) {

        Util::throwExceptionIfNullOrBlank($gameName, "Game Name");
        Util::validateMax($max);
        Util::throwExceptionIfNullOrBlank($max, "Max");
        $encodedGameName = Util::encodeParams($gameName);
        $encodedMax = Util::encodeParams($max);
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $signParams['name'] = $gameName;
            $signParams['max'] = $max;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/" . $encodedGameName ."/targetedrankers" . "/"  . $encodedMax;
             $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept, $headerParams);
            $gameResponseObj = new GameResponseBuilder();
            $gameObj = $gameResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $gameObj;
    }



    public function addJSONObject($collectionName, $obj) {
        $this->dbName = App42API::getDbName();
        $this->collectionName = $collectionName;
        $this->jsonObject = json_encode($obj);
    }


    function getUsersWithScoreRange($gameName,$minScore,$maxScore) {

        Util::throwExceptionIfNullOrBlank($gameName, "Game Name");
        $encodedGameName = Util::encodeParams($gameName);
        $encodedMinScore = Util::encodeParams($minScore);
         $encodedMaxScore = Util::encodeParams($maxScore);
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $signParams['name'] = $gameName;
            $signParams['minScore'] = $minScore;
            $signParams['maxScore'] = $maxScore;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/".  $encodedGameName . "/range/".$minScore. "/".$maxScore;
             $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept, $headerParams);
            $gameResponseObj = new GameResponseBuilder();
            $gameObj = $gameResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $gameObj;
    }

}
?>