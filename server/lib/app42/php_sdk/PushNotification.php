<?php


include_once "App42Response.php";

class PushNotification extends App42Response {

    public $message;
    public $userName;
    public $expiry;
    public $deviceToken;
    public $type;
    public $state;
    public $channelList = array();

    public function getUserName() {
        return $this->userName;
    }

    public function setUserName($userName) {
        $this->userName = $userName;
    }

    public function getMessage() {
        return $this->message;
    }

    public function setMessage($message) {
        $this->message = $message;
    }

    public function getExpiry() {
        return $this->expiry;
    }

    public function setExpiry($expiry) {
        $this->expiry = $expiry;
    }

    public function getChannelList() {
        return $this->channelList;
    }

    public function setChannelList($channelList) {
        $this->channelList = $channelList;
    }

    public function getDeviceToken() {
         return $this->deviceToken;
	}

	public function setDeviceToken($deviceToken) {
            $this->deviceToken = $deviceToken;
	}
        public function getType() {
              return $this->type;
	}

	public function setType($type) {
             $this->type = $type;
	}

        public function getState() {
              return $this->state;
	}

	public function setState($state) {
             $this->state = $state;
	}
}

class Channel {

    public $channelName;
    public $description;

    public function __construct(PushNotification $pushNotification) {

        array_push($pushNotification->channelList, $this);
    }

    public function getName() {
        return $this->channelName;
    }

    public function setName($channelName) {
        $this->channelName = $channelName;
    }

    public function getDescription() {
        return $this->description;
    }

    public function setDescription($description) {
        $this->description = $description;
    }

}

?>
