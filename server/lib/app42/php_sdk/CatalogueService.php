<?php

/**
 * This Service provides a complete cloud based catalogue management. An app can
 * keep all its items based on category on the Cloud. This service provides
 * several utility methods to manage catalogue on the cloud. One can add items
 * with its related information in a particular category. And there can be
 * several categories in a catalogue. The App developer can create several
 * catalogues if needed.
 *
 * The Cart service can be used along with Catalogue service to create an end to
 * end Shopping feature for a Mobile and Web App
 *
 * @see Cart, ItemData
 * 
 */
include_once 'RestClient.class.php';
include_once 'Util.php';
include_once 'ItemData.php';
include_once 'CatalogueResponseBuilder.php';
include_once 'App42Exception.php';
include_once 'App42Log.php';
include_once 'App42Response.php';
include_once 'App42Service.php';
class CatalogueService extends App42Service {

    protected $version = "1.0";
    protected $resource = "catalogue";
    protected $baseURL;
    protected $content_type = "application/json";
    protected $accept = "application/json";

    /**
     * Constructor that takes
     *
     * @param apiKey
     * @param secretKey
     * @param baseURL
     *
     */
    public function __construct($apiKey, $secretKey) {
        //$this->resource = "charge";
        $this->apiKey = $apiKey;
        $this->secretKey = $secretKey;
        $this->url =  $this->version . "/" . $this->resource;
    }

    /**
     * Creates a Catalogue for a particular App. Categories can be added to the
     * Catalogue
     *
     * @params catalogueName
     *            - Name of the Catalogue to be created
     * @params catalogueDescription
     *            - Description of the catalogue to be created
     *
     * @returns Catalogue object
     */
    function createCatalogue($catalogueName, $catalogueDescription) {

        Util::throwExceptionIfNullOrBlank($catalogueName, "Catalogue Name");
        Util::throwExceptionIfNullOrBlank($catalogueDescription, "Catalogue Description");

        $objUtil = new Util($this->apiKey, $this->secretKey);

        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $body = null;
            $body = '{"app42":{"catalogue":{"name":"' . $catalogueName . '","description":"' . $catalogueDescription . '"}}}';
            $signParams['body'] = $body;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL;
            $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
            $catalogueResponseObj = new CatalogueResponseBuilder();
            $catalogueObj = $catalogueResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $catalogueObj;
    }

    /**
     * Creates a Category for a particular Catalogue e.g. Books, Music etc.
     *
     * @params catalogueName
     *            - Name of the Catalogue for which Category has to be created
     * @params categoryName
     *            - Name of the Category that has to be created
     * @params categoryDescription
     *            - Description of the category to be created
     *
     * @returns Catalogue object containing created category information
     */
    function createCategory($catalogueName, $categoryName, $categoryDescription) {

        Util::throwExceptionIfNullOrBlank($catalogueName, "Catalogue Name");
        Util::throwExceptionIfNullOrBlank($categoryDescription, "Catagory Description");
        Util::throwExceptionIfNullOrBlank($categoryName, "Catagory Name");
        $encodedCatName = Util::encodeParams($catalogueName);
        $objUtil = new Util($this->apiKey, $this->secretKey);

        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $body = null;
            $body = '{"app42":{"catalogue":{"categories":{"category":{"name":"' . $categoryName . '","description":"' . $categoryDescription . '"}}}}}';

            $signParams['body'] = $body;
            $signParams['catalogueName'] = $catalogueName;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/" . $encodedCatName . "/category";
            $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
            $catalogueResponseObj = new CatalogueResponseBuilder();
            $catalogueObj = $catalogueResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $catalogueObj;
    }

