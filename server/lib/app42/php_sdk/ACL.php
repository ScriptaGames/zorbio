<?php


/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of ACL
 *
 * @author VAVESH DIWEDI
 */
class ACL {

    public $user;
    public $permission;

    public function __construct($user, $permission) {
        $this->user = $user;
        $this->permission = $permission;
    }

    public function getUser() {
        return $this->user;
    }

    public function setUser($user) {
        $this->user = $user;
    }

    public function getPermission() {
        return $this->permission;
    }

    public function setPermission($permission) {
        $this->permission = $permission;
    }

    public function toString() {
        return "user : " . $this->user . " permission : " . $this->permission;
    }

    public function getJSONObject() {
        $jsonObj = new JSONObject();
        $jsonObj->user = $this->user;
        $jsonObj->permission = $this->permission;
        return $jsonObj;
    }

}

class Permission {

    const READ = "R";
    const WRITE = "W";

    public function enum($string) {

        return constant('Permission::' . $string);
    }

    public function isAvailable($string) {
        if ($string == "R")
            return "R";
        else if ($string == "W")
            return "W";
        else
            return "null";
    }

}

?>
