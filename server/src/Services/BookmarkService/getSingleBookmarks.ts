import express, { Request, Response } from 'express';
import supabase from '../../config/supabaseClient';
import { authMiddleware } from '../../config/middleware';

const router = express.Router()

router.get('/:type/:itemId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { type, itemId } = req.params;

    const { data, error } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', userId)
      .eq('type', type)
      .eq('item_id', itemId)
      .maybeSingle();

    if (error) throw error;
    res.status(200).json({ bookmarked: !!data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router