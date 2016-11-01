<?php
/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
include_once "App42Response.php";

class Achievement extends App42Response {

	
	public $name;
	public $description;
	public $gameName;
        public $userName;
	public $achievedOn;

        /**
	 *
	 * @return Returns the name of the achievement
	 */
	public function getName() {
            return $this->name;
	}

	/**
	 * Sets the name of the achievement.
	 *
	 * @param userName
	 *            - Name of the achievement
	 *
	 */

	public function setName($name) {
           // print_r( $name);

             $this->name = $name;
	}

         /**
	 *
	 * @return description
	 */

	public function getDescription() {
             return $this->description;
	}

	/**		Sets description
	 *
	 * @param description
	 */
	public function setDescription($description) {
              $this->description = $description;
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
	 * @param userName
	 *            - Name of the User
	 *
	 */

	public function setUserName($userName) {
             $this->userName = $userName;
	}

	

       

	/**
	 *
	 * @return Returns the name of the game
	 */

	public function getGameName() {
             return $this->gameName;

	}

	/** Sets the name of the game.
	 *
	 * @param gameName  - Name of the game
	 */

	public function setGameName($gameName) {
             $this->gameName = $gameName;
	}

	/**
	 *  Return  achievedOn
	 * @return
	 */

	public function getAchievedOn() {
             return $this->achievedOn;
	}

	/**
	 *
	 * @param achievedOn - sets achievedOn
	 */

	public function setAchievedOn($achievedOn) {
             $this->achievedOn = $achievedOn;
	}

	
}

?>
