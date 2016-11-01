<?php 
/*  File Name : App42NotFoundException.php
 *  Description : To calculate charges
 *  Author : Sushil Singh  04-02-2011
 */

include_once 'App42Exception.php';

class App42NotFoundException extends App42Exception{
	
	    /**
         * Constructor which takes message, httpErrorCode and the appErrorCode
	 * @param detailMessage
         * @param httpErrorCode
         * @param appErrorCode
	 */
	public function __construct($detailMessage, $httpErrorCode, $appErrorCode) {
		parent::__construct($detailMessage, $httpErrorCode, $appErrorCode);
	}
	
}

?>
