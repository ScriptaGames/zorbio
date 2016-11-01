<?php

/**
 * Creates User for the App. App42 Cloud API's provides a complete User Management for any
 * Mobile or Web App. It supports User registration, retrieval, state management e.g. lock, delete
 * and Authentication.
 * Along with User management the platform provides API's for persistent SessionManagement
 * @see SessionManager
 */
include_once "App42Response.php";
include_once "App42NotFoundException.php";
include_once "App42Exception.php";
include_once 'Util.php';

/**
 *
 * This User object is the value object which contains the properties of User
 * along with the setter & getter for those properties.
 *
 */
class User  extends App42Response {

    public $sessionId;
    public $createdOn;
    public $userName;
    public $password;
    public $email;
    public $accountLocked;
    public $profile;
    public $role = array();
   public $jsonDocList = array();

   public function getJsonDocList() {
        return $this->jsonDocList;
    }

    public function setJsonDocList($jsonDocListt) {
        $this->jsonDocList = $jsonDocListt;
    }


    /**
     * Returns the roles assigned to the User
     *
     * @return List of the roles assigned to the User
     *
     */
    public function getRoleList() {
        return $this->role;
    }

    /**
     * Assigns the list of roles to the User
     *
     * @params roleList
     *            - List of roles to be assigned to User
     *
     */
    public function setRoleList($roleList) {
        $this->role = $roleList;
    }

    /**
     * Returns the name of the User.
     *
     * @return the name of the User.
     */
    public function getUserName() {
        return $this->userName;
    }

    /**
     * Sets the name of the User.
     *
     * @params userName
     *            - Name of the User
     *
     */
    public function setUserName($userName) {
        $this->userName = $userName;
    }

    /**
     * Returns the password of the User.
     *
     * @return the password of the User.
     *
     */
    public function getPassword() {
        return $this->password;
    }

    /**
     * Sets the password for the User.
     *
     * @params password
     *            - Password for the User
     *
     */
    public function setPassword($password) {
        $this->password = $password;
    }

    /**
     * Returns the email of the User.
     *
     * @return the email of the User.
     *
     */
    public function getEmail() {
        return $this->email;
    }

    /**
     * Sets the Email of the User.
     *
     * @params email
     *            - Email of the User
     *
     */
    public function setEmail($email) {
        $this->email = $email;
    }
    /**
     * Returns the sessionId of the User.
     *
     * @return the sessionId of the User.
     *
     */
    public function getSessionId() {
        return $this->sessionId;
    }

    /**
     * Sets the SessionId of the User.
     *
     * @params sessionId
     *            - SessionId of the User
     *
     */
    public function setSessionId($sessionId) {
        $this->sessionId = $sessionId;
    }

    /**
     * Returns the User Response in JSON format.
     *
     * @return the response in JSON format.
     *
     */
    public function toString() {
        return $this->getStrResponse();
    }

    /**
     * Returns the User.Profile object for the User.
     *
     * @return Profile of the User
     *
     */
    public function getProfile() {
        return $this->profile;
    }

    /**
     * Sets the User. Profile object for the User.
     *
     * @params profile
     *            - Profile of the User
     *
     */
    public function setProfile(Profile $profile) {
        $this->profile = $profile;
    }

    /**
     * Returns the User's account status.
     *
     * @return true if account is locked, false if account is unlocked.
     */
    public function isAccountLocked() {
        if ($this->accountLocked == 1)
            return "true";
        else
            return "false";
        //	return $this->accountLocked;
    }

    /**
     * Sets the value of account to either true or false.
     *
     * @params accountLocked
     *            - true or false
     *
     */
    public function setAccountLocked($accountLocked) {
        $this->accountLocked = $accountLocked;
    }
    	public function getCreatedOn() {
            return $this->createdOn;
	}

	/**
	 *
	 * @param createdOn
	 */

	public function setCreatedOn($createdOn) {
                 $this->createdOn = $createdOn;
	}

}

