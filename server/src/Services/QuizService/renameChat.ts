import express, { Request, Response } from "express";
import { authMiddleware } from "../../config/middleware";
import supabase from "../../config/supabaseClient";

const router = express.Router();

// Route: PATCH /api/chats/:chatId/rename
router.patch("/:chatId/", authMiddleware, async (req: Request, res: Response) => {
  const { chatId } = req.params;
  const { newTitle } = req.body;
  const userId = (req as any).user?.userId;

  if (!newTitle || newTitle.trim().length === 0) {
    return res.status(400).json({ error: "New chat title cannot be empty" });
  }

  try {
    // 1️⃣ Check that the chat belongs to the user
    const { data: chat, error: fetchError } = await supabase
      .from("chats")
      .select("id, user_id, title")
      .eq("id", chatId)
      .eq("user_id", userId)
      .single();

    if (fetchError || !chat) {
      console.error("Chat not found or unauthorized:", fetchError);
      return res.status(404).json({ error: "Chat not found or you are not authorized" });
    }

    // 2️⃣ Update the chat title
    const { data: updatedChat, error: updateError } = await supabase
      .from("chats")
      .update({ title: newTitle })
      .eq("id", chatId)
      .select("*")
      .single();

    if (updateError || !updatedChat) {
      console.error("Failed to rename chat:", updateError);
      return res.status(500).json({ error: "Failed to rename chat" });
    }

    // 3️⃣ Return the updated chat
    return res.json({ message: "Chat renamed successfully", chat: updatedChat });
  } catch (err) {
    console.error("Rename chat error:", err);
    return res.status(500).json({ error: "Unexpected error while renaming chat" });
  }
});

export default router;
