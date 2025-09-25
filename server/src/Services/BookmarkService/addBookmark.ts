import express, { Request, Response } from 'express';
import { authMiddleware } from '../../config/middleware'
import supabase from '../../config/supabaseClient'

const router = express.Router();

// POST /user/bookmarks
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { type, item_id } = req.body;
    const userId = (req as any).user?.userId;

    if (!type || !item_id) {
      return res.status(400).json({ error: 'type and item_id are required' });
    }

    // Check if already bookmarked
    const { data: existing, error: checkError } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('type', type)
      .eq('item_id', item_id)
      .eq('user_id', userId)
      .maybeSingle();

    if (checkError) throw checkError;
    if (existing) {
      return res.status(400).json({ message: 'Already bookmarked' });
    }

    // Insert bookmark
    const { data, error } = await supabase
      .from('bookmarks')
      .insert([{ user_id: userId, type, item_id }])
      .select('*')
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Bookmarked', bookmark: data });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router