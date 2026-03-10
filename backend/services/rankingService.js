exports.rankPlaces = (places, userPreferences = []) => {
  console.log("Ranking function called!");
  console.log("User preferences:", userPreferences);
  console.log(
    "Places before ranking:",
    places.map((p) => p.name),
  );

  const Nmax = Math.max(...places.map((p) => p.total_ratings || 0), 1);

  const ranked = places
    .map((place) => {
      const R = place.rating || 0;
      const N = place.total_ratings || 1;
      const confidence = Math.log(N + 1) / Math.log(Nmax + 1);
      const P = userPreferences.includes(place.category) ? 1 : 0;
      const finalScore = R * confidence * (1 + P);

      console.log(`${place.name} => score: ${finalScore.toFixed(2)}`);

      return {
        ...place,
        relevance_score: parseFloat(finalScore.toFixed(2)),
      };
    })
    .sort((a, b) => b.relevance_score - a.relevance_score);

  console.log(
    "Ranked places:",
    ranked.map((p) => `${p.name} (${p.relevance_score})`),
  );
  return ranked;
};
