<?php


include_once "App42Response.php";

/**
 * 
 * This Cart object is the value object which contains the properties of Cart
 * along with the setter & getter for those properties.
 *
 */
class Cart extends App42Response {

    public $userName;
    public $cartId;
    public $creationTime;
    public $checkOutTime;
     public $checkOutDate;
    public $state;
    public $isEmpty;
    public $cartSession;
    public $totalAmount;
    public $itemList = array();
    public $payment;

    /**
     * Returns the name of the User.
     *
     * @return the userName.
     */
    public function getUserName() {
        return $this->userName;
    }

    /**
     * Sets the user name for the User.
     *
     * @params userName
     *            - userName of the User
     *
     */
    public function setUserName($userName) {
        $this->userName = $userName;
    }

    /**
     * Returns the ID of the cart.
     *
     * @return the cartId.
     */
    public function getCartId() {
        return $this->cartId;
    }

    /**
     * Sets the cartId for the User.
     *
     * @params cartId
     *            - cartId of the User
     *
     */
    public function setCartId($cartId) {
        $this->cartId = $cartId;
    }

    /**
     * Returns the creation time of the cart.
     *
     * @return the creationTime.
     */
    public function getCreationTime() {
        return $this->creationTime;
    }

    /**
     * Sets the creationTime for the Cart.
     *
     * @params creationTime
     *            - creationTime of the Cart
     *
     */
    public function setCreationTime($creationTime) {
        $this->creationTime = $creationTime;
    }

    /**
     * Returns the check out time of cart.
     *
     * @return the checkOutTime.
     */
    public function getCheckOutTime() {
        return $this->checkOutTime;
    }

    /**
     * Sets the checkOutTime for the Cart.
     *
     * @params checkOutTime
     *            - checkOutTime of the Cart
     *
     */
    public function setCheckOutTime($checkOutTime) {
        $this->checkOutTime = $checkOutTime;
    }

    /**
     * Returns the state of the cart.
     *
     * @return the cart state.
     */
    public function getState() {
        return $this->state;
    }

    /**
     * Sets the state for the Cart.
     *
     * @params state
     *            - state of the Cart
     *
     */
    public function setState($state) {
        $this->state = $state;
    }

    /**
     * Returns true or false as per the cart information whether it's empty or
     * not.
     *
     * @return true if cart is empty, false if cart is not empty.
     */
    public function isEmpty() {
        if ($this->isEmpty == 1)
            return "true";
        else
            return "false";
        //return $this->isEmpty;
    }

    /**
     * Sets the state whether the cart is empty or not
     *
     * @params isEmpty
     *            - Check whether it's empty or not
     *
     * @returns true if empty and false if not
     */
    public function setIsEmpty($isEmpty) {
        $this->isEmpty = $isEmpty;
    }

    /**
     * Returns the session of the Cart.
     *
     * @return the cartSession.
     */
    public function getCartSession() {
        return $this->cartSession;
    }

    /**
     * Sets the cartSession for the Cart.
     *
     * @params cartSession
     *            - cartSession for the Cart
     *
     */
    public function setCartSession($cartSession) {
        $this->cartSession = $cartSession;
    }

    /**
     * Returns the total amount of cart.
     *
     * @return the total amount of purchase.
     */
    public function getTotalAmount() {
        return $this->totalAmount;
    }

    /**
     * Sets the totalAmount of the Cart.
     *
     * @params totalAmount
     *            - totalAmount of the Cart
     *
     */
    public function setTotalAmount($totalAmount) {
        $this->totalAmount = $totalAmount;
    }

    /**
     * Returns the list of all the items in the cart.
     *
     * @return the itemList.
     */
    public function getItemList() {
        return $this->itemList;
    }

    /**
     * Sets the itemList of Cart.
     *
     * @params itemList
     *            - List of items in cart
     *
     */
    public function setItemList($itemList) {
        $this->itemList = $itemList;
    }

    /**
     * Returns the payment information for the cart.
     *
     * @return the payment information.
     */
    public function getPayment() {
        return $this->payment;
    }

    /**
     * Sets the payment of the Cart.
     *
     * @params payment
     *            - payment of the Cart
     *
     */
    public function setPayment($payment) {
        $this->payment = $payment;
    }

    
      public function getCheckOutDate() {
        return $this->checkOutDate;
    }

    /**
     * Sets the cartId for the User.
     *
     * @params checkOutDate
     *            - checkOutDate of the User
     *
     */
    public function setCheckOutDate($checkOutDate) {
        $this->checkOutDate = $checkOutDate;
    }

}

