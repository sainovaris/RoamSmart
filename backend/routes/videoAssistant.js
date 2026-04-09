const express = require("express");
const axios = require("axios");
const router = express.Router();

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// 👉 GET VIDEOS
router.get("/", async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    const url = "https://www.googleapis.com/youtube/v3/search";

    const response = await axios.get(url, {
      params: {
        part: "snippet",
        q: query,
        maxResults: 10,
        type: "video",
        key: YOUTUBE_API_KEY,
      },
    });

    const videos = response.data.items;

    // 🎯 FORMAT
    const formatted = videos.map((video) => ({
      title: video.snippet.title,
      url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
      thumbnail: video.snippet.thumbnails.medium.url,
      channel: video.snippet.channelTitle,
      publishedAt: video.snippet.publishedAt,
    }));

    // ⭐ SIMPLE SCORING
    const scored = formatted.map((v) => {
      let score = 0;

      // recent videos
      const daysOld =
        (Date.now() - new Date(v.publishedAt)) / (1000 * 60 * 60 * 24);
      score += Math.max(0, 10 - daysOld / 30);

      // title relevance
      if (v.title.toLowerCase().includes(query.toLowerCase())) {
        score += 5;
      }

      return { ...v, score };
    });

    // 🔥 SORT + TOP 3
    const topVideos = scored.sort((a, b) => b.score - a.score).slice(0, 3);

    res.json({
      poi: query,
      videos: topVideos,
    });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch videos" });
  }
});

module.exports = router;
