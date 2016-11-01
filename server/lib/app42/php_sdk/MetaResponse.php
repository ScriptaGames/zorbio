<?php
include_once 'App42Service.php';
/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

class MetaResponse  {
   
    public $jsonDocList = array();

   public function getJsonDocList() {
        return $this->jsonDocList;
    }

    public function setJsonDocList($jsonDocList) {
        $this->jsonDocList = $jsonDocList;
    }
}
class ScoreJSONDocument {

    public $jsonDoc;
    public $docId;
    public $createdAt;
    public $updatedAt;
    private $owner;
    public $event;
    public $loc ;
    /**
     * This create the constructor and takes no parameter.
     */
    public function __construct(MetaResponse $list) {
        array_push($list->jsonDocList, $this);
    }

    /**
     * Returns the json doc for Storage.
     *
     * @return json doc for storage
     */
    public function getJsonDoc() {
        return $this->jsonDoc;
    }

    /**
     * Sets the json document for Storage
     *
     * @params jsonDoc
     *            - json document for storage
     *
     */
    public function setJsonDoc($jsonDoc) {
        $this->jsonDoc = $jsonDoc;
    }

    /**
     * Returns the document Id.
     *
     * @return docId
     */
    public function getDocId() {
        return $this->docId;
    }

    /**
     * Sets the document Id for the Storage
     *
     * @params docId
     *            - document Id for the storage
     *
     */
    public function setDocId($docId) {
        $this->docId = $docId;
    }
    public function  getUpdatedAt() {
            return $this->updatedAt;
    }
    public function setUpdatedAt($updatedAt) {
	  $this->updatedAt = $updatedAt;
    }

    public function getCreatedAt() {
	return $this->createdAt;
    }
    public function setCreatedAt($createdAt) {
            $this->createdAt = $createdAt;
    }
    public function getEvent() {
         return $this->event;
    }

    public function  setEvent($event) {
	$this->event = $event;
    }
    public function getOwner() {
	return $this->owner;
}

    public function setOwner($owner) {
            $this->owner = $owner;
    }

    public function getLocation(){
        return $this->loc;
		}
    public function setLocation(GeoTag $loc){
            $this->loc = $loc;
    }

    /**
     * Returns the Storage Response in JSON format.
     *
     * @return the response in JSON format.
     *
     */
    public function toString() {
        //if($this->docId != null &&  $this->jsonDoc != null)
        return $this->docId . " : " . $this->jsonDoc;
        //else
        //return super->toString();
    }
}
?>
