<?php 
/*  File Name : App42Exception.php
 *  Description : To handle exceptions
 *  Author : Sushil Singh  10-03-2012
 */

class App42Exception extends RuntimeException{
	
	private $httpErrorCode;
    private $appErrorCode;
	
	
	/**
         * Constructor which takes message, httpErrorCode and the appErrorCode
	 * @param detailMessage
         * @param httpErrorCode
         * @param appErrorCode
	 */
	 public function __construct() {
		$argv = func_get_args();
		switch(func_num_args())
		{
		default:
		case 1:
		self::App42Exception1($argv[0]);
		break;
		case 2:
		self::App42Exception2( $argv[0], $argv[1] );
		break;
		case 3:
		self::App42Exception3( $argv[0], $argv[1], $argv[2]);
		break;
		}
	}
	public function App42Exception1($detailMessage) {
		parent::__construct($detailMessage);
		
	}
	
	public function App42Exception2($httpErrorCode, $appErrorCode) {
		$this->httpErrorCode = $httpErrorCode;
		$this->appErrorCode = $appErrorCode;
	}
	
	public function App42Exception3($detailMessage, $httpErrorCode, $appErrorCode) {
		$this->detailMessage = $detailMessage;
                $this->httpErrorCode = $httpErrorCode;
		$this->appErrorCode = $appErrorCode;
              return parent::__construct($detailMessage, $httpErrorCode);
	}
	
        
	/**
	 * Sets the HttpErrorCode for the Exception
         * @param httpErrorCode The http error code e.g. 404, 500, 401 etc.
	 */
	public function setHttpErrorCode($httpErrorCode) {
		$this->httpErrorCode = $httpErrorCode;
	}
            
        /**
	 * Gets the HttpErrorCode for the Exception e.g. 404, 500, 401 etc.
         */
	public function getHttpErrorCode() {
		return $this->httpErrorCode;
	}
	/**
	 * Sets the AppErrorCode for the Exception
         * @param appErrorCode App error codes correspond to the error which specific to the service.
         *                     This error code can help App developers to take decisions and take action
         *                     when a particular error occurs for a service
	 */
	public function setAppErrorCode($appErrorCode) {
		$this->appErrorCode = $appErrorCode;
	}
            
        /**
	 * Gets the AppErrorCode for the Exception. App error codes correspond to the error which specific to the service.
         * This error code can help App developers to take decisions and take action
         * when a particular error occurs for a service 
         */
	public function getAppErrorCode() {
		return $this->appErrorCode;
	}
        
	
        
	
	
	 
}

?>
