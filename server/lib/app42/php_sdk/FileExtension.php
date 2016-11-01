<?php
/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
class FileExtension{
     const PNG = "png";
    const JPG = "jpg";
    const GIF = "gif";

    public function enum($string) {
        return constant('FileExtension::' . $string);
    }

    public function isAvailable($string) {
        if ($string == "PNG")
            return "png";
        else if ($string == "JPG")
            return "jpg";
        else if ($string == "GIF")
            return "gif";
        else
            return "null";
    }
}
?>
