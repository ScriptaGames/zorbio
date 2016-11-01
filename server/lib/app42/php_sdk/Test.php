<?php


include_once 'ServiceAPI.php';
include_once 'JSONObject.php';
include_once 'QueryBuilder.php';
include_once 'OrderByType.php';
include_once 'StorageService.php';
include_once 'StorageResponseBuilder.php';
include_once 'Storage.php';
/**
 * This class basically is a factory class which builds the service for use.
 * All services can be instantiated using this class
 * 
 */
class Test {

    // BUILDING FUNCTIONS FOR ALL THE API'S

    public function buildUserService() {
        $objUser = new UserService($this->apiKey, $this->secretKey, $this->url);
        return $objUser;
    }

    public function buildUploadService() {
        $objUpload = new UploadService($this->apiKey, $this->secretKey, $this->url);
        return $objUpload;
    }

    public function buildReviewService() {
        $objReview = new ReviewService($this->apiKey, $this->secretKey, $this->url);
        return $objReview;
    }

    public function buildSessionService() {
        $objSession = new SessionService($this->apiKey, $this->secretKey, $this->url);
        return $objSession;
    }

    public function buildRecommenderService() {
        $objRecommender = new RecommenderService($this->apiKey, $this->secretKey, $this->url);
        return $objRecommender;
    }

    public function buildCartService() {
        $objCart = new CartService($this->apiKey, $this->secretKey, $this->url);
        return $objCart;
    }

    public function buildLicenseService() {
        $objLicense = new LicenseService($this->apiKey, $this->secretKey, $this->url);
        return $objLicense;
    }

    public function buildUsageService() {
        $objUsage = new UsageService($this->apiKey, $this->secretKey, $this->url);
        return $objUsage;
    }

    public function buildCatalogueService() {
        $objCatalogue = new CatalogueService($this->apiKey, $this->secretKey, $this->url);
        return $objCatalogue;
    }

    public function buildChargeService() {
        $objCharge = new Charge($this->apiKey, $this->secretKey, $this->url);
        return $objCharge;
    }

    public function buildStorageService() {
        $objStorage = new StorageService($this->apiKey, $this->secretKey, $this->url);
        return $objStorage;
    }

    public function buildGeoService() {
        $objGeo = new GeoService($this->apiKey, $this->secretKey, $this->url);
        return $objGeo;
    }

    public function buildQueueService() {
        $objQueue = new QueueService($this->apiKey, $this->secretKey, $this->url);
        return $objQueue;
    }

    public function buildAlbumService() {
        $objAlbum = new AlbumService($this->apiKey, $this->secretKey, $this->url);
        return $objAlbum;
    }

    public function buildPhotoService() {
        $objPhoto = new PhotoService($this->apiKey, $this->secretKey, $this->url);
        return $objPhoto;
    }

    public function buildEmailService() {
        $objEmail = new EmailService($this->apiKey, $this->secretKey, $this->url);
        return $objEmail;
    }

    public function buildGameService() {
        $objGame = new GameService($this->apiKey, $this->secretKey, $this->url);
        return $objGame;
    }

    public function buildRewardService() {
        $objReward = new RewardService($this->apiKey, $this->secretKey, $this->url);
        return $objReward;
    }

    public function buildScoreService() {
        $buildScore = new ScoreService($this->apiKey, $this->secretKey, $this->url);
        return $buildScore;
    }

    public function buildScoreBoardService() {
        $buildScoreBoard = new ScoreBoardService($this->apiKey, $this->secretKey, $this->url);
        return $buildScoreBoard;
    }

    public function buildLogService() {
        $buildLog = new LogService($this->apiKey, $this->secretKey, $this->url);
        return $buildLog;
    }

    public function buildImageProcessorService() {
        $buildImageProcessor = new ImageProcessorService($this->apiKey, $this->secretKey, $this->url);
        return $buildImageProcessor;
    }

    public function buildBillService() {
        $buildBill = new BillService($this->apiKey, $this->secretKey, $this->url);
        return $buildBill;
    }

    public function buildFacebookService() {
        $buildFacebook = new FacebookService($this->apiKey, $this->secretKey, $this->url);
        return $buildFacebook;
    }

    public function buildTwitterService() {
        $buildTwitter = new TwitterService($this->apiKey, $this->secretKey, $this->url);
        return $buildTwitter;
    }
    public function buildPushNotificationService() {
        $buildPushNotification = new PushNotificationService($this->apiKey, $this->secretKey, $this->url);
        return $buildPushNotification;
    }
 
}

//Serer details
//$serviceAPIObj = new ServiceAPI("c8274620e0a4f73baffa35239333600198614fb8b6f5230617906131f3ada4d3", "cfc9e90170ae16e3f0f010d9b48165dc992cb3ec585646181d0c62a173ad4e94");
//Local
//$serviceAPIObj = new ServiceAPI("9ff49a60d1e86392cd406f9ff9944a8d9a3e606f72ed9ee6fb43c7663b70fd7c", "e1ef3a75420ea581a368a65d2e9f47084f2aec30b8ddb6d0d5065b713e2b2847");
//NEW
//$serviceAPIObj = new ServiceAPI("760d2ee83d3f2fda7e69c1de84ff597546f550e057f1b76215c7e21df3dd2fb6", "8d18691a4b9c29dc480eb696dc64ea24bd99a3078eabed700c8e558762b77884");

$serviceAPIObj = new ServiceAPI("3d93b0796e2c8b99a1c7312d015adac709c79345de17593b94a9172921868a6c", "8268f3a39b87ce0f83a57c6454d3cedddf3ea95c7a1cc389518d0cb53dbf2c57");
//---------------------apptap--------------------------//
$usage = $serviceAPIObj->buildUsageService();
$usage1 = $serviceAPIObj->buildUsageService();
$usage2 = $serviceAPIObj->buildUsageService();
$bill = $serviceAPIObj->buildBillService();
$license = $serviceAPIObj->buildLicenseService();
$license1 = $serviceAPIObj->buildLicenseService();
$license2 = $serviceAPIObj->buildLicenseService();
$levelName = "nvnbvvxvxffdsvvn";
$oneTmeCharge = "dsfdfdfxvvcx55vgggdgvcvdf";
//$createOneTimeObj = $usage->createOneTimeCharge($oneTmeCharge, 333, Currency::ASD, "OneTimeCharge");
//$getOneTimeObj = $usage1->getOneTime($oneTmeCharge);
 //$getAllOneTimeUsageObj = $usage1->getAllOneTimeUsage();
// $chargeOneTimeObj = $usage1->chargeOneTime("nareshdffdgfgfhwivfdffedi", $oneTmeCharge);
//$removeoneTimeObj = $usage2->removeOneTime($oneTmeCharge);
//$levelObj = $usage->createLevelCharge($levelName, 100, Currency::ASD, "Welcome");
//$timeObj = $usage->createTimeCharge("rrrvcvrr11", 4321, TimeUnit::HOURS, 100, Currency::ASD, "GURU12gdg3");
//$timeChargeObj = $usage->getAllTimeUsage();
//$timeObj1 = $usage->removeLevel($levelName);
//$levelObj1 = $usage->getLevel($levelName);
//$timeChargeObj = $usage1->chargeLevel("userName1111", $levelName);
//$timeChargeObj = $usage->getAllLevelUsage();
 //$chargeTime = $usage1->chargeTime("usernacvmew", "rrrvcvrr11", 10, TimeUnit::HOURS);
 //$timeChargeObj = $usage2->getTime("rrrvcvrr11");
//$timeChargeObj = $usage->removeTime("yugdgfgfhfdfdfgdfgdfgyuiyu");
//$createFeatureCharge = $usage->createFeatureCharge("iiivnvnibhbfh", 100, Currency::ASD, "test for featured");
//$chargeFeatureObj = $usage1->chargeFeature("naresh_123111", "iiivnvnibhbfh");
//$createStorageCharge = $usage->createStorageCharge("gdfh1dgg1551", 100, StorageUnit::KB, 100, Currency::ASD, "test storage schage");
//$chargeStorageObj = $usage1->chargeStorage("storagg771", "gdfh1dgg1551", 100, StorageUnit::GB);
//$removeStorage = $usage1->removeStorage("gdfh11");
//$getStorage = $usage2->getStorage("gdfh1155");
// $getAllStorageUsage = $usage1->getAllStorageUsage();
//$BandwidthChargeObj = $usage->createBandwidthCharge("gggtcccet",1000, BandwidthUnit::GB,10, Currency::ASD, "Description");
//$chargeBandwidthObj = $usage1->chargeBandwidth("guru111dgfgfhfhfh","gggtcccet",1000, BandwidthUnit::GB);
//$createOneTimeObj = $usage->createOneTimeCharge($OneTimeCharge, 333, Currency::ASD, "OneTimeCharge");
//$chargeOneTimeObj = $usage1->chargeOneTime("nareshdbvbbwvddxvfdfffhivedi",$OneTimeCharge);
//$getOneTimeObj = $usage2->getOneTime("onetimevdb");
//$getAllOneTimeUsageObj = $usage1->getAllOneTimeUsage();
//$featureObj = $usage->createFeatureCharge("fhfgh", 100, Currency::ASD, "test for featured");
//$getFeatureObj = $usage1->getFeature("FeatureChafrge");
//$getAllFeatureUsageObj = $usage1->getAllFeatureUsage();
//$removeFeatureObj = $usage1->removeFeature("fhfgh");
 //$getBandwidthObj = $usage1->getBandwidth("BandwifdsfghdthCharges6");
//$getAllBandwidthUsageObj = $usage1->getAllBandwidthUsage();
  //$removeBandwidth = $usage1->removeBandwidth("BandwifdgdgdshhfghdthCharges6");
//echo"start";
//print_r($removeBandwidth);
//echo"finish";
 //$billLevelObj = $bill->usageLevelByMonthAndYear("userName1111", $levelName, BillMonth::OCTOBER, 2012);
 //$billFeatureObj = $bill->usageFeatureByMonthAndYear("naresh_123111", "iiivnvnibhbfh", BillMonth::OCTOBER, 2012);
  //$BandwidthObj = $bill->usageBandwidthByMonthAndYear("guru111dgfgfhfhfh", "gggtcccet", BillMonth::OCTOBER, 2012);
//$TimeObj = $bill->usageTimeByMonthAndYear("usernamew", "rrrrr11", BillMonth::OCTOBER, 2012);
  //$billStorageObj = $bill->usageStorageByMonthAndYear("storagg771", "gdfh1dgg1551", BillMonth::OCTOBER, 2012);
 //$oneTimeBillObj = $bill->usageOneTimeByMonthAndYear("nareshdbvbbwvddxvfdfffhivedi", $OneTimeCharge, BillMonth::OCTOBER, 2012);
 //$removeoneTimeObj = $usage2->removeOneTime($OneTimeCharge);
