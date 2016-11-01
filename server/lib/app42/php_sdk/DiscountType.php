<?php

class DiscountType {
    const package_Type = "PACKAGETYPE";
    const storage_Type = "STORAGETYPE";
    const bandwidth_Type = "BANDWIDTHTYPE";
    const featureType = "FEATURETYPE";

    public $value;

    /**
     * Sets the value of the Currency.
     *
     * @param value
     *            - the value of Currency
     *
     */
    private function DiscountType($value) {
        $this->value = $value;
    }

    /**
     * Returns the value of the Currency.
     *
     * @return the value of Currency.
     *
     */
    public function getValue() {
        return value;
    }

}
?>
