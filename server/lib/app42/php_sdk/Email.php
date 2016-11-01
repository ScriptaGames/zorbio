<?php
include_once "App42Response.php";

/**
 *
 * This Email object is the value object which contains the properties of Email
 * along with the setter & getter for those properties.
 *
 */
class Email extends App42Response {

    public $from;
    public $to;
    public $subject;
    public $body;
    public $configList = array();

    /**
     * Returns the ID from where the email is received.
     *
     * @return the ID from where the email is received.
     */
    public function getFrom() {
        return $this->from;
    }

    /**
     * Sets the ID from where the email is received.
     *
     * @params from
     *            - ID from where the email is received.
     *
     */
    public function setFrom($from) {
        $this->from = $from;
    }

    /**
     * Returns the ID to whom the email has to be sent.
     *
     * @return the ID to whom the email has to be sent.
     */
    public function getTo() {
        return $this->to;
    }

    /**
     * Sets the ID to whom the email has to be sent.
     *
     * @params to
     *            - ID to whom the email has to be sent.
     *
     */
    public function setTo($to) {
        $this->to = $to;
    }

    /**
     * Returns the subject of the Email.
     *
     * @return the subject of the Email.
     */
    public function getSubject() {
        return $this->subject;
    }

    /**
     * Sets the subject of the Email.
     *
     * @params subject
     *            - subject of the Email.
     *
     */
    public function setSubject($subject) {
        $this->subject = $subject;
    }

    /**
     * Returns the body of the Email.
     *
     * @return the body of the Email.
     */
    public function getBody() {
        return $this->body;
    }

    /**
     * Sets the body of the Email.
     *
     * @params body
     *            - body of the Email.
     *
     */
    public function setBody($body) {
        $this->body = $body;
    }

    /**
     * Returns the list of email configuration.
     *
     * @return List of configuration of the email.
     *
     */
    public function getConfigList() {
        return $this->configList;
    }

    /**
     * Sets the configuration of email
     *
     * @params configList
     *            List of configuration of the email
     *
     */
    public function setConfigList($configList) {
        $this->configList = $configList;
    }

}

/**
 * An inner class that contains the remaining properties of the Email.
 *
 */
class Configuration {

    public $emailId;
    public $host;
    public $port;
    public $ssl;

    /**
     * This is a constructor .
     *
     */
    public function __construct(Email $email) {

        array_push($email->configList, $this);
    }

    /**
     * Returns the emailId of the User.
     *
     * @return the emailId.
     */
    public function getEmailId() {
        return $this->emailId;
    }

    /**
     * Sets the emailId of the User.
     * 
     * @params emailId
     *            - emailId of the User
     *
     */
    public function setEmailId($emailId) {
        $this->emailId = emailId;
    }

    /**
     * Returns the host of the Email.
     *
     * @return the host of the Email.
     */
    public function getHost() {
        return $this->host;
    }

    /**
     * Sets the host of the Email.
     *
     * @params host
     *            - host of the Email.
     *
     */
    public function setHost($host) {
        $this->host = $host;
    }

    /**
     * Returns the port of the Email.
     *
     * @return the port of the Email.
     */
    public function getPort() {
        return $this->port;
    }

    /**
     * Sets the port of the Email.
     *
     * @params port
     *            - port of the Email.
     *
     */
    public function setPort($port) {
        $this->port = $port;
    }

    /**
     * Returns the ssl of the Email.
     *
     * @return the ssl of the Email.
     */
    public function getSsl() {
        if ($this->ssl == 1)
            return "true";
        else
            return "false";
    }

    /**
     * Sets the ssl of the Email.
     * 
     * @params ssl
     *            - ssl of the Email.
     *
     */
    public function setSsl($ssl) {
        $this->ssl = $ssl;
    }

    /**
     * Returns the Email Response in JSON format.
     *
     * @return the response in JSON format.
     *
     */
    public function toString() {
        return "Email : " . $this->emailId . " : Host  : " . $this->host . " : port : " . $this->port . " : ssl : " . $this->ssl;
    }

}
?>