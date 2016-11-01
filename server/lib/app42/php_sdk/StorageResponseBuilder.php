<?php

include_once "JSONObject.php";
include_once "App42ResponseBuilder.php";
include_once "Storage.php";

/**
 *
 * StorageResponseBuilder class converts the JSON response retrieved from the
 * server to the value object i.e Storage
 *
 */
class StorageResponseBuilder extends App42ResponseBuilder {

    /**
     * Converts the response in JSON format to the value object i.e Storage
     *
     * @params json
     *            - response in JSON format
     *
     * @return Storage object filled with json data
     *
     */
    function buildResponse($json) {
        $storageObj = new Storage();
        $jsonDocList = array();

        $storageObj->setJsonDocList($jsonDocList);
        $storageObj->setStrResponse($json);
        $jsonObj = new JSONObject($json);
        $jsonObjApp42 = $jsonObj->__get("app42");
        $jsonObjResponse = $jsonObjApp42->__get("response");
        $storageObj->setResponseSuccess($jsonObjResponse->__get("success"));
        $jsonObjStorage = $jsonObjResponse->__get("storage");
        $this->buildObjectFromJSONTree($storageObj, $jsonObjStorage);

        if (!$jsonObjStorage->has("jsonDoc"))
            return $storageObj;

        if ($jsonObjStorage->__get("jsonDoc") instanceof JSONObject) {
            // Only One attribute is there
            $jsonObjDoc = $jsonObjStorage->__get("jsonDoc");
            $document = new JSONDocument($storageObj);
            $this->buildJsonDocument($document, $jsonObjDoc);
        } else {
            // There is an Array of attribute
            $jsonObjDocArray = $jsonObjStorage->getJSONArray("jsonDoc");
            for ($i = 0; $i < count($jsonObjDocArray); $i++) {
                // Get Individual Attribute Node and set it into Object
                $jsonObjDoc = $jsonObjDocArray[$i];
                $document = new JSONDocument($storageObj);
                //$jsonObjDoc = new JSONObject($jsonObjDoc);
                $this->buildJsonDocument($document, $jsonObjDoc);
            }
        }

        return $storageObj;
    }

    /**
     * Builds the Json Document for the storage w.r.t their docId
     *
     * @param document
     *            - document for storage
     * @param jsonObjDoc
     *            - jsonDoc object for storage
     *
     */
  function buildJsonDocument($document, $jsonObjDoc) {
        $jsonObjDoc = new JSONObject($jsonObjDoc);
        if ($jsonObjDoc->has("loc") && $jsonObjDoc->__get("loc") != null) {
            $geoArray = $jsonObjDoc->getJSONArray("loc");
            for ($i = 0; $i < count($geoArray); $i++) {
                 if (count($geoArray) == 2) {
                    $geoTag = new GeoTag();
                    $geoTag->setLat($geoArray[0]);
                    $geoTag->setLng($geoArray[1]);
                    $document->setLocation($geoTag);
                    $jsonObjDoc->remove("loc");
                }
            }
        }

        if ($jsonObjDoc->has("_id") && $jsonObjDoc->__get("_id") != null) {
            $idObj = $jsonObjDoc->__get("_id");
            $oIdObj = $idObj->__get("\$oid");
            $document->setDocId($oIdObj);
            $jsonObjDoc->remove("_id");
        }
        if ($jsonObjDoc->has("_\$updatedAt") && $jsonObjDoc->__get("_\$updatedAt") != null) {
            $updatedObj = $jsonObjDoc->__get("_\$updatedAt");
            $document->setUpdatedAt($updatedObj);
            $jsonObjDoc->remove("_\$updatedAt");
        }
        if ($jsonObjDoc->has("_\$createdAt") && $jsonObjDoc->__get("_\$createdAt") != null) {
            $createdAtObj = $jsonObjDoc->__get("_\$createdAt");
            $document->setCreatedAt($createdAtObj);
            $jsonObjDoc->remove("_\$createdAt");
        }
        if ($jsonObjDoc->has("_\$event") && $jsonObjDoc->__get("_\$event") != null) {
            $eventObj = $jsonObjDoc->__get("_\$event");
            $document->setEvent($eventObj);
            $jsonObjDoc->remove("_\$event");
        }
        if ($jsonObjDoc->has("_\$owner") && $jsonObjDoc->__get("_\$owner") != null) {
            $idObj = $jsonObjDoc->__get("_\$owner");
            $ownerObj = $idObj->__get("owner");
            $document->setOwner($ownerObj);
            $jsonObjDoc->remove("_\$owner");
        }

        $document->setJsonDoc($jsonObjDoc);
    }

}
?>