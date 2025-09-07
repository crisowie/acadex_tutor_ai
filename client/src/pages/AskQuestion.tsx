import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Send, Bot, Mic, Paperclip, Copy, Sparkles, BookOpen, Lightbulb, MessageSquare, HelpCircle } from "lucide-react";
import { useChat } from "@/context/ChatContext";
import { Message } from "@/types";
import BookmarkToggleButton from "@/utils/bookmarkButton";
import MessageRenderer from "@/components/MessageRender";
import { toast } from "react-hot-toast";
import { useQuiz } from "@/context/QuizContext";
import { useAuth } from "@/context/AuthContext";

axios.defaults.withCredentials = true;
// axios.defaults.baseURL = "https://acadex-tutor-ai.onrender.com";
axios.defaults.baseURL = "http://localhost:5050"

export default function AskQuestion() {
  const { chatId } = useParams();
  const { sendMessage, setMessages, messages, loadChatHistory } = useChat();
  const { generateQuizFromChat } = useQuiz();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [currentQuestion, setCurrentQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const greetings = `Hello ${user?.full_name || "there"}! I'm your AI tutor, ready to help you learn and understand any topic. What would you like to explore today?`;

  const suggestionCards = [
    {
      icon: BookOpen,
      title: "Explain a concept",
      subtitle: "Get clear explanations of complex topics"
    },
    {
      icon: Lightbulb,
      title: "Solve a problem",
      subtitle: "Work through challenging questions step-by-step"
    },
    {
      icon: MessageSquare,
      title: "Practice conversation",
      subtitle: "Improve your understanding through discussion"
    },
    {
      icon: HelpCircle,
      title: "Ask anything",
      subtitle: "I'm here to help with any academic question"
    }
  ];

  const handleQuizMe = async () => {
    if (!chatId) return toast("No chat selected");
    const quiz = await generateQuizFromChat(chatId);
    if (quiz?.id) {
      navigate(`/quiz/${quiz.id}`, { state: { quiz } });
      console.log("Generated quiz from chat:", quiz);
    }
  };

  // scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // load history or greeting
  useEffect(() => {
    const loadChat = async () => {
      if (chatId) {
        try {
          const res = await axios.get(`/api/chat-history/${chatId}`);
          loadChatHistory(chatId);
          setMessages(res.data.messages);
        } catch (err) {
          console.error("Failed to load chat history:", err);
          setMessages([
            {
              id: 1,
              content: "Failed to load previous messages.",
              role: "assistant",
              timestamp: new Date(),
            },
          ]);
        }
      } else {
        setMessages([]);
      }
    };
    loadChat();
  }, [chatId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentQuestion.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      content: currentQuestion,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setCurrentQuestion("");
    setIsLoading(true);

    try {
      await sendMessage(currentQuestion);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          content: "Error: Could not fetch response from the server.",
          role: "assistant",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setCurrentQuestion(suggestion);
    textareaRef.current?.focus();
  };

  // 👇 compute if Quiz button should show
  const userMessages = messages.filter((m) => m.role === "user");
  const showQuiz = userMessages.length >= 3;

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      {chatId && (
        <div className="flex justify-between items-center px-6 py-4 border-b border-border bg-background/95 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-semibold">Acadex AI</h1>
          </div>
          <BookmarkToggleButton itemId={chatId} type="chat" />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        {messages.length === 0 ? (
          // Welcome Screen
          <div className="flex-1 flex flex-col items-center justify-center px-6 pb-32">
            <div className="text-center mb-12">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold mb-4">
                Hello {user?.full_name || "there"}!
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                I'm your AI tutor, ready to help you learn and understand any topic. 
                What would you like to explore today?
              </p>
            </div>

            {/* Suggestion Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
              {suggestionCards.map((card, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(card.title.toLowerCase())}
                  className="group p-4 rounded-xl border border-border hover:border-green-600/50 
                           hover:bg-neutral-800/50 transition-all duration-200 text-left"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-600/10 flex items-center justify-center 
                                  group-hover:bg-green-600/20 transition-colors">
                      <card.icon className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm mb-1">{card.title}</h3>
                      <p className="text-xs text-muted-foreground">{card.subtitle}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          // Chat Messages
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <div className="space-y-6 max-w-3xl mx-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  
                  <div
                    className={`group relative max-w-2xl ${
                      message.role === "user" ? "order-2" : ""
                    }`}
                  >
                    <div
                      className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        message.role === "user"
                          ? "bg-green-600 text-white ml-auto"
                          : "bg-neutral-800 text-gray-100"
                      }`}
                    >
                      <MessageRenderer 
                        content={message.content} 
                        resources={message.resources} 
                      />
                    </div>

                    {/* Copy button for assistant messages */}
                    {message.role === "assistant" && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(message.content);
                          setCopiedId(message.id);
                          setTimeout(() => setCopiedId(null), 2000);
                        }}
                        className="absolute -bottom-8 left-0 opacity-0 group-hover:opacity-100 
                                 transition-opacity duration-200 text-xs text-muted-foreground 
                                 hover:text-foreground flex items-center gap-1"
                      >
                        {copiedId === message.id ? (
                          <span className="text-green-400">Copied!</span>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            Copy
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {message.role === "user" && (
                    <div className="w-8 h-8 bg-neutral-700 rounded-full flex items-center justify-center flex-shrink-0 mt-1 order-3">
                      <span className="text-xs font-medium text-white">
                        {user?.full_name?.charAt(0) || "U"}
                      </span>
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-4 justify-start">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-neutral-800 max-w-2xl">
                    <LoadingSpinner size="sm" />
                    <p className="text-xs mt-2 text-muted-foreground">Thinking...</p>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-border bg-background px-4 py-4">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="relative">
              <Textarea
                ref={textareaRef}
                value={currentQuestion}
                onChange={(e) => setCurrentQuestion(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Message Acadex AI..."
                className="w-full min-h-[52px] max-h-40 resize-none rounded-xl border-border 
                         bg-neutral-800 pr-12 pl-4 py-3 text-sm focus:outline-none focus:ring-2 
                         focus:ring-green-600/50 focus:border-transparent"
                disabled={isLoading}
              />
              
              <div className="absolute right-2 bottom-2 flex items-center gap-1">
                <button
                  type="button"
                  disabled
                  className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground 
                           hover:text-foreground hover:bg-neutral-700 transition-colors disabled:opacity-50"
                >
                  <Paperclip className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled
                  className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground 
                           hover:text-foreground hover:bg-neutral-700 transition-colors disabled:opacity-50"
                >
                  <Mic className="h-4 w-4" />
                </button>
                <Button
                  type="submit"
                  size="sm"
                  className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700"
                  disabled={!currentQuestion.trim() || isLoading}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
            
            <p className="text-center text-xs text-muted-foreground mt-3">
              Acadex AI can make mistakes. Double-check explanations.
            </p>
          </div>
        </div>
      </div>

      {/* Floating Quiz Button */}
      {showQuiz && (
        <Button
          className="fixed bottom-24 right-6 bg-green-600 hover:bg-green-700 text-white 
                   shadow-lg rounded-full px-6 py-3 flex items-center gap-2 animate-bounce z-50"
          onClick={handleQuizMe}
        >
          <Sparkles className="h-4 w-4" />
          Quiz Me
        </Button>
      )}
    </div>
  );
}