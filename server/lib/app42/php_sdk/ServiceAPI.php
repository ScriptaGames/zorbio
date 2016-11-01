<?php

//use com\shephertz\app42\paas\sdk\php\appTab\Discount;
include_once 'catalogue.php';

include_once 'UserService.php';
include_once 'UploadService.php';
include_once 'Upload.php';
include_once 'UploadFileType.php';
include_once 'ReviewService.php';
include_once 'Review.php';
include_once 'SessionService.php';
include_once 'Recommender.php';
include_once 'RecommenderService.php';
include_once 'Cart.php';
include_once 'PaymentStatus.php';
include_once 'CartService.php';
include_once 'Cart.php';
include_once 'Storage.php';
include_once 'StorageService.php';
include_once 'Geo.php';
include_once 'GeoService.php';
include_once 'GeoPoint.php';
include_once 'QueueService.php';
include_once 'Queue.php';
include_once 'Album.php';
include_once 'AlbumService.php';
include_once 'PhotoService.php';
include_once 'EmailService.php';
include_once 'Email.php';
include_once 'EmailMIME.php';
include_once 'GameService.php';
include_once 'RewardService.php';
include_once 'ScoreService.php';
include_once 'ScoreBoardService.php';
include_once 'Logging.php';
include_once 'LogService.php';
include_once 'CatalogueService.php';
include_once 'Image.php';
include_once 'ImageProcessorService.php';
include_once 'Social.php';
include_once 'SocialService.php';
include_once 'PushNotificationService.php';
include_once 'AchievementService.php';
include_once 'Achievement.php';
include_once 'App42Config.php';
include_once 'ABTestService.php';
include_once 'ABTesting.php';
include_once 'Buddy.php';
include_once 'BuddyService.php';
include_once 'AvatarService.php';
include_once 'Avatar.php';
include_once 'MetaResponse.php';
include_once 'BravoBoardService.php';


/**
 * This class basically is a factory class which builds the service for use.
 * All services can be instantiated using this class
 * 
 */
class ServiceAPI {

    protected $apiKey;
    protected $secretKey;
    protected $url;
    protected $contentType;
    protected $accept;
    private $config;
    private $baseURL;

    /**
     * this is a constructor that takes
     * @param  apiKey
     * @param  secretKey
     *
     */
    public function __construct($apiKey, $secretKey) {
        $this->apiKey = $apiKey;
        $this->secretKey = $secretKey;
    }

    /**
     * Retrieve the value of config object.
     *
     * @return Config object
     */
    public function getConfig() {
        return $this->config;
    }

    /**
     * Sets the value of config object
     *
     * @param config
     *            Config object
     *
     * @see Config
     */
    public function setConfig($config) {
        $this->config = $config;
    }

    public function setBaseURL($protocol, $host, $port) {
        App42Config::getInstance()->setBaseURL($protocol, $host, $port);
    }

    // BUILDING FUNCTIONS FOR ALL THE API'S

    public function buildUserService() {
        $objUser = new UserService($this->apiKey, $this->secretKey);
        return $objUser;
    }

    public function buildUploadService() {
        $objUpload = new UploadService($this->apiKey, $this->secretKey);
        return $objUpload;
    }

    public function buildReviewService() {
        $objReview = new ReviewService($this->apiKey, $this->secretKey);
        return $objReview;
    }

    public function buildSessionService() {
        $objSession = new SessionService($this->apiKey, $this->secretKey);
        return $objSession;
    }

    public function buildRecommenderService() {
        $objRecommender = new RecommenderService($this->apiKey, $this->secretKey);
        return $objRecommender;
    }

    public function buildCartService() {
        $objCart = new CartService($this->apiKey, $this->secretKey);
        return $objCart;
    }

    public function buildCatalogueService() {
        $objCatalogue = new CatalogueService($this->apiKey, $this->secretKey);
        return $objCatalogue;
    }

    public function buildStorageService() {
        $objStorage = new StorageService($this->apiKey, $this->secretKey);
        return $objStorage;
    }

    public function buildGeoService() {
        $objGeo = new GeoService($this->apiKey, $this->secretKey);
        return $objGeo;
    }

    public function buildQueueService() {
        $objQueue = new QueueService($this->apiKey, $this->secretKey);
        return $objQueue;
    }

    public function buildAlbumService() {
        $objAlbum = new AlbumService($this->apiKey, $this->secretKey);
        return $objAlbum;
    }

    public function buildPhotoService() {
        $objPhoto = new PhotoService($this->apiKey, $this->secretKey);
        return $objPhoto;
    }

    public function buildEmailService() {
        $objEmail = new EmailService($this->apiKey, $this->secretKey);
        return $objEmail;
    }

    public function buildGameService() {
        $objGame = new GameService($this->apiKey, $this->secretKey);
        return $objGame;
    }

    public function buildRewardService() {
        $objReward = new RewardService($this->apiKey, $this->secretKey);
        return $objReward;
    }

    public function buildScoreService() {
        $buildScore = new ScoreService($this->apiKey, $this->secretKey);
        return $buildScore;
    }

    public function buildScoreBoardService() {
        $buildScoreBoard = new ScoreBoardService($this->apiKey, $this->secretKey);
        return $buildScoreBoard;
    }

    public function buildLogService() {
        $buildLog = new LogService($this->apiKey, $this->secretKey);
        return $buildLog;
    }

    public function buildImageProcessorService() {
        $buildImageProcessor = new ImageProcessorService($this->apiKey, $this->secretKey);
        return $buildImageProcessor;
    }

    public function buildSocialService() {
        $buildSocial = new SocialService($this->apiKey, $this->secretKey);
        return $buildSocial;
    }

    public function buildPushNotificationService() {
        $pushSocial = new PushNotificationService($this->apiKey, $this->secretKey);
        return $pushSocial;
    }

    public function buildAchievementService() {
        $achievementService = new AchievementService($this->apiKey, $this->secretKey);
        return $achievementService;
    }

    public function buildABTestService() {
        $abTestService = new ABTestService($this->apiKey, $this->secretKey);
        return $abTestService;
    }

    public function buildBuddyService() {
        $buddyService = new BuddyService($this->apiKey, $this->secretKey);
        return $buddyService;
    }

    public function buildAvatarService() {
        $avatarService = new AvatarService($this->apiKey, $this->secretKey);
        return $avatarService;
    }

    public function buildGiftService() {
        $giftService = new GiftService($this->apiKey, $this->secretKey);
        return $giftService;
    }

    public function buildTimerService() {
        $timerService = new TimerService($this->apiKey, $this->secretKey);
        return $timerService;
    }
       public  function buildBravoBoardService() {
		$bravoBoardService = new BravoBoardService($this->apiKey, $this->secretKey);
		return $bravoBoardService;
	}
}

?>