import express, { Request, Response } from "express";
import { authMiddleware } from "../../config/middleware";
import supabase from "../../config/supabaseClient"

const router = express.Router();

// 🔹 Create a new project
router.post("/", authMiddleware, async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;
  const { title, description } = req.body;

  if (!title || title.trim().length === 0) {
    return res.status(400).json({ error: "Project title is required" });
  }

  try {
    // 1️⃣ Insert project
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .insert([{ title, description, owner_id: userId }])
      .select()
      .single();

    if (projectError) {
      console.error("Add project error:", projectError);
      return res.status(500).json({ error: "Failed to create project" });
    }

    // 2️⃣ Add owner as a member
    const { error: memberError } = await supabase
      .from("project_members")
      .insert([{ project_id: project.id, user_id: userId, role: "owner" }]);

    if (memberError) {
      console.error("Add project owner error:", memberError);
    }

    return res.status(201).json(project);
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
