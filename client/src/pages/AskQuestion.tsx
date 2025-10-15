import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Send, Paperclip, Copy, Sparkles, BookOpen, Lightbulb, MessageSquare, HelpCircle, Check, X, Bookmark, Loader2 } from "lucide-react";
import { useChat } from "@/context/ChatContext";
import { Message } from "@/types";
import BookmarkToggleButton from "@/utils/bookmarkButton";
import MessageRenderer from "@/components/MessageRender";
import { toast } from "react-hot-toast";
import { useQuiz } from "@/context/QuizContext";
import { useAuth } from "@/context/AuthContext";
import { useNotes } from "@/context/NoteContext";

axios.defaults.withCredentials = true;
// axios.defaults.baseURL = "http://localhost:5050"; it
axios.defaults.baseURL = "https://acadex-tutor-ai.onrender.com";

export default function AskQuestion() {
  const { chatId } = useParams();
  const [quiz, setQuiz] = useState(false);
  const { sendMessage, setMessages, messages, loadChatHistory, summarizePDF } = useChat();
  const { generateQuizFromChat } = useQuiz();
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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
      title: "Summarize text",
      subtitle: "Input text or upload a pdf file for a concise summary"
    },
    {
      icon: HelpCircle,
      title: "Ask anything",
      subtitle: "I'm here to help with any academic question"
    }
  ];

  const handleQuizMe = async () => {
    try {
      setQuiz(true);
      if (!chatId) return toast.error("No chat selected");
      const quiz = await generateQuizFromChat(chatId);
      if (quiz?.id) {
        navigate(`/quiz/${quiz.id}`, { state: { quiz } });
      }
    } catch (error) {
      console.error("Error generating quiz:", error);
    } finally {
      setQuiz(false);
    }
  };


  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      setHighlightedText(selection.toString());
      setShowSavePopup(true);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    const input = document.getElementById("fileUpload") as HTMLInputElement;
    if (input) input.value = "";
  };

  // Scroll on new messages or content updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load history or greeting
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
    if ((!currentQuestion.trim() && !selectedFile) || isLoading) return;

    // Add user message (text or file)
    const userMessage: Message = {
      id: Date.now(),
      content: selectedFile ? `📄 ${selectedFile.name}` : currentQuestion,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setCurrentQuestion("");
    setIsLoading(true);

    try {
      if (selectedFile) {
        // Handle file summarization
        const result = await summarizePDF(selectedFile, chatId);
        setSelectedFile(null);

        if (!chatId && result && result.chat_id) {
          navigate(`/chat/${result.chat_id}`, { replace: true });
        }
      } else {
        // Handle normal text message with streaming
        const response = await sendMessage(currentQuestion);

        if (!chatId && response && typeof response === "object" && "chat_id" in response) {
          navigate(`/chat/${response.chat_id}`, { replace: true });
        }
      }
    } catch (error) {
      console.error("Submit error:", error);
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

  // Compute if Quiz button should show
  const userMessages = messages.filter((m) => m.role === "user");
  const showQuiz = userMessages.length >= 3;

  return (
    <div className="flex flex-col h-full w-full bg-zinc-950 overflow-hidden">
      {/* Header - Only show if chatId exists */}
      {chatId && (
        <div className="flex-shrink-0 flex justify-between items-center px-3 py-2.5 border-b border-zinc-800 bg-zinc-900/95 backdrop-blur-sm w-full">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <h1 className="text-sm font-semibold truncate text-white">Acadex AI</h1>
          </div>
          <button className="flex-shrink-0 p-1.5 hover:bg-zinc-800 rounded-lg transition-colors">
            <BookmarkToggleButton itemId={chatId} type="chat" />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto scrollbar-thumb-black scrollbar-track-slate-900 overflow-x-hidden w-full">
        {messages.length === 0 ? (
          // Welcome Screen
          <div className="flex items-center justify-center min-h-full p-4 w-full">
            <div className="w-full max-w-2xl mx-auto text-center space-y-6">
              <div className="space-y-3 px-2">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                  Hello {user?.full_name ? user.full_name.split(' ')[0] : "there"}!
                </h1>
                <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed">
                  I'm your AI tutor, ready to help you learn and understand any topic.
                  What would you like to explore today?
                </p>
              </div>

              {/* Suggestion Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto w-full px-2">
                {suggestionCards.map((card, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(card.title.toLowerCase())}
                    className="group p-3 sm:p-4 rounded-xl border border-zinc-800 hover:border-green-600/50 
                             hover:bg-zinc-800/50 transition-all duration-200 text-left w-full"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-600/10 flex items-center justify-center 
                                    group-hover:bg-green-600/20 transition-colors flex-shrink-0">
                        <card.icon className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-sm text-white mb-1">{card.title}</h3>
                        <p className="text-xs text-zinc-400 leading-relaxed">{card.subtitle}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // Messages Area
          <div className="h-full w-full" onMouseUp={handleTextSelection}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`w-full border-b border-zinc-800/50 ${message.role === "assistant" ? "bg-zinc-900/30" : ""
                  }`}
              >
                <div className="max-w-3xl mx-auto px-4 py-4 sm:py-5 w-full">
                  {/* User Message */}
                  {message.role === "user" ? (
                    <div className="flex gap-3 items-start w-full">
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-green-600 flex items-center justify-center text-white text-sm font-semibold">
                        {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                        <div className="text-sm text-zinc-100 break-words whitespace-pre-wrap">
                          {message.content}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Assistant Message with Streaming Support */
                    <div className="flex gap-3 items-start group w-full">
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-green-600 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-zinc-100 break-words whitespace-pre-wrap pt-1">
                          <MessageRenderer content={message.content} resources={message.resources} />

                          {/* Streaming cursor effect */}
                          {message.streaming && (
                            <span className="inline-block w-1.5 h-4 bg-green-600 ml-0.5 animate-pulse" />
                          )}
                        </div>

                        {/* Copy Button - Only show when not streaming */}
                        {!message.streaming && message.content && (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(message.content);
                              setCopiedId(message.id);
                              setTimeout(() => setCopiedId(null), 2000);
                            }}
                            className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity 
                                     text-xs text-zinc-400 hover:text-zinc-100 flex items-center gap-1.5 
                                     px-2 py-1 rounded hover:bg-zinc-800"
                          >
                            {copiedId === message.id ? (
                              <>
                                <Check className="h-3 w-3" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading State - Show while waiting for stream to start */}
            {isLoading && !messages.some(m => m.streaming) && (
              <div className="w-full bg-zinc-900/30 border-b border-zinc-800/50">
                <div className="max-w-3xl mx-auto px-4 py-4 sm:py-5 w-full">
                  <div className="flex gap-3 items-start">
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-green-600 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                      <p className="text-xs mt-2 text-zinc-400">Thinking...</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom spacer */}
            <div className="h-32" />
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Fixed Input Area at Bottom */}
      <div className="flex-shrink-0 border-t border-zinc-800 bg-zinc-950 w-full safe-bottom">
        <div className="max-w-3xl mx-auto px-3 py-3 w-full">
          <form onSubmit={handleSubmit} className="relative w-full">
            {/* Hidden File Input */}
            <input
              type="file"
              id="fileUpload"
              accept=".pdf,.txt,.docx"
              className="hidden"
              onChange={handleFileChange}
            />

            <div className="relative flex items-end gap-2 bg-zinc-900 rounded-2xl border border-zinc-800 
                          focus-within:border-green-600/50 transition-colors w-full">
              {/* Upload Button */}
              <label
                htmlFor="fileUpload"
                className="absolute left-3 bottom-3 cursor-pointer text-zinc-400 
                         hover:text-green-600 transition-colors z-10"
              >
                <Paperclip className="h-5 w-5" />
              </label>

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={currentQuestion}
                onChange={(e) => setCurrentQuestion(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Message Acadex AI..."
                className="flex-1 min-h-[52px] max-h-32 resize-none bg-transparent border-0 
                         pl-11 pr-11 py-3.5 text-sm text-zinc-100 placeholder:text-zinc-500 w-full
                         focus:outline-none focus:ring-0"
                disabled={isLoading}
                rows={1}
              />

              {/* Send Button */}
              <button
                type="submit"
                className="absolute right-2 bottom-2 h-9 w-9 rounded-lg bg-green-600 
                         hover:bg-green-700 disabled:opacity-50 disabled:bg-zinc-700 
                         disabled:cursor-not-allowed flex-shrink-0 flex items-center justify-center
                         transition-colors"
                disabled={(!currentQuestion.trim() && !selectedFile) || isLoading}
              >
                <Send className="h-4 w-4 text-white" />
              </button>
            </div>
          </form>

          {/* File Preview */}
          {selectedFile && (
            <div className="flex items-center justify-between mt-2 px-3 py-2.5 rounded-lg 
                          bg-zinc-900 text-sm border border-zinc-800 w-full">
              <span className="truncate flex-1 mr-2 text-zinc-300 text-xs">{selectedFile.name}</span>
              <button
                onClick={removeFile}
                className="flex-shrink-0 text-red-500 hover:text-red-400 transition-colors"
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <p className="text-center text-xs text-zinc-500 mt-2 px-2">
            Acadex AI can make mistakes. Double-check explanations.
          </p>
        </div>
      </div>

      {/* Floating Quiz Button */}
      {showQuiz && (
        <button
        disabled={quiz}
          onClick={handleQuizMe}
          className="fixed bottom-28 right-4 bg-green-600 hover:bg-green-700 
                   text-white shadow-lg rounded-full px-5 py-2.5 
                   flex items-center gap-2 animate-bounce z-50 text-sm"
        >
          <Sparkles className="h-4 w-4" />
          <span>{quiz ? <Loader2 className="animate-spin h-5 w-5"/> : "Quiz Me"}</span>
        </button>
      )}

      {/* Save Note Modal */}
      {showSavePopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 shadow-lg rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-white">Save Highlight as Note</h3>
            <input
              type="text"
              placeholder="Enter title..."
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              className="w-full mb-4 p-3 text-sm rounded-lg border border-zinc-800 bg-zinc-950 
                       text-white placeholder:text-zinc-500
                       focus:outline-none focus:ring-2 focus:ring-green-600/50"
            />
            <div className="mb-4 max-h-24 overflow-y-auto">
              <p className="text-sm text-zinc-400 break-words bg-zinc-800/50 p-3 rounded-lg">
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