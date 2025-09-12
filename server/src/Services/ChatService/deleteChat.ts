import express, { Request, Response } from 'express';
import axios from 'axios';
import { authMiddleware } from '../../config/middleware';
import supabase from '../../config/supabaseClient';


const router = express.Router();


router.delete("/:chatId", authMiddleware, async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId; // extracted from JWT in authMiddleware
  const { chatId } = req.params;

  try {
    // 1. Check if the chat belongs to the user
    const { data: chat, error: chatError } = await supabase
      .from("chats")
      .select("id")
      .eq("id", chatId)
      .eq("user_id", userId)
      .single();

    if (chatError || !chat) {
      return res
        .status(403)
        .json({ error: "Chat not found or access denied" });
    }

    // 2. Delete the chat
    const { error: deleteError } = await supabase
      .from("chats")
      .delete()
      .eq("id", chatId)
      .eq("user_id", userId);

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return res.status(500).json({ error: "Failed to delete chat" });
    }

    return res.status(200).json({ message: "Chat deleted successfully" });
  } catch (error) {
    console.error("Chat deletion error:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
}
);

export { router as DeleteChat };