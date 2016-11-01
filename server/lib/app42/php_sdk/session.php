<?php


include_once "App42Response.php";

/**
 *
 * This Session object is the value object which contains the properties of
 * Session along with the setter & getter for those properties.
 *
 */
class Session extends App42Response {

    public $userName;
    public $sessionId;
    public $createdOn;
    public $invalidatedOn;
    public $attributeList = array();

    /**
     * Returns the userName for the session.
     *
     * @return the userName.
     */
    public function getUserName() {
        return $this->userName;
    }

    /**
     * Sets the user name for the session.
     *
     * @param userName
     *            - userName of the session
     *
     */
    public function setUserName($userName) {
        $this->userName = $userName;
    }

    /**
     * Returns the sessionId for the session.
     *
     * @return the sessionId information.
     */
    public function getSessionId() {
        return $this->sessionId;
    }

    /**
     * Sets the session Id for the session.
     *
     * @param sessionId
     *            - sessionId of the session
     *
     */
    public function setSessionId($sessionId) {
        $this->sessionId = $sessionId;
    }

    /**
     * Returns the time, date and day the session was created on.
     *
     * @return the createdOn information.
     */
    public function getCreatedOn() {
        return $this->createdOn;
    }

    /**
     * Sets the createdOn for the session.
     *
     * @param createdOn
     *            - session information on when it was created
     *
     */
    public function setCreatedOn($createdOn) {
        $this->createdOn = $createdOn;
    }

    /**
     * Returns the invalidatedOn information for the session.
     *
     * @return the invalidatedOn information.
     */
    public function getInvalidatedOn() {
        return $this->invalidatedOn;
    }

    /**
     * Sets the invalidatedOn for the session.
     *
     * @param invalidatedOn
     *            - invalidatedOn of the session
     *
     */
    public function setInvalidatedOn($invalidatedOn) {
        $this->invalidatedOn = $invalidatedOn;
    }

    /**
     * Returns the List of the Attributed for the Session.
     *
     * @return the attributeList information.
     */
    public function getAttributeList() {
        return $this->attributeList;
    }

    /**
     * Sets the user name for the Session.
     *
     * @param attributeList
     *            - attributeList of the Session
     *
     */
    public function setAttributeList($attributeList) {
        $this->attributeList = $attributeList;
    }

}

/**
 * An inner class that contains the remaining properties of the Session.
 *
 */
class Attribute {

    public $name;
    public $value;

    public function __construct(Session $session) {
        array_push($session->attributeList, $this);
    }

    /**
     * Returns the name of the attribute.
     *
     * @return the name of the attribute.
     */
    public function getName() {
        return $this->name;
    }

    /**
     * Sets the name for the attribute.
     *
     * @param userName
     *            - name of the attribute
     *
     */
    public function setName($name) {
        $this->name = $name;
    }

    /**
     * Returns the value of the session.
     *
     * @return the value of the session.
     */
    public function getValue() {
        return $this->value;
    }

    /**
     * Sets the value for the session.
     *
     * @param value
     *            - value of the session
     *
     */
    public function setValue($value) {
        $this->value = $value;
    }

}
?>