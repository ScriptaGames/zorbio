<?php
include_once "App42Response.php";

/**
 *
 * This Recommender object is the value object which contains the properties of
 * Recommender along with the setter & getter for those properties.
 *
 */
class Recommender extends App42Response {

    public $fileName;
    public $recommendedItemList = array();

    /**
     * Returns the recommended Item List for Recommender.
     *
     * @return the recommended Item List for Recommender.
     */
    public function getRecommendedItemList() {
        return $this->recommendedItemList;
    }

    /**
     * Sets the recommended Item List for Recommender.
     *
     * @param recommendedItemList
     *            - recommendedItemList for Recommender.
     *
     */
    public function setRecommendedItemList($recommendedItemList) {
        $this->recommendedItemList = $recommendedItemList;
    }

    /**
     * Returns the fileName of the Recommender.
     *
     * @return the fileName of the Recommender.
     */
    public function getFileName() {
        return $this->fileName;
    }

    /**
     * Sets the fileName of the Recommender.
     *
     * @param fileName
     *            - fileName of the Recommender
     *
     */
    public function setFileName($fileName) {
        $this->fileName = $fileName;
    }

}

/**
 * An inner class that contains the remaining properties of the Recommender.
 *
 */
class RecommendedItem {

    public $userId;
    public $item;
    public $value;

    public function __construct(Recommender $recommender) {
        array_push($recommender->recommendedItemList, $this);
    }

    /**
     * Returns the userId of the User.
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
     * Returns the item for the Recommended Item.
     *
     * @return the item for the Recommended Item.
     */
    public function getItem() {
        return $this->item;
    }

    /**
     * Sets the item for the Recommended Item.
     *
     * @param item
     *            - item for the Recommended Item
     *
     */
    public function setItem($item) {
        $this->item = $item;
    }

    /**
     * Returns the value for the Recommended Item.
     *
     * @return the value for the Recommended Item.
     */
    public function getValue() {
        return $this->value;
    }

    /**
     * Sets the value for the Recommended Item.
     *
     * @param value
     *            - value for the Recommended Item
     *
     */
    public function setValue($value) {
        $this->value = $value;
    }

    /**
     * Returns the Recommender Response in JSON format.
     *
     * @return the response in JSON format.
     *
     */
    public function toString() {
        return "userId : " . $this->userId . ": item : " . $this->item . " : value : " . $this->value;
    }

}
?>
