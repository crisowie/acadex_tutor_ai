// routes/quiz/submit.ts - Fixed version

import express, { Request, Response } from "express";
import { authMiddleware } from "../../config/middleware";
import supabase from "../../config/supabaseClient";

const router = express.Router();

/**
 * POST /quiz/:id/submit
 * Body: { answers: [{ questionId, selectedOption }] }
 */
router.post("/:id/submit", authMiddleware, async (req: Request, res: Response) => {
  const { id: quizId } = req.params;
  const { answers } = req.body; // ✅ Now correctly expects "answers"
  const userId = (req as any).user?.userId;

  console.log("Received quiz submission:", { quizId, answers, userId });

  if (!quizId || !answers || !Array.isArray(answers)) {
    return res.status(400).json({ success: false, error: "Invalid payload" });
  }

  try {
    // 1. Verify quiz belongs to user
    const { data: quiz, error: quizError } = await supabase
      .from("quizzes")
      .select("id, user_id")
      .eq("id", quizId)
      .eq("user_id", userId)
      .single();

    if (quizError || !quiz) {
      return res.status(404).json({ success: false, error: "Quiz not found" });
    }

    // 2. Fetch correct answers
    const { data: questions, error: qError } = await supabase
      .from("quiz_questions")
      .select("*")
      .eq("quiz_id", quizId)
      .order("id", { ascending: true });

    if (qError) throw qError;
    if (!questions || questions.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: "Quiz not found or has no questions" 
      });
    }

    console.log("Found questions:", questions.length);
    console.log("Received answers:", answers.length);

    // 3. Compare answers and calculate score
    let score = 0;
    const detailedResults = answers.map((ans: any) => {
      const question = questions.find(q => String(q.id) === String(ans.questionId));
      
      if (!question) {
        console.log("Question not found for ID:", ans.questionId);
        return {
          questionId: ans.questionId,
          selected: ans.selectedOption,
          correct_answer: null,
          isCorrect: false,
          explanation: "Question not found",
        };
      }

      // Normalize strings for comparison
      const normalizeAnswer = (answer: string) => {
        return answer?.trim().toLowerCase() || "";
      };

      const isCorrect = normalizeAnswer(question.correct_answer) === normalizeAnswer(ans.selectedOption);
      
      if (isCorrect) {
        score++;
        console.log("Correct answer for question", ans.questionId);
      } else {
        console.log("Incorrect answer for question", ans.questionId, {
          selected: ans.selectedOption,
          correct: question.correct_answer
        });
      }

      return {
        questionId: ans.questionId,
        selected: ans.selectedOption,
        correct_answer: question.correct_answer,
        isCorrect,
        explanation: question.explanation || "No explanation available",
      };
    });

    // 4. Calculate percentage
    const totalQuestions = questions.length;
    const percentage = Math.round((score / totalQuestions) * 100);

    console.log("Final results:", { score, totalQuestions, percentage });

    // 5. Update quiz with score, percentage, and completion status
    const { data: updatedQuiz, error: updateError } = await supabase
      .from("quizzes")
      .update({
        score,          // raw correct answers
        percentage,     // percentage out of 100
        completed: true,
      })
      .eq("id", quizId)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (updateError) {
      console.error("Update error:", updateError);
      throw updateError;
    }

    console.log("Quiz updated successfully:", updatedQuiz);

    // 6. Return comprehensive results
    return res.json({
      success: true,
      data: {
        quizId,
        score,
        percentage,
        total: totalQuestions,
        results: detailedResults,
        quiz: {
          id: updatedQuiz.id,
          subject: updatedQuiz.subject,
          score: updatedQuiz.score,
          percentage: updatedQuiz.percentage,
          completed: updatedQuiz.completed,
        }
      },
    });

  } catch (err: any) {
    console.error("Submit quiz error:", err.message);
    return res.status(500).json({ 
      success: false, 
      error: "Failed to submit quiz",
      details: err.message 
    });
  }
});

// ✅ Keep your reset route as is
router.post("/:id/reset", authMiddleware, async (req: Request, res: Response) => {
  const { id: quizId } = req.params;
  const userId = (req as any).user?.userId;

  try {
    const { error } = await supabase
      .from("quizzes")
      .update({
        score: null,
        percentage: null,
        completed: false,
      })
      .eq("id", quizId)
      .eq("user_id", userId);

    if (error) throw error;

    return res.json({ success: true, message: "Quiz reset successfully" });
  } catch (err: any) {
    console.error("Reset quiz error:", err.message);
    return res.status(500).json({ success: false, error: "Failed to reset quiz" });
  }
});

export default router;