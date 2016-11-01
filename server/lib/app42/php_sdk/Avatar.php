<?php
/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
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
class Avatar  extends App42Response {
        public $userName;
	public $name;
	public $url;
	public $tinyUrl;
	public $createdOn;
	public $description;
	public $isCurrent;

          public function isCurrent() {
        if ($this->isCurrent == 1)
            return "true";
        else
            return "false";
    }
    public function setIsCurrent($isCurrent) {
        $this->isCurrent = $isCurrent;
    }
    public function getUserName() {
          return $this->userName;
	}

	/**
	 *
	 * @param userName
	 */

	public function setUserName() {
              $this->userName = $userName;
	}
	/**
	 *
	 * @return
	 */
	public function getName() {
             return $this->name;
	}

	/**
	 * Sets the name of the User.
	 *
	 * @param userName
	 *            - Name of the User
	 *
	 */

	public function setName($name) {
            $this->name = $name;
	}
		/**
		 *
		 * @return
		 */

	public function getURL() {
            return $this->url;
	}

	/**
	 *
	 * @param url
	 */

	public function setURL($url) {
            $this->url = $url;
	}

	/**
	 *
	 * @return
	 */

	public function getTinyURL() {
              return $this->tinyUrl;
	}

	/**
	 *
	 * @param tinyUrl
	 */

	public function setTinyURL($tinyUrl) {
             $this->tinyUrl = $tinyUrl;
	}

	/**
	 *
	 * @return
	 */

	public function getDescription() {
            return $this->description;
	}

	/**
	 *
	 * @param description
	 */

	public function setDescription($description) {
                $this->description = $description;
	}

	/**
	 *
	 * @return
	 */

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
?>
