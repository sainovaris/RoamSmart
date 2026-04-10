exports.rankVideos = (videos, query) => {
  const keywords = query.toLowerCase().split(" ");

  return videos
    .map((video) => {
      // 📊 Views Score (log scale)
      const viewScore = Math.log10(video.views + 1) * 0.4;

      // ❤️ Likes Score
      const likeScore = Math.log10(video.likes + 1) * 0.2;

      // 🎯 Keyword Matching
      const title = video.title.toLowerCase();

      let keywordMatches = 0;
      keywords.forEach((word) => {
        if (title.includes(word)) keywordMatches++;
      });

      const keywordScore =
        (keywordMatches / keywords.length) * 0.2;

      // 📅 Recency Score (newer = better)
      const daysOld =
        (Date.now() - new Date(video.publishedAt)) /
        (1000 * 60 * 60 * 24);

      const recencyScore = Math.max(0, 1 - daysOld / 365) * 0.2;

      // 🔥 FINAL SCORE
      const finalScore =
        viewScore + likeScore + keywordScore + recencyScore;

      return {
        ...video,
        video_score: parseFloat(finalScore.toFixed(3)),
      };
    })
    .sort((a, b) => b.video_score - a.video_score)
    .slice(0, 3);
};