/**
 *  Class that contains the User Gender either MALE or FEMALE.
 *
 */
class UserGender {
    const FEMALE = "Female";
    const MALE = "Male";

    public function enum($string) {
        return constant('UserGender::' . $string);
    }

    public function isAvailable($string) {
        if ($string == "Female")
            return "FEMALE";
        else if ($string == "Male")
            return "MALE";
        else
            return "null";
    }

}

/**
 * An inner class that contains the remaining properties of the User.
 *
 */
class Profile {

    public $firstName;
    public $lastName;
    public $sex;
    public $mobile;
    public $line1;
    public $line2;
    public $city;
    public $state;
    public $country;
    public $pincode;
    public $homeLandLine;
    public $officeLandLine;
    public $dateOfBirth;

    /**
     * This is a constructor that takes no parameter
     *
     */
    public function __construct(User $user) {
        $user->profile = $this;
    }

  

    /**
     * Returns the first name of the User.
     *
     * @return the first name of the User.
     */
    public function getFirstName() {
        return $this->firstName;
    }

    /**
     * Sets the first name of the User.
     *
     * @params firstName
     *            - FirstName of the User
     *
     */
    public function setFirstName($firstName) {
        $this->firstName = $firstName;
    }

    /**
     * Returns the last name of the User.
     *
     * @return the last name of the User.
     */
    public function getLastName() {
        return $this->lastName;
    }

    /**
     * Sets the last name of the User.
     *
     * @params lastName
     *            - LastName of the User
     *
     */
    public function setLastName($lastName) {
        $this->lastName = $lastName;
    }

    /**
     * Returns the gender of the User.
     *
     * @return the gender of the User.
     */
    public function getSex() {
        return $this->sex;
    }

    /**
     * Sets the gender of the User.
     *
     * @params sex
     *            - Gender of the User
     *
     */
    public function setSex($userGender) {
        $genderObj = new UserGender();
        if ($genderObj->isAvailable($userGender) == "null") {
            throw new App42Exception("User Gender can be either MALE or FEMALE");
        }
        $this->sex = $userGender;
    }

    /**
     * Returns the mobile number of the User.
     *
     * @return the mobile of the User.
     */
    public function getMobile() {
        return $this->mobile;
    }

    /**
     * Sets the mobile number for the User.
     *
     * @params mobile
     *            - Mobile of the User
     *
     */
    public function setMobile($mobile) {
        $this->mobile = $mobile;
    }

    /**
     * Returns the address line1 of the User.
     *
     * @return the address line1 of the User.
     */
    public function getLine1() {
        return $this->line1;
    }

    /**
     * Sets the address line1 of the User.
     *
     * @params line1
     *            - Address line1 of the User
     *
     */
    public function setLine1($line1) {
        $this->line1 = $line1;
    }

    /**
     * Returns the address line2 of the User.
     *
     * @return the address line2 of the User.
     */
    public function getLine2() {
        return $this->line2;
    }

    /**
     * Sets the address line2 of the User.
     *
     * @params line2
     *            - Address line2 of the User
     *
     */
    public function setLine2($line2) {
        $this->line2 = $line2;
    }

    /**
     * Returns the city of the User.
     *
     * @return the city of the User.
     */
    public function getCity() {
        return $this->city;
    }

    /**
     * Sets the city of the User.
     *
     * @params city
     *            - City of the User
     *
     */
    public function setCity($city) {
        $this->city = $city;
    }

    /**
     * Returns the state of the User.
     *
     * @return the state of the User.
     */
    public function getState() {
        return $this->state;
    }

    /**
     * Sets the state of the User.
     *
     * @params state
     *            State of the User
     *
     */
    public function setState($state) {
        $this->state = $state;
    }

    /**
     * Returns the country of the User.
     *
     * @return the country of the User.
     */
    public function getCountry() {
        return $this->country;
    }

