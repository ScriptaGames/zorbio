<?php

include_once "App42Response.php";

/**
 *
 * This class Manage the response which comes from App42 server and set, get
 * values from the response.
 * 
 */
class Social extends App42Response {

    public $userName;
    public $status;
    public $facebookAppId;
    public $facebookAppSecret;
    public $facebookAccessToken;
    public $twitterConsumerKey;
    public $twitterConsumerSecret;
    public $twitterAccessToken;
    public $twitterAccessTokenSecret;
    public $linkedinApiKey;
    public $linkedinSecretKey;
    public $linkedinAccessToken;
    public $linkedinAccessTokenSecret;
    public $friendslist = array();
    public $facebookProfile;
    public $publicProfile = array();

    /**
     * Returns the user name for the social.
     *
     * @return the user name for the social.
     */
    public function getUserName() {
        return $this->userName;
    }

    /**
     * Sets the user name for the social.
     *
     * @param userName
     *            - Name of the user whose social account to be linked
     *
     */
    public function setUserName($userName) {
        $this->userName = $userName;
    }

    /**
     * Returns the status for the social.
     *
     * @return the status for the social.
     */
    public function getStatus() {
        return $this->status;
    }

    /**
     * Sets the status for the social.
     *
     * @param userName
     *            - Status for the social account which has to be updated
     *
     */
    public function setStatus($status) {
        $this->status = $status;
    }

    /**
     * Returns the app id for the Facebook.
     *
     * @return the app id for the Facebook.
     */
    public function getFacebookAppId() {
        return $this->facebookAppId;
    }

    /**
     * Sets the app id for the Facebook.
     *
     * @param facebookAppId
     *            - App id for linking to the facebook account
     *
     */
    public function setFacebookAppId($facebookAppId) {
        $this->facebookAppId = $facebookAppId;
    }

    /**
     * Returns the app secret for the Facebook.
     *
     * @return the app secret for the Facebook.
     */
    public function getFacebookAppSecret() {
        return $this->facebookAppSecret;
    }

    /**
     * Sets the app secret for the Facebook.
     *
     * @param facebookAppSecret
     *            - App secret for linking to the facebook account
     *
     */
    public function setFacebookAppSecret($facebookAppSecret) {
        $this->facebookAppSecret = $facebookAppSecret;
    }

    /**
     * Returns the access token for the Facebook.
     *
     * @return the access token for the Facebook.
     */
    public function getFacebookAccessToken() {
        return $this->facebookAccessToken;
    }

    /**
     * Sets the access token for the Facebook.
     *
     * @param facebookAccessToken
     *            - Facebook Access Token that has been received after
     *            authorization
     *
     */
    public function setFacebookAccessToken($facebookAccessToken) {
        $this->facebookAccessToken = $facebookAccessToken;
    }

    /**
     * Returns the consumer key for the Twitter.
     *
     * @return the consumer key for the Twitter.
     */
    public function getTwitterConsumerKey() {
        return $this->twitterConsumerKey;
    }

    /**
     * Sets the consumer key for the Twitter.
     *
     * @param twitterConsumerKey
     *            - Consumer key for linking to the twitter account
     *
     */
    public function setTwitterConsumerKey($twitterConsumerKey) {
        $this->twitterConsumerKey = $twitterConsumerKey;
    }

    /**
     * Returns the consumer secret key for the Twitter.
     *
     * @return the consumer secret key for the Twitter.
     */
    public function getTwitterConsumerSecret() {
        return $this->twitterConsumerSecret;
    }

    /**
     * Sets the consumer secret key for the Twitter.
     *
     * @param twitterConsumerSecret
     *            - Consumer secret for linking to the twitter account
     *
     */
    public function setTwitterConsumerSecret($twitterConsumerSecret) {
        $this->twitterConsumerSecret = $twitterConsumerSecret;
    }

    /**
     * Returns the access token for the Twitter.
     *
     * @return the access token for the Twitter.
     */
    public function getTwitterAccessToken() {
        return $this->twitterAccessToken;
    }

    /**
     * Sets the access token for the Twitter.
     *
     * @param twitterAccessToken
     *            - Twitter Access Token that has been received after
     *            authorization
     *
     */
    public function setTwitterAccessToken($twitterAccessToken) {
        $this->twitterAccessToken = $twitterAccessToken;
    }

