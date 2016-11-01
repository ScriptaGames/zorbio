<?php
include_once "JSONObject.php";
include_once "Upload.php";
include_once "App42ResponseBuilder.php";

/**
 *
 * UploadResponseBuilder class converts the JSON response retrieved from the
 * server to the value object i.e User
 *
 */
class UploadResponseBuilder extends App42ResponseBuilder {

    /**
     * Converts the response in JSON format to the value object i.e Upload
     *
     * @params json
     *            - response in JSON format
     *
     * @return Upload object filled with json data
     *
     */
    public function buildResponse($json) {
        $uploadObj = new Upload();

        $uploadObj->setStrResponse($json);
        $uploadObj->setResponseSuccess($this->isRespponseSuccess($json));

        $jsonObjUpload = $this->getServiceJSONObject("upload", $json);
        // Get File Item Array
        $jsonObjFiles = $jsonObjUpload->__get("files");

        if ($jsonObjFiles->__get("file") instanceof JSONObject) {
            //
            $jsonObjFile = $jsonObjFiles->__get("file");
            $fileObj = new File($uploadObj);
            $this->buildObjectFromJSONTree($fileObj, $jsonObjFile);
        } else {
            $jsonObjFileArray = $jsonObjFiles->getJSONArray("file");
            for ($i = 0; $i < count($jsonObjFileArray); $i++) {
                $fileObj = new File($uploadObj);
                $jsonObjFile = $jsonObjFileArray[$i];
                $jsonObjFile = new JSONObject($jsonObjFile);
                $this->buildObjectFromJSONTree($fileObj, $jsonObjFile);
            }
        }
        return $uploadObj;
    }

}
?>