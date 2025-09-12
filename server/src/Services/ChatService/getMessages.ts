import express, { Request, Response } from 'express';
import axios from 'axios';
import { authMiddleware } from '../../config/middleware';
import supabase from '../../config/supabaseClient';

const router = express.Router();

// get all messages sent 
router.get("/", authMiddleware, async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;
  try {
    const { data: mssgs, error: MssgsError } = await supabase
      .from("messages")
      .select("*", { count: 'exact' })
      .eq("user_id", userId)
      .eq("role", "user")

    if (MssgsError) {
      console.error("Error Fetching messages", MssgsError)
      return res.status(500).json({ error: "Failed to fetch messages histoty" })
    }
    return res.status(200).json({ mssgs })

  } catch (error) {
    console.error("Error fetching messages:", error);
    return res.status(500).json({ error: "Failed to fetch messages history" });
  }
})

export { router as SentMessages }