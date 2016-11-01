<?php

 class PreferenceData {

	public $userId;
	public $itemId;
	public $preference;

	public function getUserId() {
		return $this->userId;
	}
	public function setUserId($userId) {
		$this->userId = $userId;
	}
	public function getItemId() {
		return $this->itemId;
	}
	public function setItemId($itemId) {
		$this->itemId = $itemId;
	}
	public function getPreference() {
		return $this->preference;
	}
	public function setPreference($preference) {
		$this->preference = $preference;
	}
}
?>
