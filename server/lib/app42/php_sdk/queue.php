<?php


include_once "App42Response.php";

/**
 *
 * This Queue object is the value object which contains the properties of Queue
 * along with the setter & getter for those properties.
 *
 */
class Queue extends App42Response {

    public $queueName;
    public $queueType;
    public $description;

    /**
     * Returns the description of the queue.
     * 
     * @return the description of the queue.
     */
    public function getDescription() {
        return $this->description;
    }

    /**
     * Sets the description of the queue.
     *
     * @param description
     *            - description of the queue.
     *
     */
    public function setDescription($description) {
        $this->description = $description;
    }

    public $messageList = array();

    /**
     * Returns the name of the queue.
     *
     * @return the name of the queue.
     */
    public function getQueueName() {
        return $this->queueName;
    }

    /**
     * Sets the name of the queue.
     *
     * @param queueName
     *            - name of the queue.
     *
     */
    public function setQueueName($queueName) {
        $this->queueName = $queueName;
    }

    /**
     * Returns the type of the message in queue.
     *
     * @return the type of the message in queue.
     */
    public function getQueueType() {
        return $this->queueType;
    }

    /**
     * Sets the type of the message in queue.
     *
     * @param queueType
     *            - the type of the message in queue.
     *
     */
    public function setQueueType($queueType) {
        $this->queueType = $queueType;
    }

    /**
     * Returns the list of all the messages in the queue.
     *
     * @return the list of all the messages in the queue.
     */
    public function getMessageList() {
        return $this->messageList;
    }

    /**
     * Sets the list of all the messages in the queue.
     *
     * @param messageList
     *            - list of all the messages in the queue.
     *
     */
    public function setMessageList($messageList) {
        $this->messageList = $messageList;
    }

}

/**
 * An inner class that contains the remaining properties of the Queue.
 *
 */
class QueueMessage {

    /**
     * This is a constructor.
     *
     */
    public function __construct(Queue $queue) {
        array_push($queue->messageList, $this);
    }

    public $correlationId;
    public $payLoad;
    public $messageId;

    /**
     * Returns the correlationId of the messages in queue.
     *
     * @return the correlationId of the messages in queue.
     */
    public function getCorrelationId() {
        return $this->correlationId;
    }

    /**
     * Sets the correlationId of the messages in queue.
     *
     * @param correlationId
     *            - correlationId of the messages in queue.
     *
     */
    public function setCorrelationId($correlationId) {
        $this->correlationId = $correlationId;
    }

    /**
     * Returns the payLoad of the messages in queue.
     *
     * @return the payLoad of the messages in queue.
     */
    public function getPayLoad() {
        return $this->payLoad;
    }

    /**
     * Sets the payLoad of the messages in queue.
     *
     * @param payLoad
     *            - payLoad of the messages in queue.
     *
     */
    public function setPayLoad($payLoad) {
        $this->payLoad = $payLoad;
    }

    /**
     * Returns the messageId of the messages in queue.
     *
     * @return the messageId of the messages in queue.
     */
    public function getMessageId() {
        return $this->messageId;
    }

    /**
     * Sets the messageId of the messages in queue.
     *
     * @param messageId
     *            - messageId of the messages in queue.
     *
     */
    public function setMessageId($messageId) {
        $this->messageId = $messageId;
    }

    /**
     * Returns the Queue Response in JSON format.
     *
     * @return the response in JSON format.
     *
     */
    public function toString() {
        return " correlationId : " . $this->correlationId . " : payLoad : " . $this->payLoad . " : messageId : " . $this->messageId;
    }

}
?>