    /**
     * Returns the access token secret for the Twitter.
     *
     * @return the access token secret for the Twitter.
     */
    public function getTwitterAccessTokenSecret() {
        return $this->twitterAccessTokenSecret;
    }

    /**
     * Sets the access token secret for the Twitter.
     *
     * @param twitterAccessTokenSecret
     *            - Twitter Access Token Secret that has been received after
     *            authorization
     *
     */
    public function setTwitterAccessTokenSecret($twitterAccessTokenSecret) {
        $this->twitterAccessTokenSecret = $twitterAccessTokenSecret;
    }

    /**
     * Returns the api key for the LinkedIn.
     *
     * @return the api key for the LinkedIn.
     */
    public function getLinkedinApiKey() {
        return $this->linkedinApiKey;
    }

    /**
     * Sets the api key for the LinkedIn.
     *
     * @param linkedinApiKey
     *            - Api key for linking to the linkedIn account
     *
     */
    public function setLinkedinApiKey($linkedinApiKey) {
        $this->linkedinApiKey = $linkedinApiKey;
    }

    /**
     * Returns the secret key for the LinkedIn.
     *
     * @return the secret key for the LinkedIn.
     */
    public function getLinkedinSecretKey() {
        return $this->linkedinSecretKey;
    }

    /**
     * Sets the secret key for the LinkedIn.
     *
     * @param linkedinSecretKey
     *            - Secret key for linking to the linkedIn account
     *
     */
    public function setLinkedinSecretKey($linkedinSecretKey) {
        $this->linkedinSecretKey = $linkedinSecretKey;
    }

    /**
     * Returns the access token for the LinkedIn.
     *
     * @return the access token for the LinkedIn.
     */
    public function getLinkedinAccessToken() {
        return $this->linkedinAccessToken;
    }

    /**
     * Sets the access token for the LinkedIn.
     *
     * @param linkedinAccessToken
     *            - LinkedIn Access Token that has been received after
     *            authorization
     *
     */
    public function setLinkedinAccessToken($linkedinAccessToken) {
        $this->linkedinAccessToken = $linkedinAccessToken;
    }

    /**
     * Returns the access token secret for the LinkedIn.
     *
     * @return the access token secret for the LinkedIn.
     */
    public function getLinkedinAccessTokenSecret() {
        return $this->linkedinAccessTokenSecret;
    }

    /**
     * Sets the access token secret for the LinkedIn.
     *
     * @param linkedinAccessTokenSecret
     *            - LinkedIn Access Token Secret that has been received after
     *            authorization
     *
     */
    public function setLinkedinAccessTokenSecret($linkedinAccessTokenSecret) {
        $this->linkedinAccessTokenSecret = $linkedinAccessTokenSecret;
    }

    /**
     * Returns the Social.Friends object for the User.
     *
     * @return FriendsList of the User
     *
     */
    public function getFriendslist() {
        return $this->friendslist;
    }

    /**
     * Sets the Social. Friends object for the User.
     *
     * @params Friends
     *            - FriendsList of the User
     *
     */
    public function setFriendslist($friendslist) {
        $this->friendslist = $friendslist;
    }

    public function getFacebookProfile() {
        return $this->facebookProfile;
    }

    public function setFacebookProfile($facebookProfilee) {
        $this->facebookProfile = $facebookProfilee;
    }

    public function getPublicProfile() {
        return $this->publicProfile;
    }

    public function setPublicProfile($publicProfile) {
        $this->publicProfile = $publicProfile;
    }

}

class Friends {

    public $name;
    public $picture;
    public $id;
    public $installed;

    /**
     * This is a constructor that takes no parameter
     *
     */
    function __construct(Social $social) {
        array_push($social->friendslist, $this);
    }

    /**
     * Returns the name of the Friends.
     *
     * @return the  name of the Friends.
     */
    public function getName() {
        return $this->name;
    }

    /**
     * Sets the name of the Friends.
     *
     * @params name
     *            - Name of the Friends
     *
     */
    public function setName($name) {
        $this->name = $name;
    }

    /**
     * Returns the picture of the Friends.
     *
     * @return the  picture of the Friends.
     */
    public function getPicture() {
        return $this->picture;
    }

