import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import axios from "axios";
import { Quiz, QuizContextType } from "@/types";


axios.defaults.withCredentials = true;
axios.defaults.baseURL =  "https://acadex-tutor-ai.onrender.com";
// axios.defaults.baseURL = "http://localhost:5050";

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) throw new Error("useQuiz must be used within a QuizProvider");
  return context;
};

export const QuizProvider = ({ children }: { children: ReactNode }) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [completedQuizzes, setCompletedQuizzes] = useState<Quiz[]>([]);
  const [completedCount, setCompletedCount] = useState<number>(0);

  const [loading, setLoading] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, string | null>>({});

  // -------------------------------
  // Unified API response handler
  // -------------------------------
  const handleApiResponse = (res: any) => {
    const payload = res?.data;
    if (!payload?.success) {
      throw new Error(payload?.error || "Unknown API error");
    }
    // ✅ support both { success, data } and { success, count }
    return payload.data !== undefined ? payload.data : payload;
  };

  // -------------------------------
  // Function to reset the quiz for a new attempt
  // -------------------------------
  const resetQuizForRetake = useCallback(() => {
    setCurrentQuiz(null);
    setUserAnswers({});
  }, []);

  // Function to reset the quiz state.
  const resetCurrentQuiz = useCallback(() => {
    setCurrentQuiz(null);
    setUserAnswers({});
  }, []);


  // -------------------------------
  // Fetch quiz history
  // -------------------------------
  const fetchQuizHistory = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/quiz/history`);
      const quizzesData = handleApiResponse(res);
      setQuizzes(quizzesData);
      console.log("Fetched history:", quizzesData);
    } catch (err) {
      console.error("Error fetching quiz history", err);
    } finally {
      setLoading(false);
    }
  }, []);


  const fetchCompletedCount = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get("/quiz/history/completed/count");
      const { count } = handleApiResponse(res); // ✅ now works
      setCompletedCount(count);
      console.log("Completed quiz count:", count);
    } catch (err) {
      console.error("Error fetching completed quiz count", err);
    } finally {
      setLoading(false);
    }
  }, []);


  const fetchCompletedQuizzes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get("/quiz/history/completed");
      const quizzes = handleApiResponse(res);
      setCompletedQuizzes(quizzes);
      console.log("Completed quizzes list:", quizzes);
    } catch (err) {
      console.error("Error fetching completed quizzes", err);
    } finally {
      setLoading(false);
    }
  }, []);




  // -------------------------------
  // Fetch quiz by ID
  // -------------------------------
  const fetchQuizById = useCallback(async (quizId: string): Promise<Quiz | null> => {
    try {
      setLoading(true);
      setCurrentQuiz(null);
      resetCurrentQuiz();
      resetQuizForRetake()
      const res = await axios.get(`/quiz/history/${quizId}`);
      console.log(res)
      const quiz = handleApiResponse(res);
      setCurrentQuiz(quiz); // ✅ ensure state updates
      return quiz;
    } catch (err) {
      console.error("Error fetching quiz by ID", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [resetCurrentQuiz, resetQuizForRetake]);





  // -------------------------------
  // Mark quiz as completed
  // -------------------------------
  const markQuizCompleted = useCallback(async (quizId: string) => {
    try {
      setLoading(true);
      const res = await axios.patch(`/quiz/${quizId}/complete`);
      const updated = handleApiResponse(res);

      if (updated) {
        setQuizzes((prev) =>
          prev.map((q) => (q.id === quizId ? { ...q, completed: true } : q))
        );

        // 🔄 refresh both completed list and count
        await Promise.all([fetchCompletedQuizzes(), fetchCompletedCount()]);
      }
    } catch (err) {
      console.error("Error marking quiz completed", err);
    } finally {
      setLoading(false);
    }
  }, [fetchCompletedQuizzes, fetchCompletedCount]);


  useEffect(() => {
    fetchCompletedQuizzes();
    fetchCompletedCount(); // ✅ add this
  }, [fetchCompletedQuizzes, fetchCompletedCount]);


  // Get Best Subject


  const getBestSubject = () => {
    if (!completedQuizzes || completedQuizzes.length === 0) return "N/A";

    // Group by subject
    const subjectScores: Record<string, number[]> = {};

    completedQuizzes.forEach((quiz) => {
      const subject = quiz.topic || quiz.subject || "Unknown";
      if (!subjectScores[subject]) subjectScores[subject] = [];
      subjectScores[subject].push(quiz.score || 0);
    });

    // Find subject with highest average score
    let bestSubject = "N/A";
    let bestAvg = -1;

    for (const [subject, scores] of Object.entries(subjectScores)) {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      if (avg > bestAvg) {
        bestAvg = avg;
        bestSubject = subject;
      }
    }

    return bestSubject;
  };

  useEffect(()=>{
    fetchCompletedCount()
  },[])


  // -------------------------------
  // Generate quiz from topic
  // -------------------------------
  const generateQuizFromTopic = useCallback(async (topic: string): Promise<Quiz | null> => {
    try {
      setLoading(true);
      const res = await axios.post(`/quiz/topic`, { topic });
      const quiz = handleApiResponse(res);
      setCurrentQuiz(quiz);
      fetchQuizHistory(); // refresh list
      return quiz;
    } catch (err) {
      console.error("Error generating quiz from topic", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchQuizHistory]);

  // -------------------------------
  // Generate quiz from chat
  // -------------------------------
  const generateQuizFromChat = useCallback(async (chatId: string): Promise<Quiz | null> => {
    try {
      setLoading(true);
      console.log("📡 generateQuizFromChat ->", chatId);
      const res = await axios.post(`/quiz/chat/${chatId}`, {}); // YOUR baseURL should be set already
      console.log("📮 backend response:", res.status, res.data);

      const quiz = handleApiResponse(res); // expects { success: true, data: {...} }
      console.log("🧩 normalized quiz:", quiz);

      setCurrentQuiz(quiz);
      await fetchQuizHistory();
      return quiz;
    } catch (err: any) {
      console.error("❌ generateQuizFromChat error:", err.response?.status, err.response?.data || err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchQuizHistory]);


  // -------------------------------
  // Submit quiz answers
  // -------------------------------
  const submitAnswer = async (quizId: string, userAnswers: any) => {
    try {
      const formattedAnswers = userAnswers.map((answer: any) => ({
        questionId: answer.questionId,
        selectedOption: answer.selectedOption
      }));
      const res = await axios.post(`/quiz/${quizId}/submit`, { answers: formattedAnswers });
      // refresh quizzes list so `completed` updates
      await fetchQuizHistory();
      return handleApiResponse(res);

    } catch (err) {
      console.error("Error submitting quiz answers", err);
      throw err;
    }
  };

  const handleResetQuiz = async (quizId: string) => {
    try {
      const res = await axios.post(`/quiz/${quizId}/reset`);
    } catch (err) {
      console.error("Error resetting quiz:", err);
    }
  }

  const handleDeleteQuiz = async (quizId: string) => {
    try {
      const res = await axios.delete(`/quiz/delete/${quizId}`);
      if (res.status === 200) {
        // Remove the deleted quiz from the state
        setQuizzes((prevQuizzes) => prevQuizzes.filter((quiz) => quiz.id !== quizId));
      }
      await fetchQuizHistory();
      await fetchCompletedCount();// refresh list
    } catch (err) {
      console.error("Error deleting quiz:", err);
    }
  };

  console.log("Current quiz state:", currentQuiz);

  // -------------------------------
  // Auto fetch history on mount
  // -------------------------------
  useEffect(() => {
    fetchQuizHistory();
  }, [fetchQuizHistory]);

  return (
    <QuizContext.Provider
      value={{
        quizzes,
        currentQuiz,
        setCurrentQuiz,
        loading,
        fetchQuizById,
        generateQuizFromChat,
        generateQuizFromTopic,
        fetchQuizHistory,
        submitAnswer,
        markQuizCompleted,
        completedQuizzes,
        completedCount,
        fetchCompletedQuizzes,
        resetQuizForRetake,
        userAnswers,
        setUserAnswers,
        resetCurrentQuiz,
        fetchCompletedCount,
        getBestSubject,
        handleResetQuiz,
        handleDeleteQuiz
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};
