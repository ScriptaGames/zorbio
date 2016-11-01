<?php
/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

include_once "JSONObject.php";

class GeoQuery {

    private $jsonObject;
    private $jsonArray;

    public function Query($jsonQuery) {

        if ($jsonQuery instanceof JSONObject) {

            $objectArray = array();
            array_push($objectArray, $jsonQuery);
            return $this->jsonObject = $objectArray;
        } else {
            return $this->jsonArray = $jsonQuery;
        }
    }
}
?>
