<?php
/*  File Name : UploadFileType.php
 *  Author : Shashank Shukla  05-10-2012
 * This define the type of the device that can be stored.
 */
class DeviceType {
    
    
	const ANDROID = "ANDROID";
	const iOS = "iOS";
	const WP7 = "WP7";
	const NOKIAX = "NokiaX";
        public function enum($string){
        return constant('DeviceType::'.$string);
    }
    
	public function isAvailable($string){
                if($string == "ANDROID")
		return "ANDROID";
		else if($string == "iOS")
		return "iOS";
                else if($string == "WP7")
		return "WP7";
                else if($string == "NokiaX")
		return "NokiaX";
		else
		return "null";
    }
}
?>
