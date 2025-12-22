import express, { Request, Response } from "express";
import { authMiddleware } from "../../config/middleware";
import supabase from "../../config/supabaseClient";
import { generateQuizWithGroq } from "./quizService";

const router = express.Router();

router.post("/", authMiddleware, async (req: Request, res: Response) => {
  const { topic, score, number } = req.body;
  const userId = (req as any).user?.userId;

  if (!topic) {
    return res.status(400).json({ success: false, error: "Topic is required" });
  }

  try {
    // 1. Generate quiz with AI
    const quizData = await generateQuizWithGroq(topic, number);

    if (!quizData.questions || quizData.questions.length < 5) {
      return res.status(500).json({ success: false, error: "Invalid quiz generated" });
    }

    // 2. Insert quiz metadata into quizzes table
    const { data: quiz, error: quizError } = await supabase
      .from("quizzes")
      .insert([
        {
          user_id: userId,
          subject: quizData.subject,
          difficulty: quizData.difficulty || "medium",
          duration: quizData.duration || 10,
          score: null,
          percentage: null,
          completed: false,
          rating: null,
          topic,
        },
      ])
      .select("*")
      .single();

    if (quizError || !quiz) throw quizError;

    // 3. Insert questions into quiz_questions table
    const formattedQuestions = quizData.questions.map((q: any) => ({
      quiz_id: quiz.id,
      question_text: q.question,
      options: JSON.stringify(q.options || []),
      correct_answer: q.correct_answer,
      explanation: q.explanation
    }));

    const { data: insertedQuestions, error: questionsError } = await supabase
      .from("quiz_questions")
      .insert(formattedQuestions)
      .select("id, question_text, options, correct_answer, explanation")
      .order("id", { ascending: true })

    if (questionsError) {
      await supabase.from("quizzes").delete().eq("id", quiz.id);
      throw questionsError;
    }

    // 4. Send response in consistent format
    return res.json({
      success: true,
      data: {
        id: quiz.id,
        subject: quiz.subject,
        topic: quiz.topic,
        difficulty: quiz.difficulty,
        duration: quiz.duration,
        score: quiz.score,
        completed: quiz.completed,
        rating: quiz.rating,
        percentage: quiz.percentage,
        questions: insertedQuestions.map(q => ({
          id: q.id,
          question: q.question_text,
          options: typeof q.options === "string" ? JSON.parse(q.options) : q.options,
          correct_answer: q.correct_answer,
          explanation: q.explanation,
        })),
      },
    });


  } catch (err: any) {
    console.error("Quiz generation error:", err.message);
    res.status(500).json({ success: false, error: "Failed to generate quiz" });
  }
});

export default router;