    /**
     * Sets the picture of the Friends.
     *
     * @params picture
     *            - Picture of the Friends
     *
     */
    public function setPicture($picture) {
        $this->picture = $picture;
    }

    /**
     * Returns the id of the Friends.
     *
     * @return the  id of the Friends.
     */
    public function getId() {
        return $this->id;
    }

    /**
     * Sets the id of the Friends.
     *
     * @params id
     *            - id of the Friends
     *
     */
    public function setId($id) {
        $this->id = $id;
    }

    /**
     * Returns the installed of the Friends.
     *
     * @return the  installed of the Friends.
     */
    public function getInstalled() {
        if ($this->installed == 1)
            return "true";
        else
            return "false";
    }

    /**
     * Sets the installed of the Friends.
     *
     * @params installed
     *            - installed of the Friends
     *
     */
    public function setInstalled($installedd) {
        $this->installed = $installedd;
    }

}

class SocialFacebookProfile {

    public $name;
    public $picture;
    public $id;
    public $firstName;
    public $lastName;
    public $gender;
    public $link;
    public $locale;
    public $userName;

    /**
     * This is a constructor that takes no parameter
     *
     */
    public function __construct(Social $social) {
        $social->facebookProfile= $this;
    }

    /**
     * Returns the name of the Friends.
     *
     * @return the  name of the Friends.
     */
    public function getName() {
        return $this->name;
    }

    /**
     * Sets the name of the Friends.
     *
     * @params name
     *            - Name of the Friends
     *
     */
    public function setName($name) {
        $this->name = $name;
    }

    /**
     * Returns the picture of the Friends.
     *
     * @return the  picture of the Friends.
     */
    public function getPicture() {
        return $this->picture;
    }

    /**
     * Sets the picture of the Friends.
     *
     * @params picture
     *            - Picture of the Friends
     *
     */
    public function setPicture($picture) {
        $this->picture = $picture;
    }

    /**
     * Returns the id of the Friends.
     *
     * @return the  id of the Friends.
     */
    public function getId() {
        return $this->id;
    }

    /**
     * Sets the id of the Friends.
     *
     * @params id
     *            - id of the Friends
     *
     */
    public function setId($id) {
        $this->id = $id;
    }

     public function getFirstName() {
        return $this->firstName;
    }
     public function setFirstName($firstName) {
        $this->firstName = $firstName;
    }
      public function getLastName() {
        return $this->lastName;
    }
     public function setLastName($lastName) {
        $this->lastName = $lastName;
    }
       public function getGender() {
        return $this->gender;
    }
     public function setGender($gender) {
        $this->gender = $gender;
    }
    
     public function getLink() {
        return $this->link;
    }
     public function setLink($link) {
        $this->link = $link;
    }
      public function getLocale() {
        return $this->locale;
    }
     public function setLocale($locale) {
        $this->locale = $locale;
    }
    
      public function getUserName() {
        return $this->userName;
    }
     public function setUserName($userName) {
        $this->userName = $userName;
    }
}

class PublicProfile {

    public $name;
    public $picture;
    public $id;

    /**
     * This is a constructor that takes no parameter
     *
     */
    public function __construct(Social $social) {
        array_push($social->publicProfile, $this);
    }

    /**
     * Returns the name of the Friends.
     *
     * @return the  name of the Friends.
     */
    public function getName() {
        return $this->name;
    }

    /**
     * Sets the name of the Friends.
     *
     * @params name
     *            - Name of the Friends
     *
     */
    public function setName($name) {
        $this->name = $name;
    }

    /**
     * Returns the picture of the Friends.
     *
     * @return the  picture of the Friends.
     */
    public function getPicture() {
        return $this->picture;
    }

    /**
     * Sets the picture of the Friends.
     *
     * @params picture
     *            - Picture of the Friends
     *
     */
    public function setPicture($picture) {
        $this->picture = $picture;
    }

    /**
     * Returns the id of the Friends.
     *
     * @return the  id of the Friends.
     */
    public function getId() {
        return $this->id;
    }

    /**
     * Sets the id of the Friends.
     *
     * @params id
     *            - id of the Friends
     *
     */
    public function setId($id) {
        $this->id = $id;
    }

}
?>