//$licenseObj = $license->createLicense("licenseName1111", 10,Currency::USD, "License for GOW");
//$issueLicenseObj = $license1->issueLicense("userName1111", "licenseName1111");
//$getLicenseObj = $license->getLicense("licenseName");
// $getAllLicenseObj = $license->getAllLicenses();
// $getIssuedLicensesObj = $license->getIssuedLicenses("userName", "licenseName");
//$revokeLicenseObj = $license2->revokeLicense("userName11", "licenseName11", $issueLicenseObj->getKey());
// $isValidObj = $license2->isValid("userName1111", "licenseName1111", $issueLicenseObj->getKey());
 //$licenseBillObj = $bill->usageLicenseByMonthAndYear("userName1111", "licenseName1111", BillMonth::OCTOBER, 2012);
//echo"start";
//print_r($timeChargeObj);
//echo"finish";
//--------------------------------------push----------------------//
$push = $serviceAPIObj->buildPushNotificationService();
$push1 = $serviceAPIObj->buildPushNotificationService();
$push2 = $serviceAPIObj->buildPushNotificationService();
//$createUserObj = $push->storeDeviceToken("userName1", "jkkkkkkkkkkgdgdffgfgfdg", DeviceType::WP7);
//$createUserObj1 = $push->createChannelForApp("channelName11", "teffffst");
//$createUserObj2 = $push1->subscribeToChannel("channelName11", "userName1");
//$createUserObj = $push->unsubscribeFromChannel("channelName", "userName1");
//$createUserObj = $push->sendPushMessageToAll("sha1_sh_push");
//$createUserObj = $push->sendPushMessageToUser("userName1", "shasha hello");
//$createUserObj = $push2->sendPushMessageToChannel("channelName11", "shashank shukla");
//echo"start";
//print_r($createUserObj);
//echo"finish";

























$user = $serviceAPIObj->buildUserService();
//$user1 = $serviceAPIObj->buildUserService();
//$userName = "testdcc";
//$email = "somd55vddy@gmail.com";
//$roleList = array();
//array_push($roleList, "Admin");
//array_push($roleList, "Manager");
//array_push($roleList, "Programmer");
//array_push($roleList, "Tester");
$createUserObj = $user->createUser("userbvvvcbName", "tefffvdfst", "emaivvl@gmail.com");
print_r($createUserObj);
//$createUserObj = $user->createUser($userName, "teffffst", $email, $roleList);
//$createUserObj1 = $user->assignRoles($userName, $roleList);
//$createUserObj2 = $user->getRolesByUser($userName);
//$createUserObj2 = $user->getUsersByRole("Manager");
//$createUserObj2 = $user->getAllUsersCount();
//$createUserObj2 = $user->getAllUsers(1, 1);
//$getj = $user->getUser($userName);
//$updateUser = $user->updateEmail($userName, "abcdssssxzxxxxsssssssssse@gmail.com");
//$createUserObj = $user->createUser($userName, "test1", $email);
//$unlockUser = $user->unlockUser($userName);
//   $profile = new Profile($createUserObj);
//        $profile->setCountry("India");
//        $profile->setCity("lko");
//        $profile->setCountry("India");
//        $profile->setDateOfBirth("14-02-2012");
//        $profile->setFirstName("Naresh321");
//        $profile->setLastName("dwivedi");
//        $profile->setHomeLandLine("9560877453");
//        $profile->setOfficeLandLine("67890000");
//        $profile->setMobile("981088714130000000000000");
//        $profile->setSex(UserGender::MALE);
//        $profile->setState("UP");
//        $createprofileObj = $user1->createOrUpdateProfile($createUserObj);
//$unlockUser = $user->lockUser($userName);
//$changeUserPasswordObj = $user->changeUserPassword($userName, "test1", "shukla12356");
// $authenticateObj = $user->authenticate($userName, "shukla12356");
//$deleteUserObj = $user->deleteUser($userName);
//$createUserObj = $user->createUser($userName, "shu12ffscdf34", $email);
// $lockUserObj = $user->lockUser($userName);
//        $getLockedUsersObj = $user1->getLockedUsers();
//  $getUserByEmailIdObj = $user->getUserByEmailId($email);
//  print_r($getUserByEmailIdObj);























$upload = $serviceAPIObj->buildUploadService();
$name = "ghffhfghgfhsfdgggg";
//$uploadObj = $upload->uploadFile($name, "D:/Kalimba.mp3", UploadFileType::AUDIO, "Audio123");
//$getAllFilesObj = $upload->getAllFilesCount();
//$getAllFilesObj = $upload->getFilesCountByType(UploadFileType::AUDIO);
//$getAllFilesObj = $upload->getFilesByType(UploadFileType::AUDIO, 1, 0);
//$uploadObj = $upload->uploadFileForUser($name, "shashank", "D:/Kalimba.mp3", UploadFileType::AUDIO, "Audiohh123");
//$getAllFilesObj = $upload->getAllFilesByUser("shashank", 1, 0);
//$getAllFilesObj = $upload->getAllFilesCountByUser("shashank");
//$getAllFilesObj = $upload->getAllFiles(1, 1);
// $getObj = $upload->getAllFiles();
//$getObj = $upload->removeFileByName($name);
//print_r($getObj);
//$user = $serviceAPIObj->buildSessionService();
//$user1 = $serviceAPIObj->buildSessionService();
//$user2 = $serviceAPIObj->buildSessionService();
//$userName = "shufsfklgdjjgas";
//$sessionObj = $user->getSession($userName, "true");
//$sessionObj1 = $user->getSession($userName, "false");
//print_r($sessionObj1);
//$sessionObj = $user->getSession($userName);
//$invalidateObj = $user1->invalidate($sessionObj->sessionId);
//$setAttributeObj = $user1->setAttribute($sessionObj->sessionId, "attributeName007", "attributeValue010");
//$getAttributeObj = $user2->getAttribute("ab8c3700-4a5f-4dbf-b256-cbf0430c7cc0", "attributeName007");
//$getAllAttributesObj = $user->getAllAttributes("ab8c3700-4a5f-4dbf-b256-cbf0430c7cc0");
//print_r($getAllAttributesObj);
//$removeAttributeObj = $user->removeAttribute("ab8c3700-4a5f-4dbf-b256-cbf0430c7cc0", "attributeName007");
//$removeAttributeObj = $user2->removeAllAttributes("ab8c3700-4a5f-4dbf-b256-cbf0430c7cc0");
//print_r($removeAttributeObj);

$storage = $serviceAPIObj->buildStorageService();
$storage1 = $serviceAPIObj->buildStorageService();
//$test = new QueryBuilder();
// $q1 = $test->build("himanshu", "sharma", Operator::EQUALS);
// $storaget = $storage->findDocumentsByQuery("test111", "foo111", $q1);
//$q1 = $test->build("himanshu", "sharma", Operator::EQUALS);
//        $q2 = $test->build("sharma", "sharma", Operator::EQUALS);
//        $q3 = $test->compoundOperator($q1, Operator::ORop, $q2);
//        $q4 = $test->build("name", "himanshu", Operator::LIKE);
//        $q5 = $test->compoundOperator($q3, Operator::ANDop, $q4);
//        $q6 = $test->build("name", "sharma", Operator::EQUALS);
//        $q7 = $test->compoundOperator($q5, Operator::ORop, $q6);
//        $storaget = $storage->findDocumentsByQueryWithPaging("test111", "foo111", $q7,2,0);
       // $storaget = $storage->findDocsWithQueryPagingOrderBy("test111", "foo111", $q7,1,0,"_id",OrderByType::DESCENDING);
 //$insertObj = $storage->insertJSONDocument("test", "foo", "{\"date\":\"30jan\"}");
//$result = $storage1->findDocumentByKeyValue("test","foo","date","30jan");
//echo"ss";
//print_r($result);
// echo"ff";
//$insertObj = $storage->insertJSONDocument("test", "foo", "{\"date\":\"30jan\"}");
//$findAllObj = $storage1->findAllDocuments("test", "foo");
//$objList = $insertObj->getJsonDocList();
//$DocId = $objList[0]->getDocId();
// $findAllObj = $storage1->findDocumentById("test", "foo", $DocId);
//$findByKeyValueObj = $storage1->findDocumentByKeyValue("test", "foo", "date", "30jan");
//$updateDocumentByKeyValueObj = $storage1->updateDocumentByKeyValue("test", "foo", "date", "30jan", "{'new30jan123' : 'new30jan'}");
//$insertObj = $storage->insertJSONDocument("test", "foo", "{\"date\":\"29march\"}");
//$objList = $insertObj->getJsonDocList();
//$DocId = $objList[0]->getDocId();
////$result = $storage1->updateDocumentByDocId("test", "foo", $DocId,"{'hostingDate2' : '31jan'}");
//$result = $storage1->deleteDocumentById("test", "foo",$DocId);
//$insertObj = $storage->insertJSONDocument("test", "foo", "{\"date\":\"2dec\"}");
//$result = $storage1->mapReduce("test", "foo", "function map(){ emit(this.user,1);}", "function reduce(key, val){var sum = 0; for(var n=0;n<val.length;n++){ sum = sum + val[n]; } return sum;}");
//print_r($result);
//$HashMap = array("name" => "shashank", "age" => "22");
//$result = $storage->insertJsonDocUsingMap("test", "foo", $HashMap);
//print_r($result);
//$result = $storage1->findAllDocumentsCount("test", "foo");
//print_r($result);
//$result = $storage1->findAllDocuments("test","foo",1,0);
//print_r($result);
//$review = $serviceAPIObj->buildReviewService();
//$review1 = $serviceAPIObj->buildReviewService();
//$userID = "u6segdgdgdrIdsD_321" . time();
//$reviewObj = $review->createReview($userID, "ItemsgdfvgffID", "reviewComment", 5);
//$result = $review->getAllReviewsCount();
//$result1 = $review->getAllReviews(1, 2);
//$result = $review->getReviewsCountByItem("ItemID");
//$result1 = $review->getReviewByItem("ItemID", 1, 0);
//$item = $reviewObj->itemId;
//print_r($item);
//$getItem = $review1->getReviewByItem($item);
//$getAverageReviewsByItem = $review1->getAverageReviewByItem("ItemsffID");
//$getHighestReviewByItemObj = $review->getHighestReviewByItem("ItemsffID");
// $createObj = $review->getLowestReviewByItem("ItemsffID");
//$muteObj = $review->mute($reviewObj->reviewId);
//$unmuteObj = $review->unmute($reviewObj->reviewId);
//print_r($unmuteObj);