    /**
     * Creates a Item in a Category for a particular Catelogue
     *
     * @params catalogueName
     *            - Name of the Catalogue to which item has to be added
     * @params categoryName
     *            - Name of the Category to which item has to be added
     * @params itemData
     *            - Item Information that has to be added
     *
     * @returns Catalogue object containing added item.
     * @see ItemData
     *
     */
    function addItem($catalogueName, $categoryName, ItemData $itemData) {
        $imagePath = $itemData->getImage();
        Util::throwExceptionIfNullOrBlank($catalogueName, "Catalogue Name");
        Util::throwExceptionIfNullOrBlank($itemData, "Item Data");
        Util::throwExceptionIfNullOrBlank($categoryName, "Catagory Name");
        Util::throwExceptionIfNotValidImageExtension($imagePath, "imagePath");
        $encodedCatName = Util::encodeParams($catalogueName);
        $encodedCategoryName = Util::encodeParams($categoryName);
        $objUtil = new Util($this->apiKey, $this->secretKey);
        //$file = fopen($filePath, r);
        if (!file_exists($itemData->image)) {
            throw new App42Exception("File Not Found");
        }
        //$file = new File($filePath);
        //if(!file_exists($file)){
        //throw Exception
        //}
        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $queryParams['catalogueName'] = $catalogueName;
            $queryParams['categoryName'] = $categoryName;
              $signParams = array_merge($queryParams, $signParams);
               $postParams= array();
            $postParams['itemId'] = $itemData->itemId;
            $postParams['name'] = $itemData->name;
            $postParams['description'] = $itemData->description;
            $postParams['price'] = $itemData->price;
            $params = array_merge($postParams, $signParams);
            $signature = urlencode($objUtil->sign($params)); //die();
            $params['imageFile'] = "@" . $itemData->image;
            $headerParams['signature'] = $signature;
            $contentType = "multipart/form-data";
            $body = null;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/" . $encodedCatName . "/" . $encodedCategoryName . "/item";
            $response = RestClient::post($baseURL, $params, null, null, $contentType, $accept, $body, $headerParams);
            $catalogueResponseObj = new CatalogueResponseBuilder();
            $catalogueObj = $catalogueResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $catalogueObj;
    }

