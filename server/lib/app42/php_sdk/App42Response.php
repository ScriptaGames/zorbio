<?php 

/*  File Name : App42Response.php
 *  Description : To handle exceptions
 *  Author : Sushil Singh  10-03-2012
 */

class App42Response {

	private $isResponseSuccess;
        private $strResponse;
        private $totalRecords = -1;

        public function getTotalRecords() {
		return $this->totalRecords;
	}

        public function setTotalRecords($totalRecords) {
		$this->totalRecords = $totalRecords;
	}
        
	public function getStrResponse() {
		return $this->strResponse;
	}

	public function setStrResponse($strResponse) {
		$this->strResponse = $strResponse;
	}

	public function isResponseSuccess() {
		if($this->isResponseSuccess == 1)
		return "true";
		else 
		return "false";
		//return $this->isResponseSuccess;
	}
        
	public function setResponseSuccess($isResponseSuccess) {
		$this->isResponseSuccess = $isResponseSuccess;
	}
            
	public function toString() {
		return $this->strResponse;;
	}
 
}

?>