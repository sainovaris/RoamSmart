/**
 * Ranks places based on rating, popularity (number of reviews), and status
 */
exports.rankPlaces = (places) => {
  return (
    places
      .map((place) => {
        // Basic Math: 70% weight to Rating, 30% weight to quantity of reviews
        // We use Math.log10 to prevent a place with 10,000 reviews from
        // completely destroying a place with 500 reviews.
        const popularityScore = Math.log10(place.total_ratings + 1) * 0.3;
        const ratingScore = place.rating * 0.7;

        let finalScore = ratingScore + popularityScore;

        // Penalty: If it's closed, drop the score significantly
        if (place.is_open === false) {
          finalScore -= 3;
        }

        return {
          ...place,
          relevance_score: parseFloat(finalScore.toFixed(2)),
        };
      })
      // Sort from highest score to lowest
      .sort((a, b) => b.relevance_score - a.relevance_score)
  );
};
