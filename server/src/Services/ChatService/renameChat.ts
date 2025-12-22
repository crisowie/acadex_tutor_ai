import express, { Request, Response } from "express";
import { authMiddleware } from "../../config/middleware";
import supabase from "../../config/supabaseClient";

const router = express.Router();

router.patch("/:chatId", authMiddleware, async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;
  const { chatId } = req.params;
  const { newName } = req.body;

  if (!newName || newName.trim().length === 0) {
    return res.status(400).json({ error: "Chat name cannot be empty" });
  }

  try {
    // 1️⃣ Check ownership
    const { data: chat, error: chatError } = await supabase
      .from("chats")
      .select("id, user_id, title")
      .eq("id", chatId)
      .eq("user_id", userId)
      .single();

    if (chatError || !chat) {
      return res.status(403).json({ error: "Chat not found or access denied" });
    }

    // 2️⃣ Update chat name
    const { data: updatedChat, error: updateError } = await supabase
      .from("chats")
      .update({ title: newName })
      .eq("id", chatId)
      .select("*") // return updated row
      .single();

    if (updateError || !updatedChat) {
      console.log("Failed to rename chat")
      return res.status(500).json({ error: "Failed to rename chat" });
    }

    return res.status(200).json({ message: "Chat renamed successfully", chat: updatedChat });

  } catch (error) {
    console.error("Rename chat error:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

export { router as RenameChat };
