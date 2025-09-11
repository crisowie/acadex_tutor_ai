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
import { useNotes } from "@/context/NoteContext";
axios.defaults.withCredentials = true;
axios.defaults.baseURL = "https://acadex-tutor-ai.onrender.com";
// axios.defaults.baseURL = "http://localhost:5050"

export default function AskQuestion() {
  const { chatId } = useParams();
  const { sendMessage, setMessages, messages, loadChatHistory } = useChat();
  const { generateQuizFromChat } = useQuiz();
  const { user } = useAuth();
  const { addNote } = useNotes();
  const [highlightedText, setHighlightedText] = useState("");
  const [showSavePopup, setShowSavePopup] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");

  const navigate = useNavigate();

  const [currentQuestion, setCurrentQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      setHighlightedText(selection.toString());
      setShowSavePopup(true);
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
    <div className="h-full flex flex-col bg-background">
      {/* Header - Only show if chatId exists */}
      {chatId && (
        <div className="flex-shrink-0 flex justify-between items-center px-4 py-3 border-b border-border bg-background/95 backdrop-blur-sm">
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="text-lg font-semibold truncate">Acadex AI</h1>
          </div>
          <div className="flex-shrink-0">
            <BookmarkToggleButton itemId={chatId} type="chat" />
          </div>
        </div>
      )}

      {/* Main Content - Chat Interface */}
      <div className="flex-1 flex flex-col min-h-0">
        {messages.length === 0 ? (
          // Welcome Screen - Centered content
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="w-full max-w-3xl mx-auto text-center space-y-8">
              {/* Header */}
              <div className="space-y-4">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto">
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-3">
                    Hello {user?.full_name ? user.full_name.split(' ')[0] : "there"}!
                  </h1>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    I'm your AI tutor, ready to help you learn and understand any topic.
                    What would you like to explore today?
                  </p>
                </div>
              </div>

              {/* Suggestion Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {suggestionCards.map((card, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(card.title.toLowerCase())}
                    className="group p-4 rounded-xl border border-border hover:border-green-600/50 
                             hover:bg-neutral-800/50 transition-all duration-200 text-left"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-600/10 flex items-center justify-center 
                                    group-hover:bg-green-600/20 transition-colors flex-shrink-0">
                        <card.icon className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-medium text-sm mb-1">{card.title}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">{card.subtitle}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // Messages Area - Full height with proper scrolling
          <div className="flex-1 overflow-y-auto" onMouseUp={handleTextSelection}>
            <div className="max-w-4xl mx-auto px-4 py-6">
              <div className="space-y-6">
                {messages.map((message) => (
                  <div key={message.id} className="w-full">
                    {/* User Message */}
                    {message.role === "user" ? (
                      <div className="flex justify-end">
                        <div className="max-w-[80%] lg:max-w-[70%]">
                          <div className="bg-green-600 text-white rounded-2xl px-4 py-3 text-sm break-words">
                            <MessageRenderer
                              content={message.content}
                              resources={message.resources}
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Assistant Message */
                      <div className="flex justify-start">
                        <div className="max-w-[85%] lg:max-w-[80%] group">
                          <div className="bg-neutral-800 text-gray-100 rounded-2xl px-4 py-3 text-sm break-words">
                            <MessageRenderer
                              content={message.content}
                              resources={message.resources}
                            />
                          </div>
                          
                          {/* Copy Button */}
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(message.content);
                              setCopiedId(message.id);
                              setTimeout(() => setCopiedId(null), 2000);
                            }}
                            className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity 
                                     text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                          >
                            {copiedId === message.id ? (
                              <span className="text-green-400">Copied!</span>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Loading State */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] lg:max-w-[80%]">
                      <div className="bg-neutral-800 rounded-2xl px-4 py-3">
                        <LoadingSpinner size="sm" />
                        <p className="text-xs mt-2 text-muted-foreground">Thinking...</p>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>
        )}

        {/* Input Area - Fixed at bottom */}
        <div className="flex-shrink-0 border-t border-border bg-background p-4">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="relative">
              <Textarea
                ref={textareaRef}
                value={currentQuestion}
                onChange={(e) => setCurrentQuestion(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Message Acadex AI..."
                className="w-full min-h-[52px] max-h-32 resize-none rounded-2xl 
                         border-border bg-neutral-800 pr-12 pl-4 py-3 text-sm 
                         focus:outline-none focus:ring-2 focus:ring-green-600/50 focus:border-transparent
                         placeholder:text-muted-foreground"
                disabled={isLoading}
              />

              <Button
                type="submit"
                size="sm"
                className="absolute right-2 bottom-2 h-8 w-8 p-0 bg-green-600 hover:bg-green-700"
                disabled={!currentQuestion.trim() || isLoading}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>

            <p className="text-center text-xs text-muted-foreground mt-2">
              Acadex AI can make mistakes. Double-check explanations.
            </p>
          </div>
        </div>
      </div>

      {/* Floating Quiz Button */}
      {showQuiz && (
        <Button
          className="fixed bottom-24 right-6 bg-green-600 hover:bg-green-700 text-white 
                   shadow-lg rounded-full px-6 py-3 flex items-center gap-2 
                   animate-bounce z-50 text-sm"
          onClick={handleQuizMe}
        >
          <Sparkles className="h-4 w-4" />
          <span>Quiz Me</span>
        </Button>
      )}

      {/* Save Note Modal */}
      {showSavePopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background border border-border shadow-lg rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Save Highlight as Note</h3>
            <input
              type="text"
              placeholder="Enter title..."
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              className="w-full mb-4 p-3 text-sm rounded-lg border border-border bg-background 
                       focus:outline-none focus:ring-2 focus:ring-green-600/50"
            />
            <div className="mb-4 max-h-24 overflow-y-auto">
              <p className="text-sm text-muted-foreground break-words bg-muted/50 p-3 rounded-lg">
                {highlightedText}
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowSavePopup(false);
                  setHighlightedText("");
                  setNoteTitle("");
                }}
              >
                Cancel
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={async () => {
                  if (!noteTitle.trim()) {
                    toast.error("Please enter a title");
                    return;
                  }
                  await addNote(chatId!, noteTitle, highlightedText);
                  toast.success("Note saved!");
                  setShowSavePopup(false);
                  setHighlightedText("");
                  setNoteTitle("");
                }}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}