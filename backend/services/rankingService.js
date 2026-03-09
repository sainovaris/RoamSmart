/**
 * Advanced ranking based on rating, popularity confidence, and user preference
 */

exports.rankPlaces = (places, userPreferences = []) => {
  // Find the maximum number of reviews among all places
  const Nmax = Math.max(...places.map((p) => p.total_ratings || 0), 1);

  return (
    places
      .map((place) => {
        const R = place.rating || 0;
        const N = place.total_ratings || 0;

        // Confidence score
        const confidence = Math.log(N + 1) / Math.log(Nmax + 1);

        // Preference boost
        const P = userPreferences.includes(place.category) ? 1 : 0;

        // Final score
        const finalScore = R * confidence * (1 + P);

        return {
          ...place,
          relevance_score: parseFloat(finalScore.toFixed(2)),
        };
      })

      // Sort descending
      .sort((a, b) => b.relevance_score - a.relevance_score)
  );
};
