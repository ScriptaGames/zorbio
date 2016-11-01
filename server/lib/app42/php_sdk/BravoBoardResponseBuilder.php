<?php
include_once "JSONObject.php";
include_once "BravoBoard.php";
include_once "App42ResponseBuilder.php";
/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of BravoBoardResponseBuilder
 *
 * @author PRAVIN
 */
class BravoBoardResponseBuilder extends App42ResponseBuilder {
    
     public function buildResponse($json) {
        $activitiesJSONObj = $this->getServiceJSONObject("activities", $json);
        $activityJSONObject = $activitiesJSONObj->__get("activity");
        $bravo = $this->buildBravoObject($activityJSONObject);
        $bravo->setStrResponse($json);
        $bravo->setResponseSuccess($this->isRespponseSuccess($json));
        return $bravo;
    }

 
    private function buildBravoObject($bravoTagObject) {
       // $bravoTagObject = new JSONObject($jsonObject); 
        
            $tagList=  array();
        $bravo = new BravoBoard(); 
         $this->buildObjectFromJSONTree($bravo, $bravoTagObject);
        if ($bravoTagObject->has("tags")) {
            // Fetch Items
            if ($bravoTagObject->__get("tags") instanceof JSONObject) { 
                $tagJSONObj = $bravoTagObject->__get("tags");
                $tag = new Tags($bravo); 
                $this->buildObjectFromJSONTree($tag, $tagJSONObj);
            } else {     
                $bravo->setTagList($tagList);
                //Multiple Items
                $tagsJSONArray = $bravoTagObject->getJSONArray("tags");
                for ($i = 0; $i < count($tagsJSONArray); $i++) { 
                     $tagsObj = $tagsJSONArray[$i];
                     $tags = new Tags($bravo);                  
                     $tagJSONObject = new JSONObject($tagsObj); 
                     $this->buildObjectFromJSONTree($tags, $tagJSONObject);
                 }
            }
        }       
         return $bravo;
    }

      public function buildArrayResponse($json) {
        $activitiesJSONObj = $this->getServiceJSONObject("activities", $json);
        $activityJSONArray = $activitiesJSONObj->getJSONArray("activity");
        $bravoList = array();

        if ($activityJSONArray instanceof JSONObject) {
            $bravoJSONObject = new JSONObject($activityJSONArray);
            $bravo= $this->buildBravoObject($bravoJSONObject);
            $bravo->setStrResponse($json);
            $bravo->setResponseSuccess($this->isRespponseSuccess($json));
            array_push($bravoList, $bravo);
        } else {
            for ($i = 0; $i < count($activityJSONArray); $i++) {
                $bravoJSONObjectArray = $activityJSONArray[$i];
                $bravoJSONObject1 = new JSONObject($bravoJSONObjectArray);
                $bravoObject = $this->buildBravoObject($bravoJSONObject1);
                $this->buildObjectFromJSONTree($bravo, $bravoJSONObject1);
                $bravoObject->setStrResponse($json);
                $bravoObject->setResponseSuccess($this->isRespponseSuccess($json));
                array_push($bravoList, $bravoObject);
            }
        }
        return $bravoList;
    }
}
?>
