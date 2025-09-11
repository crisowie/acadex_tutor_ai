import express from 'express'
import { Request, Response } from 'express'
import supabase from '../../config/supabaseClient'
import { authMiddleware } from '../../config/middleware'


const router = express.Router()

router.post('/', authMiddleware, async (req: Request, res: Response) => {
  const { title, content, chatId, } = req.body
  const userId = (req as any).user?.userId
  if (!title || !content || !chatId) {
    return res.status(400).json({ success: false, error: 'Title, content, and chatId are required' })
  }

  try {
    const { data, error } = await supabase
      .from('notes')
      .insert([{ user_id: userId, title, content }])
      .select('*')
      .single()
    if (error) throw error

    res.status(201).json({ success: true, note: data })
  }
  catch (error) {
    console.error('Error adding note:', error)
    res.status(500).json({ success: false, error: 'Failed to add note' })
  }
})

export default router