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
 * This BravoBoard object is the value object which contains the properties of User
 * along with the setter & getter for those properties.
 *
 */
class BravoBoard extends App42Response {
    //put your code here
    	public $userId;
	public $itemId;
	public $status;
	public $comment;
	public $activityId;
	public $createdOn;
	public $tags = array();

	/**
	 * Returns the user Id.
	 * 
	 * @return the userId of the User.
	 */
	public function getUserId() {
		return $this->userId;
	}

	/**
	 * Sets the userId of the User.
	 * 
	 * @param userId
	 *            - userId of the User
	 * 
	 */
	public function setUserId($userId) {
		$this->userId = $userId;
	}

	/**
	 * Returns the itemId of the User.
	 * 
	 * @return the itemId of the User.
	 */
	public function getItemId() {
		return $this->itemId;
	}

	/**
	 * Sets the itemId of the User.
	 * 
	 * @param itemId
	 *            - itemId of the User
	 * 
	 */
	public function setItemId($itemId) {
		$this->itemId = $itemId;
	}

	/**
	 * Returns the status of the User.
	 * 
	 * @return the status of the User.
	 */
	public function getStatus() {
		return $this->status;
	}

	/**
	 * Sets the status of the User.
	 * 
	 * @param status
	 *            - status of the User
	 * 
	 */
	public function setStatus($status) {
		$this->status = $status;
	}

	/**
	 * Returns the comment of the User.
	 * 
	 * @return the comment of the User.
	 */
	public function getComment() {
		return $this->comment;
	}

	/**
	 * Sets the comment of the User.
	 * 
	 * @param comment
	 *            - comment of the User
	 * 
	 */
	public function setComment($comment) {
		$this->comment = $comment;
	}

	

	/**
	 * Returns the time, day and date of the review when it was created by the
	 * User.
	 * 
	 * @return the createdOn information of the review by the User.
	 */
	public function getCreatedOn() {
		return $this->createdOn;
	}

	/**
	 * Sets the createdOn information of the review by the User.
	 * 
	 * @param createdOn
	 *            - createdOn information by the User
	 * 
	 */
	public function setCreatedOn($createdOn) {
		$this->createdOn = $createdOn;
	}

	/**
	 * 
	 * @param activityId
	 */

	public function setActivityId($activityId) {
		$this->activityId = $activityId;
	}

	/**
	 * 
	 * @return
	 */
	public function getActivityId() {
		return $this->activityId;
	}

	/**
	 * 
	 * @return
	 */

	public function getTagList() {
		return $this->tags;
	}

	/**
	 * 
	 * @param tags
	 */
	public function setTagList($tagsss) {
		$this->tags = $tagsss;
	}


	/**
	 * Returns the User Response in JSON format.
	 * 
	 * @return the response in JSON format.
	 * 
	 */

	public function getStringView() {
		return "UserId :" . $this->userId . " : ItemId : " . $this->itemId . " : Status : "
				. $this->status . " : Comment : " . $this->comment .  " : CreatedOn : " . $this->createdOn . " : activityId : "
				.$this->activityId;
	}
}
/**
 * An inner class that contains the remaining properties of the Tags.
 *
 */
            class Tags {

		public $user;
		public $tagName;
		public $taggedOn;

                public function __construct(BravoBoard $bravoBoard) {
                    array_push($bravoBoard->tags, $this);
                }

		public function getUser() {
			return $this->user;
		}

		public function setUser($user) {
			$this->user = $user;
		}

		public function getTagName() {
			return $this->tagName;
		}

		public function setTagName($tagName) {
			$this->tagName = $tagName;
		}

		public function getTaggedOn() {
			return $this->taggedOn;
		}

		public function setTaggedOn($taggedOn) {
			$this->taggedOn = $taggedOn;
		}

	}

?>
