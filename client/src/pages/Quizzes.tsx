import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Clock, Star, Play, CheckCircle, Trophy, Search, Loader2, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useQuiz } from "@/context/QuizContext";

export default function Quizzes() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingQuizId, setLoadingQuizId] = useState<string | null>(null);
  const [newTopic, setNewTopic] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { quizzes, generateQuizFromTopic, loading, fetchQuizById, fetchQuizHistory, completedQuizzes, completedCount, resetQuizForRetake, resetCurrentQuiz, getBestSubject, handleDeleteQuiz } = useQuiz();

  const navigate = useNavigate();

  const difficulties = ["Beginner", "Intermediate", "Advanced"];

  // Map backend difficulty to display labels
  const difficultyMap: Record<string, string> = {
    easy: "Beginner",
    medium: "Intermediate",
    hard: "Advanced",
  };

  const handleGenerateQuiz = async () => {
    try {
      setIsLoading(true);
      if (!newTopic.trim()) return;

      const newQuiz = await generateQuizFromTopic(newTopic.trim());
      if (newQuiz) {
        // Clear the input after successful generation
        setNewTopic("");
        // Pass the quiz object directly to QuizPage
        navigate(`/quiz/${newQuiz.id || newTopic}`, { state: { quiz: newQuiz } });
      }
    } catch (error) {
      console.error("Error generating quiz:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleGenerateQuiz();
  };

  useEffect(() => {
    fetchQuizHistory();
  }, [fetchQuizHistory]);

  // FIXED: Better quiz opening/retake logic




  const handleOpenQuiz = async (quizId: string) => {
    try {
      console.log("Opening quiz with ID:", quizId);
      setLoadingQuizId(quizId);

      // Check if quiz exists in current quizzes array first
      const existingQuiz = quizzes.find(q => q.id === quizId);

      if (existingQuiz) {
        console.log("Found existing quiz:", existingQuiz);
        // Reset the current quiz state in the context
        resetCurrentQuiz();
        resetQuizForRetake();
        // Create a completely fresh quiz state for retake
        const freshQuiz = {
          ...existingQuiz,
          // Remove any completion or answer state
          completed: false,
          score: null,
          user_answer: "",
          currentQuestionIndex: undefined,
        };

        console.log("Navigating with fresh quiz:", freshQuiz);
        navigate(`/quiz/${quizId}`, { state: { quiz: freshQuiz } });
      } else {
        // Fetch the quiz from backend if not in current array
        const quizData = await fetchQuizById(quizId);

        if (quizData) {
          console.log("Fetched quiz data:", quizData);

          // Create fresh quiz state
          const freshQuiz = {
            ...quizData,
            completed: false,
            score: null,
            userAnswers: undefined,
            currentQuestionIndex: undefined,
            questions: quizData.questions.map(q => ({
              ...q,
              user_answer: "",
              answer: "",
              isCorrect: undefined
            }))
          };

          navigate(`/quiz/${quizId}`, { state: { quiz: freshQuiz } });
        } else {
          console.error("Quiz not found with ID:", quizId);
        }
      }
    } catch (error) {
      console.error("Error opening quiz:", error);
    } finally {
      setLoadingQuizId(null);
    }
  };

  const filteredQuizzes = quizzes.filter((quiz) => {
    const matchesDifficulty =
      !selectedDifficulty || difficultyMap[quiz.difficulty] === selectedDifficulty;
    const matchesSearch =
      (quiz.topic || quiz.subject)
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
    return matchesDifficulty && matchesSearch;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficultyMap[difficulty] || "") {
      case "Beginner":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "Intermediate":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "Advanced":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 0) return "text-orange-500";
    return "text-red-500";
  };

  const bestScore = quizzes.length > 0
    ? Math.max(...quizzes.filter(q => q.completed).map(q => q.percentage || 0))
    : 0;


  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Quizzes</h1>
            <p className="text-muted-foreground">
              Test your knowledge across different subjects
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">Best Score: {bestScore}%</span>
          </div>
        </div>

        {/* New Quiz by Topic */}
        <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
          <Input
            placeholder="Enter a topic to generate a quiz"
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !newTopic.trim()}>
            {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : "Start Quiz"}
          </Button>
        </form>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search quizzes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedDifficulty === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDifficulty(null)}
            >
              All
            </Button>
            {difficulties.map((difficulty) => (
              <Button
                key={difficulty}
                variant={selectedDifficulty === difficulty ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedDifficulty(difficulty)}
              >
                {difficulty}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Total Quizzes</span>
            </div>
            <p className="text-2xl font-bold mt-1">{quizzes.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Completed</span>
            </div>
            <p className="text-2xl font-bold mt-1">
              {completedCount}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Average Score</span>
            </div>
            <p className="text-2xl font-bold mt-1">
              {quizzes.length > 0
                ? Math.round(
                  quizzes
                    .filter(q => q.completed && q.score !== null)
                    .reduce((acc, q) => acc + (q.score || 0), 0) /
                  quizzes.filter(q => q.completed && q.score !== null).length || 1
                )
                : 0}
              %
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Best Subject</span>
            </div>
            <p className="text-2xl font-bold mt-1">{getBestSubject()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Quiz Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredQuizzes.map((quiz) => (
          <Card key={quiz.id || quiz.topic} className="hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between w-full">
                <div className="space-y-2">
                  <CardTitle className="text-lg leading-tight">
                    {quiz.topic || quiz.subject || "Untitled Quiz"}
                  </CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {quiz.subject}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  {quiz.completed && (
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteQuiz(quiz.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>

            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 border border-gray-300 px-2 py-0.5 rounded">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{quiz.duration}</span>
                </div>
                <span className="text-muted-foreground">{quiz.questions?.length || 0} questions</span>
              </div>

              <div className="flex items-center justify-between">
                <Badge className={getDifficultyColor(quiz.difficulty)}>
                  {difficultyMap[quiz.difficulty] || quiz.difficulty}
                </Badge>
                {quiz.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-500 fill-current" />
                    <span className="text-xs text-gray-400">{quiz.rating || "No Rating"}</span>
                  </div>
                )}
              </div>

              {quiz.completed && quiz.score !== null && quiz.score !== undefined && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Your Score: {quiz.score}</span>
                    <span className={`font-medium ${getScoreColor(quiz.percentage)}`}>
                      {quiz.percentage}%
                    </span>
                  </div>
                  <Progress value={quiz.percentage} className="h-2" />
                </div>
              )}

              <Button
                className="w-full"
                variant={quiz.completed ? "outline" : "default"}
                onClick={() => handleOpenQuiz(quiz.id)}
                disabled={loadingQuizId === quiz.id}
              >
                {loadingQuizId === quiz.id ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                {quiz.completed || quiz.score > 80 ? "Retake Quiz" : "Start Quiz"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredQuizzes.length === 0 && !loading && !isLoading && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No quizzes found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}

      {/* Loading State */}
      {(loading || isLoading) && (
        <div className="text-center py-12">
          <Loader2 className="animate-spin mx-auto h-8 w-8 text-primary mb-2" />
          <p className="text-muted-foreground">
            {isLoading ? "Generating quiz..." : "Loading quizzes..."}
          </p>
        </div>
      )}
    </div>
  );
}