$recommender = $serviceAPIObj->buildRecommenderService();
$recommender1 = $serviceAPIObj->buildRecommenderService();
//$loadPreferenceFileObj = $recommender->loadPreferenceFile("D:\\recommender.csv");
//print_r($loadPreferenceFileObj);
//$result = $recommender->userBasedNeighborhood(3, 4567788, 199);
//$result = $recommender ->userBasedNeighborhoodBySimilarity(RecommenderSimilarity::EUCLIDEAN_DISTANCE, 1, 2, 3);
//print_r("bbbbbbbbbbbbbbbbb");
// $result = $recommender->itemBased(1, 1);
//$resulta = $recommender->itemBasedBySimilarity(RecommenderSimilarity::EUCLIDEAN_DISTANCE, 1, 1);
//$result = $recommender->slopeOne(1, 1);
//$result = $recommender->userBasedNeighborhoodForAll(2, 1);
//$result = $recommender->userBasedThresholdForAll(0.5,10);
//$itemBasedForAllObj = $recommender->itemBasedForAll(1);
//$loadPrefereeFileObj = $recommender->loadPreferenceFile("D:\\recommender.csv");
//$result = $recommender1->slopeOneForAll(1);
//echo"ss";
//print_r($result);
// echo"ff";
//$preferenceDataList = array();
//$preferenceData = new PreferenceData();
//$preferenceData->SetItemId("103");
//$preferenceData->SetUserId("1");
//$preferenceData->SetPreference("2.4");
//array_push($preferenceDataList, $preferenceData);
//$addOrUpdateObj = $recommender->addOrUpdatePreference($preferenceDataList);
//print_r($addOrUpdateObj);
//$queue = $serviceAPIObj->buildQueueService();
//$queue1 = $serviceAPIObj->buildQueueService();
//$queue2 = $serviceAPIObj->buildQueueService();
//$queueName = "shuklv88cxcxchf000hvffca";
//$queueObj = $queue->createPullQueue($queueName, "testing");
//$purgePullQueueObj = $queue->purgePullQueue($queueName);
//print_r($purgePullQueueObj);
//$sendMessageObj = $queue1->sendMessage($queueName, "Its message testing time", 100);
//$getMessagesObj = $queue2->getMessages($queueName, 1000);
//print_r($sendMessageObj);
//print_r("yes");
// $qName = $sendMessageObj->getQueueName();
// print_r($qName);
// $receiveObj = $queue2->receiveMessage($qName, 1000);
//print_r($receiveObj);
//$messageList = $sendMessageObj->getMessageList();
// $collectionId = $messageList[0]->getCorrelationId();
// $correlationIdObj = $queue2->receiveMessageByCorrelationId($queueName, 1000, $collectionId);
// print_r($correlationIdObj);
//$pendingMessagesObj = $queue2->pendingMessages($queueName);
//print_r($pendingMessagesObj);
//$deletePullQueueObj = $queue1->deletePullQueue($queueName);
//$logs = $serviceAPIObj->buildLogService();
//$logs1 = $serviceAPIObj->buildLogService();
//$logObj = $logs->info("infosf lofffgs", "tesfdtmfffod");
//$message = $logObj->getMessageList();
//$text = $message[0]->getMessage();
//$module = $message[0]->getModule();
// $fetchLogsByInfoObj = $logs->fetchLogsCountByInfo();
//$logObj = $logs->debug("debug logs", "testmod");
//$fetchLogsByInfoObj = $logs1->fetchLogsCountByDebug();
//print_r($fetchLogsByInfoObj);
//$logObj = $logs->error("error logs", "testmod");
//$fetchLogsByInfoObj = $logs1->fetchLogsCountByError();
// $logObj = $logs->fatal("fatal logs", "testmod");
//$fetchLogsByInfoObj = $logs1->fetchLogsCountByFatal();
// $fetchLogsByInfoObj = $logs1->fetchLogsByFatal(1, 0);
// print_r($fetchLogsByInfoObj);
// $result = $logs->fetchLogCountByDateRange("04-06-2012", "06-06-2012");
// print_r($result);
// $result = $logs->fetchLogByDateRange("04-10-2012", "05-10-2012", 1, 1);
// print_r("bvjkxcgvvvvvv");
//$fetchLogsByInfoObj = $logs1->fetchLogsCountByModuleAndText("dddd", "aaaa");
// print_r($fetchLogsByInfoObj);
//$fetchLogsByInfoObj = $logs1->fetchLogsByModule($module, 1, 1);
//$logObj = $logs1->fetchLogsByModule($module);
//$image = $serviceAPIObj->buildImageProcessorService();
//$name = "gggg555g";
//$resizeObj = $image->resize($name, "D:\\1.jpg", 234, 1000);
//$thumbnailObj = $image->thumbnail($name, "D:\\1.jpg", 150, 500);
//print_r($thumbnailObj);
// $scaleObj = $image->scale($name, "D:\\1.jpg", 267, 300);
// $resizeByPercentageObj = $image->resizeByPercentage($name, "D:\\1.jpg", 100);
// print_r($resizeByPercentageObj);
//$thumbnailByPercentage = $image->thumbnailByPercentage($name, "D:\\1.jpg", 100);
// $scaleByPercentage = $image->scaleByPercentage($name, "D:\\1.jpg", 100);
// $cropObj = $image->crop($name, "D:\\1.jpg", 21, 23, 34, 32);
// print_r($cropObj);
//  $convertObj = $image->convertFormat($name, "D:\\1.jpg", "png");
// print_r($convertObj);
//$geo = $serviceAPIObj->buildGeoService();
//$geoList = array();
//
//$gp = new GeoPoint();
//$gp->setMarker("10gen Office");
//$gp->setLat(-73.99171);
//$gp->setLng(40.738868);
//array_push($geoList, $gp);
//$geoObj = $geo->createGeoPoints("s1", $geoList);
//print_r($geoObj);
//$nearObj = $geo->getNearByPointsByMaxDistance("s1", -73.99171, 40.738868, 1);
// $nearObj = $geo->getPointsWithInCircle("s1", -73.99171, 40.738868, 1, 1);
//   $result = $geo->getAllStorage();
//   print_r($result);
//  $result = $geo->getAllPoints("s1");
// $result = $geo->deleteStorage("s1");
//$email = $serviceAPIObj->buildEmailService();
//$email1 = $serviceAPIObj->buildEmailService();
//$emailName = "shiksdfdfsdha.c@gmail.com";
//$createMailConfigurationObj = $email->createMailConfiguration("smtp.gmail.com", 465, $emailName, "test", true);
//print_r($createMailConfigurationObj);
//$result = $email->removeEmailConfiguration($emailName);
//$result = $email1->sendMail($emailName, "ssdcxcsdhicvcv.c@gmail.com", "teesting", "cvxcvcx", EmailMIME::PLAIN_TEXT_MIME_TYPE);
//print_r("sendMail");
//$getMailConfigurationObj = $email1->getEmailConfigurations();
//print_r("get");
//$album = $serviceAPIObj->buildAlbumService();
//$photo = $serviceAPIObj->buildPhotoService();
//$photo1 = $serviceAPIObj->buildPhotoService();
//$userName = "shikhrraddasgfdggfgafhha";
//$albumObj = $album->createAlbum($userName, "albddsfsfudmyygghh1", "welcome");
//////print_r("yesooooooooooo");
// $result = $photo->addPhoto($userName, "albddsfsfudmyygghh1", "photggogdgggxg1", "welcome", "D:\\1.jpg");
// $resulte = $photo1->getPhotos($userName);
// print_r($resulte);
//print_r("yes");
// $result = $album->getAlbums($userName);
// print_r($result);
//$getPhotosByAlbumName = $photo1->getPhotosByAlbumName($userName, "albumgghh1", 1, 0);
//print_r($getPhotosByAlbumName);
//$result = $album->getAlbumByName($userName, "albumgghh1");
//print_r($result->getUserName());
// $result = $album->removeAlbum($userName, "albumgghh1");
// print_r($result);
// $result = $photo1->getPhotosByAlbumAndPhotoName($userName, "albumyygghh1", "photggoggg1");
// print_r("yes");
//$tagList = array();
//array_push($tagList, "sffhashank");
//array_push($tagList, "sffhukla");
//$getAlbumsObj = $photo1->addTagToPhoto($userName, "albddsfsfudmyygghh1", "photggogdgggxg1", $tagList);
//$photoList = $getAlbumsObj->getPhotoList();
//$tagList = $photoList[0]->getTagList();
//$tagName = $tagList[0];
//print_r($tagName[0]);
//$getAlbumsObj = $photo1->getTaggedPhotos($userName, "sffhashank");
//print_r($getAlbumsObj);
//$cat = $serviceAPIObj->buildCatalogueService();
//$cat1 = $serviceAPIObj->buildCatalogueService();
//$cat2 = $serviceAPIObj->buildCatalogueService();
//$cat3 = $serviceAPIObj->buildCatalogueService();
//$createCatalogueObj = $cat->createCatalogue("99f66", "Description");
//$createCatagoryObj = $cat1->createCategory("99f66", "bhhh", "categoryDescription");
//$getItemsByCategoryObj = $cat3->getItemsCountByCategory("99f66", "bhhh");
// $itemData = new ItemData();
// $itemData->setItemId("iiiiiiiii");
//$itemData->setDescription("Description 1");
//$itemData->setName("Item");
//$itemData->setPrice(20.0);
//$itemData->setImage("D:\\1.jpg");
//$addItemObj = $cat2->addItem("99ftggvvxggtggdg1", "bnjnvvbj",$itemData);
// $itmeID = $itemData->itemId;
// print_r($itmeID);
//$getItemObj = $cat3->getItemsByCategory("99ftggtggdg1", "bnjnbj",1,0);
// $getItemsByCategoryObj = $cat3->getItemsCountByCategory("99ftggtggdg1", "bnjnbj");
//$getItemObj = $cat2->getItems("99ftggtggdg1");
//$getItemsByCategoryObj = $cat3->getItemById("99ftggvvxggtggdg1", "bnjnvvbj", "iiiiiiiii");
//$removeAllItemsObj = $cat2->removeAllItems("99ftggvvxggtggdg1");
// $removeItemsByCategoryObj = $cat2->removeItemsByCategory("99ftggdgdgvvxggtggdg1", "bnjccnvvbj");
//print_r("gggggggggggg88g");
//$getItemsByCategoryObj = $cat3->getItemsCountByCategory("99fdg1", "bnjnbj");
//$cart = $serviceAPIObj->buildCartService();
//$cart1 = $serviceAPIObj->buildCartService();
//$cart2 = $serviceAPIObj->buildCartService();
//$cart3 = $serviceAPIObj->buildCartService();
//$cart4 = $serviceAPIObj->buildCartService();
//$cartObj = $cart->createCart("fgoooohghg");
//$addItemObj = $cart1->addItem($cartObj->cartId, "iiiii0000000", 2, 100.0);
//$success = $addItemObj->isResponseSuccess();
//print_r($addItemObj->getCartId());
//$getItemObj = $cart->getItems("1b4387e33d917f653e51e8821020811c6443c0d8af2ea59df3d1a00926b49a5d");
//$getItemObj = $cart->getItem("1b4387e33d917f653e51e8821020811c6443c0d8af2ea59df3d1a00926b49a5d", "itemID");
//$success = $getItemObj->isResponseSuccess();
// $removeItemObj = $cart->removeItem("1b4387e33d917f653e51e8821020811c6443c0d8af2ea59df3d1a00926b49a5d", "itemID");
// $removeItemObj = $cart->removeAllItems($addItemObj->cartId);
// $success = $removeItemObj->isResponseSuccess();
// print_r("REMOVED ALL");
// $getItemsObj = $cart->isEmpty($cartObj->cartId);
//  $checkOutObj = $cart2->checkOut($addItemObj->cartId);
//  $getCartDetailsObj = $cart3->getCartDetails($checkOutObj->cartId);
//   print_r("hgjhgjhj");
//    $paymentObj = $cart3->payment($addItemObj->cartId, "transactionID", PaymentStatus::AUTHORIZED);
//$getPaymentsByUserAndStatusObj = $cart4->increaseQuantity($cartObj->getCartId(), "iiiii0000000", 11);
//   $decreaseQuantityObj = $cart4->decreaseQuantity($addItemObj->cartId, "iiiii0000000", 1);
//   print_r($decreaseQuantityObj);
//    $getPaymentsByUserAndStatusObj = $cart4->getPaymentHistoryByUser("fg88dgfhfhg88888");
//     $getPaymentsByUserAndStatusObj = $cart4->getPaymentHistoryAll();
//    print_r($getPaymentsByUserAndStatusObj);
//   $getPaymentsByUserAndStatusObj = $cart4->getPaymentsByUserAndStatus("fggffhhiigg", PaymentStatus::AUTHORIZED);
//  $getPaymentByCartObj = $cart4->getPaymentsByCart($paymentObj->cartId);
// $getPaymentsByUserObj = $cart4->getPaymentsByUser("fggffhhiigg");
//  $getPaymentsByCartObj = $cart4->getPaymentsByStatus(PaymentStatus::AUTHORIZED);
//  $pay = $getPaymentsByCartObj->getPayment();
// FOR  Test Create USER
//$objUser = $serviceAPIObj->buildUserService();
//$objj = $objUser->resetUserPassword("shukla0017");
//print_r($objj->isResponseSuccess());
//
//
// FOR  Test Create USER With Role
//$user = $serviceAPIObj->buildUserService();
//$roleList = array();
//array_push($roleList, "Admin");
//array_push($roleList, "Manager");
//array_push($roleList, "Programmer");
//array_push($roleList, "Tester");
//$createUserObj = $user->createUser("shukla0017", "teffffst", "sjajsja@gmail.com", $roleList);
//print_r($createUserObj->getUserName());
//FOR  Test AssignRoles 
//$user = $serviceAPIObj->buildUserService();
//$roleList = array();
//array_push($roleList, "Admin1");
//array_push($roleList, "Manager1");
//array_push($roleList, "Programmer1");
//array_push($roleList, "Tester1");
//$createUserObj = $user->assignRoles("shukla0017", $roleList);
//print_r($createUserObj->getUserName());
// For testGetRolesByUser
//$user = $serviceAPIObj->buildUserService();
//$createUserObj = $user->getRolesByUser("shukla0017");
//print_r($createUserObj->toString());
// For getLockedUsersCount
//$user = $serviceAPIObj->buildUserService();
//$createUserObj = $user->getLockedUsersCount();
//print_r($createUserObj->toString());
// FOR  Test Update USER
//$objUser = $serviceAPIObj->buildUserService();
//$objj = $objUser->updateUser("John", "rohitrainaa.raina@shephertz.co.in");
//print_r($objj);
// FOR  Test Get All Users
//$objUser = $serviceAPIObj->buildUserService();
//$createUserObj =$objUser->getAllUsers();
//print_r($createUserObj[0]->toString());
// FOR  Test Get All Users
//$objUser = $serviceAPIObj->buildUserService();
//$createUserObj =$objUser->getLockedUsers();
//print_r($createUserObj[0]->toString());
// FOR  Test Get All Users BY Paging
//$objUser = $serviceAPIObj->buildUserService();
//print_r($objUser->getAllUsersByPaging(3, 1));
// FOR  Test Get User By Email Id
//$objUser = $serviceAPIObj->buildUserService();
//$objj = $objUser->getUserByEmailId("sjajsja@gmail.com");
//print_r($objj->toString());
// FOR  Test Get Locked Users
//$objUser = $serviceAPIObj->buildUser();
//print_r($objUser->getLockedUsers());
// FOR  Test is User Locked
//$objUser = $serviceAPIObj->buildUser();
//print_r($objUser->isUserLocked("John"));
// FOR  Test Delete USER
//$objUser = $serviceAPIObj->buildUser();
//print_r($objUser->deleteUser("jasdsains"));
// FOR  Test create Profile
//$objUser = $serviceAPIObj->buildUser();
//$userName = "rohit" .time();
//$email = "rohit.raina@gmail.com" .time();
//$createUserObj = $objUser->createUser($userName, "ssss", $email);
//echo"------CREATE USER OBJ CALLED <br/>";
//print_r($createUserObj);
//echo"<br/>";
//$profile = new Profile($createUserObj);
//$profile->setFirstName("ajay") ;
//$profile->setLastName("tiwari") ;
//$profile->setSex(UserGender::FEMALE);
//$profile->setCity("nagpur") ;
//$profile->setCountry("India");
//$profile->setDateOfBirth("2012-11-20");
//$profile->setHomeLandLine("098765456"); 
//$profile->setOfficeLandLine("67890000");
//$profile->setMobile("98108871413");
//$profile->setState("UP");
//print_r(get_class($createUserObj));
//$createprofileObj = $objUser->createOrUpdateProfile($createUserObj);
//echo"------CREATE PROFILE OBJ CALLED <br/>";
//print_r($createprofileObj);
//echo"<br/>";
//$json = new JSONObject($createprofileObj->toString());
// $app42 = $json->__get("app42");
// $response = $app42->__get("response");
// $success = $response->__get("success");
// echo"------SUCCESS<br/>";
// print_r($success);
// echo"<br/>";
// FOR  Test get User
//$objUser = $serviceAPIObj->buildUserService();
//$objj = $objUser->getUser("john");
//print_r($objj);
// FOR  Test authenticate
//$objUser = $serviceAPIObj->buildUser();
//print_r($objUser->authenticate("John","ssss"));
// FOR  Test Unlock User
//$objUser = $serviceAPIObj->buildUser();
//print_r($objUser->unlockUser("John"));
// FOR  Test Lock User
//$objUser = $serviceAPIObj->buildUserService();
//print_r($objUser->lockUser("Johnah"));
// FOR  Test Lock User By Paging
//$objUser = $serviceAPIObj->buildUserService();
//print_r($objUser->getLockedUsersByPaging(1, 1));
// FOR  change User Password
//$objUser = $serviceAPIObj->buildUser();
//print_r($objUser->changeUserPassword("JohnaH", "ssssa", "ssss")->getUserName());
// --------------------------------------------------- UPLOAD ------------------------------------------------------------	
// FOR  Test upload File for USer
//$objUpload = $serviceAPIObj->buildUploadService();
//$result = $objUpload->removeAllFilesByUser("shashank");
//print_r($result->toString());
// FOR  Test upload File
//$objUpload = $serviceAPIObj->buildUpload();
//$uplod = "nameuplaod" .time();
//$objj = $objUpload->uploadFile($uplod, "D:/logo.png",UploadFileType::IMAGE,"Test file21");
//$obs = $objj->isResponseSuccess();
//print_r($objj);
// FOR  Test get All Files 
//$objUpload = $serviceAPIObj->buildUpload();
//$objj = $objUpload->getAllFiles();
//$obs = $objj->getFileList();
//print_r($obs[22]->getName());
// FOR  Test get All Files By Paging
//$objUpload = $serviceAPIObj->buildUploadService();
//$objj = $objUpload->getAllFilesByPaging(2, 1);
//print_r($objj);
// FOR  Test get File By USER
//$objUpload = $serviceAPIObj->buildUpload();
//print_r($objUpload->getFileByUser("Imagea1", "user1"));
// FOR  Test get All File By USER By paging
//$objUpload = $serviceAPIObj->buildUploadService();
//print_r($objUpload->getAllFilesByUserByPaging(4, 1, "user1"));
// FOR  Test get File By Name
//$objUpload = $serviceAPIObj->buildUpload();
//print_r($objUpload->getFileByName("imge"));
// FOR  Test get File By Name By paging
//$objUpload = $serviceAPIObj->buildUploadService();
//print_r($objUpload->getFileByNameByPaging(2,1,"imge"));
// FOR  Test get File By User
//$objUpload = $serviceAPIObj->buildUpload();
//print_r($objUpload->getAllFilesByUser("user1"));
// FOR  Test Remove All Files
//$objUpload = $serviceAPIObj->buildUpload();
//print_r($objUpload->removeAllFiles());
// FOR  Test Remove File by name and User 
//$objUpload = $serviceAPIObj->buildUpload();
//print_r($objUpload->removeFileByUser("Imagea1", "user1"));
// FOR  Test Remove File by name 
//$objUpload = $serviceAPIObj->buildUpload();
//print_r($objUpload->removeFileByName("imge"));
// FOR  Test Remove File by User Name 
//$objUpload = $serviceAPIObj->buildUpload();
//print_r($objUpload->removeAllFilesByUser("user1"));
// FOR  Test get Files By Type	
//$objUpload = $serviceAPIObj->buildUpload();
//$objj = $objUpload->getFilesByType("IMAGE");
//$obs = $objj->getFileList();
//print_r($obs[0]->getType());
//------------------------------------------------------ REVIEW ---------------------------------------------------------------
//$objReview = $serviceAPIObj->buildReviewService();
////$response =  null;
//// FOR  Test create Review
//$objj = $objReview->getReviewByItem("ItemID", 1, 0);
//print_r($objj[0]->toString());
//print_r($objj->getUserId());
// FOR  Test get Review By Item
//$response = $objReview->getReviewByItem("0071");
//print_r($response);
// FOR  Test get All Reviews
//$objj = $objReview->getAllReviews();
//print_r($objj);
// FOR  Test get All Reviews By paging
//$objj = $objReview->getAllReviewsByPaging(5, 1);
//print_r($objj);
// FOR  Test get Review By Item
//$objj = $objReview->getReviewByItem("0071");
//print_r($objj[0]->getItemId());
// FOR  Test get Review By Item By Paging
//$objj = $objReview->getReviewByItemByPaging(1, 1, "0071");
//print_r($objj);
// FOR  Test get Average Review By Item
//print_r($objReview->getAverageReviewByItem("007"));
// FOR  Test get Highest Review By Item
//print_r($objReview->getHighestReviewByItem("007"));
// FOR  Test get Lowest Review By Item 
//print_r($objReview->getLowestReviewByItem("007"));
// FOR  Test mute
//print_r($objReview->mute("819689f8-f2d5-4e1c-a697-d16d3845dbe0"));
// FOR  Test unmute
//print_r($objReview->unmute("819689f8-f2d5-4e1c-a697-d16d3845dbe0"));
//-------------------------------------------------  SESSION MANAGER ------------------------------------------------------
//$objSession = $serviceAPIObj->buildSessionService();
//$response = null;
// FOR  Test get Session
//$objj = $objSession->getSession("adminsa");
//print_r($objj->getSessionId());
// FOR  Test get Session by name and isCreate
/* try {
  $response = $objSession->getSession("rohit", "true");
  }
  catch(App42BadParameterException $ex){
  if ($ex->getAppErrorCode() == 2001) {
  // Do exception Handling for Already created User.
  echo("2001");
  }
  }
  catch (App42SecurityException $ex) {
  // Exception Caught
  // Check for authorization Error due to invalid Public/Private Key
  if ($ex.getAppErrorCode() == 1401) {
  // Do exception Handling here
  echo("1401");
  }
  } catch (App42Exception $ex) {
  // Exception Caught due to other Validation
  echo("500");
  }
  print_r($response); */

