<?php
include_once "JSONObject.php";
/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
 class GeoTag {
	private $lat;
	private $lng;
          public function _construct($lat=null, $lng=null ) {

        $argv = func_get_args();
        if (count($argv) == 2) {
            $this->lat = $lat;
            $this->lng = $lng;
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
       public function getJSONObject() {
        $obj = new JSONObject();

        $obj->put("lat", $this->lat);
        $obj->put("lng", $this->lng);

        return $obj;
    }
 }
?>
