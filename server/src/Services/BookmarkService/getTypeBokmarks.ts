import express, { Request, Response } from "express";
import { authMiddleware } from "../../config/middleware";
import supabase from "../../config/supabaseClient";

const router = express.Router()

const apiKey = process.env.YOUTUBE_API_KEY as string;

// GET /user/bookmarks?type=chat
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { type } = req.query;

    if (type && typeof type !== 'string') {
      return res.status(400).json({ error: 'type must be a string' });
    }

    // Base query
    let bookmarksQuery = supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (type) {
      bookmarksQuery = bookmarksQuery.eq('type', type);
    }

    const { data: bookmarks, error } = await bookmarksQuery;
    if (error) throw error;

    // Helper to fetch details
    const fetchItemDetails = async (bookmark: any) => {
      switch (bookmark.type) {
        case 'chat': {
          const { data } = await supabase
            .from('chats')
            .select('id, title, subject_emphasis, created_at')
            .eq('id', bookmark.item_id)
            .single();
          return data;
        }
        case 'video': {
          const ytData = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${bookmark.item_id}&key=${apiKey}`
          ).then(res => res.json());
          if (ytData.items?.length) {
            const vid = ytData.items[0];
            return {
              id: bookmark.item_id,
              title: vid.snippet.title,
              thumbnail: vid.snippet.thumbnails.high.url,
              publishedAt: vid.snippet.publishedAt
            };
          }
          return null;
        }
        case 'resource': {
          const { data } = await supabase
            .from('resources')
            .select('id, title, link, description, created_at')
            .eq('id', bookmark.item_id)
            .single();
          return data;
        }
        case 'question': {
          const { data } = await supabase
            .from('questions')
            .select('id, content, answer, created_at')
            .eq('id', bookmark.item_id)
            .single();
          return data;
        }
        default:
          return null;
      }
    };

    // Get detailed bookmarks
    const detailedBookmarks = await Promise.all(
      bookmarks.map(async bookmark => ({
        ...bookmark,
        item: await fetchItemDetails(bookmark)
      }))
    );

    res.status(200).json({ bookmarks: detailedBookmarks });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router