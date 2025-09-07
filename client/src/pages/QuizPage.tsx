import { useState, useEffect, useRef } from "react";
import { useLocation, useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, ArrowLeft, Loader2 } from "lucide-react";
import { useQuiz } from "@/context/QuizContext";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function QuizPage() {
  const { quizId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { submitAnswer, fetchQuizById, handleResetQuiz,fetchQuizHistory,fetchCompletedCount } = useQuiz();
  const originalQuizRef = useRef<any>(location.state?.quiz ?? null);
  const [attemptId, setAttemptId] = useState(0);
  const quizFromState = location.state?.quiz;

  // Main state
  const [quiz, setQuiz] = useState<any>(quizFromState || null);
  const [loading, setLoading] = useState(!quizFromState);
  const [submitting, setSubmitting] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<
    { questionId: string; questionIndex?: number; questionText?: string; selectedOption: string }[]
  >([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  // Quiz completion state
  const [finished, setFinished] = useState(false);
  const [result, setResult] = useState<any>(null);

  // ✅ FIXED: Consistent normalization function
  const normalizeQuestionData = (question: any) => {
    return {
      ...question,
      question: question.question || question.question_text,
      correct_answer: question.correct_answer, // ✅ Keep consistent property name
      options: Array.isArray(question.options) ? question.options : [],
      explanation: question.explanation || "There is no explanation available.",
    };
  };

  // ✅ REMOVED: Duplicate useEffect - keeping only one
  useEffect(() => {
    console.log("Quiz component mounted with:", { quizId, quizFromState });

    // If we have a quiz from state (retake or new quiz), use it and normalize the data
    if (quizFromState) {
      console.log("Using quiz from state:", quizFromState);
      const clonedQuiz = JSON.parse(JSON.stringify(quizFromState));
      const normalizedQuestions = clonedQuiz.questions.map(normalizeQuestionData);
      setQuiz({ ...clonedQuiz, questions: normalizedQuestions });
      originalQuizRef.current = { ...clonedQuiz, questions: normalizedQuestions };
      setLoading(false);
      resetQuizState();
      return;
    }

    // Otherwise, fetch quiz by ID
    const fetchQuiz = async () => {
      if (!quizId) return;

      console.log("Fetching quiz by ID:", quizId);
      setLoading(true);
      try {
        const fetchedQuiz = await fetchQuizById(quizId);
        console.log("Fetched quiz:", fetchedQuiz);

        if (fetchedQuiz) {
          const clonedQuiz = JSON.parse(JSON.stringify(fetchedQuiz));
          // Normalize the fetched data
          const normalizedQuestions = clonedQuiz.questions.map(normalizeQuestionData);
          setQuiz({ ...clonedQuiz, questions: normalizedQuestions });
          originalQuizRef.current = { ...clonedQuiz, questions: normalizedQuestions };
          setShowExplanation(false);
          resetQuizState();
        }
      } catch (error) {
        console.error("Error fetching quiz:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId, quizFromState, fetchQuizById]);

  // Helper function to reset quiz state
  const resetQuizState = () => {
    setCurrentQuestion(0);
    setSelectedOption(null);
    setAnswers([]);
    setShowExplanation(false);
    setFinished(false);
    setResult(null);
  };

  // Normalize helper for safe string comparisons
  const normalize = (v: any) => {
    if (typeof v === "string") {
      return v.trim().toLowerCase();
    }
    if (v === null || v === undefined) {
      return "";
    }
    return String(v).trim().toLowerCase();
  };

  // Handle answer selection
  const handleAnswer = (option: string) => {
    if (!quiz || selectedOption) return; // Prevent multiple selections

    const currentQuestionData = quiz.questions[currentQuestion];
    console.log("Current question data:", currentQuestionData);
    console.log("Selected option:", option);
    console.log("Correct answer:", currentQuestionData.correct_answer); // ✅ Consistent property name
    console.log("Explanation:", currentQuestionData.explanation); // ✅ Consistent property name
    console.log("Normalized selected:", normalize(option));
    console.log("Normalized correct:", normalize(currentQuestionData.correct_answer));

    setSelectedOption(option);
    setShowExplanation(true);
  };

  // Handle moving to next question or finishing quiz
  const handleNext = async () => {
    if (!quiz || !selectedOption) return;

    const currentQuestionData = quiz.questions[currentQuestion];

    const newAnswer = {
      // prefer real id if present; fallback to index-keyed id
      questionId: currentQuestionData.id,
      questionIndex: currentQuestion,
      questionText: currentQuestionData.question,
      selectedOption: selectedOption
    };

    console.log("Adding answer:", newAnswer);

    // Add current answer to answers array
    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);

    // Check if this is the last question
    if (currentQuestion + 1 >= quiz.questions.length) {
      // Finish quiz
      console.log("Finishing quiz with answers:", updatedAnswers);
      await finishQuiz(updatedAnswers);
    } else {
      // Move to next question
      setCurrentQuestion(prev => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    }
  };

  // Handle quiz completion
  // Updated finishQuiz function in QuizPage.tsx

  const finishQuiz = async (finalAnswers: typeof answers) => {
    setSubmitting(true);
    setFinished(true);

    try {
      // Submit answers if submitAnswer function is available
      let submissionResult = null;

      if (quiz.id && submitAnswer) {
        console.log("Submitting answers to backend:", finalAnswers);
        submissionResult = await submitAnswer(quiz.id, finalAnswers);
        console.log("Submission result:", submissionResult);
      }

      // Calculate local results as fallback
      const localResult = calculateLocalResults(finalAnswers);

      // Use backend result if available and has the expected structure
      let finalResult;
      if (submissionResult && submissionResult.score !== undefined) {
        finalResult = {
          score: submissionResult.score,
          total: submissionResult.total || quiz.questions.length,
          percentage: submissionResult.percentage,
          results: finalAnswers.map((answer) => {
            const question = quiz.questions.find((q: any) =>
              q.id === answer.questionId ||
              quiz.questions[answer.questionIndex || 0] === q
            );

            const backendResult = submissionResult.results?.find((r: any) =>
              r.questionId === answer.questionId
            );

            return {
              questionId: answer.questionId,
              questionIndex: answer.questionIndex,
              question: question?.question || answer.questionText,
              selected: answer.selectedOption,
              correct: backendResult?.correct_answer || question?.correct_answer,
              isCorrect: backendResult?.isCorrect ||
                normalize(answer.selectedOption) === normalize(question?.correct_answer),
              explanation: backendResult?.explanation || question?.explanation || "No explanation available"
            };
          })
        };
      } else {
        // Fall back to local calculation
        finalResult = localResult;
      }

      console.log("Final result:", finalResult);
      setResult(finalResult);

      // Refresh quiz history to reflect completion status
     await fetchQuizHistory();
     await fetchCompletedCount();

    } catch (error) {
      console.error("Error submitting quiz:", error);
      // Fall back to local calculation on error
      const localResult = calculateLocalResults(finalAnswers);
      setResult(localResult);
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ FIXED: Calculate results locally with consistent property names
  const calculateLocalResults = (finalAnswers: typeof answers) => {
    const results = finalAnswers.map((answer) => {
      const question =
        quiz.questions.find((q: any) => q.id === answer.questionId) ??
        (typeof answer.questionIndex === "number" ? quiz.questions[answer.questionIndex] : undefined);

      const correct = question?.correct_answer ?? null; // ✅ Use correct_answer consistently
      const explanation = question?.explanation ?? "";

      return {
        questionId: answer.questionId,
        questionIndex: answer.questionIndex,
        question: question?.question ?? answer.questionText ?? "",
        selected: answer.selectedOption,
        correct,
        isCorrect: correct !== null && normalize(answer.selectedOption) === normalize(correct),
        explanation
      };
    });

    const correctCount = results.filter(r => r.isCorrect).length;
    const percentage = Math.round((correctCount / quiz.questions.length) * 100);

    return {
      score: correctCount,
      total: quiz.questions.length,
      percentage,
      results
    };
  };

  // Handle retake - reset everything and restore unmutated quiz copy
  const handleRetake = async () => {
    console.log("Retaking quiz");
    try {
      await handleResetQuiz(quiz.id); // Call the reset API
    } catch (error) {
      console.error("Error resetting quiz:", error);
    }
    const freshQuiz = await fetchQuizById(quizId);
    if (freshQuiz) {
      const cloned = JSON.parse(JSON.stringify(freshQuiz));
      const normalizedQuestions = cloned.questions.map(normalizeQuestionData); // ✅ Normalize on retake too
      const normalizedQuiz = { ...cloned, questions: normalizedQuestions };
      resetQuizState();
      setQuiz(normalizedQuiz);
      originalQuizRef.current = normalizedQuiz;
    }
    setAttemptId(prev => prev + 1);
  };

  // Handle going back to quizzes
  const handleGoBack = () => {
    navigate("/quizzes");
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="text-center py-12">
          <Loader2 className="animate-spin mx-auto h-8 w-8 text-primary mb-4" />
          <p className="text-muted-foreground"><LoadingSpinner /></p>
        </div>
      </div>
    );
  }

  // Quiz not found state
  if (!quiz) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <Card className="p-6 text-center">
          <CardContent>
            <h2 className="text-xl font-semibold mb-4">Quiz not found</h2>
            <p className="text-muted-foreground mb-4">
              The quiz you're looking for doesn't exist or couldn't be loaded.
            </p>
            <Button onClick={handleGoBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Quizzes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestionData = quiz.questions[currentQuestion];
  const progressPercentage = ((currentQuestion + (selectedOption ? 1 : 0)) / quiz.questions.length) * 100;

  return (
    <div key={attemptId} className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleGoBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">{quiz.topic || quiz.subject || "Quiz"}</h1>
        </div>
        <Badge variant="outline">
          {quiz.subject || quiz.difficulty || "General"}
        </Badge>
      </div>

      {/* Progress Bar - only show during quiz */}
      {!finished && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Question {currentQuestion + 1} of {quiz.questions.length}</span>
            <span>{Math.round(progressPercentage)}% Complete</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      )}

      {finished ? (
        /* Quiz Results */
        <Card className="shadow-lg border-2 border-primary/20">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {result?.percentage >= 70 ? (
                <CheckCircle className="h-16 w-16 text-green-500" />
              ) : result?.percentage >= 50 ? (
                <CheckCircle className="h-16 w-16 text-orange-500" />
              ) : (
                <XCircle className="h-16 w-16 text-red-500" />
              )}
            </div>
            <CardTitle className="text-3xl font-bold">Quiz Complete!</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Score Display */}
            <div className="text-center space-y-2">
              <p className="text-2xl font-semibold">
                {result?.score || 0} / {quiz.questions.length}
              </p>
              <p className="text-lg text-muted-foreground">
                {result?.percentage || 0}% Correct
              </p>
            </div>

            {/* Progress Bar */}
            <Progress
              value={result?.percentage || 0}
              className="h-4"
            />

            {/* Performance Message */}
            <div className="text-center p-4 rounded-lg bg-muted">
              <p className="font-medium">
                {result?.percentage >= 90 ? "Excellent work! 🎉" :
                  result?.percentage >= 80 ? "Great job! 👏" :
                    result?.percentage >= 70 ? "Good effort! 👍" :
                      result?.percentage >= 50 ? "Not bad, keep practicing! 📚" :
                        "Keep studying and try again! 💪"}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={handleRetake}
                className="flex-1 sm:flex-none"
                variant="default"
              >
                Retake Quiz
              </Button>
              <Button
                onClick={handleGoBack}
                className="flex-1 sm:flex-none"
                variant="outline"
              >
                Back to Quizzes
              </Button>
            </div>

            {/* Detailed Results */}
            {result?.results && result.results.length > 0 && (
              <div className="mt-6 space-y-3">
                <h3 className="font-semibold text-lg">Detailed Results</h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {result.results.map((r: any) => {
                    // find matching question from quiz by id, then by index fallback
                    const questionData =
                      quiz.questions.find((q: any) => q.id === r.questionId) ||
                      (typeof r.questionIndex === "number" ? quiz.questions[r.questionIndex] : undefined) ||
                      { options: [], question: r.question, correct_answer: r.correct };

                    return (
                      <div key={r.questionId || r.questionIndex || Math.random()} className="p-4 rounded-lg border bg-gray-200">
                        <p className="font-medium text-green-600 text-sm mb-3">
                          {questionData.question ? `Q: ${questionData.question}` : `Question`}
                        </p>

                        <div className="space-y-2">
                          {(questionData.options || []).map((opt: string, i: number) => {
                            const isCorrect = normalize(opt) === normalize(questionData.correct_answer); // ✅ Use correct_answer
                            const isSelected = normalize(opt) === normalize(r.selected);

                            let optClasses = "w-full text-left p-2 rounded-md border transition";
                            if (isCorrect) {
                              optClasses += " bg-green-100 border-green-400 text-green-700";
                            } else if (isSelected && !isCorrect) {
                              optClasses += " bg-red-100 border-red-400 text-red-700";
                            } else {
                              optClasses += " bg-white border-gray-200 text-gray-700";
                            }

                            return (
                              <div key={i} className={optClasses}>
                                <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>
                                {opt}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        /* Active Question */
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">
              {currentQuestionData?.question}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Answer Options */}
            <div className="grid gap-3">
              {currentQuestionData?.options?.map((option: string, index: number) => {
                let variant: "default" | "destructive" | "outline" | "secondary" = "outline";
                let className = "justify-start text-left h-auto p-4 whitespace-normal";


                if (showExplanation && selectedOption) {
                  const isCorrectAnswer = normalize(option) === normalize(currentQuestionData.correct_answer); // ✅ Use correct_answer
                  const isSelectedOption = normalize(option) === normalize(selectedOption);
                  const isCorrectSelection = normalize(selectedOption) === normalize(currentQuestionData.correct_answer);

                  if (isCorrectAnswer) {
                    // Always show correct answer in green
                    variant = "default";
                    className += " bg-green-100 border-green-500 text-green-700 hover:bg-green-100";
                  } else if (isSelectedOption && !isCorrectSelection) {
                    // Only show selected wrong answer in red
                    variant = "destructive";
                    className += " bg-red-300 border-red-500 text-red-700";
                  } else {
                    // Other unselected options remain neutral
                    variant = "secondary";
                    className += " opacity-60";
                  }
                } else if (selectedOption && normalize(selectedOption) === normalize(option)) {
                  // Currently selected option (before explanation)
                  variant = "default";
                }

                return (
                  <Button
                    key={`${option}_${index}`}
                    variant={variant}
                    className={className}
                    onClick={() => handleAnswer(option)}
                    disabled={!!selectedOption}
                  >
                    <span className="font-medium mr-2">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    {option}
                  </Button>
                );
              })}
            </div>

            {/* Explanation */}
            {showExplanation && currentQuestionData?.explanation && (
              <div className="mt-4 p-4 rounded-lg bg-blue-50 border border-blue-200">
                <p className="text-sm text-blue-900">
                  <span className="font-medium">💡 Explanation: </span>
                  {currentQuestionData.explanation}
                </p>
              </div>
            )}

            {/* Next Button */}
            {selectedOption && (
              <Button
                className="w-full mt-6"
                onClick={handleNext}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Finishing Quiz...
                  </>
                ) : (
                  currentQuestion + 1 >= quiz.questions.length ? "Finish Quiz" : "Next Question"
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 