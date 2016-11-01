<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 * class that contains 2 types of the EmailMIME either text/plain or
 * text/html.
 *
 */

class EmailMIME {
    const PLAIN_TEXT_MIME_TYPE = "text/plain";
    const HTML_TEXT_MIME_TYPE = "text/html";

    public function enum($string) {

        return constant('com\shephertz\app42\paas\sdk\php\email\EmailMIME::' . $string);
    }

    public function isAvailable($string) {
        if ($string == "text/plain")
            return "PLAIN_TEXT_MIME_TYPE";
        else if ($string == "text/html")
            return "HTML_TEXT_MIME_TYPE";
        else
            return "null";
    }

}
?>