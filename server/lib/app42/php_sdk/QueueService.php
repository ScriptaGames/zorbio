<?php

include_once 'RestClient.class.php';
include_once 'Util.php';
include_once 'QueueResponseBuilder.php';
include_once 'App42Response.php';
include_once 'App42Exception.php';
include_once 'App42Log.php';
include_once 'App42Service.php';
/**
 * Manages Asynchronous queues. Allows to create, delete, purge messages, view pending messages and
 * get all messages
 * 
 */
class QueueService extends App42Service {

    protected $version = "1.0";
    protected $resource = "queue";
    private $messageResource = "message";
    protected $content_type = "application/json";
    protected $accept = "application/json";

    /**
     * this is a constructor that takes
     * @param  apiKey
     * @param  secretKey
     * @param  baseURL
     *
     */
    public function __construct($apiKey, $secretKey) {
        //$this->resource = "charge";
        $this->apiKey = $apiKey;
        $this->secretKey = $secretKey;
        $this->url =  $this->version . "/" . $this->resource;
        $this->messageUrl = $this->version . "/" . $this->messageResource;
    }

    /**
     * Creates a type Pull Queue
     *  @param queueName The name of the queue which has to be created
     *  @param queueDescription The description of the queue
     *  @return Queue object containing queue name which has been created
     */
    function createPullQueue($queueName, $queueDescription) {
        Util::throwExceptionIfNullOrBlank($queueName, "Queue Name");
        Util::throwExceptionIfNullOrBlank($queueDescription, "Queue Description");
        $objUtil = new Util($this->apiKey, $this->secretKey);

        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $signParams['type'] = "pull";
            $body = null;
            $body = '{"app42":{"queue":{"name":"' . $queueName . '","description":"' . $queueDescription . '"}}}';
            $signParams['body'] = $body;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/pull";
            $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
            $queueResponseObj = new QueueResponseBuilder();
            $queueObj = $queueResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $queueObj;
    }

    /**
     * Deletes the Pull type Queue
     *  @param queueName The name of the queue which has to be deleted
     *  @return App42Response if deleted successfully 
     */
    function deletePullQueue($queueName) {

        Util::throwExceptionIfNullOrBlank($queueName, "Queue Name");
        $encodedQueueName = Util::encodeParams($queueName);
        $responseObj = new App42Response();
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $signParams['type'] = 'pull';
            $signParams['queueName'] = $queueName;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/pull/" . $encodedQueueName;
            $response = RestClient::delete($baseURL, $params, null, null, $contentType, $accept, $headerParams);
           $responseObj->setStrResponse($response->getResponse());
            $responseObj->setResponseSuccess(true);
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $responseObj;
    }

    /**
     * Purges message on the Queue. Note: once the Queue is purged the messages
     *  are removed from the Queue and wont be available for dequeueing.
     *  @param queueName The name of the queue which has to be purged
     *  @return Queue object containing queue name which has been purged 
     */
    function purgePullQueue($queueName) {

        Util::throwExceptionIfNullOrBlank($queueName, "Queue Name");
        $encodedQueueName = Util::encodeParams($queueName);
        $responseObj = new App42Response();
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $signParams['type'] = 'pull';
            $signParams['queueName'] = $queueName;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/pull/purge/" . $encodedQueueName;
            $response = RestClient::delete($baseURL, $params, null, null, $contentType, $accept, $headerParams);
            $responseObj->setStrResponse($response->getResponse());
            $responseObj->setResponseSuccess(true);
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $responseObj;
    }

