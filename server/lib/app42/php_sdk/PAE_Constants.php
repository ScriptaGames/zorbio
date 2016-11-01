<?php
/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
class PAE_Constants {


	const API_KEYS = "apiKey";
	const VERSION = "version";
	const TIME_SATMP = "timeStamp";
        const LOG_TAG = "App42";
        const SESSION_ID = "sessionId";
        const ADMIN_KEY = "adminKey";
        const PAGE_OFFSET = "offset";
        const PAGE_MAX_RECORDS = "max";
        const DATA_ACL_HEADER = "dataACL";
        const SELECT_KEY_FLAG = "1";
        const SELECT_KEYS_HEADER = "selectKeys";
        const FB_ACCESS_TOKEN = "fbAccessToken";
        const GeoTag = "geoTag";


        public function enum($string){
        return constant('PAE_Constants::'.$string);
    }

	public function isAvailable($string){
                if($string == "API_KEYS")
                    return "apiKey";
		else if($string == "VERSION")
                    return "version";
                else if($string == "TIME_SATMP")
                    return "timeStamp";
                else if($string == "LOG_TAG")
                    return "App42";
                else if($string == "SESSION_ID")
                    return "sessionId";
                else if($string == "ADMIN_KEY")
                    return "adminKey";
                else if($string == "PAGE_OFFSET")
                    return "offset";
                else if($string == "PAGE_MAX_RECORDS")
                    return "max";
                else if($string == "DATA_ACL_HEADER")
                    return "dataACL";
                else if($string == "SELECT_KEY_FLAG")
                    return "1";
                else if($string == "SELECT_KEYS_HEADER")
                    return "selectKeys";
                else if($string == "FB_ACCESS_TOKEN")
                    return "fbAccessToken";
                else if($string == "GeoTag")
                    return "geoTag";
		else
		return "null";
    }
}
?>
