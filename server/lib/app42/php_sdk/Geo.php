<?php

include_once "App42Response.php";

/**
 *
 * This Geo object is the value object which contains the properties of Geo
 * along with the setter & getter for those properties.
 *
 */
class Geo extends App42Response {

    public $storageName;
    public $sourceLat;
    public $sourceLng;
    public $distanceInKM;
    public $createdOn;
    public $pointList = array();

    /**
     * Returns the name of the storage.
     *
     * @return the name of the storage.
     */
    public function getStorageName() {
        return $this->storageName;
    }

    /**
     * Sets the name of the storage.
     *
     * @param storageName
     *            - name of the storage.
     *
     */
    public function setStorageName($storageName) {
        $this->storageName = $storageName;
    }

    /**
     * Returns the source lat point for geo.
     *
     * @return the source lat point for geo.
     */
    public function getSourceLat() {
        return $this->sourceLat;
    }

    /**
     * Sets the source lat point for geo.
     *
     * @param sourceLat
     *            - source lat point for geo.
     *
     */
    public function setSourceLat($sourceLat) {
        $this->sourceLat = $sourceLat;
    }

    /**
     * Returns the source lng point for geo.
     *
     * @return the source lng point for geo.
     */
    public function getSourceLng() {
        return $this->sourceLng;
    }

    /**
     * Sets the source lng point for geo.
     *
     * @param sourceLng
     *            - source lng point for geo.
     *
     */
    public function setSourceLng($sourceLng) {
        $this->sourceLng = $sourceLng;
    }

    /**
     * Returns the distance in km for geo.
     *
     * @return the distance in km for geo.
     */
    public function getDistanceInKM() {
        return $this->distanceInKM;
    }

    /**
     * Sets the distance in km for geo.
     *
     * @param distanceInKM
     *            - distance in km for geo.
     *
     */
    public function setDistanceInKM($distanceInKM) {
        $this->distanceInKM = $distanceInKM;
    }

    /**
     * Returns the time, day and date when the geo was created.
     *
     * @return the time, day and date when the geo was created.
     */
    public function getCreatedOn() {
        return $this->createdOn;
    }

    /**
     * Sets the time, day and date when the geo was created.
     *
     * @param createdOn
     *            - time, day and date when the geo was created.
     *
     */
    public function setCreatedOn($createdOn) {
        $this->createdOn = $createdOn;
    }

    /**
     * Returns the list of all the points in the geo.
     *
     * @return the list of all the points in the geo.
     */
    public function getPointList() {
        return $this->pointList;
    }

    /**
     * Sets the list of all the points in the geo.
     *
     * @param pointList
     *            - list of all the points in the geo.
     *
     */
    public function setPointList($pointList) {
        $this->pointList = $pointList;
    }

}

/**
 * An inner class that contains the remaining properties of the Geo.
 *
 */
class Point {

    public $lat;
    public $lng;
    public $marker;

    /**
     * This is a constructor.
     *
     */
    public function __construct(Geo $geo, $arg1=null, $arg2=null, $arg3=null) {
        $argv = func_get_args();
        switch (func_num_args ()) {
            default:
            case 1:
                self::PointWithoutParameter($argv[0]);
                break;
            case 4:
                self::PointWithParameters($argv[0], $argv[1], $argv[2], $argv[3]);
                break;
        }
    }

    public function PointWithoutParameter(Geo $geo) {

        array_push($geo->pointList, $this);
    }

    public function PointWithParameters(Geo $geo, $lat, $lng, $marker) {
        $this->lat = $lat;
        $this->lng = $lng;
        $this->marker = $marker;
        array_push($geo->pointList, $this);
    }

    /**
     * Returns the lat point for Geo.
     *
     * @return the lat point for Geo.
     */
    public function getLat() {
        return $this->lat;
    }

    /**
     * Sets the lat point for Geo.
     *
     * @param lat
     *            - lat point for Geo.
     *
     */
    public function setLat($lat) {
        $this->lat = $lat;
    }

    /**
     * Returns the lng point for Geo.
     *
     * @return the lng point for Geo.
     */
    public function getLng() {
        return $this->lng;
    }

    /**
     * Sets the lng point for Geo.
     *
     * @param lng
     *            - lng point for Geo.
     *
     */
    public function setLng($lng) {
        $this->lng = $lng;
    }

    /**
     * Returns the marker point for Geo.
     *
     * @return the marker point for Geo.
     */
    public function getMarker() {
        return $this->marker;
    }

    /**
     * Sets the marker point for Geo.
     *
     * @param marker
     *            - marker point for Geo.
     *
     */
    public function setMarker($marker) {
        $this->marker = $marker;
    }

    /**
     * Returns the Geo Response in JSON format.
     *
     * @return the response in JSON format.
     *
     */
    public function toString() {
        return "Lat : " . $this->lat . " : Long : " . $this->lng . " : Marker : " . $this->marker;
    }

}
?>