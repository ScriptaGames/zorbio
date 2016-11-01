<?php

include_once 'App42Config.php';

//require_once dirname(__FILE__) . 'Config.php';
/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
class App42API {

    /**
     * ApiKey or App
     */
    public static $apiKey = "";
    public static $config = "";
    /**
     * Secret Key for App
     */
    public static $secretKey = "";
    /**
     * Current Logged In user
     */
    public static $loggedInUser = "";
    /**
     * SessionId for Logged In User
     */
    public static $userSessionId = "";
    /**
     * Default ACL list for logged in user data
     */
    public static $defaultACL = array();
    public static $dbName = "";

    /**
     *
     */
    //public static $consssfig =
    /**
     * Returns default ACL list set for logged in user data
     *
     * @return
     */
//	public static Set<ACL> getDefaultACL() {
//		return defaultACL;
//	}
    public static $enableCrashEventHandler = false;



    /**
     * Set default ACL list for currently logged in user data
     *
     * @param defaultACL
     */
//	public static function setDefaultACL(Set<ACL> defaultACL) {
//		App42API.defaultACL = defaultACL;
//	}

    /**
     * Returns currently logged in user.
     *
     * @return
     */
    public static function getLoggedInUser() {
        return self::$loggedInUser;
    }

    /**
     * Set current logged in user.
     *
     * @param loggedInUser
     */
    public static function setLoggedInUser($loggedInUser) {
        App42API::$loggedInUser = $loggedInUser;
    }

    /**
     * Get session id of logged in user
     *
     * @return
     */
    public static function getUserSessionId() {
        return self::$userSessionId;
    }

    /**
     * Set session id of current logged in user
     *
     * @param userSessionId
     */
    public static function setUserSessionId($userSessionId) {
        App42API::$userSessionId = $userSessionId;
    }

    public static function setDbName($dbName) {
        App42API::$dbName = $dbName;
    }

    public static function getDbName() {
        return self::$dbName;
    }

    /**
     * Set Api Key and Secret Key of your App
     *
     * @param apiKey
     * @param secretKey
     */
    public static function initialize($apiKey, $secretKey) {

        self::$config = App42Config::getInstance();
        App42API::$apiKey = $apiKey;
        App42API::$secretKey = $secretKey;
    }

    /**
     * Sets the value of Config.baseURL
     *
     * @param protocol
     *            protocol - A variable of String type
     * @param host
     *            host - A variable of String type
     * @param port
     *            port - A variable of Integer type
     */
    public static function setBaseURL($protocol, $host, $port) {
        self::$config->setBaseURL($protocol, $host, $port);
    }

    /**
     * Builds the instance of UserService.
     *
     * @return UserService - UserService Object
     * @see UserService
     */
    public static function buildUserService() {
        $userService = new UserService(self::$apiKey, self::$secretKey);
        return $userService;
    }
	/**
//	 * Builds the instance of StorageService.
//	 *
//	 * @return StorageService - StorageService Object
//	 * @see StorageService
//	 */
	public static function buildStorageService() {
		$storageService = new StorageService(self::$apiKey, self::$secretKey);
		return $storageService;
	}
    /**
     * Builds the instance of EmailService.
     *
     * @return EmailService - EmailService Object
     * @see EmailService
     */
	public static function buildEmailService() {
		$emailService = new EmailService(self::$apiKey, self::$secretKey);
		return $emailService;
	}


	/**
	 * Builds the instance of LogService.
	 *
	 * @return LogService - LogService Object
	 * @see LogService
	 */
	public static function buildLogService() {
		$logService = new LogService(self::$apiKey, self::$secretKey);
		return $logService;
	}



	/**
	 * Builds the instance of GeoService.
	 *
	 * @return GeoService - GeoService Object
	 * @see GeoService
	 */
	public static function buildGeoService() {
		$geoService = new GeoService(self::$apiKey, self::$secretKey);
		return $geoService;
	}

	/**
	 * Builds the instance of SessionService.
	 *
	 * @return SessionService - SessionService Object
	 * @see SessionService
	 */
	public static function buildSessionManager() {
		$sessionService = new SessionService(self::$apiKey, self::$secretKey);
		return $sessionService;
	}

	/**
	 * Builds the instance of PhotoService.
	 *
	 * @return PhotoService - PhotoService Object
	 * @see PhotoService
	 */
	public static function buildPhotoService() {
		$photoService = new PhotoService(self::$apiKey, self::$secretKey);
		return $photoService;
	}

	/**
	 * Builds the instance of QueueService.
	 *
	 * @return QueueService - QueueService Object
	 * @see QueueService
	 */
	public static function buildQueueService() {
		$queueService = new QueueService(self::$apiKey, self::$secretKey);
		return $queueService;
	}

	/**
	 * Builds the instance of RecommenderService.
	 *
	 * @return RecommenderService - RecommenderService Object
	 * @see RecommenderService
	 */
	public static function buildRecommenderService() {
		$recommenderService = new RecommenderService(self::$apiKey, self::$secretKey);
		return $recommenderService;
	}

