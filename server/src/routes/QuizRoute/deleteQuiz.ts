import express, { Request, Response } from "express";
import supabase from "../../config/supabaseClient"; // adjust path to your config
import { authMiddleware } from "../../config/middleware";

const router = express.Router();

/**
 * DELETE /quiz/:id
 * Deletes a quiz by ID (only if it belongs to the current user)
 */
router.delete("/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const quizId = req.params.id;
    const userId = (req as any).user?.userId; // assuming JWT middleware attaches user

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // delete quiz (and optionally cascade delete related questions if you have FKs)
    const { error } = await supabase
      .from("quizzes")
      .delete()
      .eq("id", quizId)
      .eq("user_id", userId); // security check: only delete your own quiz

    if (error) {
      console.error("Error deleting quiz:", error.message);
      return res.status(500).json({ error: "Failed to delete quiz" });
    }

    return res.json({ success: true, message: "Quiz deleted successfully" });
  } catch (err) {
    console.error("Unexpected error deleting quiz:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
