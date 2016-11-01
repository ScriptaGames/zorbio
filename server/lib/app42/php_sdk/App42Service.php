<?php

include_once "Query.php";
include_once "Util.php";
include_once "PAE_Constants.php";
include_once "GeoTag.php";
include_once "ACL.php";
include_once "App42API.php";


/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

abstract class App42Service {

    protected $apiKey;
    protected $version;
    protected $sessionId;
    protected $adminKey;
    protected $geoTag;
    protected $secretKey;
    protected $pageOffset = -1;
    protected $pageMaxRecords = -1;
    protected $fbAccessToken;
    protected $orderByDescending;
    protected $dataACL = array();
    protected $event;
    protected $metaInfo;
    protected $metaInfoQuery;
    protected $dbName;
    protected $collectionName;
    protected $query;
    protected $jsonObject;
    protected $orderByAscending;
    protected $otherMetaHeaders = array();

    public function setQuery( $collectionName, $metaInfoQuery=null) {
        $argv = func_get_args();
        if (count($argv) == 2) {
            $this->dbName = App42API::getDbName();
            $this->collectionName = $collectionName;
            if ($metaInfoQuery instanceof JSONObject) {
                $queryObject = array();
                array_push($queryObject, $metaInfoQuery);
                $this->query = json_encode($queryObject);
            } else {
                
                $this->query = json_encode($metaInfoQuery);
            }
        } else {
            $this->dbName = App42API::getDbName();
            $this->collectionName = collectionName;
        }
    }

    public function getOrderByDescending() {
        return $this->orderByDescending;
    }

    public function setOrderByDescending($orderByDescending) {
        $this->orderByDescending = $orderByDescending;
    }

    public function getOtherMetaHeaders() {
        return $this->otherMetaHeaders;
    }

    public function setOtherMetaHeaders($otherMetaHeaders) {
        $this->otherMetaHeaders = $otherMetaHeaders;
    }

    public function getOrderByAscending() {
        return $this->orderByAscending;
    }

    public function setOrderByAscending($orderByAscending) {
        $this->orderByAscending = $orderByAscending;
    }

    protected $selectKeys = array();
    protected $aclList = array();

    public function getAclList() {
        return $this->aclList;
    }

    public function setAclList($aclList) {
        $this->aclList = $aclList;
    }

  

    public function setSelectKeys($selectKeys) {
         $this->selectKeys = $selectKeys;
    }

    public function getSelectKeys() {
        return $this->selectKeys;
    }
    public function getEvent() {
        return $this->event;
    }

    public function setEvent($event) {

        $this->event = $event;
    }

    protected function populateSignParams() {
        $params = array();
        $params[PAE_Constants::API_KEYS] = $this->apiKey;
        $params[PAE_Constants::VERSION] = $this->version;
        $sessionId = $this->sessionId;
        if ($sessionId != null) {
            $params[PAE_Constants::SESSION_ID] = $this->sessionId;
        }
        $adminKey = $this->adminKey;
        if ($this->adminKey != null) {
            $params[PAE_Constants::ADMIN_KEY] = $this->adminKey;
        }
        $params[PAE_Constants::TIME_SATMP] = Util::getUTCFormattedTimestamp();
        if ($this->fbAccessToken != null) {
            $params[PAE_Constants::FB_ACCESS_TOKEN] = $this->fbAccessToken;
        }
        return $params;
    }

    public function getSessionId() {
        return $this->sessionId;
    }

    public function setSessionId($sessionId) {
        Util::throwExceptionIfNullOrBlank(sessionId, "sessionId");
        $this->sessionId = $sessionId;
    }

    public function getGeoTag() {
        return $this->geoTag;
    }

    public function setGeoTag(GeoTag $geoTag) {
        Util::throwExceptionIfNullOrBlank(geoTag, "geoTag");
        $this->geoTag = $geoTag;
    }

    public function getAdminKey() {
        return $this->adminKey;
    }

    public function setAdminKey($adminKey) {
        Util::throwExceptionIfNullOrBlank(adminKey, "adminKey");
        $this->adminKey = $adminKey;
    }

    public function getPageOffset() {
        return $this->pageOffset;
    }

    public function setPageOffset($pageOffset) {
        $this->pageOffset = $pageOffset;
    }

    public function getPageMaxRecords() {
        return $this->pageMaxRecords;
    }

    public function setPageMaxRecords($pageMaxRecords) {
        $this->pageMaxRecords = $pageMaxRecords;
    }

    public function getFbAccessToken() {
        return $this->fbAccessToken;
    }

    public function setFbAccessToken($fbAccessToken) {
        $this->fbAccessToken = $fbAccessToken;
    }

    protected function populateMetaHeaderParams() {
        $params = array();
        if ($this->pageOffset != -11)
            $params[PAE_Constants::PAGE_OFFSET] = "" . $this->pageOffset;
        if ($this->pageMaxRecords != -1)
            $params[PAE_Constants::PAGE_MAX_RECORDS] = "" . $this->pageMaxRecords;

        $this->setACLHeader($params);
        if ($this->geoTag != null)
            $params[PAE_Constants::GeoTag] = $this->geoTag->getJSONObject();
        
        if (count($this->getSelectKeys()) > 0) {
            $selectJSONKeys = new JSONObject();
            foreach ($this->selectKeys as $key  ) {
                $selectJSONKeys->put($key, PAE_Constants::SELECT_KEY_FLAG);
            }
           
            $params[PAE_Constants::SELECT_KEYS_HEADER]=$selectJSONKeys;
        }
        $params['SDKName'] = "Php";
        if ($this->event != null && $this->event != "") {
            $params['event'] = $this->event;
        }

        if (App42API::getLoggedInUser() != null && App42API::getLoggedInUser() != "") {
            $params['loggedInUser'] = App42API::getLoggedInUser();
        }

        if ($this->query != null && $this->query != "")
            $params['metaQuery'] = $this->query;

        if ($this->jsonObject != null && $this->jsonObject !="") {
            $params['jsonObject'] = $this->jsonObject;
        }

        if ($this->dbName != null && $this->dbName != "" && $this->collectionName != null && $this->collectionName != "") {
            $obj = new JSONObject();
            $obj->put("dbName", $this->dbName);
            $obj->put("collectionName", $this->collectionName);
            $params['dbCredentials'] = $obj->__toString();
        }
        // Add Other meta headers if available
        if (count($this->getOtherMetaHeaders()) > 0) {
            $keySet = $this->getOtherMetaHeaders();
            foreach ($keySet as $key => $value) {
                if ($key != null && !$key == "" && $value != null && $value != "") {
                    $params[$key] = $value;
                }
            }
        }
        return $params;
    }

    private function setACLHeader($params) {
        if (count($this->getAclList()) > 0) {
            $aclArray = $this->getAclList();
            $params[PAE_Constants . DATA_ACL_HEADER] = $this->aclArray;
        }
        // Check if default ACL property is set for the app.
        else if (count(App42API::$defaultACL) > 0) {
            $aclArray = getJsonObj(App42API::$defaultACL);
            $params[PAE_Constants . DATA_ACL_HEADER]=$this->aclArray;
        }
    }

    private function getJsonObj() {
        $aclArray = array();
        $acl = new ACL($user, $permission);
        foreach ($this->$acl as $aclList) {
            $newJSON = new JSONObject();
            $user = $acl->getUser();
            $permission = $acl->getPermission();
            $newJSON->put($user, $permission);
            array_push($aclArray, $newJSON);
        }
        return $aclArray;
    }

}
?>
