import express, { Request, Response } from "express";
import { authMiddleware } from "../../config/middleware";
import supabase from "../../config/supabaseClient";

const router = express.Router();

// Fetch previous quizzes with their questions
router.get("/", authMiddleware, async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;

  try {
    const { data: quizzes, error } = await supabase
      .from("quizzes")
      .select(`
        id,
        subject,
        difficulty,
        duration,
        score,
        percentage,
        completed,
        rating,
        created_at,
        quiz_questions (
          id,
          quiz_id,
          question_text,
          options,
          correct_answer,
          explanation
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error.message);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch quiz history",
      });
    }

    const normalized = quizzes?.map((quiz: any) => ({
      id: quiz.id,
      subject: quiz.subject,
      difficulty: quiz.difficulty,
      duration: quiz.duration,
      score: quiz.score,
      percentage: quiz.percentage,
      completed: quiz.completed,
      rating: quiz.rating,
      createdAt: quiz.created_at,
      questions:
        quiz.quiz_questions?.map((q: any) => ({
          id: q.id,
          question: q.question_text,
          options:
            typeof q.options === "string" ? JSON.parse(q.options) : q.options,
          correct_answer: q.correct_answer,
          explanation: q.explanation,
        })) ?? [],
      }));

    return res.json({
      success: true,
      data: normalized ?? [],
    });
  } catch (err: any) {
    console.error("History error:", err.message);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch quizzes",
    });
  }
});


// quizHistory.ts
router.get("/completed/count", authMiddleware, async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;

  try {
    const { count, error } = await supabase
      .from("quizzes")
      .select("*", { count: "exact", head: true }) // no data, just count
      .eq("user_id", userId)
      .eq("completed", true);

    if (error) throw error;

    return res.json({ success: true, data: { count: count ?? 0 } });
  } catch (err: any) {
    console.error("Completed quiz count error:", err.message);
    return res.status(500).json({ success: false, error: "Failed to fetch completed quiz count" });
  }
});




router.get("/completed", authMiddleware, async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;

  try {
    const { data: quizzes, error } = await supabase
      .from("quizzes")
      .select("id, subject, score, completed, created_at")
      .eq("user_id", userId)
      .eq("completed", true)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return res.json({ success: true, data: quizzes ?? [] });
  } catch (err: any) {
    console.error("Completed quizzes error:", err.message);
    return res.status(500).json({ success: false, error: "Failed to fetch completed quizzes" });
  }
});


// Fetch a single quiz by ID
router.get("/:id", authMiddleware, async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;
  const { id } = req.params;

  try {
    const { data: quiz, error } = await supabase
      .from("quizzes")
      .select(`
        id,
        subject,
        difficulty,
        duration,
        score,
        completed,
        rating,
        percentage,
        created_at,
        quiz_questions (
          id,
          quiz_id,
          question_text,
          options,
          explanation,
          correct_answer
        )
      `)
      .eq("user_id", userId)
      .eq("id", id)
      .single();

    if (error || !quiz) {
      console.error("Supabase error:", error?.message);
      return res.status(404).json({ success: false, error: "Quiz not found" });
    }

    const normalized = {
      id: quiz.id,
      subject: quiz.subject,
      difficulty: quiz.difficulty,
      duration: quiz.duration,
      score: quiz.score,
      completed: quiz.completed,
      rating: quiz.rating,
      createdAt: quiz.created_at,
      questions: quiz.quiz_questions?.map((q: any) => {
        const base = {
          id: q.id,
          question: q.question_text,
          options: typeof q.options === "string" ? JSON.parse(q.options) : q.options,
          correct_answer: q.correct_answer, // Always include
          explanation: q.explanation,
        };
        return base;
      }) ?? [],
    };

    return res.json({ success: true, data: normalized });
  } catch (err: any) {
    console.error("Fetch quiz by id error:", err.message);
    return res.status(500).json({ success: false, error: "Failed to fetch quiz" });
  }
});


router.patch("/:id/complete", authMiddleware, async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;
  const { id } = req.params;
  const { score } = req.body; // optional

  try {
    const { data, error } = await supabase
      .from("quizzes")
      .update({ completed: true, ...(score !== undefined && { score }) })
      .eq("id", id)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (error) throw error;

    return res.json({ success: true, data });
  } catch (err: any) {
    console.error("Mark complete error:", err.message);
    return res.status(500).json({ success: false, error: "Failed to mark quiz complete" });
  }
});






export default router;
