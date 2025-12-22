import express, { Request, Response } from "express";
import supabase from "../../config/supabaseClient";

const router = express.Router();

// Public route to get shared chat
router.get("/:shareId", async (req: Request, res: Response) => {
  const { shareId } = req.params;
  try {

    if (!shareId) {
      return res.status(400).json({ error: "Missing shareId" });
    }


    // 1️⃣ Find chat by share_id
    const { data: chat, error: chatError } = await supabase
      .from("chats")
      .select("id, is_shared")
      .eq("share_id", shareId)
      .eq("is_shared", true)
      .single();

    if (chatError || !chat) {
      console.error("Chat fetch error:", chatError);
      return res.status(404).json({ error: "Shared chat not found" });
    }

    // 2️⃣ Get all messages
    const { data: messages, error: msgError } = await supabase
      .from("messages")
      .select("id, role, content, created_at")
      .eq("chat_id", chat.id)
      .order("created_at", { ascending: true });

    if (msgError) {
      console.error("Message fetch error:", msgError);
      return res.status(500).json({ error: "Failed to fetch messages" });
    }
    return res.json({ chatId: chat.id, messages: messages || [] });
 } catch (err) {
  console.error("Fetch shared chat error:", err);
  return res.status(500).json({ error: "Failed to load shared chat" });
}

});

export default router;