    /**
     * Sets the country of the User.
     *
     * @params country
     *            - Country of the User
     *
     */
    public function setCountry($country) {
        $this->country = $country;
    }

    /**
     * Returns the pincode of the User.
     *
     * @return the pincode of the User.
     */
    public function getPincode() {
        return $this->pincode;
    }

    /**
     * Sets the pincode of the User.
     *
     * @params pincode
     *            - Pincode of the User
     *
     */
    public function setPincode($pincode) {
        $this->pincode = $pincode;
    }

    /**
     * Returns the home land line of the User.
     *
     * @return the home land line of the User.
     */
    public function getHomeLandLine() {
        return $this->homeLandLine;
    }

    /**
     * Sets the home land line of the User.
     *
     * @params homeLandLine
     *            - Home land line of the User
     *
     */
    public function setHomeLandLine($homeLandLine) {
        $this->homeLandLine = $homeLandLine;
    }

    /**
     * Returns the office land line of the User.
     *
     * @return the office land line of the User.
     */
    public function getOfficeLandLine() {
        return $this->officeLandLine;
    }

    /**
     * Sets the office land line of the User.
     *
     * @params officeLandLine
     *            - Office land line of the User
     *
     */
    public function setOfficeLandLine($officeLandLine) {
        $this->officeLandLine = $officeLandLine;
    }

    /**
     * Returns the date of birth of the User.
     *
     * @return the data of birth of the User.
     */
    public function getDateOfBirth() {
        return $this->dateOfBirth;
    }

    /**
     * Sets the data of birth of the User.
     *
     * @params dateOfBirth
     *            Date of birth of the User
     *
     */
    public function setDateOfBirth($dateOfBirth) {
        $validateStartDate = Util::validateDate($dateOfBirth);
        $this->dateOfBirth = $dateOfBirth;
    }

}
class UserJSONDocument {

    public $jsonDoc;
    public $docId;
    public $createdAt;
    public $updatedAt;
    private $owner;
    public $event;
    public $loc ;
    /**
     * This create the constructor and takes no parameter.
     */
    function __construct(User $user) {
        array_push($user->jsonDocList, $this);
    }

    /**
     * Returns the json doc for Storage.
     *
     * @return json doc for storage
     */
    public function getJsonDoc() {
        return $this->jsonDoc;
    }

    /**
     * Sets the json document for Storage
     *
     * @params jsonDoc
     *            - json document for storage
     *
     */
    public function setJsonDoc($jsonDoc) {
        $this->jsonDoc = $jsonDoc;
    }

    /**
     * Returns the document Id.
     *
     * @return docId
     */
    public function getDocId() {
        return $this->docId;
    }

    /**
     * Sets the document Id for the Storage
     *
     * @params docId
     *            - document Id for the storage
     *
     */
    public function setDocId($docId) {
        $this->docId = $docId;
    }
    public function  getUpdatedAt() {
            return $this->updatedAt;
    }
    public function setUpdatedAt($updatedAt) {
	  $this->updatedAt = $updatedAt;
    }

    public function getCreatedAt() {
	return $this->createdAt;
    }
    public function setCreatedAt($createdAt) {
            $this->createdAt = $createdAt;
    }
    public function getEvent() {
         return $this->event;
    }

    public function  setEvent($event) {
	$this->event = $event;
    }
    public function getOwner() {
	return $this->owner;
}

    public function setOwner($owner) {
            $this->owner = $owner;
    }

    public function getLocation(){
        return $this->loc;
		}
    public function setLocation(GeoTag $loc){
            $this->loc = $loc;
    }

    /**
     * Returns the Storage Response in JSON format.
     *
     * @return the response in JSON format.
     *
     */
    public function toString() {
        //if($this->docId != null &&  $this->jsonDoc != null)
        return $this->docId . " : " . $this->jsonDoc;
        //else
        //return super->toString();
    }
}
?>
