import express, { Request, Response } from "express";
import { authMiddleware } from "../../config/middleware";
import supabase from "../../config/supabaseClient";

const router = express.Router();

router.post("/:chatId", authMiddleware, async (req: Request, res: Response) => {
  const frontendUrl = "http://localhost:8080";
  const { chatId } = req.params;
  const userId = (req as any).user?.userId;
  console.log("chatId:", chatId, "userId:", userId);

  try {
    console.log("chatId:", chatId, "userId:", userId);
    // 1️⃣ Verify that the chat belongs to the user
    const { data: chat, error: fetchError } = await supabase
      .from("chats")
      .select("id, user_id, is_shared, share_id")
      .eq("id", chatId)
      .eq("user_id", userId)
      .single();

    if (fetchError || !chat) {
      console.error("Chat not found or unauthorized:", fetchError);
      return res.status(404).json({ error: "Chat not found" });
    }

    // 2️⃣ If already shared, reuse existing link
    if (chat.is_shared && chat.share_id) {

      return res.json({
        shareUrl: `${frontendUrl}/share/${chat.share_id}`,
      });
    }

    const { data: updated, error: updateError } = await supabase
      .from("chats")
      .update({
        is_shared: true,
        shared_at: new Date().toISOString(),
      })
      .eq("id", chatId)
      .select("share_id")
      .single();

    if (updateError || !updated) {
      console.error("Failed to update chat:", updateError);
      return res.status(500).json({ error: "Failed to generate share link" });
    }

    // 4️⃣ Return the public share link
    console.log("✅ Share link created:", `${frontendUrl}/share/${updated.share_id}`);
    return res.json({
      shareUrl: `${frontendUrl}/share/${updated.share_id}`,
    });
  } catch (err) {
    console.error("Share chat error:", err);
    return res.status(500).json({ error: "Unexpected error while sharing chat" });
  }
});

export default router;
