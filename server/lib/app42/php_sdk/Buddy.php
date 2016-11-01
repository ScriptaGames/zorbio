<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

include_once "App42Response.php";

class Buddy extends App42Response {

    public $userName;
    public $buddyName;
    public $groupName;
    public $ownerName;
    public $message;
    public $sendedOn;
    public $acceptedOn;
    public $messageId;
    public $point = array();
    public $buddyList = array();

    public function getMessageId() {
        return $this->messageId;
    }

    public function setMessageId($messageId) {
        $this->messageId = $messageId;
    }

    public function getPointList() {
        return $this->point;
    }

    public function setPointList($point) {
        $this->point = $point;
    }

    public function getGroupName() {
        return $this->groupName;
    }

    public function setGroupName($groupName) {
        $this->groupName = $groupName;
    }

    public function getUserName() {
        return $this->userName;
    }

    public function setOwnerName($ownerName) {
        $this->ownerName = $ownerName;
    }

    public function getOwnerName() {
        return $this->ownerName;
    }

    public function setUserName($userName) {
        $this->userName = $userName;
    }

    public function getBuddyName() {
        return $this->buddyName;
    }

    public function setBuddyName($buddyName) {
        $this->buddyName = $buddyName;
    }

    public function getMessage() {
        return $this->message;
    }

    public function setMessage($message) {
        $this->message = $message;
    }

    public function getAcceptedOn() {
        return $this->acceptedOn;
    }

    public function setAcceptedOn($acceptedOn) {
        $this->acceptedOn = $acceptedOn;
    }

    public function getSendedOn() {
        return $this->sendedOn;
    }

    public function setSendedOn($sendedOn) {
        $this->sendedOn = $sendedOn;
    }

    public function toString() {
        return $this->getStrResponse();
    }

    public function getBuddyList() {
        return $this->buddyList;
    }

    public function setBuddyList($buddyList) {
        $this->buddyList = $buddyList;
    }

}

class BuddyPoint {

    public function __construct(Buddy $buddy) {
        array_push($buddy->point, $this);
    }

    public $latitude;
    public $longitude;
    public $markerName;
    public $createdOn;
    public $buddyName;

    public function getCreatedOn() {
        return $this->createdOn;
    }

    public function setCreatedOn($createdOn) {
        $this->createdOn = $createdOn;
    }

    public function getLatitude() {
        return $this->latitude;
    }

    public function setLatitude($latitude) {
        $this->latitude = $latitude;
    }

    public function getLongitude() {
        return $this->longitude;
    }

    public function setLongitude($longitude) {
        $this->longitude = $longitude;
    }

    public function getMarkerName() {
        return $this->markerName;
    }

    public function setMarkerName($markerName) {
        $this->markerName = $markerName;
    }

    public function getBuddyName() {
        return $this->buddyName;
    }

    public function setBuddyName($buddyName) {
        $this->buddyName = $buddyName;
    }

    public function getJSONObject() {
        $obj = new JSONObject();
        $obj->put("latitude", $this->latitude);
        $obj->put("longitude", $this->longitude);
        $obj->put("markerName", $this->marker);

        return $obj;
    }

}
?>
