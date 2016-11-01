<?php
include_once "App42Response.php";

/**
 *
 * This Catalogue object is the value object which contains the properties of
 * Catalogue along with the setter & getter for those properties.
 *
 */
class Catalogue extends App42Response {

    public $name;
    public $description;

    /**
     * Returns the description of the Catalogue.
     *
     * @return the description of the Catalogue.
     */
    public function getDescription() {
        return $this->description;
    }

    /**
     * Sets the description of the Catalogue.
     *
     * @params description
     *            - description of the Catalogue
     *
     */
    public function setDescription($description) {
        $this->description = $description;
    }

    public $categoryList = array();

    /**
     * Returns the name of the Catalogue.
     *
     * @return the name of the Catalogue.
     */
    public function getName() {
        return $this->name;
    }

    /**
     * Sets the name of the Catalogue.
     *
     * @params name
     *            - name of the Catalogue
     *
     */
    public function setName($name) {
        $this->name = $name;
    }

    /**
     * Returns the List of the Categories of the Catalogue.
     *
     * @return the categoryList of the Catalogue.
     */
    public function getCategoryList() {
        return $this->categoryList;
    }

    /**
     * Sets the categoryList of the Catalogue.
     *
     * @params categoryList
     *            - List of the categories of the Catalogue
     *
     */
    public function setCategoryList($categoryList) {
        $this->categoryList = $categoryList;
    }

}

/**
 * An inner class that contains the remaining properties of the Catalogue.
 *
 */
class Category {

    /**
     * This is a constructor that takes no parameter
     *
     */
    public function __construct(Catalogue $catalogue) {
        array_push($catalogue->categoryList, $this);
    }

    public $name;
    public $description;
    public $itemList = array();

    /**
     * Returns the description of the Category.
     *
     * @return the description of the Category.
     */
    public function getDescription() {
        return $this->description;
    }

    /**
     * Sets the description of the Category.
     *
     * @params description
     *            - description of the Category
     *
     */
    public function setDescription($description) {
        $this->description = $description;
    }

    /**
     * Returns the name of the Category.
     *
     * @return the name of the Category.
     */
    public function getName() {
        return $this->name;
    }

    /**
     * Sets the name of the Category.
     *
     * @params name
     *            - name of the Category
     *
     */
    public function setName($name) {
        $this->name = $name;
    }

    /**
     * Returns the list of all the Items of the Category.
     *
     * @return the itemList of the Category.
     */
    public function getItemList() {
        return $this->itemList;
    }

    /**
     * Sets the itemList of the Category.
     *
     * @params itemList
     *            - itemList of the Category
     *
     */
    public function setItemList($itemList) {
        $this->itemList = $itemList;
    }

    /**
     * Returns the Cart Response in JSON format.
     *
     * @return the response in JSON format.
     *
     */
    public function toString() {
        return " name : " . $this->name . " : description : " . $this->description;
    }

}

/**
 * An inner class that contains the remaining properties of the Catelogue.
 *
 */
class CatalogueItem {

    public function __construct(Category $category) {
        array_push($category->itemList, $this);
    }

    public $itemId;
    public $name;
    public $description;
    public $url;
    public $tinyUrl;
    public $price;

    /**
     * Returns the itemId of the Item.
     *
     * @return the itemId of the Item.
     */
    public function getItemId() {
        return $this->itemId;
    }

    /**
     * Sets the itemId of the Item.
     *
     * @params itemId
     *            - itemId of the Item
     *
     */
    public function setItemId($itemId) {
        $this->itemId = $itemId;
    }

    /**
     * Returns the name of the Item.
     *
     * @return the name of the Item.
     */
    public function getName() {
        return $this->name;
    }

    /**
     * Sets the name of the Item.
     *
     * @params name
     *            - name of the Item
     *
     */
    public function setName($name) {
        $this->name = $name;
    }

    /**
     * Returns the description of the Item.
     *
     * @return the description of the Item.
     */
    public function getDescription() {
        return $this->description;
    }

    /**
     * Sets the description of the Item.
     *
     * @params description
     *            - description of the Item
     *
     */
    public function setDescription($description) {
        $this->description = $description;
    }

    /**
     * Returns the url of the Item.
     *
     * @return the url of the Item.
     */
    public function getUrl() {
        return $this->url;
    }

    /**
     * Sets the url of the Item.
     *
     * @params url
     *            - url of the Item
     *
     */
    public function setUrl($url) {
        $this->url = $url;
    }

    /**
     * Returns the tinyUrl of the Item.
     *
     * @return the tinyUrl of the Item.
     */
    public function getTinyUrl() {
        return $this->tinyUrl;
    }

    /**
     * Sets the tinyUrl of the Item.
     *
     * @params tinyUrl
     *            - tinyUrl of the Item
     *
     */
    public function setTinyUrl($tinyUrl) {
        $this->tinyUrl = $tinyUrl;
    }

    /**
     * Returns the price of the Item.
     *
     * @return the price of the Item.
     */
    public function getPrice() {
        return $this->price;
    }

    /**
     * Sets the price of the Item.
     *
     * @params price
     *            - price of the Item
     *
     */
    public function setPrice($price) {
        $this->price = $price;
    }

    /**
     * Returns the Cart Response in JSON format.
     *
     * @return the response in JSON format.
     *
     */
    public function toString() {
        return " itemId : " . $this->itemId . " : name : " . $this->name . " : description : " . $this->description . " : url : " . $this->url . " : tinyUrl : " . $this->tinyUrl . " : price : " . $this->price;
    }

}
?>