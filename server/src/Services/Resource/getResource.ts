import express, { Request, Response } from "express";
import axios from "axios";
import dotenv from "dotenv";
import { authMiddleware } from "../../config/middleware";

dotenv.config();
const router = express.Router();

const YOUTUBE_KEY = process.env.YOUTUBE_API_KEY;
const YT_BASE = "https://www.googleapis.com/youtube/v3";

// 🧩 Utility for logging axios errors clearly
function logAxiosError(tag: string, err: unknown) {
  if (axios.isAxiosError(err)) {
    console.error(`${tag}:`, {
      status: err.response?.status,
      data: err.response?.data,
      url: err.config?.url,
      params: err.config?.params,
    });
  } else {
    console.error(`${tag}:`, err);
  }
}

// 🌍 Base endpoints
const OPENLEARN_API = "https://www.open.edu/openlearn/openlearn_courses_feed.json";
const OPENLIBRARY_BASE = "https://openlibrary.org/search.json";
const KHAN_BASE = "https://www.khanacademy.org/api/v1/topic";

// 🎯 Route: GET /api/resources/search?query=math
router.get("/search", authMiddleware, async (req: Request, res: Response) => {
  const query = (req.query.query as string)?.trim() || "education";

  try {
    const OPENLIBRARY_API = `${OPENLIBRARY_BASE}?q=${encodeURIComponent(query)}`;
    const KHAN_API = `${KHAN_BASE}/math`; // Khan API isn’t search-based; static fallback
    const YOUTUBE_API = `${YT_BASE}/search`;

    // 🕸️ Parallel requests
    const [openlearnRes, openlibraryRes, khanRes, youtubeRes] = await Promise.allSettled([
      axios.get(OPENLEARN_API),
      axios.get(OPENLIBRARY_API),
      axios.get(KHAN_API),
      axios.get(YOUTUBE_API, {
        params: {
          q: `${query} tutorial OR lecture OR course OR lesson OR class`,
          part: "snippet",
          maxResults: 10,
          type: "video",
          videoDuration: "long",
          videoCategoryId: "27", // Education
          safeSearch: "strict",
          order: "relevance",
          key: YOUTUBE_KEY,
        },
        timeout: 10_000,
      }),
    ]);
console.log(openlearnRes);
    // 🧠 Format results
    const openlearn =
      openlearnRes.status === "fulfilled"
        ? openlearnRes.value.data.slice(0, 10).map((c: any) => ({
            title: c.title,
            link: c.link,
            category: c.category,
          }))
        : [];
console.log(openlibraryRes);
    const openlibrary =
      openlibraryRes.status === "fulfilled"
        ? openlibraryRes.value.data.docs.slice(0, 10).map((b: any) => ({
            title: b.title,
            author: b.author_name?.[0],
            year: b.first_publish_year,
            cover: b.cover_i
              ? `https://covers.openlibrary.org/b/id/${b.cover_i}-L.jpg`
              : null,
          }))
        : [];
console.log(khanRes);
    const khanAcademy =
      khanRes.status === "fulfilled"
        ? khanRes.value.data.children?.slice(0, 10).map((item: any) => ({
            title: item.title,
            url: `https://www.khanacademy.org${item.relative_url}`,
          }))
        : [];
console.log(youtubeRes);
    const youtube =
      youtubeRes.status === "fulfilled"
        ? youtubeRes.value.data.items.map((v: any) => ({
            title: v.snippet.title,
            channel: v.snippet.channelTitle,
            thumbnail: v.snippet.thumbnails.medium.url,
            link: `https://www.youtube.com/watch?v=${v.id.videoId}`,
          }))
        : [];

    res.status(200).json({
      success: true,
      message: "Fetched educational resources successfully",
      data: {
        openlearn,
        openlibrary,
        khanAcademy,
        youtube,
      },
    });
  } catch (err) {
    logAxiosError("Resources /search error", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch educational resources",
    });
  }
});

export default router;
