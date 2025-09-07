// routes/onboarding.ts
import express, { Request, Response } from "express";
import supabase from "../../config/supabaseClient"; // adjust path
import { authMiddleware } from "../../config/middleware"

const router = express.Router();

router.post("/onboarding", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId; // ✅ from middleware
    const { learning_goal, skill_level, custom_goal } = req.body;
    if (!learning_goal || !skill_level) {
      return res.status(400).json({ error: "Missing onboarding fields" });
    }

    // ✅ update user profile in Supabase
    const { data, error } = await supabase
      .from("profiles") // or "profiles"
      .update({
        learning_goal,
        skill_level,
        custom_goal
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to save onboarding data" });
    }
    res.json({ message: "Onboarding completed", user: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export { router as Onboarding };
