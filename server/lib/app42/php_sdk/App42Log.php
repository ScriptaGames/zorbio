<?php 
/*  File Name : App42Exception.php
 *  Description : To handle exceptions
 *  Author : Sushil Singh  10-03-2012
 */

class App42Log {
	
	
	private static $debug = "false";
	
	public static function isDebug() {
		return App42Log::$debug;
	}

	public static function setDebug($debug) {
		App42Log::$debug = $debug;
	}

	public static function info($msg) {
		print_r($msg);
	}
	
	public static function debug($msg) {
		if(App42Log::$debug)
		print_r($msg);
	}
	
	public static function error($msg) {
		print_r($msg);
	}
	
	public static function fatal($msg) {
		print_r($msg);
	}
	 
}

?>
