<?php

class OrderByType {

    const ASCENDING = "ASCENDING";
    const DESCENDING = "DESCENDING";

    public function enum($string) {
        return constant('OrderByType::' . $string);
    }

    public function isAvailable($string) {
        if ($string == "ASCENDING")
            return "ASCENDING";
        else if ($string == "DESCENDING")
            return "DESCENDING";
        else
            return "null";
    }

}

?>
