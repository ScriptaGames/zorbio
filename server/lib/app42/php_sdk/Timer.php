<?php
include_once "App42Response.php";
/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of Timer
 *
 * @author PRAVIN
 */
class Timer extends App42Response {
    
    public $name;
	public $currentTime;
	public $timeInSeconds;
	public $startTime;
	public $endTime;
	public $userName;
	public $isTimerActive;
	
	public function  getUserName() {
		return $this->userName;
	}
	public function setUserName($userName) {
		$this->userName = $userName;
	}
	public function getName() {
		return $this->name;
	}
	public function setName($name) {
		$this->name = $name;
	}
	public function getCurrentTime() {
		return $this->currentTime;
	}
	public function setCurrentTime($currentTime) {
		$this->currentTime = $currentTime;
	}
	public function getTimeInSeconds() {
		return $this->timeInSeconds;
	}
	public function setTimeInSeconds($timeInSeconds) {
		$this->timeInSeconds = $timeInSeconds;
	}
	public function getStartTime() {
		return $this->startTime;
	}
	public function setStartTime($startTime) {
		$this->startTime = $startTime;
	}
	public function getEndTime() {
		return $this->endTime;
	}
	public function setEndTime($endTime) {
		$this->endTime = $endTime;
	}
	public function getIsTimerActive() {
             if ($this->isTimerActive == 1)
            return "true";
        else
            return "false";
	}
	public function setIsTimerActive($isTimerActive) {
		$this->isTimerActive = $isTimerActive;
	}

    
    
}

?>