// FOR  Test invalidate
//$objj = $objSession->invalidate("eff4b02e-a830-4408-81c7-a0d492077772");
//print_r($objj->getSessionId());
// FOR  Test setAttribute
//print_r($objSession->setAttribute("d77aff73-a94f-4c00-ae9b-92e30c8fa188","name1222","value12212"));
// FOR  Test getAttribute
//$objj = $objSession->getAttribute("d77aff73-a94f-4c00-ae9b-92e30c8fa188","name2");
//$obss = $objj->getAttributeList();
//print_r($obss[0]->getName());
// FOR  Test get All Attributes
//$objj = $objSession->getAllAttributes("eff4b02e-a830-4408-81c7-a0d492077772");
//print_r($objj->getAttributeList());
// FOR  Test get All Attributes By Paging
//$objj = $objSession->getAllAttributesByPaging("d77aff73-a94f-4c00-ae9b-92e30c8fa188", 3, 1);
//print_r($objj->getAttributeList());
// FOR  Test remove Attribute
//print_r($objSession->removeAttribute("33297f76-5824-4604-a5ac-b2ea4aefdfd","name2"));
// FOR  Test remove All Attributes
//print_r($objSession->removeAllAttributes("cc068eb8-700e-4743-91c2-b630e8a33635"));
//---------------------------------------------------------- RECOMMENDER --------------------------------------------------------------
// FOR  Test load Preference File
//$objRecommender = $serviceAPIObj->buildRecommender();
//$objj = $objRecommender->loadPreferenceFile("INTROOO","D:/recommender.csv","Intro Filesss");
//print_r($objj->getFileName());
// FOR  Test user Based Neighborhood
//$objRecommender = $serviceAPIObj->buildRecommender();
//$objj = $objRecommender->userBasedNeighborhood("INTROOO",1 ,2, 3);
//$obs = $objj->getRecommendedItemList();
//print_r($obs[0]->getItem());
// FOR  Test user Based Threshold
//$objRecommender = $serviceAPIObj->buildRecommender();
//print_r($objRecommender->userBasedThreshold("INTRwO00w",1,0.5,1));
// FOR  Test user Based Neighborhood By Similarity
//$objRecommender = $serviceAPIObj->buildRecommender();
//$objj = $objRecommender->userBasedNeighborhoodBySimilarity("HELLLO","INTRwO00w",1,2,3);
//$obss = $objj->getRecommendedItemList();
//print_r($obss[0]->getItem());
// FOR  Test user Based Threshold By Similarity
//$objRecommender = $serviceAPIObj->buildRecommender();
//print_r($objRecommender->userBasedThresholdBySimilarity("PearsonCorrelationSimilarity","INTRO2","1","0.5","3"));
// FOR  Test item Based
//$objRecommender = $serviceAPIObj->buildRecommender();
//print_r($objRecommender->itemBased("INTRO2", "1", "1"));
// FOR  Test item Based By Similarity
//$objRecommender = $serviceAPIObj->buildRecommender();
//print_r($objRecommender->itemBasedBySimilarity("PearsonCorrelationSimilarity", "INTRO2", "1", "1"));
// FOR  Test slope One
//$objRecommender = $serviceAPIObj->buildRecommender();
//print_r($objRecommender->slopeOne("INTRO2","1","1"));
// FOR  Test user Based Neighborhood For All
//$objRecommender = $serviceAPIObj->buildRecommender();
//print_r($objRecommender->userBasedNeighborhoodForAll("INTRO2","2","1"));
// FOR  Test user Based Threshold For All
//$objRecommender = $serviceAPIObj->buildRecommender();
//print_r($objRecommender->userBasedThresholdForAll("INTRO2","0.5","1"));
// FOR  Test user Based Neighborhood By Similarity For All
//$objRecommender = $serviceAPIObj->buildRecommender();
//print_r($objRecommender->userBasedNeighborhoodBySimilarityForAll("PearsonCorrelationSimilarity", "INTRO2", "2", "1"));
// FOR  Test user Based Threshold By Similarity For All
//$objRecommender = $serviceAPIObj->buildRecommender();
//print_r($objRecommender->userBasedThresholdBySimilarityForAll("PearsonCorrelationSimilarity", "INTRO2", "0.5", "1"));
// FOR  Test item Based For All
//$objRecommender = $serviceAPIObj->buildRecommender();
//print_r($objRecommender->itemBasedForAll("INTRO2","1"));
// FOR  Test item Based By Similarity For All
//$objRecommender = $serviceAPIObj->buildRecommender();
//print_r($objRecommender->itemBasedBySimilarityForAll("PearsonCorrelationSimilarity","INTRO2","1"));
// FOR  Test slope One For All
//$objRecommender = $serviceAPIObj->buildRecommender();
//print_r($objRecommender->slopeOneForAll("INTRO2","1"));
// FOR  Test delete Preference File
//$objRecommender = $serviceAPIObj->buildRecommender();
//print_r($objRecommender->deletePreferenceFile("INTRO22"));
// -------------------------------------------------------------- SHOPPING CART -------------------------------------------------------------------
// FOR  Test create Cart
//$objCart = $serviceAPIObj->buildCart();
//$objj = $objCart->createCart("rohitCarts1245");
//print_r($objj);
// FOR  Test get Cart Details
//$objCart = $serviceAPIObj->buildCart();
//$objj = $objCart->getCartDetails("1dd6fbf7ab904676d4c99af453fdca688a132f183b695eebf194c4d8b2ef991a");
//print_r($objj);
// FOR  Test add Item
//$objCart = $serviceAPIObj->buildCart();
//print_r($objCart->addItem("1dd6fbf7ab904676d4c99af453fdca688a132f183b695eebf194c4d8b2ef991a","Item",1,100));
// FOR  Test get Items
//$objCart = $serviceAPIObj->buildCart();
//print_r($objCart->getItems("1dd6fbf7ab904676d4c99af453fdca688a132f183b695eebf194c4d8b2ef991a"));
// FOR  Test get Item
//$objCart = $serviceAPIObj->buildCart();
//print_r($objCart->getItem("1dd6fbf7ab904676d4c99af453fdca688a132f183b695eebf194c4d8b2ef991a","12321"));
// FOR  Test remove Item
//$objCart = $serviceAPIObj->buildCart();
//print_r($objCart->removeItem("db52dbafb04037a51a24f4e6db7620afded10464b8d879e5228371c4e555b4ea","12321"));
// FOR  Test remove All Items
//$objCart = $serviceAPIObj->buildCart();
//print_r($objCart->removeAllItems("7cbaef8301793610c7386b21557547a42f5296a2b2d4aac120aa29381c463942"));
// FOR  Test isEmpty
//$objCart = $serviceAPIObj->buildCart();
//print_r($objCart->isEmpty("7cbaef8301793610c7386b21557547a42f5296a2b2d4aac120aa29381c463942"));
// FOR  Test checkOut
//$objCart = $serviceAPIObj->buildCart();
//print_r($objCart->checkOut("103eed6e302ea708a2e29530cb684b1a3e1dd8ab0e0f632229503813c79543e9"));
// FOR  Test payment
//$objCart = $serviceAPIObj->buildCart();
//$objj = $objCart->payment("db47d9b2292273cd130473740e178e6fdf2abc38f60df214432aa0920e129614","TRANSID542","AUTHORIZED");
//print_r($objj);
// FOR  Test get Payments By User
//$objCart = $serviceAPIObj->buildCart();
//$objj = $objCart->getPaymentsByUser("rohitCarts124");
//$obs = $objj->getPayment()->getTotalAmount();
//print_r($obs);
// FOR  Test get Payments By Cart
//$objCart = $serviceAPIObj->buildCart();
//print_r($objCart->getPaymentsByCart("7cbaef8301793610c7386b21557547a42f5296a2b2d4aac120aa29381c463942"));
// FOR  Test get Payments By User And Status
//$objCart = $serviceAPIObj->buildCart();
//print_r($objCart->getPaymentsByUserAndStatus("rohitCarts124",PaymentStatus::AUTHORIZED));
// FOR  Test Increase Quantity
//$objCart = $serviceAPIObj->buildCart();
//print_r($objCart->increaseQuantity("1dd6fbf7ab904676d4c99af453fdca688a132f183b695eebf194c4d8b2ef991a", "Item", "1000"));
// FOR  Test Descrease Quantity
//$objCart = $serviceAPIObj->buildCart();
//$objj = $objCart->decreaseQuantity("37dae6cef35d3b780afbee5590c2ce5d74590d14f8447979ea375fb3b3c0cf08", "Item", "10");
//print_r($objj);
// FOR  Test get Payments By Status
//$objCart = $serviceAPIObj->buildCart();
//print_r($objCart->getPaymentsByStatus("PENDING"));
// FOR  Test delete Preference File
//$objCart = $serviceAPIObj->buildCart();
//print_r($objCart->getPaymentHistoryByUser("rohit"));
// FOR  Test delete Preference File
//$objCart = $serviceAPIObj->buildCart();
//print_r($objCart->getPaymentHistoryAll());
//------------------------------------------------------------------Catalogue-------------------------------------------------------------
// FOR  Test create Catalogue
//$objCatalogue = $serviceAPIObj->buildCatalogue();
//$objj = $objCatalogue->createCatalogue("catalogue0081","catalogue description");
//print_r($objj);
// FOR  Test create Category
//$objCatalogue = $serviceAPIObj->buildCatalogue();
//$objj = $objCatalogue->createCategory("catalogue0081","myCategory12", "category description");
//print_r($objj);
// FOR  Test add Item 
//$objCatalogue = $serviceAPIObj->buildCatalogue();
//$itemData = new ItemData();
//$itemData->itemId = 7812 ;
//$itemData->description = "tiwasdsadasdari" ;
//$itemData->name = "Item 18";
//$itemData->price = 20;
//$itemData->image = "D:/Desert.jpg" ;
//print_r($objCatalogue->addItem("catalogue0081","myCategory12", $itemData));
// FOR  Test get Item 
//$objCatalogue = $serviceAPIObj->buildCatalogue();
//$objj = $objCatalogue->getItems("catalogue");
//$obs = $objj->getCategoryList();
//$obss = $obs[0]->getItemList();
//print_r($obss[0]->getItemId());
// FOR  Test get Items By Category
//$objCatalogue = $serviceAPIObj->buildCatalogue();
//print_r($objCatalogue->getItemsByCategory("catalogue101211","category 122"));
// FOR  Test get Item By Id
//$objCatalogue = $serviceAPIObj->buildCatalogue();
//print_r($objCatalogue->getItemById("catalogue111","category 123","item 111"));
// FOR  Test remove All Items
//$objCatalogue = $serviceAPIObj->buildCatalogue();
//print_r($objCatalogue->removeAllItems("catalogue111"));
// FOR  Test remove All Items By Category
//$objCatalogue = $serviceAPIObj->buildCatalogue();
//print_r($objCatalogue->removeItemsByCategory("catalogue111","category 123"));
// FOR  Test remove Item By Id
//$objCatalogue = $serviceAPIObj->buildCatalogue();
//print_r($objCatalogue->removeItemById("catalogue111","category 123","item 111"));
// -------------------------------------------------------------------APP TAB---------------------------------------------------------------------
//--------------------------------------------------------------LICENSE--------------------------------------------------------------------
// FOR  Test create License
//$objLicense = $serviceAPIObj->buildLicense();
//$objj = $objLicense->createLicense("lic231",100,"Dollar","License Description");
//print_r($objj->getName());
// FOR  Test issue License
//$objLicense = $serviceAPIObj->buildLicense();
//$objj = $objLicense->issueLicense("admin","lic231");
//print_r($objj->getKey());
// FOR  Test get License
//$objLicense = $serviceAPIObj->buildLicense();
//print_r($objLicense->getLicense("lic23"));
// FOR  Test get All Licenses  """---------------------------ISSUEEEEE ----------------------"""
//$objLicense = $serviceAPIObj->buildLicense();
//print_r($objLicense->getAllLicenses());
// FOR  Test get Issued Licenses
//$objLicense = $serviceAPIObj->buildLicense();
//print_r($objLicense->getIssuedLicenses("admins","license22"));
// FOR  Test isValid
//$objLicense = $serviceAPIObj->buildLicense();
//print_r($objLicense->isValid("admins","license1","d5eff219b587b364e9a4f86ac18880fe87ed36b4"));
// FOR  Test revoke License
//$objLicense = $serviceAPIObj->buildLicense();
//print_r($objLicense->revokeLicense("admin","lic231","a361295f6a727f60ba3dc485e7db0c41c7bc3751"));
//-------------------------------------------------------------USAGE-----------------------------------------------------
// FOR  Test create Level Charge
//$objUsage = $serviceAPIObj->buildUsage();
//$objj = $objUsage->createLevelCharge("level119",20,"USD", "DESCRIPTIONNNNN");
//print_r($objj->getStrResponse());
// FOR  Test get Level
//$objUsage = $serviceAPIObj->buildUsage();
//$objj = $objUsage->getLevel("level11");
//$obs = $objj->getLevelList();
//print_r($obs[0]->getName());
// FOR  Test remove Level
//$objUsage = $serviceAPIObj->buildUsage();
//print_r($objUsage->removeLevel("Level222"));
// FOR  Test create One Time Charge
//$objUsage = $serviceAPIObj->buildUsage();
//print_r($objUsage->createOneTimeCharge("OneTime1232",30,"USD","DESCRIPPPPP"));
// FOR  Test get One Time
//$objUsage = $serviceAPIObj->buildUsage();
//$objj = $objUsage->getOneTime("level");
//$obs = $objj->getOneTimeList();
//print_r($obs[0]->getPrice());
// FOR  Test remove One Time
//$objUsage = $serviceAPIObj->buildUsage();
//print_r($objUsage->removeOneTime("Level222"));
// FOR  Test create Feature Charge
//$objUsage = $serviceAPIObj->buildUsage();
//print_r($objUsage->createFeatureCharge("Feature112",30,"USD","DKSKSKJKSJKS"));
// FOR  Test get Feature
//$objUsage = $serviceAPIObj->buildUsage();
//$objj = $objUsage->getFeature("Feature112");
//$obs = $objj->getFeatureList();
//print_r($obs[0]->getprice());
// FOR  Test remove Feature
//$objUsage = $serviceAPIObj->buildUsage();
//print_r($objUsage->removeFeature("Level222"));
// FOR  Test create Bandwidth Charge
//$objUsage = $serviceAPIObj->buildUsage();
//print_r($objUsage->createBandwidthCharge("Bandwidth122",1000,UsageBandWidth::GB,10,"USD","DESCRIPTIONNNNN"));
// FOR  Test get Bandwidth
//$objUsage = $serviceAPIObj->buildUsage();
//$objj = $objUsage->getBandwidth("Bandwidth122");
//$obs = $objj->getBandwidthList();
//print_r($obs[0]->getprice());
// FOR  Test remove Bandwidth
//$objUsage = $serviceAPIObj->buildUsage();
//print_r($objUsage->removeBandwidth("MyLevel"));
// FOR  Test create Storage Charge
//$objUsage = $serviceAPIObj->buildUsage();
//print_r($objUsage->createStorageCharge("LEVEL2322",100,UsageStorage::MB,30,"USD","DESCRIPTION"));
// FOR  Test get Storage
//$objUsage = $serviceAPIObj->buildUsage();
//$objj = $objUsage->getStorage("LEVEL2322");
//$obs = $objj->getStorageList();
//print_r($obs[0]->getSpace());
// FOR  Test remove Storage
//$objUsage = $serviceAPIObj->buildUsage();
//print_r($objUsage->removeStorage("MyLevelEEESS"));
// FOR  Test create Time Charge
//$objUsage = $serviceAPIObj->buildUsage();
//print_r($objUsage->createTimeCharge("TIME123",10,UsageTime::SECONDS,10,"USD","DSESSJSJSJ"));
// FOR  Test get Time
//$objUsage = $serviceAPIObj->buildUsage();
//$objj = $objUsage->getTime("LEVEL1234");
//$obs = $objj->getTimeList();
//print_r($objj);
// FOR  Test remove Time
//$objUsage = $serviceAPIObj->buildUsage();
//print_r($objUsage->removeTime("LEVEL567"));
// FOR  Test charge Level
//$objUsage = $serviceAPIObj->buildUsage();
//$objj = $objUsage->chargeLevel("user12","level119");
//print_r($objj->getStrResponse());
// FOR  Test charge One Time
//$objUsage = $serviceAPIObj->buildUsage();
//$objj = $objUsage->chargeOneTime("jatt","OneTime1232");
//print_r($objj->getStrResponse());
// FOR  Test charge Feature
//$objUsage = $serviceAPIObj->buildUsage();
//print_r($objUsage->chargeFeature("Feature11","Feature11"));
// FOR  Test charge Bandwidth
//$objUsage = $serviceAPIObj->buildUsage();
//print_r($objUsage->chargeBandwidth("Bandwidth","Bandwidthss",20,UsageBandWidth::GB));
// FOR  Test charge Storage
//$objUsage = $serviceAPIObj->buildUsage();
//print_r($objUsage->chargeStorage("jjjj","LEVEL",20,UsageStorage::MB));
// FOR  Test charge Time
//$objUsage = $serviceAPIObj->buildUsage();
//print_r($objUsage->chargeTime("sidd","LEVEL1237",10,UsageTime::SECONDS));
// FOR  Test get All Level Usage
//$objUsage = $serviceAPIObj->buildUsage();
//$objj = $objUsage->getAllLevelUsage();
//$obs = $objj->getLevelList();
//print_r($obs[1]->getPrice());
// FOR  Test get All One Time Usage
//$objUsage = $serviceAPIObj->buildUsage();
//print_r($objUsage->getAllOneTimeUsage());
// FOR  Test get All Feature Usage
//$objUsage = $serviceAPIObj->buildUsage();
//print_r($objUsage->getAllFeatureUsage());
// FOR  Test get All Bandwidth Usage
//$objUsage = $serviceAPIObj->buildUsage();
//print_r($objUsage->getAllBandwidthUsage());
// FOR  Test get All Storage Usage
//$objUsage = $serviceAPIObj->buildUsage();
//print_r($objUsage->getAllStorageUsage());
// FOR  Test get All Time Usage
//$objUsage = $serviceAPIObj->buildUsage();
//print_r($objUsage->getAllTimeUsage());
//------------------------------------------------------------------BILL-----------------------------------------------------------------
// FOR  Test usage Time By Month And Year
//$objBill = $serviceAPIObj->buildBill();
//$objj = $objBill->usageTimeByMonthAndYear("sidd2","LEVEL12372",BillMonth::APRIL,2012);
//$obs = $objj->getTimeTransaction();
//print_r($obs->getTotalUsage());
// FOR  usage Storage By Month And Year
//$objBill = $serviceAPIObj->buildBill();
//print_r($objBill->usageStorageByMonthAndYear("admins","abc","JUNE",2011));
// FOR  usage Bandwidth By Month And Year
//$objBill = $serviceAPIObj->buildBill();
//print_r($objBill->usageBandwidthByMonthAndYear("admins","abc","JUNE",2011));
// FOR  usage Level By Month And Year
//$objBill = $serviceAPIObj->buildBill();
//$objj = $objBill->usageLevelByMonthAndYear("user12","level119",BillMonth::APRIL,2012);
//$obs = $objj->getLevelTransaction();
//print_r($obs->getTotalUsage());
// FOR  usage One Time By Month And Year
//$objBill = $serviceAPIObj->buildBill();
//print_r($objBill->usageOneTimeByMonthAndYear("admins","abc","JUNE",2011));
// FOR  usage Feature By Month And Year
//$objBill = $serviceAPIObj->buildBill();
//print_r($objBill->usageFeatureByMonthAndYear("admins","abc","JUNE",2011));
// FOR  Test usage License By Month And Year
//$objBill = $serviceAPIObj->buildBill();
//print_r($objBill->usageLicenseByMonthAndYear("admins","license1","JUNE",2011));
//------------------------------------------------------------------Charge-------------------------------------------------------------
// FOR  Test 
//$objCharge = $serviceAPIObj->buildCharge();
//print_r($objCharge->chargeStart("chargeUser11"));
// FOR  Test 
//$objCharge = $serviceAPIObj->buildCharge();
//print_r($objCharge->chargeStop("chargeUser11"));
// FOR  Test 
//$objCharge = $serviceAPIObj->buildCharge();
//print_r($objCharge->getAllTransactions());
// FOR  Test 
//$objCharge = $serviceAPIObj->buildCharge();
//print_r($objCharge->getTransactionById("id11"));
// FOR  Test 
//$objCharge = $serviceAPIObj->buildCharge();
//print_r($objCharge->getTransactionByState("state11"));
// FOR  Test 
//$objCharge = $serviceAPIObj->buildCharge();
//print_r($objCharge->getTransactionByUsername("userName11"));
// FOR  Test 
//$objCharge = $serviceAPIObj->buildCharge();
//print_r($objCharge->getTransactionByDateRange("3-10-2012","3-10-2012"));
//------------------------------------------------------------------Storage-------------------------------------------------------------
// FOR  Test Save the JSON document
//$objStorage = $serviceAPIObj->buildStorage();
//$objj = $objStorage->insertJSONDocument("dbName10021","collectionName1234561","{\"date\":\"31jan\"}");
//print_r($objj->getCollectionName());
// FOR  Test Find all documents
//$objStorage = $serviceAPIObj->buildStorage();
//$objj = $objStorage->findAllDocuments("dbName1234","collectionName1234");
//print_r($objj->getCollectionName());
// FOR  Test Find target document
//$objStorage = $serviceAPIObj->buildStorage();
//print_r($objStorage->findDocumentById("dbName11","collectionName11","docId11"));
// FOR  Test Find target document using key
//$objStorage = $serviceAPIObj->buildStorage();
//print_r($objStorage->findDocumentByKeyValue("dbName11","collectionName11","key11","value11"));
// FOR  Test Update target document using key value 
//$objStorage = $serviceAPIObj->buildStorage();
//print_r($objStorage->updateDocumentByKeyValue("dbName11","collectionName11","key11","value11","newJsonDoc11"));
//FOR  Test Update target document using Doc Id
//$objStorage = $serviceAPIObj->buildStorage();
//print_r($objStorage->updateDocumentByDocId("dbName11","collectionName11","docId11","newJsonDoc11"));
// FOR  Test Delete target document
//$objStorage = $serviceAPIObj->buildStorage();
//print_r($objStorage->deleteDocumentById("dbName11","collectionName11","docId11"));
// FOR  Test Map reduce function
//$objStorage = $serviceAPIObj->buildStorage();
//print_r($objStorage->mapReduce("dbName100","collectionName11","mapFunction11","reduceFunction11"));
// FOR  Test Save the JSON document 
//$objStorage = $serviceAPIObj->buildStorage();
//print_r($objStorage->insertJsonDocUsingMap("dbName11","collectionName11","HashMap11","map11"));
// FOR  Test accepts the HashMap 
//$objStorage = $serviceAPIObj->buildStorage();
//$map = array('name' => 'rohit', 'age' => '22');
//print_r($objStorage->insertJsonDocUsingMap("dbNam1","collec1",$map));
//------------------------------------------------------------------Geo-------------------------------------------------------------
// FOR  Test Stores the geopints
//$objGeo = $serviceAPIObj->buildGeo();
//$geoArr = array();
//$objGeoPoint = new GeoPoint();
//$objGeoPoint->marker = "10gen Office";
//$objGeoPoint->lat = 73.99171;
//$objGeoPoint->lng = 40.738868;
//$objGeoPoint1 = new GeoPoint();
//$objGeoPoint1->marker = "10gen";
//$objGeoPoint1->lat = 73.99172;
//$objGeoPoint1->lng = 40.73888;
//array_push($geoArr, $objGeoPoint);
//array_push($geoArr, $objGeoPoint1);
//$objj = $objGeo->createGeoPoints("dbName12345",$geoArr);
//$obs = $objj->getPointList();
//print_r($obs[0]->getLat());
// FOR  Test Search the near by point
//$objGeo = $serviceAPIObj->buildGeo();
//$objj = $objGeo->getNearByPointsByMaxDistance("dbName123456",73.991171,40.7388168,1);
//$obs = $objj->getPointList();
//print_r($obs[0]->getLat());
// FOR  Test Search the near by point from specified source point
//$objGeo = $serviceAPIObj->buildGeo();
//print_r($objGeo->getNearByPoint("geoStorageName11",73.991171,40.7388168,2));
// FOR  Test Search the near by point from specified source point with in specified radius
//$objGeo = $serviceAPIObj->buildGeo();
//print_r($objGeo->getPointsWithInCircle("geoStorageName11",73.99172,40.73888,2,1));
// FOR  Test Fetch the name
//$objGeo = $serviceAPIObj->buildGeo();
//$objj = $objGeo->getAllStorage("geoStorageName11");
//$obs = $objj[0]->getStorageName();
//print_r($obs);
// FOR  Test Delete the specifed
//$objGeo = $serviceAPIObj->buildGeo();
//print_r($objGeo->deleteStorage("geoStorageName11"));
// FOR  Test Get All Point
//$objGeo = $serviceAPIObj->buildGeo();
//print_r($objGeo->getAllPoints("stor"));
// FOR  Test Get All Storage
//$objGeo = $serviceAPIObj->buildGeo();
//print_r($objGeo->getAllStorage());
//------------------------------------------------------------------Message-------------------------------------------------------------
// FOR  Test Send message
//$objMessage = $serviceAPIObj->buildQueue();
//print_r($objMessage->sendMessage("queueName1","msg","exp"));
// FOR  Test Pulls all the message
//$objMessage = $serviceAPIObj->buildMessage();
//print_r($objMessage->receiveMessage("queueName","receiveTimeOut"));
// FOR  Test Pull message based 
//$objMessage = $serviceAPIObj->buildMessage();
//print_r($objMessage->receiveMessageByCorrelationId("queueName","receiveTimeOut","correlationId"));
// FOR  Test  Remove message from
//$objMessage = $serviceAPIObj->buildMessage();
//print_r($objMessage-> removeMessage("queueName","messageId"));
//------------------------------------------------------------------Queue-------------------------------------------------------------
// FOR  Test Creates a type Pull Queue
//$objQueue = $serviceAPIObj->buildQueue();
//$objj = $objQueue->createPullQueue("queueName11","queueDescription");
//print_r($objj->getQueueType());
// FOR  Test Deletes the Pull
//$objQueue = $serviceAPIObj->buildQueue();
//print_r($objQueue->deletePullQueue("queueName"));
// FOR  Test Purges message on the Queue
//$objQueue = $serviceAPIObj->buildQueue();
//print_r($objQueue->purgePullQueue("queueName11"));
// FOR  Test Messages which are pending to be dequeue
//$objQueue = $serviceAPIObj->buildQueue();
//print_r($objQueue->pendingMessages("queueName1121"));
// FOR  Test Messages are retrieved
//$objQueue = $serviceAPIObj->buildQueue();
//print_r($objQueue->getMessages("queueName1121",100));
// FOR  Test Send message on the queue with an expiry
//$objQueue = $serviceAPIObj->buildQueue();
//$objj = $objQueue->sendMessage("queueName11","msgss1233",231);
//$obs = $objj->getMessageList();
//print_r($obs[0]->getPayLoad());
// FOR  Test Pulls all the message from the queue
//$objQueue = $serviceAPIObj->buildQueue();
//$objQueue1 = $serviceAPIObj->buildQueue();
//$objj = $objQueue->createPullQueue("queueName1121","queueDescription");
//$obss = $objQueue1->sendMessage("queueName1121","HELLLOSIR JII",1000);
//print_r($objQueue1->receiveMessage("queueName1121",1000));
// FOR  Test Pull message based on the correlation id
//$objQueue = $serviceAPIObj->buildQueue();
//print_r($objQueue->receiveMessageByCorrelationId("queueName","receiveTimeOut","correlationId"));
// FOR  Test Remove message from the queue based on the message id
//$objQueue = $serviceAPIObj->buildQueue();
//print_r($objQueue->removeMessage("queueName11",100));
//------------------------------------------------------------------Album-------------------------------------------------------------
// FOR  Test Creates a type Pull Queue
//$objAlbum = $serviceAPIObj->buildAlbum();
//$objj = $objAlbum->CreateAlbum("testUser1","testAlbum1","albumDescription");
//print_r($objj->getStrResponse());
// FOR  Test Fetches all the Albums
//$objAlbum = $serviceAPIObj->buildAlbum();
//$objj = $objAlbum->getAlbums("userName123");
//print_r($objj[0]->getName());
// FOR  Test Fetch all Album based on the userName and albumName
//$objAlbum = $serviceAPIObj->buildAlbum();
//print_r($objAlbum->getAlbumByName("userName123","albName"));
// FOR  Test Removes the album
//$objAlbum = $serviceAPIObj->buildAlbum();
//print_r($objAlbum->removeAlbum("userName","albumName"));
//------------------------------------------------------------------Photo (NOT TESTED YED)-------------------------------------------------------------
// FOR  Test Add Photos
//$objPhoto = $serviceAPIObj->buildPhoto();
//$photo = "logo" . time();
//$objj = $objPhoto->addPhoto("testUser1","testAlbum1",$photo,"Photo Description11","D:/logo.png");
//print_r($objj);
// FOR  Test Fetch all the Photos
//$objPhoto = $serviceAPIObj->buildPhoto();
//print_r($objPhoto->getPhotos("testUser1"));
// FOR  Test Fetch all Photos based on the userName and album name
//$objPhoto = $serviceAPIObj->buildPhoto();
//print_r($objPhoto->getPhotosByAlbumName("testUser1","testAlbum1"));
// FOR  Test Fetch the particular photo
//$objPhoto = $serviceAPIObj->buildPhoto();
//print_r($objPhoto->getPhotosByAlbumAndPhotoName("userName","albumName","photoName"));
// FOR  Test Adds Photo
//$objPhoto = $serviceAPIObj->buildPhoto();
//print_r($objPhoto->addPhoto("userName","albumName","photoName","photoDescription","path"));
// FOR  Test Removes the particular Photo
//$objPhoto = $serviceAPIObj->buildPhoto();
//print_r($objPhoto->removePhoto("userName","albumName","photoName"));
//------------------------------------------------------------------Email-------------------------------------------------------------
// FOR  Test Creates Email Configuration
//$objEmail = $serviceAPIObj->buildEmail();
//$objj = $objEmail->createMailConfiguration("smtp","456","bill.gundsnsdserx@gmail.com","rrrrrr","true");
//$obss = $objj->getConfigList();
//print_r($obss[0]->getSsl());
// FOR  Test Removes email configuration
//$objEmail = $serviceAPIObj->buildEmail();
//print_r($objEmail->removeEmailConfiguration("emailId"));
// FOR  Test Gets all Email Configurations
//$objEmail = $serviceAPIObj->buildEmailService();
//$objj = $objEmail->getEmailConfigurations();
//$obs = $objj->getConfigList();
//print_r($obs[0]->toString());
// FOR  Test Gets all Email Configurations B PAging
//$objEmail = $serviceAPIObj->buildEmailService();
//$objj = $objEmail->getEmailConfigurationsByPaging(1, 1);
//print_r($objj);
// FOR  Sends the Email
//$objEmail = $serviceAPIObj->buildEmail();
//print_r($objEmail->sendMail("stane.bill@gmail.com","rohi38.rtt@gmail.com","HELLLO","I AM TESTINGGG",EmailMIME::PLAIN_TEXT_MIME_TYPE));
//------------------------------------------------------------------Game-------------------------------------------------------------
// FOR  Test Creates game
//$objGame = $serviceAPIObj->buildGame();
//$objj = $objGame->createGame("game121","gameDeascription1");
//print_r($objj->getName());
// FOR  Test Fetches all games
//$objGame = $serviceAPIObj->buildGameService();
//$objj = $objGame->getAllGames();
//$obs = $objj[0]->getName();
//print_r($obs);
// FOR  Test Fetches all games By Paging
//$objGame = $serviceAPIObj->buildGameService();
//$objj = $objGame->getAllGamesByPaging(1, 1);
//print_r($objj);
// FOR  Test Retrieves the game
//$objGame = $serviceAPIObj->buildGame();
//print_r($objGame->getGameByName("game102"));
//------------------------------------------------------------------Reward-------------------------------------------------------------
// FOR  Test Creates Reward
//$objReward = $serviceAPIObj->buildReward();
//$objj = $objReward->createReward("Reward123","rewardDescription1");	
//print_r($objj->getStrResponse());
// FOR  Test Fetches all the Rewards
//$objReward = $serviceAPIObj->buildReward();
//$objj = $objReward->getAllRewards();
//print_r($objj[0]->getName());
// FOR  Test Retrieves the reward
//$objReward = $serviceAPIObj->buildReward();
//print_r($objReward->getRewardByName("rewardName"));
// FOR  Test Adds the reward
//$objReward = $serviceAPIObj->buildReward();
//print_r($objReward->earnRewards("game102","gUserName","game1",10));
// FOR  Test Deducts the rewardpoints
//$objReward = $serviceAPIObj->buildReward();
//print_r($objReward->redeemRewards("game102","gUserName","game1",10));
// FOR  Test Fetches the reward 
//$objReward = $serviceAPIObj->buildReward();
//print_r($objReward->getGameRewardPointsForUser("game102","jattins"));
//------------------------------------------------------------------Score(DONEEEEEEEEEEEE)-------------------------------------------------------------
// FOR  Test Adds game score
//$objScore = $serviceAPIObj->buildScore();
//$objj = $objScore->addScore("game1234","gameUser",20);
//$obs = $objj->getScoreList();
//print_r($obs[0]->getUserName());
// FOR  Test Deducts the score
//$objScore = $serviceAPIObj->buildScore();
//print_r($objScore->deductScore("game102","gameUserNamessa",10));	
//------------------------------------------------------------------ScoreBoard-------------------------------------------------------------
// FOR  Test Saves the User
//$objScoreBoard = $serviceAPIObj->buildScoreBoard();
//$objj = $objScoreBoard->saveUserScore("game121","gameUser",10);
//$obs = $objj->getScoreList();
//print_r($obs[0]->getValue());
// FOR  Test Retrieves the scores
//$objScoreBoard = $serviceAPIObj->buildScoreBoard();
//print_r($objScoreBoard->getScoresByUser("game1234","gameUser"));
// FOR  Test Retrieves the highest
//$objScoreBoard = $serviceAPIObj->buildScoreBoard();
//print_r($objScoreBoard->getHighestScoreByUser("gameName","gameUserName"));
// FOR  Test Retrieves the lowest
//$objScoreBoard = $serviceAPIObj->buildScoreBoard();
//print_r($objScoreBoard->getLowestScoreByUser("gameName","gameUserName"));
// FOR  Test Retrieves the Top Rankings
//$objScoreBoard = $serviceAPIObj->buildScoreBoard();
//print_r($objScoreBoard->getTopRankings("gameName"));	
// FOR  Test Retrieves the User Ranking
//$objScoreBoard = $serviceAPIObj->buildScoreBoard();
//print_r($objScoreBoard->getUserRanking("gameName","gameUserName"));	
//------------------------------------------------------------------Log-------------------------------------------------------------
// FOR  Test Logs the info message
//$objLog = $serviceAPIObj->buildLog();
//$objj = $objLog->info("msg","module");
//print_r($objj);	
// FOR  Test Logs the debug message
//$objLog = $serviceAPIObj->buildLog();
//print_r($objLog->debug("msg","module"));	
// FOR Test Logs the fatal message
//$objLog = $serviceAPIObj->buildLog();
//print_r($objLog->fatal("msg","module"));	
// FOR  Test Logs the error message
//$objLog = $serviceAPIObj->buildLog();
//print_r($objLog->error("msg","module"));	
// FOR  Test Fetch the log messages
//$objLog = $serviceAPIObj->buildLog();
//$objj = $objLog->fetchLogsByModule("module");
//$obs = $objj->getMessageList();
//print_r($obs[4]->getType());
// FOR  Test Fetch log messages based on the Module and Message Text
//$objLog = $serviceAPIObj->buildLog();
//print_r($objLog->fetchLogsByModuleAndText("module","text"));
// FOR  Test Fetch the log messages based on the Level
//$objLog = $serviceAPIObj->buildLog();
//print_r($objLog->fetchLogsByLevel("level"));
// FOR  Test Fetch log messages based on Info Level
//$objLog = $serviceAPIObj->buildLog();
//print_r($objLog->fetchLogsByInfo());
// FOR  Test Fetch log messages based on Debug Level
//$objLog = $serviceAPIObj->buildLog();
//print_r($objLog->fetchLogsByDebug());
// FOR  Test Fetch log messages based on Error Level
//$objLog = $serviceAPIObj->buildLog();
//print_r($objLog->fetchLogsByError());
// FOR  Test Fetch log messages based on Fatal Level
//$objLog = $serviceAPIObj->buildLog();
//print_r($objLog->fetchLogsByFatal());
// FOR  Test Fetch log messages based on Fatal Level
//$objLog = $serviceAPIObj->buildLog();
//print_r($objLog->fetchLogByDateRange("shds-sdsd-dsds", "sdsd-sdsds-sdsd"));
//------------------------------------------------------------------ImageProcessor-------------------------------------------------------------
// FOR  Test Resize image
//$objImageProcessor = $serviceAPIObj->buildImageProcessor();
//$objj = $objImageProcessor->resize("Testds","D:/logo.png","50","100");
//print_r($objj->getOriginalImage());
// FOR  Test Creates a thumbnail of the image
//$objImageProcessor = $serviceAPIObj->buildImageProcessor();
//print_r($objImageProcessor->thumbnail("Tests","D:/logo.png","50","100"));
// FOR  Test Scales the image
//$objImageProcessor = $serviceAPIObj->buildImageProcessor();
//print_r($objImageProcessor->scale("Testa","D:/logo.png","50","100"));
// FOR  Test Crops image based on width, height and x, y coordinates
//$objImageProcessor = $serviceAPIObj->buildImageProcessor();
//print_r($objImageProcessor->crop("Testsss","D:/logo.png","50","100","23","56"));
// FOR  Test Resize image by Percentage.
//$objImageProcessor = $serviceAPIObj->buildImageProcessor();
//print_r($objImageProcessor->resizeByPercentage("Testq","D:/logo.png","50"));
// FOR  Test Creates a thumbnail of the image by Percentage
//$objImageProcessor = $serviceAPIObj->buildImageProcessor();
//print_r($objImageProcessor->thumbnailByPercentage("Testqq","D:/logo.png","50"));
// FOR  Test Scales the image  by Percentage
//$objImageProcessor = $serviceAPIObj->buildImageProcessor();
//print_r($objImageProcessor->scaleByPercentage("Testqe","D:/logo.png","50"));
//------------------------------------------------------------------SOCIAL-----------------------------------------------------------------------
//------------------------------------------------------------------FACEBOOK---------------------------------------------------------------------
//$objFacebook = $serviceAPIObj->buildFacebook();

