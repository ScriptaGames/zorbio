<?php

include_once "App42Response.php";

class App {

    protected $resource = "app";
    protected $apiKey;
    protected $secretKey;
    protected $url;
    protected $version = "1.0";
    
    public function __construct($apiKey, $secretKey, $baseURL) {
        //$this->resource = "charge";
        $this->apiKey = $apiKey;
        $this->secretKey = $secretKey;
        $this->url = $baseURL . $this->version . "/" . $this->resource;
    }
    function createApp($appName, $orgName) {
        Util::throwExceptionIfNullOrBlank($appName, "App Name");
        Util::throwExceptionIfNullOrBlank($orgName, "orgName");
        

        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		    
            $params = array();
            $params['apiKey'] = $this->apiKey;
            $params['version'] = $this->version;
            date_default_timezone_set('UTC');
            $params['timeStamp'] = date("Y-m-d\TG:i:s") . substr((string) microtime(), 1, 4) . "Z";
            $params['App Name'] = $appName;
            $params['orgName'] = $orgName;
            
            $signature = urlencode($objUtil->sign($params)); //die();
            $body = null;
           $body = '{"app42":{"app":}}';
            $params['body'] = $body;
            $params['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $this->url = $this->url;
            $response = RestClient::post($this->url, $params, null, null, $contentType, $accept, $body);
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $response;
    }

}
?>
