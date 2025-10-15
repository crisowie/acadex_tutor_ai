import { Bookmark, BookmarkCheck } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';

// You should define this type centrally (in /types or in useBookmarks.ts)
export type BookmarkType = 'chat' | 'video' | 'resource' | 'question';

// Axios global setup
axios.defaults.withCredentials = true;
axios.defaults.baseURL = "https://acadex-tutor-ai.onrender.com";
// axios.defaults.baseURL ="http://localhost:5050"

interface BookmarkToggleButtonProps {
  itemId: string;     
  type: BookmarkType;   
}

const BookmarkToggleButton: React.FC<BookmarkToggleButtonProps> = ({ itemId, type }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  /**
   * Check bookmark status from backend on mount or when `itemId` or `type` changes
   */
  useEffect(() => {
    const checkBookmark = async () => {
      try {
        setIsBookmarked(false); // reset first to avoid stale UI
        const response = await axios.get(`/bookmark/${type}/${itemId}`);
        setIsBookmarked(response.data?.bookmarked || false);
      } catch (error) {
        console.error('Error checking bookmark status:', error);
        setIsBookmarked(false); // assume not bookmarked on error
      }
    };

    if (itemId && type) {
      checkBookmark();
    }
  }, [itemId, type]);

  /**
   * Toggle bookmark - POST to add, DELETE to remove
   */
  const toggleBookmark = async () => {
    if (loading) return;

    setLoading(true);
    try {
      if (isBookmarked) {
        // Unbookmark
        await axios.delete(`/bookmark/${type}/${itemId}`);
        setIsBookmarked(false);
        toast.success("Bookmark removed");
      } else {
        // Add bookmark
        await axios.post('/bookmark/add', { type, item_id: itemId });
        setIsBookmarked(true);
        toast.success("Bookmarked successfully");
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'Something went wrong';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const Icon = isBookmarked ? BookmarkCheck : Bookmark;

  return (
    <Icon
      onClick={toggleBookmark}
      className={`
        cursor-pointer transition-colors 
        ${isBookmarked ? 'text-green-500' : 'text-muted-foreground'} 
        ${loading ? 'opacity-50 pointer-events-none' : ''}
      `}
      aria-label={isBookmarked ? 'Remove Bookmark' : 'Add Bookmark'}
    />
  );
};

export default BookmarkToggleButton;
