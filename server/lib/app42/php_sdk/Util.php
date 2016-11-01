<?php

include_once 'App42BadParameterException.php';
include_once 'App42LimitException.php';
include_once 'App42NotFoundException.php';
include_once 'App42SecurityException.php';
include_once 'ConfigurationException.php';

/**
 * A Singleton class which holds all the configuration. Users of the App42 Cloud API.
 * should never need to use it directly. All methods which are required for the user
 * are available on ServiceAPI
 *
 */
class Util {

    /**
     * this is a constructor that takes
     * @param  apiKey
     * @param  secretKey
     *
     */
    public function __construct($apiKey, $secretKey) {
        $this->apiKey = $apiKey;
        $this->secretKey = $secretKey;
    }

    /**
     * Signs the request using HmacSha1
     * 
     * @param secretKey The key using which the signing has to be done
     * @param params The parameters which have to be signed
     */
    function sign($params) {
        $requestString = $this->sortAndConvertTableToString($params);
        return base64_encode(hash_hmac('sha1', $requestString, $this->secretKey, true));
    }

    /**
     * Sorts the table keys alphatabically
     * @param table Key Value pairs which are sent as a payload to the REST App42 Cloud API Server
     */
    function sortAndConvertTableToString($params) {
        ksort($params);
        $requestString = "";
        foreach ($params as $key => $val) {
            $requestString.=$key . $val;
        }
        return $requestString;
    }

    public static function throwExceptionIfNullOrBlank($obj, $name) {
        try {
            if (is_object($obj)) {
                $trm = $obj;
                if ($trm == null) {
                    throw new App42Exception($name . " parameter can not be null ");
                }
                if ($trm == "") {
                    throw new App42Exception($name . " parameter can not be blank ");
                }
            } else if (is_array($obj)) {
                $trm = $obj;
                if ($trm == null) {
                    throw new App42Exception($name . " parameter can not be null ");
                }
                if ($trm == "") {
                    throw new App42Exception($name . " parameter can not be blank ");
                }
            } else {
                $trm = trim($obj);
                if ($trm == null) {
                    throw new App42Exception($name . " parameter can not be null ");
                }
                if ($trm == "") {
                    throw new App42Exception($name . " parameter can not be blank ");
                }
            }
            //$trm = $obj;
            //echo $trm;
        } catch (App42Exception $e) {
            throw $e;
        }
    }

    /**
     * Validate Date 
     *
     */
    public static function validateDate($date, $format = 'YYYY-MM-DD') {

        switch ($format) {
            case 'YYYY/MM/DD':
            case 'YYYY-MM-DD':
                list( $y, $m, $d ) = preg_split('/[-\.\/ ]/', $date);
                break;

            case 'YYYY/DD/MM':
            case 'YYYY-DD-MM':
                list( $y, $d, $m ) = preg_split('/[-\.\/ ]/', $date);
                break;

            case 'DD-MM-YYYY':
            case 'DD/MM/YYYY':
                list( $d, $m, $y ) = preg_split('/[-\.\/ ]/', $date);
                break;

            case 'MM-DD-YYYY':
            case 'MM/DD/YYYY':
                list( $m, $d, $y ) = preg_split('/[-\.\/ ]/', $date);
                break;

            case 'YYYYMMDD':
                $y = substr($date, 0, 4);
                $m = substr($date, 4, 2);
                $d = substr($date, 6, 2);
                break;

            case 'YYYYDDMM':
                $y = substr($date, 0, 4);
                $d = substr($date, 4, 2);
                $m = substr($date, 6, 2);
                break;

            default:
                throw new Exception("Invalid Date Format");
        }
        if ($m != '' && $d != '' && $y != '')
            return "true";
        else
            throw new App42Exception("Invalid Date");
    }

    public static function validateMax($max) {
        if ($max < 1) {
            throw new App42Exception("Max must be greater than Zero.");
        }
    }

    /**
     * Validate Email
     *
     */
    public static function throwExceptionIfEmailNotValid($email) {
//        $regex = "/^[_a-z0-9-]+(\.[_a-z0-9-]+)@[a-z0-9-]+(\.[a-z0-9-]+)(\.[a-z]{2,3})$/";
        $regex = "/^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,3})$/";
        if (preg_match($regex, $email)) {
            
        } else {
            throw new App42Exception("Invalid EmailAddress");
        }
    }

    public static function encodeParams($object) {
        $encodeObj = urlencode($object);
        $repObj = str_replace("+", "%20", $encodeObj);
        $repNewObj = str_replace("%2F", "/", $repObj);
        return $repNewObj;
    }

    /**
     * Validate Extension
     *
     */
    public static function throwExceptionIfNotValidImageExtension($imagePath, $name) {
        if ($imagePath == null) {
            throw new App42Exception($name . " parameter can not be null ");
        }

        $extension = '.';
        $pos = strpos($imagePath, $extension);
        if ($pos === false) {
            throw new App42Exception($name . " does not contain valid extension. ");
        }
        $ext = pathinfo($imagePath, PATHINFO_EXTENSION);
        if (!($ext == "png") && !($ext == "jpg") && !($ext == "jpeg") && !($ext == "gif")) {
            throw new App42Exception("The Request parameters are invalid. Only file with extensions jpg, jpeg, gif and png are supported.");
        }
    }

    public static function throwExceptionIfHowManyNotValid($howMany) {
        if ($howMany > 1000) {
            throw new App42Exception("HowMany must be less than 1000");
        }
    }

   public static function getUTCFormattedTimestamp() {
        date_default_timezone_set("UTC");
        
        return date("Y-m-d\TH:i:s") . substr((string) microtime(), 1, 4) . "Z";
    }
     public static function getUTCFormattedTimestamps($date) {
           date_default_timezone_set("UTC");
          return date("Y-m-d\TH:i:s", strtotime($date)) . substr((string) microtime(), 1, 4) . "Z";
	}
 
        
 public static function throwExceptionIfLongValueIsNegativeOrEqualToZero($obj, $name) {
         
                 if ($obj < 1) {
                    throw new App42Exception($name . " parameter can not be less than or Equal to Zero ");
                }
               
            }

}

?>
