import express, { Request, Response } from "express";
import { authMiddleware } from "../../config/middleware";
import supabase from "../../config/supabaseClient";

const router = express.Router();

// 🔹 Delete a project
router.delete("/:projectId", authMiddleware, async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;
  const { projectId } = req.params;

  try {
    // 1️⃣ Verify ownership
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id, owner_id")
      .eq("id", projectId)
      .single();

    if (projectError || !project) {
      return res.status(404).json({ error: "Project not found" });
    }

    if (project.owner_id !== userId) {
      return res.status(403).json({ error: "Access denied: not project owner" });
    }

    // 2️⃣ Delete project (Supabase handles cascading if you set it)
    const { error: deleteError } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectId);

    if (deleteError) {
      console.error("Delete project error:", deleteError);
      return res.status(500).json({ error: "Failed to delete project" });
    }

    return res.status(200).json({ message: "Project deleted successfully" });
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