// $this->userName = "sshukla";
//        $this->status = "Testing Social APIs for LinkedIn.........!";
//
//        $this->twitterConsumerKey = "6lFvyAd515aKrFDwL8DA";
//        $this->twitterConsumerSecret = "uFQ4QBr1fxcTthcB7bE5yvnaq8Jv3EUD4bAQRk8vNs";
//        $this->twitterAccessToken = "448838959-m67CV2QqqizC6tKwS88R8K7YxTts54HPmUv4EfJC";
//        $this->twitterAccessTokenSecret = "mgyFruxAopBkJdQAOS3zSBqn8SqjkRpgw8oJJZKV9vg";
//
//        $this->facebookAppId = "376182252399272";
//        $this->facebookAppSecret = "99f1*153f603bb35444d3794dad4a6b72";
//        $this->facebookAccessToken = "AAAFWIsGGaqgBAKQwSZBsLmqJSBhdtkRkeDT3S46sLlgjCZAHILlMNXipZBVE2v41PWWIFh3JGncbVX7dNWxHGZBzHE0o3ZCqSj5BG0so7ZCQZDZD";
//
//        $this->linkedinApiKey = "bua6eo3pq5g3";
//        $this->linkedinSecretKey = "zBhKq5q7ruHcgH6l";
//        $this->linkedinAccessToken = "7a7493f4-e3dd-4ab3-8014-efea40518d3d";
//        $this->linkedinAccessTokenSecret = "35c0745f-40d9-4889-9f37-6af7571e4249";
$socialService = $serviceAPIObj->buildSocialService();
 //$socialServiceObj = $socialService->linkUserFacebookAccount("vxcbbb", "vxcvcxv", "vxcvcxb","vv cv");
