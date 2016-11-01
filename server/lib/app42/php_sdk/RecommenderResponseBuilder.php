<?php


include_once "JSONObject.php";
include_once "App42ResponseBuilder.php";
include_once "Recommender.php";

/**
 *
 * RecommenderResponseBuilder class converts the JSON response retrieved from
 * the server to the value object i.e Recommender
 *
 */
class RecommenderResponseBuilder extends App42ResponseBuilder {

    /**
     * Converts the response in JSON format to the value object i.e Recommender
     *
     * @param json
     *            - response in JSON format
     *
     * @return Recommender object filled with json data
     *
     */
    public function buildResponse($json) {
        $recommenderObj = new Recommender();
        $recommendedItemList = array();
        $recommenderObj->setRecommendedItemList($recommendedItemList);

        $recommenderObj->setStrResponse($json);
        $jsonObj = new JSONObject($json);
        $jsonObjApp42 = $jsonObj->__get("app42");
        $jsonObjResponse = $jsonObjApp42->__get("response");
        $recommenderObj->setResponseSuccess($jsonObjResponse->__get("success"));
        $jsonObjRecommender = $jsonObjResponse->__get("recommender");

        $this->buildObjectFromJSONTree($recommenderObj, $jsonObjRecommender);

        if (!$jsonObjRecommender->has("recommended"))
            return $recommenderObj;

        if ($jsonObjRecommender->__get("recommended") instanceof JSONObject) {
            // Only One attribute is there

            $jsonObjRecommended = $jsonObjRecommender->__get("recommended");
            $recomItem = new RecommendedItem($recommenderObj);

            $this->buildObjectFromJSONTree($recomItem, $jsonObjRecommended);
        } else {

            // There is an Array of attribute
            $jsonObjRecommenderArray = $jsonObjRecommender->getJSONArray("recommended");
            for ($i = 0; $i < count($jsonObjRecommenderArray); $i++) {
                // Get Individual Attribute Node and set it into Object
                //$jsonObjRecommended = new JSONObject($jsonObjRecommenderArray[$i]);
                $jsonObjRecommended = $jsonObjRecommenderArray[$i];
                $recomItem = new RecommendedItem($recommenderObj);
                $jsonObjRecommended = new JSONObject($jsonObjRecommended);
                $this->buildObjectFromJSONTree($recomItem, $jsonObjRecommended);
            }
        }

        return $recommenderObj;
    }

}
?>