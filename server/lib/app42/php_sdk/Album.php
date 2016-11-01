<?php

include_once "App42Response.php";

/**
 *
 * This Album object is the value object which contains the properties of Album
 * along with the setter & getter for those properties.
 *
 */
class Album extends App42Response {

    public $userName;
    public $name;
    public $description;
    public $photoList = array();

    /**
     * Returns the user name of the album.
     *
     * @return the user name of the album.
     */
    public function getUserName() {
        return $this->userName;
    }

    /**
     * Sets the user name of the Album.
     *
     * @params userName
     *            - User Name of the Album
     *
     */
    public function setUserName($userName) {
        $this->userName = $userName;
    }

    /**
     * Returns the name of the Album.
     *
     * @return the name of the Album.
     */
    public function getName() {
        return $this->name;
    }

    /**
     * Sets the name of the Album which has to be created.
     *
     * @params name
     *            - Name of the Album that has to be created
     *
     */
    public function setName($name) {
        $this->name = $name;
    }

    /**
     * Returns the description of the Album.
     *
     * @return the description of the Album.
     */
    public function getDescription() {
        return $this->description;
    }

    /**
     * Sets the description of the Album.
     *
     * @params description
     *            - Description of the Album
     *
     */
    public function setDescription($description) {
        $this->description = $description;
    }

    /**
     * Returns the list of all the photos for the Album.
     *
     * @return the list of all the photos for the Album.
     */
    public function getPhotoList() {
        return $this->photoList;
    }

    /**
     * Sets the list of all the photos for the Album.
     *
     * @params photoList
     *            - list of all the photos for the Album.
     *
     */
    public function setPhotoList($photoList) {
        $this->photoList = $photoList;
    }

}

/**
 * An inner class that contains the remaining properties of the Album.
 *
 */
class Photo {

    /**
     * This is a constructor that takes no parameter
     *
     */
    public  function __construct(Album $album) {
        array_push($album->photoList, $this);
    }

    public $name;
    public $description;
    public $url;
    public $tinyUrl;
    public $thumbNailUrl;
    public $thumbNailTinyUrl;
    public $tagList = array();

    /**
     * Returns the name of the photo.
     *
     * @return the name of the photo.
     */
    public function getName() {
        return $this->name;
    }

    /**
     * Sets the name of the photo.
     *
     * @params name
     *            - Name of the photo
     *
     */
    public function setName($name) {
        $this->name = $name;
    }

    /**
     * Returns the description of the photo.
     *
     * @return the description of the photo.
     */
    public function getDescription() {
        return $this->description;
    }

    /**
     * Sets the description of the photo.
     *
     * @params description
     *            - Description of the photo
     *
     */
    public function setDescription($description) {
        $this->description = $description;
    }

    /**
     * Returns the url of the photo.
     *
     * @return the url of the photo.
     */
    public function getUrl() {
        return $this->url;
    }

    /**
     * Sets the url of the photo.
     *
     * @params url
     *            - url of the photo
     *
     */
    public function setUrl($url) {
        $this->url = $url;
    }

    /**
     * Returns the list of all the tags in the photo.
     *
     * @return the list of all the tags in the photo.
     */
    public function getTagList() {
        return $this->tagList;
    }

    /**
     * Sets the list of all the tags in the photo.
     *
     * @params tagList
     *            - list of all the tags in the photo.
     *
     */
    public function setTagList($tagList) {
        $this->tagList = $tagList;
    }

    /**
     * Returns the tiny url of the photo.
     *
     * @return the tiny url of the photo.
     */
    public function getTinyUrl() {
        return $this->tinyUrl;
    }

    /**
     * Sets the tiny url of the photo.
     *
     * @params tinyUrl
     *            - tinyurl of the photo
     *
     */
    public function setTinyUrl($tinyUrl) {
        $this->tinyUrl = $tinyUrl;
    }

    /**
     * Returns the thumbnail url of the photo.
     *
     * @return the thumbnail url of the photo.
     */
    public function getThumbNailUrl() {
        return $this->thumbNailUrl;
    }

    /**
     * Sets the thumbnail url of the photo.
     *
     * @params thumbnailUrl
     *            - thumbnail url of the photo
     *
     */
    public function setThumbNailUrl($thumbNailUrl) {
        $this->thumbNailUrl = $thumbNailUrl;
    }

    /**
     * Returns the thumbnail tiny url of the photo.
     *
     * @return the thumbnail tiny url of the photo.
     */
    public function getThumbNailTinyUrl() {
        return $this->thumbNailTinyUrl;
    }

    /**
     * Sets the thumbnail tiny url of the photo.
     *
     * @params thumbNailTinyUrl
     *            - thumbnail tiny url of the photo
     *
     */
    public function setThumbNailTinyUrl($thumbNailTinyUrl) {
        $this->thumbNailTinyUrl = $thumbNailTinyUrl;
    }

    /**
     * Returns the Album Response in JSON format.
     *
     * @return the response in JSON format.
     *
     */
    public function toString() {
        return " name : " . $this->name . " : description : " . $this->description . " : url : " . $this->url . " : tinyUrl  : " . $this->tinyUrl . " : thumbNailUrl   : " . $this->thumbNailUrl . " : thumbNailTinyUrl     : " . $this->thumbNailTinyUrl . " : tagList    : " . $this->tagList;
    }

}
?>