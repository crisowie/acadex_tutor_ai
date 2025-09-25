import express, { Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import { authMiddleware } from "../../config/middleware";
import supabase from "../../config/supabaseClient";
const router = express.Router();

// Use service role key to initialize admin client

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);


router.delete("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(400).json({ error: "Missing user ID" });
    }
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    if (error) {
      return res.status(500).json({ error: error.message || "Failed to delete user" });
    }

    return res.status(200).json({ message: "User deleted from auth successfully" });
    
  } catch {
    return res.status(500).json({ error: "Failed to delete user" });
  }

  // Delete the user from Supabase Auth

  // Clear cookies regardless of success

});

export { router as DeleteRoute };
