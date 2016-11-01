<?php


/**
 * An enum that contains 2 types of the Recommender Similarity either
 * EuclideanDistanceSimilarity or PearsonCorrelationSimilarity.
 *
 */
class RecommenderSimilarity {
    const EUCLIDEAN_DISTANCE = "EuclideanDistanceSimilarity";
    const PEARSON_CORRELATION = "PearsonCorrelationSimilarity";

    public function enum($string) {
        return constant('com\shephertz\app42\paas\sdk\php\recommend\RecommenderSimilarity::' . $string);
    }

    public function isAvailable($string) {
        if ($string == "EuclideanDistanceSimilarity")
            return "EUCLIDEAN_DISTANCE";
        else if ($string == "PearsonCorrelationSimilarity")
            return "PEARSON_CORRELATION";
        else
            return "null";
    }

}
?>
