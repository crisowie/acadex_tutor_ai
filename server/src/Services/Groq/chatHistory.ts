import express, { Request, Response } from 'express';
import axios from 'axios';
import { authMiddleware } from '../../config/middleware';
import supabase from '../../config/supabaseClient';


const router = express.Router();

// get all chats 
router.get("/chats-history", authMiddleware, async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;

  try {
    const { data: chats, error } = await supabase
      .from("chats")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching chats:", error);
      return res.status(500).json({ error: "Failed to fetch chat history" });
    }

    res.status(200).json({ success: true, chats });
  } catch (error) {
    console.error("Fetch all chats error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});



export { router as ChatHistory };
