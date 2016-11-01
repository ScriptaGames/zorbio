<?php

include_once "JSONObject.php";

/**
 *
 * This Geo Point object is the value object which contains the properties of
 * Geo Point along with the setter & getter for those properties.
 *
 */
class GeoPoint {

    public $lat;
    public $lng;
    public $marker;

    public function _construct($lat=null, $lng=null, $marker=null) {

        $argv = func_get_args();
        if (count($argv) == 3) {
            $this->lat = $lat;
            $this->lng = $lng;
            $this->marker = $marker;
        } else {

        }
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
     * Returns the lat point for Geo.
     *
     * @return the lat point for Geo.
     */
    public function getLat() {
        return $this->lat;
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
     * Returns the lng point for Geo.
     *
     * @return the lng point for Geo.
     */
    public function getLng() {
        return $this->lng;
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
     * Returns the marker point for Geo.
     *
     * @return the marker point for Geo.
     */
    public function getMarker() {
        return $this->marker;
    }

    /**
     * Values coming from response are converted into JSON format.
     *
     * @return JSON Response
     * @throws JSONException
     */
    public function getJSONObject() {
        $obj = new JSONObject();
        $obj->put("lat", $this->lat);
        $obj->put("lng", $this->lng);
        $obj->put("marker", $this->marker);
        return $obj;
    }

}
?>