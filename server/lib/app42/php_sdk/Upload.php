<?php


/*  File Name : UploadFileType.php
 *  Author : Sushil Singh  04-04-2011
 */


include_once "App42Response.php";

/**
 *
 * This Upload object is the value object which contains the properties of
 * Upload along with the setter & getter for those properties.
 *
 */
class Upload extends App42Response {

    public $fileList = array();

    /**
     * Returns the list of all the files.
     *
     * @return the list of files.
     */
    public function getFileList() {
        return $this->fileList;
    }

    /**
     * Sets the list of files.
     *
     * @params filelist
     *            - list of all the files
     *
     */
    public function setFileList($fileList) {
        $this->fileList = $fileList;
    }

    public function toString() {
        return $this->getStrResponse();
    }

}

/**
 * An inner class that contains the remaining properties of Upload.
 *
 */
class File {

    /**
     * This is constructor that take no parameters
     */
    public function __construct(Upload $upload) {
        array_push($upload->fileList, $this);
    }

    public $name;
    public $userName;
    public $type;
    public $url;
    public $tinyUrl;
    public $description;

    /**
     * Returns the name of the File.
     *
     * @return the name of the file.
     */
    public function getName() {
        return $this->name;
    }

    /**
     * Sets the name of the file.
     *
     * @params name
     *            - name of the file
     *
     */
    public function setName($name) {
        $this->name = $name;
    }

    /**
     * Returns the name of the User.
     *
     * @return the name of the user.
     */
    public function getUserName() {
        return $this->userName;
    }

    /**
     * Returns the tinyUrl of the Upload File.
     *
     * @return the tinyUrl of the Upload File.
     *
     */
    public function getTinyUrl() {
        return $this->tinyUrl;
    }

    /**
     * TinyUrl of the upload file.
     *
     * @params tinyUrl
     *            - TinyUrl of the file which has to be uploaded
     *
     */
    public function setTinyUrl($tinyUrl) {
        $this->tinyUrl = $tinyUrl;
    }

    /**
     * Sets the name of the User for upload file.
     *
     * @params userName
     *            - Name of the User for which file has to be saved
     *
     */
    public function setUserName($userName) {
        $this->userName = $userName;
    }

    /**
     * Returns the type of the Upload File.
     *
     * @return the type of the Upload File.
     *
     */
    public function getType() {
        return $this->type;
    }

    /**
     * Sets the type of the file to be uploaded.
     *
     * @params type
     *            - The type of the file. File can be either Audio, Video,
     *            Image, csv or other Use the static constants e.g.
     *            Upload.AUDIO, Upload.XML etc.
     *
     */
    public function setType($type) {
        $this->type = $type;
    }

    /**
     * Returns the url of the Upload File.
     *
     * @return the url of the Upload File.
     *
     */
    public function getUrl() {
        return $this->url;
    }

    /**
     * Url of the upload file.
     *
     * @params url
     *            - Url of the file which has to be uploaded
     *
     */
    public function setUrl($url) {
        $this->url = $url;
    }

    /**
     * Returns the description of the Upload File.
     *
     * @return the description of the Upload File.
     *
     */
    public function getDescription() {
        return $this->description;
    }

    /**
     * Sets the description of the upload file.
     *
     * @params description
     *            - Description of the file to be uploaded
     *
     */
    public function setDescription($description) {
        $this->description = $description;
    }

}
?>
