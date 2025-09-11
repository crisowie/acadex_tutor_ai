import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  Trophy,
  Clock,
  BookOpen,
  Target,
  TrendingUp,
  Calendar,
  Award
} from "lucide-react";
import { useChat } from "@/context/ChatContext";
import { useChatHistory } from "@/hooks/useChatHistory";
import { useMssgHistory } from "@/hooks/useMssgHistory";
import { useTotalTime } from "@/hooks/useTimeOnline";
import { useAuth } from "@/context/AuthContext";
import { useQuiz } from "@/context/QuizContext";

export default function Dashboard() {
  const { messages } = useMssgHistory()
  const { user } = useAuth()
  const { quizzes } = useQuiz()
  const { chatHistory } = useChatHistory()
  const { data, loading, error } = useTotalTime(user?.id || "");

  const totalTimeValue = loading
    ? 0
    : data
      ? `${(data.totalSeconds / 3600).toFixed(1)}h`
      : "0h";
  const stats = [
    {
      title: "Questions Asked",
      value: messages.length,
      change: "+12%",
      icon: BarChart3,
      color: "text-blue-500",
    },
    {
      title: "Quiz Score Average",
      value: quizzes.length > 0
        ? Math.round(
          quizzes
            .filter(q => q.completed && q.score !== null)
            .reduce((acc, q) => acc + (q.score || 0), 0) /
          quizzes.filter(q => q.completed && q.score !== null).length || 1
        )
        : 0,
      change: "+8%",
      icon: Trophy,
      color: "text-primary",
    },
    {
      title: "Total Study Time",
      value: totalTimeValue,
      change: "+25%",
      icon: Clock,
      color: "text-orange-500",
    },

    {
      title: "Topics Mastered",
      value: chatHistory.length,
      change: "+4",
      icon: Target,
      color: "text-purple-500",
    },
  ];


  return (
    <div className="px-2 py-3 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Track your learning progress and achievements
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="relative overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                  <Badge variant="secondary" className="text-xs">
                    {stat.change}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Progress */}
        {/* <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Subject Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {chatHistory.slice(0, 4).map((subject) => (
              <div key={subject.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{subject.subject_emphasis}</span>
                  <span className="text-xs text-muted-foreground">
                    {subject.lessons}/{subject.total} lessons
                  </span>
                </div>
                <Progress value={subject.progress} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{subject.progress}% complete</span>
                  <span>{subject.total - subject.lessons} remaining</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card> */}

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {chatHistory.slice(0, 4).map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="p-2 rounded-full bg-primary/10">

                    <Award className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.subject_emphasis}</p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={activity.score >= 90 ? "default" : activity.score >= 80 ? "secondary" : "outline"}
                      className="text-xs"
                    >
                      {activity.score}%
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(activity.created_at).toLocaleString()}
                    </p>

                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Today's Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Study Goal</span>
              </div>
              <p className="text-2xl font-bold text-primary">2.5h</p>
              <p className="text-xs text-muted-foreground">{totalTimeValue} Time  Completed</p>
              <Progress value={48} className="mt-2 h-1" />
            </div>

            <div className="p-4 rounded-lg bg-orange-500/5 border border-orange-500/20">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">Quiz Taken</span>
              </div>
              <p className="text-2xl font-bold text-orange-500">{quizzes.length}</p>
              <p className="text-xs text-muted-foreground">{quizzes.length > 0 ? `${quizzes.length} quizzes taken` : 'No quizzes taken'}</p>
              <Progress value={quizzes.length} className="mt-2 h-1" />
            </div>

            <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">Streak</span>
              </div>
              <p className="text-2xl font-bold text-purple-500">7</p>
              <p className="text-xs text-muted-foreground">days active</p>
              <Progress value={100} className="mt-2 h-1" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}