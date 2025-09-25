import express, { Request, Response } from 'express';
import supabase from '../../config/supabaseClient';
import { authMiddleware } from '../../config/middleware';

const router = express.Router()

router.delete('/:type/:itemId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { type, itemId } = req.params;

    if (!type || !itemId) {
      return res.status(400).json({ error: 'type and itemId are required' });
    }

    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('user_id', userId)
      .eq('type', type)
      .eq('item_id', itemId);

    if (error) throw error;
    res.status(200).json({ message: 'Bookmark removed' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router
