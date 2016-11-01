<?php

include_once "App42Response.php";

/**
 * Centralize logging for your App. This service allows different levels e.g. info,
 * debug, fatal, error etc. to log a message and query the messages based on 
 * different parameters.
 * You can fetch logs based on module, level, message, date range etc.
 * 
 * This Log object is the value object which contains the properties of Log
 * along with the setter & getter for those properties.
 */
class Logging extends App42Response {

    public $messageList = array();

    /**
     * Returns the list of all the messages in the log.
     *
     * @return the list of all the messages in the log.
     */
    public function getMessageList() {
        return $this->messageList;
    }

    /**
     * Sets the list of all the messages in the log.
     *
     * @param messageList
     *            - list of all the messages in the log.
     *
     */
    public function setMessageList($messageList) {
        $this->messageList = $messageList;
    }

}

/**
 * An inner class that contains the remaining properties of the Log.
 *
 */
class Message {

    /**
     * This is a constructor that takes no parameter
     *
     */
    public function __construct(Logging $log) {
        array_push($log->messageList, $this);
    }

    public $message;
    public $type;
    public $logTime;
    public $module;

    /**
     * Returns the message in a log.
     *
     * @return the message in a log.
     */
    public function getMessage() {
        return $this->message;
    }

    /**
     * Sets the message in a log.
     *
     * @param message
     *            - the message in a log
     *
     */
    public function setMessage($message) {
        $this->message = $message;
    }

    /**
     * Returns the type of the message in the log.
     *
     * @return the type of the message in the log.
     */
    public function getType() {
        return $this->type;
    }

    /**
     * Sets the type of the message in the log.
     *
     * @param type
     *            - type of the message in the log.
     *
     */
    public function setType($type) {
        $this->type = $type;
    }

    /**
     * Returns the time the log was created.
     *
     * @return the log time it was created.
     */
    public function getLogTime() {
        return $this->logTime;
    }

    /**
     * Sets the time the log was created.
     *
     * @param logTime
     *            - the time the log was created.
     *
     */
    public function setLogTime($logTime) {
        $this->logTime = $logTime;
    }

    /**
     * Returns the appModule name.
     *
     * @return the appModule name
     */
    public function getModule() {
        return $this->module;
    }

    /**
     * Sets the the appModule name
     *
     * @param appModule
     *            - the appModule name
     *
     */
    public function setModule($appModule) {
        $this->module = $appModule;
    }

    /**
     * Returns the Log Response in JSON format.
     *
     * @return the response in JSON format.
     *
     */
    public function toString() {
        return "Message : " . $this->message . " : type : " . $this->type . " : AppModule : " . $this->module . " : logTime : " . $this->logTime;
    }

}
?>