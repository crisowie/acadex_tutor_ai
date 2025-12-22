import express, { Request, Response } from 'express';
import supabase from '../../config/supabaseClient';
import { authMiddleware } from '../../config/middleware';

const router = express.Router()

router.get("/", async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;
  try {
    const { data: bookmark, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', userId)
    if (error) throw error;
    res.status(200).json({ bookmarked: !!bookmark, bookmark});
  } catch (error) {
    console.log(error)
  }
})

export default router