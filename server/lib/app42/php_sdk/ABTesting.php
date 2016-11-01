<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
include_once "App42Response.php";

class ABTesting extends App42Response {

    public $name;
    public $isActive;
    public $type;
    public $variantList = array();

    public function getName() {
        return $this->name;
    }

    public function setName() {
        $this->name = $name;
    }

    public function isActive() {
        if ($this->isActive == 1)
            return "true";
        else
            return "false";
    }

    public function setIsActive($isCurrent) {
        $this->isActive = $isCurrent;
    }

    public function getType() {
        return $this->type;
    }

    public function setType($type) {
        $this->type = $type;
    }

    public function getVariantList() {
        return $this->variantList;
    }

    public function setVariantList($variantList) {
        $this->variantList = $variantList;
    }

}

/**
 * An inner class that contains properties of Test Variant.
 *
 */
class TestVariants {

    public $name;
    public $profile;
     function __construct(ABTesting $variantList) {
        array_push($variantList->variantList, $this);
    }
    public function getName() {
        return $this->name;
    }

    public function setName($name) {
        $this->name = $name;
    }

    public function getProfileJSON() {
        return $this->profile;
    }

    public function setProfileJSON($profile) {
        $this->profile = $profile;
    }

}
?>