//$socialServiceObj = $socialService->linkUserFacebookAccount("userName","facebookAccessToken");
 //$socialServiceObj = $socialService->updateFacebookStatus("vxcbbb","status");
 //$socialServiceObj = $socialService->linkUserTwitterAccount("userName","twitterAccessToken","twitterAccessTokenSecret","twitterConsumerKey","twitterConsumerSecret");
//$socialServiceObj = $socialService->linkUserTwitterAccount("userName","twitterAccessToken","twitterAccessTokenSecret");

//echo"ddd";
//print_r($socialServiceObj);
//echo"nnd";
//$objj = $objFacebook->linkAppCredentials($clientCode,$clientSecret,$callbackUrl);
//print_r($objj->getClientCode());
//$objj = $objFacebook->getAuthorizationURL();
//print_r($objj->getAuthorizationURL());
//$objj = $objFacebook->linkUserFacebookAccount($userName,$code);
//print_r($objj->getCode());
//$objj = $objFacebook->updateFacebookStatus($userName,"facebook testing by rohit frd");
//print_r($objj);
//$objj = $objFacebook->getFacebookInfo($userName);
//print_r($objj);
//-------------------------------------------------------------------TWITTER-----------------------------------------------------------------------
//$objTwitter = $serviceAPIObj->buildTwitter();

