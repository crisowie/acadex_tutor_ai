import express, { Request, Response } from 'express';
import axios from 'axios';
import { authMiddleware } from '../../config/middleware';
import supabase from '../../config/supabaseClient';


const router = express.Router();



router.get("/chat-history/:chatId", authMiddleware, async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;
  const { chatId } = req.params;

  try {
    // Check if the chat belongs to the user
    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .select('*')
      .eq('id', chatId)
      .eq('user_id', userId)
      .single();

    if (chatError || !chat) {
      return res.status(403).json({ error: "Chat not found or access denied" });
    }

    // Fetch full message history for the chat
    const { data: messages, error: messageError } = await supabase
      .from('messages')
      .select('role, content, created_at')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (messageError) {
      console.error("Error fetching messages:", messageError);
      return res.status(500).json({ error: 'Failed to retrieve messages' });
    }

    res.status(200).json({
      success: true,
      chat_id: chatId,
      messages,
    });

  } catch (error) {
    console.error("Chat history error:", error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

export { router as SingleChat }