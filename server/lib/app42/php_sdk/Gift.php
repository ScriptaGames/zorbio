<?php

include_once "App42Response.php";
/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of Gift
 */
class Gift extends App42Response {

    public $name;
    public $displayName;
    public $icon;
    public $description;
    public $tag;
    public $createdOn;
    public $request = array();

    public function toString() {
        return $this->getStrResponse();
    }

    public function getCreatedOn() {
        return $this->createdOn;
    }

    public function setCreatedOn($createdOn) {
        $this->createdOn = $createdOn;
    }

    public function getName() {
        return $this->name;
    }

    public function setName($name) {
        $this->name = $name;
    }

    public function getDisplayName() {
        return $this->displayName;
    }

    public function setDisplayName($displayName) {
        $this->displayName = $displayName;
    }

    public function getIcon() {
        return $this->icon;
    }

    public function setIcon($icon) {
        $this->icon = $icon;
    }

    public function getDescription() {
        return $this->description;
    }

    public function setDescription($description) {
        $this->description = $description;
    }

    public function getTag() {
        return $this->tag;
    }

    public function setTag($tag) {
        $this->tag = $tag;
    }

    public function getRequestsList() {
        return $this->request;
    }

    public function setRequestsList($request) {
        $this->request = $request;
    }

}

class Requests {

    public $sender;
    public $recipient;
    public $expiration;
    public $sentOn;
    public $requestId;
    public $type;
    public $message;
    public $receivedOn;

    public function __construct(Gift $gift) {

        array_push($gift->request, $this);
    }

    public function toString() {
        return $this->getStrResponse();
    }

    public function getSentOn() {
        return $this->sentOn;
    }

    public function setSendedOn($sentOn) {
        $this->sentOn = $sentOn;
    }

    public function getExpiration() {
        return $this->expiration;
    }

    public function setExpiration($expiration) {
        $this->expiration = $expiration;
    }

    public function getType() {
        return $this->type;
    }

    public function setType($type) {
        $this->type = $type;
    }

    public function getSender() {
        return $this->sender;
    }

    public function setSender($sender) {
        $this->sender = $sender;
    }

    public function getRecipient() {
        return $this->recipient;
    }

    public function setRecipient($recipient) {
        $this->recipient = $recipient;
    }

    public function getRequestId() {
        return $this->requestId;
    }

    public function setRequestId($requestId) {
        $this->requestId = $requestId;
    }

    public function getMessage() {
        return $this->message;
    }

    public function setMessage($message) {
        $this->message = $message;
    }

    public function getReceivedOn() {
        return $this->receivedOn;
    }

    public function setReceivedOn($receivedOn) {
        $this->receivedOn = $receivedOn;
    }

}

?>
