import express, { Request, Response } from "express";
import { authMiddleware } from "../../config/middleware";
import supabase from "../../config/supabaseClient";

const router = express.Router();

// 🔹 Add collaborator to a project
router.post("/:projectId/collaborator", authMiddleware, async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId; // Owner
  const { projectId } = req.params;
  const { collaboratorId, role } = req.body; // role: "collaborator" | "readonly"

  if (!collaboratorId || !role) {
    return res.status(400).json({ error: "Collaborator ID and role are required" });
  }

  try {
    // 1️⃣ Verify that the user is the owner
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id, owner_id")
      .eq("id", projectId)
      .single();

    if (projectError || !project) {
      return res.status(404).json({ error: "Project not found" });
    }

    if (project.owner_id !== userId) {
      return res.status(403).json({ error: "Only project owner can add collaborators" });
    }

    // 2️⃣ Check if collaborator is already added
    const { data: existing, error: existingError } = await supabase
      .from("project_members")
      .select("*")
      .eq("project_id", projectId)
      .eq("user_id", collaboratorId)
      .single();

    if (existing) {
      return res.status(400).json({ error: "User is already a collaborator" });
    }

    // 3️⃣ Insert collaborator
    const { data, error: insertError } = await supabase
      .from("project_members")
      .insert([{ project_id: projectId, user_id: collaboratorId, role }])
      .select()
      .single();

    if (insertError) {
      console.error("Add collaborator error:", insertError);
      return res.status(500).json({ error: "Failed to add collaborator" });
    }

    return res.status(201).json(data);
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
