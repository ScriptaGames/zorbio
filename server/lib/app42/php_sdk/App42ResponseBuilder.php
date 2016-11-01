<?php  
include_once "JSONObject.php";


abstract class App42ResponseBuilder {
	
	public function buildObjectFromJSONTree($obj, $jsonObj) {
		// Set all attributes of Session 
				$objJson = new JSONObject();
                               $names = $objJson->getNames($jsonObj);
                               $reflector = new ReflectionClass(get_class($obj));
				
		try{		
				foreach($names as $name) {
                                    $Reflection = new ReflectionProperty(get_class($obj), $name);
					$value = $jsonObj->__get($name);
                                        $Reflection->setValue($obj, $value);
					
				}
		   }
		   catch(ReflectionException $e){
					// go ahead
				
		   }
	}
	
	/**
	 * @param serviceName
	 * @param json
	 * @return
	 * @throws Exception
	 */
	public function getServiceJSONObject($serviceName, $json) {
		$jsonObj = new JSONObject($json);
                $jsonObjApp42 = $jsonObj->__get("app42");
		$jsonObjResponse = $jsonObjApp42->__get("response");
		$jsonObjService = $jsonObjResponse->__get($serviceName);
		return $jsonObjService;
	}
	
	/**
	 * @param json
	 * @return
	 * @throws Exception
	 */
	public function isRespponseSuccess($json) {
		$jsonObj = new JSONObject($json);
		$jsonObjApp42 = $jsonObj->__get("app42");
		$jsonObjResponse = $jsonObjApp42->__get("response");
		return $jsonObjResponse->__get("success");
	}

        /**
	 * @param json
	 * @return
	 * @throws Exception
	 */
	public function getTotalRecords($json) {
            
		$totalRecords = -1;
                $jsonObj = new JSONObject($json);
                $jsonObjApp42 = $jsonObj->__get("app42");
		$jsonObjResponse = $jsonObjApp42->__get("response");
               // if(($jsonObjResponse  != null) && ($jsonObjResponse->__get("totalRecords"))){
                  if($jsonObjResponse  != null){
                    $totalRecords = $jsonObjResponse->__get("totalRecords");
                }
               return $totalRecords;
	}
	
}

?>