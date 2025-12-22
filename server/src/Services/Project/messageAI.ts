import express, { Request, Response } from "express";
import { authMiddleware } from "../../config/middleware";
import supabase from "../../config/supabaseClient";
import { getAIResponse } from  "./projectAi" // hypothetical AI service function
const router = express.Router();
router.post("/:projectId/ai-message", authMiddleware, async (req, res) => {
  const { projectId } = req.params;
  const { content } = req.body;

  if (!content?.trim()) return res.status(400).json({ error: "Content required" });

  try {
    // Insert the user query into AI channel
    const { data: userQuery, error: insertError } = await supabase
      .from("project_messages")
      .insert([{ project_id: projectId, role: "member", channel: "ai", content }])
      .select()
      .single();

    if (insertError) return res.status(500).json({ error: insertError.message });

    // Call your AI service to get response
    const aiResponseContent = await getAIResponse(content); // implement this function

    const { data: aiMsg, error: aiError } = await supabase
      .from("project_messages")
      .insert([{ project_id: projectId, role: "ai", channel: "ai", content: aiResponseContent }])
      .select()
      .single();

    if (aiError) return res.status(500).json({ error: aiError.message });

    return res.status(201).json({ query: userQuery, aiResponse: aiMsg });
  } catch (err) {
    return res.status(500).json({ error: "Failed to send AI message" });
  }
});