    /**
     * Fetches all items for a Catalogue
     *
     * @params catalogueName
     *            - Name of the Catalogue from which item has to be fetched
     *
     * @returns Catalogue object containing all Items
     */
    function getItems($catalogueName) {

        Util::throwExceptionIfNullOrBlank($catalogueName, "Catalogue Name");
        $encodedCatName = Util::encodeParams($catalogueName);
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $signParams['catalogueName'] = $catalogueName;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/" . $encodedCatName;
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept, $headerParams);
            $catalogueResponseObj = new CatalogueResponseBuilder();
            $catalogueObj = $catalogueResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $catalogueObj;
    }

    /**
     * Fetches all items for a Catalogue and Category
     *
     * @params catalogueName
     *            - Name of the Catalogue from which item has to be fetched
     * @params categoryName
     *            - Name of the Category from which item has to be fetched
     *
     * @returns Catalogue object
     */
    function getItemsByCategory($catalogueName, $categoryName, $max = null, $offset = null) {
        $argv = func_get_args();
        if (count($argv) == 2) {
            Util::throwExceptionIfNullOrBlank($catalogueName, "Catalogue Name");
            Util::throwExceptionIfNullOrBlank($categoryName, "Catagory Name");
            $encodedCatName = Util::encodeParams($catalogueName);
            $encodedCategoryName = Util::encodeParams($categoryName);
            $objUtil = new Util($this->apiKey, $this->secretKey);
            try {
			    $params = null;
                $headerParams = array();
                $queryParams = array();
                $signParams = $this->populateSignParams();
                $metaHeaders = $this->populateMetaHeaderParams();
                $headerParams = array_merge($signParams, $metaHeaders);
                $signParams['catalogueName'] = $catalogueName;
                $signParams['categoryName'] = $categoryName;
                $signature = urlencode($objUtil->sign($signParams)); //die();
                $headerParams['signature'] = $signature;
                $contentType = $this->content_type;
                $accept = $this->accept;
                $baseURL = $this->url;
                $baseURL = $baseURL . "/" . $encodedCatName . "/" . $encodedCategoryName;
                $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept, $headerParams);
                $catalogueResponseObj = new CatalogueResponseBuilder();
                $catalogueObj = $catalogueResponseObj->buildResponse($response->getResponse());
            } catch (App42Exception $e) {
                throw $e;
            } catch (Exception $e) {
                throw new App42Exception($e);
            }
            return $catalogueObj;
        } else {

            /**
             * Fetches all items for a Catalogue and Category by paging.
             *
             * @params catalogueName
             *            - Name of the Catalogue from which item has to be fetched
             * @params categoryName
             *            - Name of the Category from which item has to be fetched
             * @params max
             *            - Maximum number of records to be fetched
             * @params offset
             *            - From where the records are to be fetched
             *
             * @returns Catalogue object
             */
            Util::throwExceptionIfNullOrBlank($catalogueName, "Catalogue Name");
            Util::throwExceptionIfNullOrBlank($categoryName, "Catagory Name");
            Util::throwExceptionIfNullOrBlank($max, "Max");
            Util::throwExceptionIfNullOrBlank($offset, "Offset");
            Util::validateMax($max);
            $encodedCatName = Util::encodeParams($catalogueName);
            $encodedCategoryName = Util::encodeParams($categoryName);
            $encodedMax = Util::encodeParams($max);
            $encodedOffset = Util::encodeParams($offset);
            $objUtil = new Util($this->apiKey, $this->secretKey);
            try {
			    $params = null;
                $headerParams = array();
                $queryParams = array();
                $signParams = $this->populateSignParams();
                $metaHeaders = $this->populateMetaHeaderParams();
                $headerParams = array_merge($signParams, $metaHeaders);
                $signParams['catalogueName'] = $catalogueName;
                $signParams['categoryName'] = $categoryName;
                $signParams['max'] = $max;
                $signParams['offset'] = $offset;
                $signature = urlencode($objUtil->sign($signParams)); //die();
                $headerParams['signature'] = $signature;
                $contentType = $this->content_type;
                $accept = $this->accept;
                $baseURL = $this->url;
                $baseURL = $baseURL . "/paging/" . $encodedCatName . "/" . $encodedCategoryName . "/" . $encodedMax . "/" . $encodedOffset;
                $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept, $headerParams);
                $catalogueResponseObj = new CatalogueResponseBuilder();
                $catalogueObj = $catalogueResponseObj->buildResponse($response->getResponse());
            } catch (App42Exception $e) {
                throw $e;
            } catch (Exception $e) {
                throw new App42Exception($e);
            }
            return $catalogueObj;
        }
    }

    /**
     * Fetches count of all items for a Catalogue and Category
     *
     * @params catalogueName
     *            - Name of the Catalogue from which count of item has to be
     *            fetched
     * @params categoryName
     *            - Name of the Category from which count of item has to be
     *            fetched
     *
     * @returns App42Response object
     */
    function getItemsCountByCategory($catalogueName, $categoryName) {

        Util::throwExceptionIfNullOrBlank($catalogueName, "Catalogue Name");
        Util::throwExceptionIfNullOrBlank($categoryName, "Catagory Name");
        $encodedCatName = Util::encodeParams($catalogueName);
        $encodedCategoryName = Util::encodeParams($categoryName);
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		    $params = null;
            $catalogueObj = new App42Response();
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $signParams['catalogueName'] = $catalogueName;
            $signParams['categoryName'] = $categoryName;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/" . $encodedCatName . "/" . $encodedCategoryName . "/count";
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept, $headerParams);
            $catalogueObj->setStrResponse($response->getResponse());
            $catalogueObj->setResponseSuccess(true);
            $catalogueResponseObj = new CatalogueResponseBuilder();
            $catalogueObj->setTotalRecords($catalogueResponseObj->getTotalRecords($response->getResponse()));
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $catalogueObj;
    }

    /**
     * Fetches Item by id for a Catalogue and Category
     *
     * @params catalogueName
     *            - Name of the Catalogue from which item has to be fetched
     * @params categoryName
     *            - Name of the Category from which item has to be fetched
     * @params itemId
     *            - Item id for which information has to be fetched.
     *
     * @returns Catalogue object
     */
    function getItemById($catalogueName, $categoryName, $itemId) {

        Util::throwExceptionIfNullOrBlank($catalogueName, "Catalogue Name");
        Util::throwExceptionIfNullOrBlank($categoryName, "Catagory Name");
        Util::throwExceptionIfNullOrBlank($itemId, "Item Id");
        $encodedCatName = Util::encodeParams($catalogueName);
        $encodedCategoryName = Util::encodeParams($categoryName);
        $encodedItemId = Util::encodeParams($itemId);
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $signParams['catalogueName'] = $catalogueName;
            $signParams['categoryName'] = $categoryName;
            $signParams['itemId'] = $itemId;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/" . $encodedCatName . "/" . $encodedCategoryName . "/" . $encodedItemId;
            $response = RestClient::get($baseURL, $params, null, null, $contentType, $accept,$headerParams);
            $catalogueResponseObj = new CatalogueResponseBuilder();
            $catalogueObj = $catalogueResponseObj->buildResponse($response->getResponse());
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $catalogueObj;
    }

    /**
     * Removes all the Items of the given Catalogue.
     *
     * @params catalogueName
     *            - Name of the Catalogue from which item has to be removed
     *
     * @returns App42Response object containing all removed items
     */
    function removeAllItems($catalogueName) {

        Util::throwExceptionIfNullOrBlank($catalogueName, "catalogueName");
        $encodedCatName = Util::encodeParams($catalogueName);
        $responseObj = new App42Response();
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $signParams['catalogueName'] = $catalogueName;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/" . $encodedCatName;
            $response = RestClient::delete($baseURL, $params, null, null, $contentType, $accept,$headerParams);
            $responseObj->setStrResponse($response->getResponse());
            $responseObj->setResponseSuccess(true);
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $responseObj;
    }

    /**
     * Removes all the Items from a given Catalogue and Category
     *
     * @params catalogueName
     *            - Name of the Catalogue from which item has to be removed
     * @params categoryName
     *            - Name of the Category from which item has to be removed
     *            returns App42Response object containing removed items
     *
     * @returns App42Response object containing removed items by category
     */
    function removeItemsByCategory($catalogueName, $categoryName) {

        Util::throwExceptionIfNullOrBlank($catalogueName, "Catalogue Name");
        Util::throwExceptionIfNullOrBlank($categoryName, "Category Name");
        $encodedCatName = Util::encodeParams($catalogueName);
        $encodedCategoryName = Util::encodeParams($categoryName);
        $responseObj = new App42Response();
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		     $params = null;
             $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $signParams['catalogueName'] = $catalogueName;
            $signParams['categoryName'] = $categoryName;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/" . $encodedCatName . "/" . $encodedCategoryName;
            $response = RestClient::delete($baseURL, $params, null, null, $contentType, $accept,$headerParams);
            $responseObj->setStrResponse($response->getResponse());
            $responseObj->setResponseSuccess(true);
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $responseObj;
    }

    /**
     * Removes the Item for the given Id
     *
     * @params catalogueName
     *            - Name of the Catalogue from which item has to be removed
     * @params categoryName
     *            - Name of the Category from which item has to be removed
     * @params itemId
     *            - Item id which has to be removed returns App42Response object
     *            containing removed items
     *
     * @returns App42Response object containing removed items by ID
     */
    function removeItemById($catalogueName, $categoryName, $itemId) {

        Util::throwExceptionIfNullOrBlank($catalogueName, "Catalogue Name");
        Util::throwExceptionIfNullOrBlank($categoryName, "Category Name");
        Util::throwExceptionIfNullOrBlank($itemId, "Item Id");
        $encodedCatName = Util::encodeParams($catalogueName);
        $encodedCategoryName = Util::encodeParams($categoryName);
        $encodedItemId = Util::encodeParams($itemId);
        $responseObj = new App42Response();
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $signParams['catalogueName'] = $catalogueName;
            $signParams['categoryName'] = $categoryName;
            $signParams['itemId'] = $itemId;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/" . $encodedCatName . "/" . $encodedCategoryName . "/" . $encodedItemId;
            $response = RestClient::delete($baseURL, $params, null, null, $contentType, $accept,$headerParams);
                $responseObj->setStrResponse($response->getResponse());
            $responseObj->setResponseSuccess(true);
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $responseObj;
    }

     function deleteCategory($catalogueName,$categoryName) {

        Util::throwExceptionIfNullOrBlank($catalogueName, "CatalogueName");
        Util::throwExceptionIfNullOrBlank($categoryName, "CategoryName");
        $encodedCatalogueName = Util::encodeParams($catalogueName);
          $encodedCategoryName = Util::encodeParams($categoryName);
        $responseObj = new App42Response();
        $objUtil = new Util($this->apiKey, $this->secretKey);
        try {
		    $params = null;
            $headerParams = array();
            $queryParams = array();
            $signParams = $this->populateSignParams();
            $metaHeaders = $this->populateMetaHeaderParams();
            $headerParams = array_merge($signParams, $metaHeaders);
            $signParams['catalogueName'] = $catalogueName;
            $signParams['categoryName'] = $categoryName;
            $signature = urlencode($objUtil->sign($signParams)); //die();
            $headerParams['signature'] = $signature;
            $contentType = $this->content_type;
            $accept = $this->accept;
            $baseURL = $this->url;
            $baseURL = $baseURL . "/" . $encodedCatalogueName . "/category" . "/" . $encodedCategoryName;
            $response = RestClient::delete($baseURL, $params, null, null, $contentType, $accept,$headerParams);
            $responseObj->setStrResponse($response->getResponse());
            $responseObj->setResponseSuccess(true);
        } catch (App42Exception $e) {
            throw $e;
        } catch (Exception $e) {
            throw new App42Exception($e);
        }
        return $responseObj;
    }

}
?>