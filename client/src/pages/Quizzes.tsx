import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Clock, Star, Play, CheckCircle, Trophy, Search, Loader2, Trash2, Upload, FileText, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useQuiz } from "@/context/QuizContext";
import { toast } from "sonner";

export default function Quizzes() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingQuizId, setLoadingQuizId] = useState<string | null>(null);
  const [newTopic, setNewTopic] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingPDF, setIsUploadingPDF] = useState(false);

  const { quizzes, generateQuizFromTopic, generateQuizFromPDF, loading, fetchQuizById, fetchQuizHistory,
    completedQuizzes,
    completedCount,
    resetQuizForRetake,
    resetCurrentQuiz,
    getBestSubject,
    handleDeleteQuiz 
  } = useQuiz();

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
      toast.error("Failed to generate quiz. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleGenerateQuiz();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Please select a PDF file");
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error("File size must be less than 10MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  // ✅ Fixed: Now using context function instead of direct API call
  const handlePDFUpload = async () => {
    if (!selectedFile) return;

    try {
      setIsUploadingPDF(true);
      
      const newQuiz = await generateQuizFromPDF(selectedFile);
      
      if (newQuiz) {
        toast.success("Quiz generated successfully from PDF!");
        setSelectedFile(null);
        
        // Navigate to the new quiz
        navigate(`/quiz/${newQuiz.id}`, { state: { quiz: newQuiz } });
      } else {
        toast.error("Failed to generate quiz from PDF");
      }
    } catch (error) {
      console.error("Error uploading PDF:", error);
      toast.error("An error occurred while processing the PDF");
    } finally {
      setIsUploadingPDF(false);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    // ✅ Reset file input
    const fileInput = document.getElementById('pdf-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  useEffect(() => {
    fetchQuizHistory();
  }, [fetchQuizHistory]);

  const handleDelete = async (quizId: string) => {
    const response = await handleDeleteQuiz(quizId)
    if (response) {
      toast.success("Quiz deleted successfully")
      fetchQuizHistory()
      getBestSubject()

    } else {
      toast.error("There was an error deleting the quiz")
    }
  }

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
          toast.error("Quiz not found");
        }
      }
    } catch (error) {
      console.error("Error opening quiz:", error);
      toast.error("Failed to open quiz");
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
    if (score >= 50 && score > 0) return "text-orange-500";
    if(score < 50) return "text-red-700";
  };

  const bestScore = quizzes.length > 0
    ? Math.max(...quizzes.filter(q => q.completed).map(q => q.percentage || 0))
    : 0;

  return (
    <div className="w-full min-h-screen">
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Quizzes</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Test your knowledge across different subjects
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <span className="text-sm font-medium whitespace-nowrap">Best Score: {bestScore}%</span>
            </div>
          </div>

          {/* Quiz Generation Section */}
          <div className="space-y-4">
            {/* Topic-based Quiz Generation */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Generate Quiz by Topic
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
                  <Input
                    placeholder="Enter a topic to generate a quiz"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button 
                    type="submit" 
                    disabled={isLoading || !newTopic.trim()}
                    className="w-full sm:w-auto"
                  >
                    {isLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                    Start Quiz
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* PDF Upload Section */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Generate Quiz from PDF
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {!selectedFile ? (
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="pdf-upload"
                      />
                      <label
                        htmlFor="pdf-upload"
                        className="cursor-pointer flex flex-col items-center gap-2"
                      >
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Click to upload PDF</p>
                          <p className="text-xs text-muted-foreground">
                            Maximum file size: 10MB
                          </p>
                        </div>
                      </label>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm truncate">{selectedFile.name.length > 20 ? `${selectedFile.name.slice(0, 20)}...` : selectedFile.name}</span>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          ({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearSelectedFile}
                        className="flex-shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {selectedFile && (
                    <Button
                      onClick={handlePDFUpload}
                      disabled={isUploadingPDF}
                      className="w-full"
                    >
                      {isUploadingPDF ? (
                        <>
                          <Loader2 className="animate-spin h-4 w-4 mr-2" />
                          Processing PDF...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Generate Quiz from PDF
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

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
            <div className="flex gap-2 overflow-x-auto pb-1">
              <Button
                variant={selectedDifficulty === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedDifficulty(null)}
                className="whitespace-nowrap"
              >
                All
              </Button>
              {difficulties.map((difficulty) => (
                <Button
                  key={difficulty}
                  variant={selectedDifficulty === difficulty ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDifficulty(difficulty)}
                  className="whitespace-nowrap"
                >
                  {difficulty}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium">Total Quizzes</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold mt-1">{quizzes.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium">Completed</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold mt-1">
                {completedCount}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-orange-500 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium">Average Score</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold mt-1">
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
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium truncate">Best Subject</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold mt-1 truncate">{getBestSubject()}</p>
            </CardContent>
          </Card>
        </div>

        {/* Quiz Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredQuizzes.map((quiz) => (
            <Card key={quiz.id || quiz.topic} className="hover:shadow-lg transition-all duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between w-full gap-2">
                  <div className="space-y-2 min-w-0 flex-1">
                    <CardTitle className="text-base sm:text-lg leading-tight break-words">
                      {quiz.subject || "Untitled Quiz"}
                    </CardTitle>
                    <Badge variant="outline" className="text-xs w-fit">
                      {quiz.subject || "General"}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    {quiz.completed && (
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(quiz.id)}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-1 border border-gray-300 px-2 py-0.5 rounded">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
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
                  className="w-full text-xs sm:text-sm"
                  variant={quiz.completed ? "outline" : "default"}
                  onClick={() => handleOpenQuiz(quiz.id)}
                  disabled={loadingQuizId === quiz.id}
                >
                  {loadingQuizId === quiz.id ? (
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
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
    </div>
  );
}