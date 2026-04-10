const axios = require("axios");
exports.fetchVideos = async (query) => {
  try {
    const API_KEY = process.env.YOUTUBE_API_KEY;

    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
      query,
    )}&type=video&maxResults=5&key=${API_KEY}`;

    const res = await axios.get(url);

    const videos = res.data.items;

    // 🔥 SECOND API CALL (for stats)
    const ids = videos.map((v) => v.id.videoId).join(",");

    const statsRes = await axios.get(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${ids}&key=${API_KEY}`,
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
    console.error("YouTube Error:", err.message);
    return [];
  }
};
