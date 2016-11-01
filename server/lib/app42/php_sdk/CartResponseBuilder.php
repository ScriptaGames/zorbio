<?php

include_once "JSONObject.php";
include_once "Cart.php";
include_once "App42ResponseBuilder.php";

/**
 *
 * CartResponseBuilder class converts the JSON response retrieved from the
 * server to the value object i.e Cart
 *
 */
class CartResponseBuilder extends App42ResponseBuilder {

    /**
     * Converts the response in JSON format to the value object i.e Cart
     *
     * @params json
     *            - response in JSON format
     *
     * @return Cart object filled with json data
     *
     */
    function buildResponse($json) {
        $cartsJSONObj = $this->getServiceJSONObject("carts", $json);
        $cartJSONObj = $cartsJSONObj->__get("cart");
        $cart = new Cart();
        $cart = $this->buildCartObject($cartJSONObj);
        $cart->setStrResponse($json);
        $cart->setResponseSuccess($this->isRespponseSuccess($json));
        return $cart;
    }

    /**
     * Converts the Cart JSON object to the value object i.e Cart
     *
     * @params cartJSONObj
     *            - cart data as JSONObject
     *
     * @return Cart object filled with json data
     *
     */
    function buildCartObject($cartJSONObj) {

        $cartJSONObj = new JSONObject($cartJSONObj);
        $cart = new Cart();
        $this->buildObjectFromJSONTree($cart, $cartJSONObj);
        if ($cartJSONObj->has("items") && $cartJSONObj->__get("items")->has("item")) {
            // Fetch Items
            if ($cartJSONObj->__get("items")->__get("item") instanceof JSONObject) {
                $itemJSONObj = $cartJSONObj->__get("items")->__get("item");
                $item = new Item($cart);
                $this->buildObjectFromJSONTree($item, $itemJSONObj);
            } else {
                //Multiple Items
                $itemJSONArray = $cartJSONObj->__get("items")->getJSONArray("item");
                for ($i = 0; $i < count($itemJSONArray); $i++) {
                    $itemJSONObj = $itemJSONArray[$i];
                    $item = new Item($cart);
                    $itemJSONObj = new JSONObject($itemJSONObj);
                    $this->buildObjectFromJSONTree($item, $itemJSONObj);
                }
            }
        }
        if ($cartJSONObj->has("payments") && $cartJSONObj->__get("payments")->has("payment")) {
            // Fetch Payment
          
            $paymentJSONObj = $cartJSONObj->__get("payments")->__get("payment");
            $payment = new Payment($cart);
            $this->buildObjectFromJSONTree($payment, $paymentJSONObj);
        }
        return $cart;
    }

    /**
     * Converts the response in JSON format to the list of value objects i.e
     * Cart
     *
     * @params json
     *            - response in JSON format
     *
     * @return List of Cart object filled with json data
     *
     */
    function buildArrayResponse($json) {
        $cartsJSONObj = $this->getServiceJSONObject("carts", $json);
        $cartList = array();
        if ($cartsJSONObj->__get("cart") instanceof JSONObject) {

            $cartJSONObj = $cartsJSONObj->__get("cart");
            $cart = $this->buildCartObject($cartJSONObj);
            $cart->setStrResponse($json);
            $cart->setResponseSuccess($this->isRespponseSuccess($json));
            array_push($cartList, $cart);
        } else {
            $cartJSONArray = $cartsJSONObj->getJSONArray("cart");
            for ($i = 0; $i < count($cartJSONArray); $i++) {
                $cartJSONObj = $cartJSONArray[$i];
                $objCart = new Cart();
                $cart = $this->buildCartObject($cartJSONObj);
                $cart->setStrResponse($json);
                $cart->setResponseSuccess($this->isRespponseSuccess($json));
                array_push($cartList, $cart);

            }
        }
        return $cartList;
    }

}
?>