<?php 

/*  File Name : UploadFileType.php
 *  Author : Sushil Singh  04-04-2011
 * This define the type of the file that can be uploaded.
 */
class UploadFileType {
    
    
	const AUDIO = "AUDIO";
	const VIDEO = "VIDEO";
	const IMAGE = "IMAGE";
	const BINARY = "BINARY";
	const TXT =    "TXT";
	const XML =    "XML";
	const CSV = "CSV";
	const JSON = "JSON";
	const OTHER = "OTHER";
	const HTML="text";
	
  	public function enum($string){
        return constant('com\shephertz\app42\paas\sdk\php\upload\UploadFileType::'.$string);
    }
    
	public function isAvailable($string){
        if($string == "AUDIO")
		return "AUDIO";
		else if($string == "VIDEO")
		return "VIDEO";
		else if($string == "IMAGE")
		return "IMAGE";
		else if($string == "BINARY")
		return "BINARY";
		else if($string == "TXT")
		return "TXT";
		else if($string == "XML")
		return "XML";
		else if($string == "CSV")
		return "CSV";
		else if($string == "JSON")
		return "JSON";
		else if($string == "OTHER")
		return "OTHER";
		else if($string == "HTML")
		return "text";
		else
		return "null";
    }
	
}

?>