/**
 * An inner class that contains the remaining properties of the Cart.
 *
 */
class Item {

    /**
     * This is a constructor that takes no parameter
     *
     */
    public function __construct(Cart $cart) {
        array_push($cart->itemList, $this);
    }

    public $itemId;
    public $quantity;
    public $name;
    public $image;
    public $price;
    public $totalAmount;

    /**
     * Returns the ID of items purchased.
     *
     * @return the itemId.
     */
    public function getItemId() {
        return $this->itemId;
    }

    /**
     * Sets the itemId for the items in Cart.
     *
     * @params itemId
     *            - itemId of the Items
     *
     */
    public function setItemId($itemId) {
        $this->itemId = $itemId;
    }

    /**
     * Returns the number of items purchased i.e Quantity in cart.
     *
     * @return the quantity.
     */
    public function getQuantity() {
        return $this->quantity;
    }

    /**
     * Sets the quantity of the Cart.
     *
     * @params quantity
     *            - quantity in the Cart
     *
     */
    public function setQuantity($quantity) {
        $this->quantity = $quantity;
    }

    /**
     * Returns the name of the item.
     *
     * @return the name of the item.
     */
    public function getName() {
        return $this->name;
    }

    /**
     * Sets the name of the Item in cart.
     *
     * @params name
     *            - name of the Item
     *
     */
    public function setName($name) {
        $this->name = $name;
    }

    /**
     * Returns the image for the item.
     *
     * @return the image for the Item.
     */
    public function getImage() {
        return $this->image;
    }

    /**
     * Sets the image of the Item.
     *
     * @params image
     *            - image of the Item
     *
     */
    public function setImage($image) {
        $this->image = $image;
    }

    /**
     * Returns the price of the item in cart.
     *
     * @return the price of the item.
     */
    public function getPrice() {
        return $this->price;
    }

    /**
     * Sets the price of the Item in Cart.
     *
     * @params price
     *            - price of the Item
     *
     */
    public function setPrice($price) {
        $this->price = $price;
    }

    /**
     * Returns the total amount of the cart.
     *
     * @return the total amount.
     */
    public function getTotalAmount() {
        return $this->totalAmount;
    }

    /**
     * Sets the totalAmount of the Cart.
     *
     * @params totalAmount
     *            - totalAmount of the Cart
     *
     */
    public function setTotalAmount($totalAmount) {
        $this->totalAmount = $totalAmount;
    }

    /**
     * Returns the Cart Response in JSON format.
     *
     * @return the response in JSON format.
     *
     */
    public function toString() {
        return " name : " . $this->name . " : itemId : " . $this->itemId . " : price : " . $this->price . " : quantity : " . $this->quantity;
    }

}

/**
 * An inner class that contains the remaining properties of the Cart.
 *
 */
class Payment {

    /**
     * This is a constructor that takes no parameter
     *
     */
    public function __construct(Cart $cart) {
        $cart->payment = $this;
    }

    public $transactionId;
    public $totalAmount;
    public $status;
    public $date;

    /**
     * Returns the transaction Id of Payment.
     *
     * @return the transactionId.
     */
    public function getTransactionId() {
        return $this->transactionId;
    }

    /**
     * Sets the transactionId of the Payment made.
     *
     * @params transactionId
     *            - transactionId of the Payment
     *
     */
    public function setTransactionId($transactionId) {
        $this->transactionId = $transactionId;
    }

    /**
     * Returns the total amount of cart.
     *
     * @return the total amount.
     */
    public function getTotalAmount() {
        return $this->totalAmount;
    }

    /**
     * Sets the totalAmount that has to be paid.
     *
     * @params totalAmount
     *            - totalAmount that has to be paid.
     *
     */
    public function setTotalAmount($totalAmount) {
        $this->totalAmount = $totalAmount;
    }

    /**
     * Returns the status mode of payment.
     *
     * @return the status of payment.
     */
    public function getStatus() {
        return $this->status;
    }

    /**
     * Sets the status for the Payment.
     *
     * @params status
     *            - status of the Payment
     *
     */
    public function setStatus($status) {
        $this->status = $status;
    }

    /**
     * Returns the date when the transaction was done.
     *
     * @return the transaction date.
     */
    public function getDate() {
        return $this->date;
    }

    /**
     * Sets the date when the transaction was done.
     *
     * @params date
     *            - date of the transaction
     *
     */
    public function setDate($date) {
        $this->date = $date;
    }

}
?>