<?php

include_once "App42Response.php";

/**
 * 
 * This Reward object is the value object which contains the properties of
 * Reward along with the setter & getter for those properties.
 *
 */
class Reward extends App42Response {

    public $gameName;
    public $userName;
    public $name;
    public $points;
    public $description;
    public $rank;
    /**
     * Returns the name of the game.
     *
     * @return the name of the game.
     */
    public function getGameName() {
        return $this->gameName;
    }

    /**
     * Sets the name of the Game which has to be created.
     *
     * @param gameName
     *            - Name of the Game that has to be created
     *
     */
    public function setGameName($gameName) {
        $this->gameName = $gameName;
    }

    /**
     * Returns the description of the game.
     *
     * @return the description of the game.
     */
    public function getDescription() {
        return $this->description;
    }

    /**
     * Sets the description of the Game.
     *
     * @param description
     *            - Description of the game to be created
     *
     */
    public function setDescription($description) {
        $this->description = $description;
    }

    /**
     * Returns the user name of the game.
     *
     * @return the user name of the game.
     */
    public function getUserName() {
        return $this->userName;
    }

    /**
     * Sets the user name of the Game.
     *
     * @param userName
     *            - User Name of the Game
     *
     */
    public function setUserName($userName) {
        $this->userName = $userName;
    }

    /**
     * Returns the name of the reward.
     *
     * @return the name of the reward.
     */
    public function getName() {
        return $this->name;
    }

    /**
     * Sets the name of the reward which has to be created.
     *
     * @param name
     *            - Name of the reward that has to be created
     *
     */
    public function setName($name) {
        $this->name = $name;
    }

    /**
     * Returns the points to the Reward.
     *
     * @return the points to the Reward.
     */
    public function getPoints() {
        return $this->points;
    }

    /**
     * Sets the points to the Reward.
     *
     * @param points
     *            - points to the reward
     *
     */
    public function setPoints($points) {
        $this->points = $points;
    }

    	public function getRank() {
              return $this->rank;
	}
	public function setRank($rank) {
             $this->rank = $rank;
	}


}
?>