// routes/youtube.ts
import express, { Request, Response } from "express";
import axios from "axios";
import { authMiddleware } from "../../config/middleware";
import dotenv from 'dotenv'
dotenv.config()
const router = express.Router();

const YT_BASE = "https://www.googleapis.com/youtube/v3";
const API_KEY = process.env.YOUTUBE_API_KEY!;

if (!API_KEY) {
  console.warn("[YouTube] YOUTUBE_API_KEY is not set. Requests will fail.");
}

// Helpful util to log exact API errors
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

// GET /api/youtube/search?query=...
router.get("/search", authMiddleware, async (req: Request, res: Response) => {
  try {
    const q = typeof req.query.query === "string" ? req.query.query.trim() : "";
    if (!q) {
      return res.status(400).json({ error: "Missing required query parameter: query" });
    }
    if (!API_KEY) {
      return res.status(500).json({ error: "Server missing YOUTUBE_API_KEY" });
    }

    const { data } = await axios.get(`${YT_BASE}/search`, {
      params: {
        q: `${q} tutorial OR lecture OR course OR lesson OR class`,
        part: "snippet",
        maxResults: 20,
        type: "video",
        videoDuration: "long",
        videoCategoryId: "27", // Education
        safeSearch: "strict",
        order: "relevance",
        key: API_KEY,
      },
      timeout: 12_000,
    });

    return res.json(data);
  } catch (err) {
    logAxiosError("YouTube /search error", err);
    const status = axios.isAxiosError(err) ? err.response?.status ?? 500 : 500;
    return res.status(status).json({ error: "Failed to fetch YouTube videos" });
  }
});

// GET /api/youtube/video/:videoId
router.get("/video/:videoId", async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;
    if (!videoId) return res.status(400).json({ error: "Missing videoId" });
    if (!API_KEY) {
      return res.status(500).json({ error: "Server missing YOUTUBE_API_KEY" });
    }

    // Request more parts if your UI needs them
    const { data } = await axios.get(`${YT_BASE}/videos`, {
      params: {
        part: "snippet,contentDetails,statistics",
        id: videoId,
        key: API_KEY,
      },
      timeout: 12_000,
    });

    if (!data.items?.length) {
      return res.status(404).json({ message: "Video not found" });
    }

    return res.json(data.items[0]);
  } catch (err) {
    logAxiosError("YouTube /video error", err);
    const status = axios.isAxiosError(err) ? err.response?.status ?? 500 : 500;
    return res.status(status).json({ error: "Failed to fetch video details" });
  }
});

export default router;
