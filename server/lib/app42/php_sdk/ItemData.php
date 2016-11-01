<?php

/**
 *
 * This ItemData object is the value object which contains the properties of
 * ItemData along with the setter & getter for those properties.
 *
 */
class ItemData {

    public $itemId;
    public $name;
    public $description;
    public $image;
    public $price;

    /**
     * Returns the itemId of the Catalogue.
     *
     * @return the itemId of the Catalogue.
     */
    public function getItemId() {
        return itemId;
    }

    /**
     * Sets the itemId of the Catalogue.
     *
     * @param itemId
     *            - itemId of the Catalogue
     *
     */
    public function setItemId($itemId) {
        $this->itemId = $itemId;
    }

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
     * @param name
     *            - Name of the Catalogue
     *
     */
    public function setName($name) {
        $this->name = $name;
    }

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
     * @param description
     *            - description of the Catalogue
     *
     */
    public function setDescription($description) {
        $this->description = $description;
    }

    /**
     * Returns the image of the Item in Catalogue.
     *
     * @return the image of the Item.
     */
    public function getImage() {
        return $this->image;
    }

    /**
     * Sets the image of the Item in Catalogue.
     *
     * @param image
     *            - image of the Item
     *
     */
    public function setImage($image) {
        $this->image = $image;
    }

    /**
     * Returns the price of the Item in Catalogue.
     *
     * @return the price of the Item.
     */
    public function getPrice() {
        return $this->price;
    }

    /**
     * Sets the price of the Item in Catalogue.
     *
     * @param price
     *            - price of the Item
     *
     */
    public function setPrice($price) {
        $this->price = $price;
    }

}
?>