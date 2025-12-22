import express, { Request, Response } from "express";
import { authMiddleware } from "../../config/middleware";
import supabase from "../../config/supabaseClient";
const router = express.Router();

router.get("/:projectId/messages", authMiddleware, async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const channel = req.query.channel || "team";

  try {
    const { data, error } = await supabase
      .from("project_messages")
      .select("id, role, sender_id, content, created_at")
      .eq("project_id", projectId)
      .eq("channel", channel)
      .order("created_at", { ascending: true });

    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json({ messages: data });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch messages" });
  }
});