$apiKey = "0452bf13b517bdba6400e119db64c78643d4de1c6209cd2f94951b40067f1412";
$secretKey = "833398acd0afee6470de1c36b82c48f1fd8310bf1bc52518ea9b6cbb9679089f";
$consumerKey = "6lFvyAd515aKrFDwL8DA";
$consumerSecret = "uFQ4QBr1fxcTthcB7bE5yvnaq8Jv3EUD4bAQRk8vNs";
//$consumerKey = "6lFvyAd515aKrFDwL8";
//$consumerSecret = "uFQ4QBr1fxcTthcB7bE5yvnaq8Jv3EUD4bAQRk8v";
$callbackUrl = "test";
$requestToken = "Zi2OHaYrSFao8KuzYpwv1WNNu9mQZ1qPP8Ixa5aIeyc";
$requestTokenSecret = "NIR4hfPKdyTrLbwPI9db9bP59WMUMVXYqvJgeee2ZYU";
$userName = "naveen";


//$objj = $objTwitter->linkAppCredentials($consumerKey, $consumerSecret, $callbackUrl);
//print_r($objj->getConsumerSecret());
//$objj = $objTwitter->getAuthorizationURL();
//print_r($objj);
//$objj = $objTwitter->linkUserTwitterAccount($userName, $requestToken, $requestTokenSecret);
//print_r($objj);
//$objj = $objTwitter->updateStatus($userName, "THis is first tweet regarding testing Apis");
//print_r($objj);
//$objj = $objTwitter->getFavorites($userName);
//print_r($objj);
?>