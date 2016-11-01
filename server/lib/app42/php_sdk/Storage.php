<?php

include_once "App42Response.php";
include_once "GeoTag.php";
/**
 *
 * This Storage object is the value object which contains the properties of
 * Storage along with the setter & getter for those properties.
 *
 */
class Storage extends App42Response {

    public $dbName;
    public $collectionName;
    public $jsonDocList = array();
    public $docId;
    public $recordCount;

    /**
     * Returns the name of the database.
     *
     * @return the name of the database.
     */
    public function getDbName() {
        return $this->dbName;
    }

    /**
     * Sets the name of the database.
     *
     * @params dbName
     *            - Database name for storage json document
     *
     */
    public function setDbName($dbName) {
        $this->dbName = $dbName;
    }

    /**
     * Returns the collection name of the storage
     *
     * @return collection name of storage
     */
    public function getCollectionName() {
        return $this->collectionName;
    }

    /**
     * Sets the collection name of storage.
     *
     * @params collectionName
     *            - Collection name of storage
     *
     */
    public function setCollectionName($collectionName) {
        $this->collectionName = $collectionName;
    }

    /**
     * Returns the json document list of storage
     *
     * @return json document list of storage
     */
    public function getJsonDocList() {
        return $this->jsonDocList;
    }

    /**
     * Sets the Json doc list
     *
     * @params jsonDocList
     *            - json document list of the storage
     *
     */
    public function setJsonDocList($jsonDocList) {
        $this->jsonDocList = $jsonDocList;
    }

    public function getRecordCount() {
	return $this->recordCount;
    }
    public function setRecordCount($recordCount) {
	$this->recordCount = $recordCount;
	}
}

/**
 * An inner class that contains the remaining properties of the Storage.
 *
 */
class JSONDocument {

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
    function __construct(Storage $storage) {
        array_push($storage->jsonDocList, $this);
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