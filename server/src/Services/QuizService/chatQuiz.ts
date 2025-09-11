// routes/quiz/chatQuiz.ts (or wherever)
import express, { Request, Response } from "express";
import { authMiddleware } from "../../config/middleware";
import supabase from "../../config/supabaseClient";
import { generateQuizWithGroq } from "./quizService";

const router = express.Router();

router.post("/:chatId", authMiddleware, async (req: Request, res: Response) => {
  const { chatId } = req.params;
  const userId = (req as any).user?.userId;

  console.log("📥 POST /quiz/chat/:chatId called", { chatId, userId });

  try {
    // 1. Fetch chat
    const { data: chat, error: chatError } = await supabase
      .from("chats")
      .select("*")
      .eq("id", chatId)
      .eq("user_id", userId)
      .single();

    if (chatError || !chat) {
      console.warn("Chat not found or access denied", { chatError });
      return res.status(404).json({ success: false, error: "Chat not found" });
    }

    console.log("🔎 chat fetched", { id: chat.id, title: chat.title });

    // 2. Generate quiz
    let quizObj;
    try {
      quizObj = await generateQuizWithGroq(chat.title);
    } catch (gErr) {
      console.error("Generator (generateQuizWithGroq) threw:", gErr);
      return res.status(500).json({ success: false, error: "Quiz generator failed" });
    }

    console.log("🧠 quizObj received:", {
      ok: !!quizObj,
      questionsLength: quizObj?.questions?.length,
    });

    if (!quizObj || !Array.isArray(quizObj.questions) || quizObj.questions.length < 1) {
      console.warn("Invalid quizObj:", quizObj);
      return res.status(500).json({ success: false, error: "Invalid quiz generated" });
    }

    // 3. Insert quiz metadata
    const { data: quizData, error: quizError } = await supabase
      .from("quizzes")
      .insert({
        user_id: userId,
        chat_id: chatId,
        subject: chat.title,
        topic: chat.topic || chat.title,
        difficulty: quizObj.difficulty || "medium",
        duration: quizObj.duration || 10,
        score: null,
        percentage: null,
        completed: false,
        rating: null,
      })
      .select("*")
      .single();

    if (quizError || !quizData) {
      console.error("Supabase insert quiz error:", quizError);
      return res.status(500).json({ success: false, error: "Failed to save quiz metadata" });
    }
    const quizId = quizData.id;
    console.log("💾 quiz metadata inserted:", { quizId });

    // 4. Insert quiz questions
    const questionsToInsert = quizObj.questions.map((q: any) => ({
      quiz_id: quizId,
      question_text: q.question || q.question_text,
      options: JSON.stringify(q.options || []),
      correct_answer: q.correct_answer,
      explanation: q.explanation,
    }));

    console.log("📝 quizObj.questions:", quizObj.questions);


    const { error: questionsError } = await supabase
      .from("quiz_questions")
      .insert(questionsToInsert);

    if (questionsError) {
      console.error("Supabase insert questions error:", questionsError);
      // cleanup
      await supabase.from("quizzes").delete().eq("id", quizId);
      return res.status(500).json({ success: false, error: "Failed to save quiz questions" });
    }

    console.log("💾 quiz questions inserted for quizId:", quizId);

    // 4b. Fetch inserted questions to return a normalized payload
    const { data: insertedQuestions, error: fetchQError } = await supabase
      .from("quiz_questions")
      .select("id, question_text, options, correct_answer, explanation")
      .eq("quiz_id", quizId)
      .order("id", { ascending: true });

    if (fetchQError) {
      console.error("Error fetching inserted questions:", fetchQError);
      return res.status(500).json({ success: false, error: "Failed to fetch quiz questions" });
    }

    const normalizedQuestions = (insertedQuestions || []).map((q: any) => ({
      id: q.id,
      question: q.question_text,
      options: typeof q.options === "string" ? JSON.parse(q.options) : q.options,
      correct_answer: q.answer || q.correct_answer,
      explanation: q.explanation,
    }));

    console.log("✅ returning quiz payload", { quizId, questionCount: normalizedQuestions.length });

    // 5. Respond
    return res.json({
      success: true,
      data: {
        id: quizId,
        subject: quizData.subject,
        difficulty: quizData.difficulty,
        duration: quizData.duration,
        score: 0,
        percentage: 0,
        completed: false,
        questions: normalizedQuestions,
        explanation: normalizedQuestions.map((q) => q.explanation),
      },
    });
  } catch (err: any) {
    console.error("Chat Quiz error (catch):", err);
    res.status(500).json({ success: false, error: "Failed to generate quiz" });
  }
});

export default router;
