<?php

include_once "App42Response.php";

/**
 * The ImageProcessor service is a Image utility service on the Cloud. Developers can 
 * upload files on the cloud and perform various Image Manipulation operations on the Uploaded
 * Images e.g. resize, scale, thumbnail, crop etc. It is especially useful for Mobile Apps when 
 * they dont want to store Images locally and dont want to perform processor intensive operations
 * It is also useful for web applications who want to perform complex Image Operations.
 *
 * This Image object is the value object which contains the properties of Image
 * along with the setter & getter for those properties.
 *
 */
class Image extends App42Response {

    public $name;
    public $action;
    public $originalImage;
    public $convertedImage;
    public $originalImageTinyUrl;
    public $convertedImageTinyUrl;
    public $percentage;
    public $width;
    public $height;
    public $x;
    public $y;

    /**
     * Returns the name of the image.
     *
     * @return the name of the image.
     */
    public function getName() {
        return $this->name;
    }

    /**
     * Sets the name of the image.
     *
     * @param name
     *            - name of the image.
     *
     */
    public function setName($name) {
        $this->name = $name;
    }

    /**
     * Returns the action that has to be done on image.
     *
     * @return the action that has to be done on image.
     */
    public function getAction() {
        return $this->action;
    }

    /**
     * Sets the action that has to be done on image.
     *
     * @param action
     *            - action that has to be done on image.
     *
     */
    public function setAction($action) {
        $this->action = $action;
    }

    /**
     * Returns the Tiny Url of the original image.
     *
     * @return the Tiny url of the original image.
     */
    public function getOriginalImageTinyUrl() {
        return $this->originalImageTinyUrl;
    }

    /**
     * Sets the Tiny Url of the original image.
     *
     * @param originalImageTinyUrl
     *            - Tiny Url of the original image.
     *
     */
    public function setOriginalImageTinyUrl($originalImageTinyUrl) {
        $this->originalImageTinyUrl = $originalImageTinyUrl;
    }

    /**
     * Returns the Tiny url of the converted image.
     *
     * @return the Tiny url of the converted image.
     */
    public function getConvertedImageTinyUrl() {
        return $this->convertedImageTinyUrl;
    }

    /**
     * Sets the Tiny url of the converted image.
     *
     * @param convertedImageTinyUrl
     *            - Tiny url of the converted image.
     *
     */
    public function setConvertedImageTinyUrl($convertedImageTinyUrl) {
        $this->convertedImageTinyUrl = $convertedImageTinyUrl;
    }

    /**
     * Returns the original image.
     *
     * @return the original image.
     */
    public function getOriginalImage() {
        return $this->originalImage;
    }

    /**
     * Sets the original image.
     *
     * @param originalImage
     *            - original image.
     *
     */
    public function setOriginalImage($originalImage) {
        $this->originalImage = $originalImage;
    }

    /**
     * Returns the converted Image of the original image.
     *
     * @return the converted Image of the original image.
     */
    public function getConvertedImage() {
        return $this->convertedImage;
    }

    /**
     * Sets the converted Image of the original image.
     *
     * @param convertedImage
     *            - converted Image of the original image.
     *
     */
    public function setConvertedImage($convertedImage) {
        $this->convertedImage = $convertedImage;
    }

    /**
     * Returns the percentage value for the image.
     *
     * @return the percentage value for the image.
     */
    public function getPercentage() {
        return $this->percentage;
    }

    /**
     * Sets the percentage value for the image.
     *
     * @param percentage
     *            - percentage value for the image.
     *
     */
    public function setPercentage($percentage) {
        $this->percentage = $percentage;
    }

    /**
     * Returns the width value for the image.
     *
     * @return the width value for the image.
     */
    public function getWidth() {
        return $this->width;
    }

    /**
     * Sets the width value for the image.
     *
     * @param width
     *            - width value for the image.
     *
     */
    public function setWidth($width) {
        $this->width = $width;
    }

    /**
     * Returns the height value for the image.
     *
     * @return the height value for the image.
     */
    public function getHeight() {
        return $this->height;
    }

    /**
     * Sets the height value for the image.
     *
     * @param height
     *            - height value for the image.
     *
     */
    public function setHeight($height) {
        $this->height = $height;
    }

    /**
     * Returns the x value for the image.
     *
     * @return the x value for the image.
     */
    public function getX() {
        return $this->x;
    }

    /**
     * Sets the x value for the image.
     *
     * @param x
     *            - x value for the image.
     *
     */
    public function setX($x) {
        $this->x = $x;
    }

    /**
     * Returns the y value for the image.
     *
     * @return the y value for the image.
     */
    public function getY() {
        return $this->y;
    }

    /**
     * Sets the y value for the image.
     *
     * @param y
     *            - y value for the image.
     *
     */
    public function setY($y) {
        $this->y = $y;
    }

    /**
     * Returns the Image Response in JSON format.
     *
     * @return the response in JSON format.
     *
     */
    public function getStringView() {
        return " Name : " . $this->name . " : Action : " . $this->action . " : originalImage : " . $this->originalImage . " :convertedImage : " . $this->convertedImage . " : percentage : " . $this->percentage . " : width : " . $this->width . " : height  : " . $this->height . " : x : " . $this->x . " :y : " . $this->y;
    }

}
?>