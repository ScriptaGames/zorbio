<?php

include_once "JSONObject.php";
include_once "Catalogue.php";
include_once "App42ResponseBuilder.php";

/**
 *
 * CatalogueResponseBuilder class converts the JSON response retrieved from the
 * server to the value object i.e Catalogue
 *
 */
class CatalogueResponseBuilder extends App42ResponseBuilder {

    /**
     * Converts the response in JSON format to the value object i.e Catalogue
     *
     * @params json
     *            - response in JSON format
     *
     * @return Catalogue object filled with json data
     *
     */
    function buildResponse($json) {
        $cataloguesJSONObject = $this->getServiceJSONObject("catalogues", $json);
        $catalogueJSONObject = $cataloguesJSONObject->__get("catalogue");
        $catalogue = new Catalogue();
        $catalogue = $this->buildCatalogueObject($catalogueJSONObject);
        //$catalogue->setAttributeList($attributeList);
        $catalogue->setStrResponse($json);
        $catalogue->setResponseSuccess($this->isRespponseSuccess($json));
        return $catalogue;
    }

    /**
     * Converts the User JSON object to the value object i.e Catalogue
     *
     * @params catalogueJSONObj
     *            - Catalogue data as JSONObject
     *
     * @return Catalogue object filled with json data
     *
     */
    function buildCatalogueObject($catalogueJSONObj) {

        $catalogue = new Catalogue();
        $this->buildObjectFromJSONTree($catalogue, $catalogueJSONObj);
        if ($catalogueJSONObj->has("categories") && $catalogueJSONObj->__get("categories")->has("category")) {
            // Fetch Items
            if ($catalogueJSONObj->__get("categories")->__get("category") instanceof JSONObject) {
                $categoryJSONObj = $catalogueJSONObj->__get("categories")->__get("category");
                $catalogueCategory = new Category($catalogue);
                $this->buildObjectFromJSONTree($catalogueCategory, $categoryJSONObj);

                if ($categoryJSONObj->has("items") && $categoryJSONObj->__get("items")->has("item")) {

                    if ($categoryJSONObj->__get("items")->__get("item") instanceof JSONObject) {
                        //Single Item
                        $itemJSONObj = $categoryJSONObj->__get("items")->__get("item");
                        $item = new CatalogueItem($catalogueCategory);
                        $this->buildObjectFromJSONTree($item, $itemJSONObj);
                    } else {
                        //Multiple Items
                        $categoryJSONArray = $categoryJSONObj->__get("items")->getJSONArray("item");
                       
                        for ($j = 0; $j < count($categoryJSONArray); $j++) {

                            $itemJSONObject = $categoryJSONArray[$j];
                            $itemArray = new CatalogueItem($catalogueCategory);
                            $itemJSONObjectArray = new JSONObject($itemJSONObject);
                            $this->buildObjectFromJSONTree($itemArray, $itemJSONObjectArray);
                        }
                    }
                }
            } else {
                //Multiple Items
                $itemJSONArray = $catalogueJSONObj->__get("categories")->getJSONArray("category");
                for ($i = 0; $i < count($itemJSONArray); $i++) {
                    $categoryJSONObj = $itemJSONArray[$i];
                    $catalogueCategory = new Category($catalogue);
                    $categoryJSONObj = new JSONObject($categoryJSONObj);
                    $this->buildObjectFromJSONTree($catalogueCategory, $categoryJSONObj);
                    // Check for Items Now
                    if ($categoryJSONObj->has("items") && $categoryJSONObj->__get("items")->has("item")) {

                        if ($categoryJSONObj->__get("items")->__get("item") instanceof JSONObject) {
                            //Single Item
                            $itemJSONObj = $categoryJSONObj->__get("items")->__get("item");
                            $item = new CatalogueItem($catalogueCategory);
                            $this->buildObjectFromJSONTree($item, $itemJSONObj);
                        } else {
                            //Multiple Items
                            $categoryJSONArray = $categoryJSONObj->__get("items")->getJSONArray("item");
                            for ($j = 0; $j < count($categoryJSONArray); $j++) {
                                $itemJSONObj = $categoryJSONArray[$j];
                                $itemJSONObj = new JSONObject($itemJSONObj);
                                $item = new CatalogueItem($catalogueCategory);
                                $this->buildObjectFromJSONTree($item, $itemJSONObj);
                            }
                        }
                    }
                }
            }
        }
        return $catalogue;
    }

    /**
     * Converts the response in JSON format to the list of value objects i.e
     * Catalogue
     *
     * @params response
     *            - response in JSON format
     *
     * @return List of Catalogue object filled with json data
     *
     */
    function buildArrayResponse($json) {
        $cataloguesJSONObj = $this->getServiceJSONObject("catalogues", $json);
        $catalogueList = array();

        if ($cataloguesJSONObj->__get("catalogue") instanceof JSONObject) {

            $catalogueJSONObj = $cataloguesJSONObj->__get("catalogue");
            $catalogueJSONObj = new JSONObject($catalogueJSONObj);
            $objCatalogue = new Catalogue();
            $catalogue = $objCatalogue->buildCatalogueObject($catalogueJSONObj);
            $catalogue->setStrResponse($json);
            $catalogue->setResponseSuccess($this->isRespponseSuccess($json));
            array_push($catalogueList, $catalogue);
        } else {

            $catalogueJSONArray = $cataloguesJSONObj->getJSONArray("catalogue");

            for ($i = 0; $i < count($catalogueJSONArray); $i++) {

                $catalogueJSONObj = $catalogueJSONArray[$i];
                $objCatalogue = new Catalogue();
                $catalogue = $objCatalogue->buildCatalogueObject($catalogueJSONObj);
                $catalogue->setStrResponse($json);
                $catalogue->setResponseSuccess($this->isRespponseSuccess($json));
                array_push($catalogueList, $catalogue);
            }
        }
        return $catalogueList;
    }

}
?>