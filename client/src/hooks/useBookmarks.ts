import { useEffect, useState, useCallback } from "react";
import axios from "axios";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = "https://acadex-tutor-ai.onrender.com";

// axios.defaults.baseURL = "http://localhost:5050";

export type BookmarkType = "chat" | "video" | "resource" | "question";

interface BaseBookmark {
  id: string;
  type: BookmarkType;
  item_id: string;
  created_at: string;
}

interface ChatBookmark extends BaseBookmark {
  type: "chat";
  item: {
    id: string;
    title: string;
    subject_emphasis: string;
    created_at: string;
  };
}

interface VideoBookmark extends BaseBookmark {
  type: "video";
  item: {
    id: string;
    title: string;
    url: string;
    created_at: string;
  };
}

interface ResourceBookmark extends BaseBookmark {
  type: "resource";
  item: {
    id: string;
    title: string;
    link: string;
    description: string;
    created_at: string;
  };
}

interface QuestionBookmark extends BaseBookmark {
  type: "question";
  item: {
    id: string;
    content: string;
    answer: string;
    created_at: string;
  };
}

export type BookmarkUnion =
  | ChatBookmark
  | VideoBookmark
  | ResourceBookmark
  | QuestionBookmark;

export const useBookmarks = (type?: BookmarkType) => {
  const [bookmarks, setBookmarks] = useState<BookmarkUnion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Fetch bookmarks
  const fetchBookmarks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await axios.get("/bookmark/all", {
        params: type ? { type } : {},
      });
      console.log(res)

      if (res?.data?.bookmarks) {
        setBookmarks(res.data.bookmarks);
      }
    } catch (err: any) {
      console.error("Error fetching bookmarks:", err.message);
      setError("Failed to fetch bookmarks");
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  useEffect(() => {
    console.log(bookmarks);
  }, [bookmarks]);


  // ✅ Check if a specific item is bookmarked (calls GET /bookmarks/:type/:itemId)
  const checkIfBookmarked = useCallback(
    async (type: BookmarkType, itemId: string): Promise<boolean> => {
      try {
        const res = await axios.get(`/bookmark/${type}/${itemId}`);
        return res?.data?.bookmarked ?? false;
      } catch (err) {
        console.error("Error checking bookmark:", err);
        return false;
      }
    },
    []
  );

  // ✅ Add a new bookmark (POST /user/bookmarks)
  const addBookmark = useCallback(
    async (type: BookmarkType, itemId: string) => {
      try {
        const res = await axios.post("/bookmark/add", {
          type,
          item_id: itemId,
        });

        // Optionally refresh the list
        fetchBookmarks();
        return res?.data?.bookmark;
      } catch (err: any) {
        console.error("Error adding bookmark:", err.message);
        throw new Error(err.response?.data?.error || "Failed to add bookmark");
      }
    },
    [fetchBookmarks]
  );

  // ✅ Remove a bookmark (DELETE /user/bookmarks/:type/:itemId)
  const removeBookmark = useCallback(
    async (type: BookmarkType, itemId: string) => {
      try {
        await axios.delete(`/bookmark/${type}/${itemId}`);
        fetchBookmarks(); // Refresh the bookmarks list
      } catch (err: any) {
        console.error("Error removing bookmark:", err.message);
        throw new Error(err.response?.data?.error || "Failed to remove bookmark");
      }
    },
    [fetchBookmarks]
  );

  // ✅ Local check from current state (faster than hitting the API)
  const isBookmarked = useCallback(
    (itemId: string) => {
      return bookmarks.some((bm) => bm.item_id === itemId);
    },
    [bookmarks]
  );

  return {
    bookmarks,
    loading,
    error,
    fetchBookmarks,
    isBookmarked,      // local check
    checkIfBookmarked, // API check
    addBookmark,
    removeBookmark,
  };
};