	/**
	 * Builds the instance of UploadService.
	 *
	 * @return UploadService - UploadService Object
	 * @see UploadService
	 */
	public static function buildUploadService() {
		$uploadService = new UploadService(self::$apiKey, self::$secretKey);
		return $uploadService;
	}

	/**
	 * Builds the instance of CatalogueService.
	 *
	 * @return CatalogueService - CatalogueService Object
	 * @see CatalogueService
	 */
	public static function buildCatalogueService() {
		$catalogueService = new CatalogueService(self::$apiKey, self::$secretKey);
		return $catalogueService;
	}

	/**
	 * Builds the instance of CartService.
	 *
	 * @return CartService - CartService Object
	 * @see CartService
	 */
	public static function buildCartService() {
		$cartService = new CartService(self::$apiKey, self::$secretKey);
		return $cartService;
	}

	/**
	 * Builds the instance of AlbumService.
	 *
	 * @return AlbumService - AlbumService Object
	 * @see AlbumService
	 */
	public static function buildAlbumService() {
		$albumService = new AlbumService(self::$apiKey, self::$secretKey);
		return $albumService;

	}

	/**
	 * Builds the instance of GameService.
	 *
	 * @return GameService - GameService Object
	 * @see GameService
	 */
	public static function buildGameService() {
		$gameService = new GameService(self::$apiKey, self::$secretKey);
		return $gameService;
	}

	/**
	 * Builds the instance of RewardService.
	 *
	 * @return RewardService - RewardService Object
	 * @see RewardService
	 */
	public static function buildRewardService() {
		$rewardService = new RewardService(self::$apiKey, self::$secretKey);
		return $rewardService;
	}

	/**
	 * Builds the instance of ReviewService.
	 *
	 * @return ReviewService - ReviewService Object
	 * @see ReviewService
	 */
	public static function buildReviewService() {
	$reivewService = new ReviewService(self::$apiKey, self::$secretKey);
		return $reivewService;
	}

	/**
	 * Builds the instance of ScoreService.
	 *
	 * @return ScoreService - ScoreService Object
	 * @see ScoreService
	 */
	public static function buildScoreService() {
		$scoreService = new ScoreService(self::$apiKey, self::$secretKey);
		return $scoreService;
	}

	/**
	 * Builds the instance of ScoreBoardService.
	 *
	 * @return ScoreBoardService - ScoreBoardService Object
	 * @see ScoreBoardService
	 */
	public static function buildScoreBoardService() {
		$scoreBoardService = new ScoreBoardService(self::$apiKey, self::$secretKey);
		return $scoreBoardService;
	}

	

	/**
	 * Builds the instance of ImageProcessorService.
	 *
	 * @return ImageProcessorService - ImageProcessorService Object
	 * @see ImageProcessorService
	 */
	public static function buildImageProcessorService() {
		$imageProcessorService = new ImageProcessorService(
				self::$apiKey, self::$secretKey);
		return $imageProcessorService;
	}

	/**
	 * Builds the instance of SocialService.
	 *
	 * @return SocialService - SocialService Object
	 * @see SocialService
	 */
	public static function buildSocialService() {
		$socialService = new SocialService(self::$apiKey, self::$secretKey);
		return $socialService;
	}

	

	public static function buildPushNotificationService() {
		$pushNotification = new PushNotificationService(self::$apiKey, self::$secretKey);
		return $pushNotification;
	}



	/**
	 * Builds the instance of BuddyService.
	 *
	 * @return BuddyService - BuddyService Object
	 * @see BuddyService
	 */
	public static function buildBuddyService() {
		$buddyService = new BuddyService(self::$apiKey, self::$secretKey);
		return $buddyService;
	}

	/**
	 * Builds the instance of AvatarService.
	 *
	 * @return AvatarService - AvatarService Object
	 * @see AvatarService
	 */
	public static function buildAvatarService() {
		$avatarService = new AvatarService(self::$apiKey, self::$secretKey);
		return $avatarService;
	}

	/**
	 * Builds the instance of AchievementService.
	 *
	 * @return AchievementService - AchievementService Object
	 * @see AchievementService
	 */
	public static function buildAchievementService() {
		$achievementService = new AchievementService(self::$apiKey, self::$secretKey);
		return $achievementService;
	}

	/**
	 * Builds the instance of ABTestService.
	 *
	 * @return ABTestService - ABTestService Object
	 * @see ABTestService
	 */
	public static function buildABTestService() {
		$abTest = new ABTestService(self::$apiKey, self::$secretKey);
		return $abTest;
	}

        public static function buildSessionService() {
		$sessionService = new SessionService(self::$apiKey, self::$secretKey);
		return $sessionService;
	}
         public static function buildGiftService() {
		$giftService = new GiftService(self::$apiKey, self::$secretKey);
		return $giftService;
	}
        
      
	public static function buildTimerService() {
		$timerService = new TimerService(self::$apiKey, self::$secretKey);
		return $timerService;
	}
        public static function buildBravoBoardService() {
		$bravoBoardService = new BravoBoardService(self::$apiKey, self::$secretKey);
		return $bravoBoardService;
	}
        
}
?>
