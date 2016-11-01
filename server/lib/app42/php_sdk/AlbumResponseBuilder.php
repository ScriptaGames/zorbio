<?php

include_once "JSONObject.php";
include_once "App42ResponseBuilder.php";
include_once "Album.php";

/**
 *
 * AlbumResponseBuilder class converts the JSON response retrieved from the
 * server to the value object i.e Album
 *
 */
class AlbumResponseBuilder extends App42ResponseBuilder {

    /**
     * Converts the response in JSON format to the value object i.e Album
     *
     * @params json
     *            - response in JSON format
     *
     * @return Album object filled with json data
     *
     */
    public function buildResponse($json) {
        $albumsJSONObj = $this->getServiceJSONObject("albums", $json);
        $albumJSONObj = $albumsJSONObj->__get("album");
        $albumObj = new Album();
        $albumObj->setStrResponse($json);
        $albumObj->setResponseSuccess($this->isRespponseSuccess($json));
        $this->buildObjectFromJSONTree($albumObj, $albumJSONObj);
        if (!$albumJSONObj->has("photos"))
            return $albumObj;
        if (!$albumJSONObj->__get("photos")->has("photo"))
            return $albumObj;
        if ($albumJSONObj->__get("photos")->__get("photo") instanceof JSONObject) {
            // Single Entry
            $photoObj = new Photo($albumObj);
            $this->buildObjectFromJSONTree($photoObj, $albumJSONObj->__get("photos")->__get("photo"));
            $photoObj = $this->setTagList($photoObj, $albumJSONObj->__get("photos")->__get("photo"));
        } else {
            // Multiple Entry
            $photoJSONArray = $albumJSONObj->__get("photos")->getJSONArray("photo");
            for ($i = 0; $i < count($photoJSONArray); $i++) {
                $photoJsonObj = $photoJSONArray[$i];
                $photoJSONObj = new JSONObject($photoJsonObj);
                $photoObj = new Photo($albumObj);
                $this->buildObjectFromJSONTree($photoObj, $photoJSONObj);
                $photoObj = $this->setTagList($photoObj, $photoJSONObj);
            }
        }

        return $albumObj;
    }

    /**
     * Converts the Album JSON object to the value object i.e Album
     *
     * @params albumsJSONObj
     *            - Album data as JSONObject
     *
     * @return Album object filled with json data
     *
     */
    private function buildAlbumObject($albumJSONObj) {

        $albumObj = new Album();
        $albumsJSONObj = new JSONObject($albumJSONObj);
        $this->buildObjectFromJSONTree($albumObj, $albumsJSONObj);
        if ($albumsJSONObj->has("photos") && $albumsJSONObj->__get("photos")->has("photo")) {
            if ($albumsJSONObj->__get("photos")->__get("photo") instanceof JSONObject) {

                $photoJsonObj = $albumsJSONObj->__get("photos")->__get("photo");

                // Single Entry
                $photoObj = new Photo($albumObj);
                $this->buildObjectFromJSONTree($photoObj, $albumsJSONObj->__get("photos")->__get("photo"));
                $photoObj = $this->setTagList($photoObj, $photoJsonObj);
            } else {
               
                // Multiple Entry
                $photoJSONArray = $albumsJSONObj->__get("photos")->getJSONArray("photo");
                for ($j = 0; $j < count($photoJSONArray); $j++) {
                    $photoJSONObj = $photoJSONArray[$j];
                    $photoObject = new Photo($albumObj);
                    $photoJsonObject = new JSONObject($photoJSONObj);
                    $this->buildObjectFromJSONTree($photoObject, $photoJsonObject);
                    $photoObj = $this->setTagList($photoObject, $photoJsonObject);
                }
            }
        }
        return $albumObj;
    }

    /**
     * Converts the response in JSON format to the list of value objects i.e
     * Album
     *
     * @params json
     *            - response in JSON format
     *
     * @return List of Album object filled with json data
     *
     */
    public function buildArrayResponse($json) {
        $albumsJSONObj = $this->getServiceJSONObject("albums", $json);
        $albumList = array();

        if ($albumsJSONObj->__get("album") instanceof JSONObject) {
            $albumJSONObj = $albumsJSONObj->__get("album");
            $albumObj = new Album();
            $albumObj = $this->buildAlbumObject($albumJSONObj);
            $albumObj->setStrResponse($json);
            $albumObj->setResponseSuccess($this->isRespponseSuccess($json));
            array_push($albumList, $albumObj);
        } else {

            $albumJSONArray = $albumsJSONObj->getJSONArray("album");
            for ($i = 0; $i < count($albumJSONArray); $i++) {
                $albumJSONObj = $albumJSONArray[$i];
                $albumObj = new Album();
                $albumObj = $this->buildAlbumObject($albumJSONObj);
                $albumObj->setStrResponse($json);
                $albumObj->setResponseSuccess($this->isRespponseSuccess($json));
                $albumJSONObj = new JSONObject($albumJSONObj);
                $this->buildObjectFromJSONTree($albumObj, $albumJSONObj);
                array_push($albumList, $albumObj);
//                if ($albumJSONObj->has("photos") && $albumJSONObj->__get("photos")->has("photo")) {
//
//                    if ($albumJSONObj->__get("photos")->__get("photo") instanceof JSONObject) {
//                        // Single Entry
//                        $photoObj = new Photo($albumObj);
//                        $this->buildObjectFromJSONTree($photoObj, $albumJSONObj->__get("photos")->__get("photo"));
//                    } else {
//                        // Multiple Entry
//                        $photoJSONArray = $albumJSONObj->__get("photos")->getJSONArray("photo");
//                        for ($j = 0; $j < count($photoJSONArray); $j++) {
//                            $photoJSONObj = $photoJSONArray[$j];
//                            $photoObject = new Photo($albumObj);
//                            $photoJSONObject = new JSONObject($photoJSONObj);
//                            $this->buildObjectFromJSONTree($photoObject, $photoJSONObject);
//                            $photoObj = $this->setTagList($photoObject, $photoJSONObject);
//                        }
//                    }
//                }
            }
        }
        return $albumList;
    }

    /**

     * set tags to the list

     * @param photoObj

     * @param photoJsonObj

     * @return photo object

     */
    private function setTagList($photoObj, $photoJsonObj) {

        if ($photoJsonObj->has("tags")) {
              $tagList = array();
            if (is_array($photoJsonObj->__get("tags"))) {
                $tagArr = $photoJsonObj->getJSONArray("tags");
                $photoObj->setTagList($photoJsonObj->getJSONArray("tags"));
            } else {

                array_push($tagList, $photoJsonObj->__get("tags"));
                $photoObj->setTagList($tagList);
            }
        }
        return $photoObj;
    }

}
?>