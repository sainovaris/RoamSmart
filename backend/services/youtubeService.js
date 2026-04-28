const axios = require("axios");

exports.fetchVideos = async (placeName, city = "Rajkot", country = "India") => {
  try {
    const API_KEY = process.env.YOUTUBE_API_KEY;

    // 🎯 Strong query (VERY IMPORTANT)
    const query = `${placeName} ${city} ${country} travel guide`;

    console.log("🎬 YouTube search query:", query);

    const searchRes = await axios.get(
      "https://www.googleapis.com/youtube/v3/search",
      {
        params: {
          key: API_KEY,
          q: query,
          part: "snippet",
          type: "video",
          maxResults: 5,
          relevanceLanguage: "en", // 🔥 improves results
        },
      }
    );

    const items = searchRes.data.items || [];

    // ✅ Safe video IDs
    const videoIds = items
      .map((v) => v.id?.videoId)
      .filter(Boolean)
      .join(",");

    if (!videoIds) return [];

    const statsRes = await axios.get(
      "https://www.googleapis.com/youtube/v3/videos",
      {
        params: {
          key: API_KEY,
          id: videoIds,
          part: "statistics,snippet",
        },
      }
    );

    return statsRes.data.items.map((item) => ({
      title: item.snippet.title,
      videoId: item.id,
      thumbnail: item.snippet.thumbnails.medium.url,

      views: parseInt(item.statistics.viewCount || 0),
      likes: parseInt(item.statistics.likeCount || 0),
      publishedAt: item.snippet.publishedAt,
    }));

  } catch (err) {
    console.error(
      "❌ YouTube Error:",
      err?.response?.data || err.message
    );
    return [];
  }
};