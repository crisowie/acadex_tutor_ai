import express from "express";
import { Request, Response } from "express";
import supabase from "../../config/supabaseClient";
import { authMiddleware } from "../../config/middleware";

const router = express.Router();

router.get("/", authMiddleware, async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;

  try {
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.status(200).json({ success: true, notes: data });
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ success: false, error: "Failed to fetch notes" });
  }
});

export default router;
