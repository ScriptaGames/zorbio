<?php

/*  File Name : PaymentStatus.php
 *  Description : Class PaymentStatus
 *  Author : Rohit Raina  17-03-2012
 * class that contains 3 types of the Payment Status either DECLINED or
 * AUTHORIZED or PENDING.
 */

class PaymentStatus {
    const DECLINED = "DECLINED";
    const AUTHORIZED = "AUTHORIZED";
    const PENDING = "PENDING";
    private $value;

    public function enum($string) {
        return constant('com\shephertz\app42\paas\sdk\php\shopping\PaymentStatus::' . $string);
    }

    public function isAvailable($string) {
        if ($string == "DECLINED")
            return "DECLINED";
        else if ($string == "AUTHORIZED")
            return "AUTHORIZED";
        else if ($string == "PENDING")
            return "PENDING";
        else
            return "null";
    }

}
?>