    /**
     * Messages which are pending to be dequeue. Note: Calling this method does not
     *  dequeue the messages in the Queue. The messages stay in the Queue till they are dequeued
     *  @param queueName The name of the queue from which pending messages have to be fetched
     *  @return Queue object containing pending messages in the Queue
     */
    function pendingMessages($queueName) {

        Util::throwExceptionIfNullOrBlank($queueName, "Queue Name");
        $encodedQueueName = Util::encodeParams($queueName);
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $signParams['queueName'] = $queueName;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/pending/" . $encodedQueueName;
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept,$headerParams);
            $queueResponseObj = new QueueResponseBuilder();
            $queueObj = $queueResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $queueObj;
    }

    /**
     * Messages are retrieved and dequeued from the Queue. 
     *  @param queueName The name of the queue which have to be retrieved
     *  @param receiveTimeOut Receive time out
     *  @return Queue object containing messages in the Queue
     */
    function getMessages($queueName, $receiveTimeOut) {

        Util::throwExceptionIfNullOrBlank($queueName, "Queue Name");
        Util::throwExceptionIfNullOrBlank($receiveTimeOut, "Receive Time Out");
        $encodedQueueName = Util::encodeParams($queueName);
        $encodedReceiveTimeOut = Util::encodeParams($receiveTimeOut);
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $signParams['queueName'] = $queueName;
            $signParams['receiveTimeOut'] = $receiveTimeOut;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/messages/" . $encodedQueueName . "/" . $encodedReceiveTimeOut;
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept,$headerParams);
            $queueResponseObj = new QueueResponseBuilder();
            $queueObj = $queueResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $queueObj;
    }

    // Message Service Method Start

    /**
     * Send message on the queue with an expiry. The message will expire if it is not pulled/dequeued before the expiry
     *  @param queueName The name of the queue to which the message has to be sent
     *  @param msg Message that has to be sent
     *  @param exp Message expiry time
     *  @return Queue object containing message which has been sent with its message id and correlation id
     */
    function sendMessage($queueName, $msg, $exp) {

        Util::throwExceptionIfNullOrBlank($queueName, "Queue Name");
        Util::throwExceptionIfNullOrBlank($msg, "Message");
        Util::throwExceptionIfNullOrBlank($exp, "Exipiration");
        $encodedQueueName = Util::encodeParams($queueName);

        $objUtil = new Util($this->apiKey, $this->secretKey);

        try {
		     $params = null;
             $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $signParams['queueName'] = $queueName;
            $body = null;
            $body = '{"app42":{"payLoad":{"message":"' . $msg . '","expiration":' . $exp . '}}}';
            $signParams['body'] = $body;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $this->messageUrl . "/" . $encodedQueueName;
            $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body,$headerParams);
            $queueResponseObj = new QueueResponseBuilder();
            $queueObj = $queueResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $queueObj;
    }

    /**
     * Pulls all the message from the queue
     *  @param queueName The name of the queue from which messages have to be pulled
     *  @param receiveTimeOut Receive time out
     *  @return Queue object containing  messages which have been pulled
     */
    function receiveMessage($queueName, $receiveTimeOut) {

        Util::throwExceptionIfNullOrBlank($queueName, "Queue Name");
        Util::throwExceptionIfNullOrBlank($receiveTimeOut, "Receive Time Out");
        $encodedQueueName = Util::encodeParams($queueName);
        $encodedReceiveTimeOut = Util::encodeParams($receiveTimeOut);
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $signParams['queueName'] = $queueName;
            $signParams['receiveTimeOut'] = $receiveTimeOut;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $this->messageUrl . "/" . $encodedQueueName . "/" . $encodedReceiveTimeOut;
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept,$headerParams);
            $queueResponseObj = new QueueResponseBuilder();
            $queueObj = $queueResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $queueObj;
    }

    /**
     * Pull message based on the correlation id
     *  @param queueName The name of the queue from which the message has to be pulled
     *  @param receiveTimeOut Receive time out
     *  @param correlationId Correlation Id for which message has to be pulled
     *  @return Queue containing  message which has pulled based on the correlation id
     */
    function receiveMessageByCorrelationId($queueName, $receiveTimeOut, $correlationId) {

        Util::throwExceptionIfNullOrBlank($queueName, "Queue Name");
        Util::throwExceptionIfNullOrBlank($receiveTimeOut, "Receive Time Out");
        Util::throwExceptionIfNullOrBlank($correlationId, "Correlation Id");
        $encodedQueueName = Util::encodeParams($queueName);
        $encodedReceiveTimeOut = Util::encodeParams($receiveTimeOut);
        $encodedCorrelationId = Util::encodeParams($correlationId);
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $signParams['queueName'] = $queueName;
            $signParams['receiveTimeOut'] = $receiveTimeOut;
            $signParams['correlationId'] = $correlationId;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $this->messageUrl . "/" . $encodedQueueName . "/" . $encodedReceiveTimeOut . "/" . $encodedCorrelationId;
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept,$headerParams);
            $queueResponseObj = new QueueResponseBuilder();
            $queueObj = $queueResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $queueObj;
    }

    /**
     * Remove message from the queue based on the message id. Note: Once the message is removed it cannot be pulled
     *  @param queueName The name of the queue from which the message has to be removed
     *  @param messageId The message id of the message which has to be removed.
     *  @return App42Response if removed successfully
     */
    function removeMessage($queueName, $messageId) {

        Util::throwExceptionIfNullOrBlank($queueName, "Queue Name");
        Util::throwExceptionIfNullOrBlank($messageId, "Message Id");
        $encodedQueueName = Util::encodeParams($queueName);
        $encodedMessageId = Util::encodeParams($messageId);
        $responseObj = new App42Response();
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $signParams['queueName'] = $queueName;
            $signParams['messageId'] = $messageId;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $this->messageUrl . "/" . $encodedQueueName . "/" . $encodedMessageId;
            $response = RestClient::delete($baseURL, $params, null, null, $contentType, $accept,$headerParams);
           $responseObj->setStrResponse($response->getResponse());
            $responseObj->setResponseSuccess(true);
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $responseObj;
    }

}
?>