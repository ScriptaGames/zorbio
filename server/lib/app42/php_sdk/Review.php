<?php

include_once "App42Response.php";
/**
 * The service is a Review & Rating manager for any item. The item can be anything which has an id
 * e.g. App on a AppStore/Marketplace, items in a catalogue, articles, blogs etc.
 * It manages the comments and its associated rating. It also provides methods to fetch average, highest etc. Reviews.
 * Reviews can be also be muted or unmuted if it has any objectionable content.
 * 
 */

/**
 *
 * This Review object is the value object which contains the properties of
 * Review along with the setter & getter for those properties.
 *
 */
class Review extends App42Response {

    public $userId;
    public $itemId;
    public $status;
    public $reviewId;
    public $comment;
    public $rating;
    public $createdOn;
    public $commentId;

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
    
     public function getCommentId() {
        return $this->commentId;
    }

    /**
     * Sets the itemId of the User.
     *
     * @param itemId
     *            - itemId of the User
     *
     */
    public function setCommentId($commentId) {
        $this->commentId = $commentId;
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
    public function setStatus($tatus) {
        $this->status = $status;
    }

    /**
     * Returns the reviewId of the User.
     *
     * @return the reviewId of the User.
     */
    public function getReviewId() {
        return $this->reviewId;
    }

    /**
     * Sets the reviewId of the User.
     *
     * @param reviewId
     *            - reviewId of the User
     *
     */
    public function setReviewId($reviewId) {
        $this->reviewId = $this->reviewId;
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
     * Returns the rating given by the User.
     *
     * @return the rating given by the User.
     */
    public function getRating() {
        return $this->rating;
    }

    /**
     * Sets the rating given by the User.
     *
     * @param rating
     *            - rating given by the User
     *
     */
    public function setRating($rating) {
        $this->rating = $rating;
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
     * Returns the User Response in JSON format.
     *
     * @return the response in JSON format.
     *
     */
    public function getStringView() {
        return "UserId :" . $this->userId . " : ItemId : " . $this->itemId . " : Status : " . $this->status . " : ReviewId : " . $this->reviewId . " : Comment : " . $this->comment . " : Rating : " . $this->rating . " : CreatedOn : " . $this->createdOn." : CommentId : " . $this->commentId;
    }

}
?>
