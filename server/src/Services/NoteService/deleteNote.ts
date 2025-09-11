import express from "express";
import { Request, Response } from "express";
import supabase from "../../config/supabaseClient";
import { authMiddleware } from "../../config/middleware";
import axios from "axios";
const router = express.Router();

router.delete("/:id", authMiddleware, async (req: Request, res: Response) => {
  const noteId = req.params.id;
  const userId = (req as any).user?.userId;

  if (!noteId) {
    return res.status(400).json({ success: false, error: "Note ID is required" });
  }

  try {
    // Verify note ownership
    const { data: existingNote, error: fetchError } = await supabase
      .from("notes")
      .select("id, user_id")
      .eq("id", noteId)
      .single();

    if (fetchError) throw fetchError;
    if (!existingNote || existingNote.user_id !== userId) {
      return res.status(403).json({ success: false, error: "Unauthorized" });
    }

    // Delete the note
    const { error: deleteError } = await supabase
      .from("notes")
      .delete()
      .eq("id", noteId);

    if (deleteError) throw deleteError;

    return res.json({ success: true, message: "Note deleted successfully" });
  } catch (error) {
    console.error("Error deleting note:", error);
    return res.status(500).json({ success: false, error: "Failed to delete note" });
  }
});


export default router;