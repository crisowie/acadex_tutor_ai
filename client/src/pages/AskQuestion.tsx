import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Send, Bot, Mic, Paperclip, Copy, Sparkles, BookOpen, Lightbulb, MessageSquare, HelpCircle, ArrowUp } from "lucide-react";
import { useChat } from "@/context/ChatContext";
import { Message } from "@/types";
import BookmarkToggleButton from "@/utils/bookmarkButton";
import MessageRenderer from "@/components/MessageRender";
import { toast } from "react-hot-toast";
import { useQuiz } from "@/context/QuizContext";
import { useAuth } from "@/context/AuthContext";
import { useNotes } from "@/context/NoteContext";
import { X, Check } from "lucide-react";
axios.defaults.withCredentials = true;
// axios.defaults.baseURL = "http://localhost:5050";
axios.defaults.baseURL = "https://acadex-tutor-ai.onrender.com";

export default function AskQuestion() {
  const { chatId } = useParams();
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    const input = document.getElementById("fileUpload") as HTMLInputElement;
    if (input) input.value = ""; // clear file input
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
        // ✅ Handle file summarization
        const result = await summarizePDF(selectedFile, chatId);
        setSelectedFile(null); // reset after sending

        if (!chatId && result && result.chat_id) {
          navigate(`/chat/${result.chat_id}`, { replace: true });
        }
      } else {
        // ✅ Handle normal text message
        const response = await sendMessage(currentQuestion);
        // If new chat created, navigate to it
        // Add these debug logs
        console.log("Response from sendMessage:", response);
        console.log("Current chatId:", chatId);

        if (!chatId && response && typeof response === "object" && "chat_id" in response) {
          console.log("Navigating to:", `/chat/${response.chat_id}`);
          navigate(`/chat/${response.chat_id}`, { replace: true });
        }
      }
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

  // compute if Quiz button should show
  const userMessages = messages.filter((m) => m.role === "user");
  const showQuiz = userMessages.length >= 3;

  return (
    <div className="flex flex-col h-screen bg-background">
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
      {/* Main Content Area - Takes remaining space minus input */}
      <div className="flex-1 overflow-y-auto pb-4 scrollbar-thumb-black ">
        {messages.length === 0 ? (
          // Welcome Screen - Centered content
          <div className="flex items-center justify-center min-h-full p-4">
            <div className="w-full max-w-3xl mx-auto text-center space-y-8">
              {/* Header */}
              <div className="space-y-4">
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
          // Messages Area - Scrollable content
          <div className="h-full" onMouseUp={handleTextSelection}>
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
                              <span className="text-foreground"><Check /></span>
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

                {/* Spacer to prevent last message from being hidden behind input */}
                <div className="h-32" />
                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>
        )}
      </div>
      {/* bg-background/95 */}
      {/* Fixed Input Area at Bottom */}
      <div className="sticky bottom-0 flex-shrink-0 border-border   p-2">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="relative flex items-end bottom-0">
            {/* Hidden File Input */}
            <input
              type="file"
              id="fileUpload"
              accept=".pdf,.txt,.docx"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Upload Button inside input */}
            <label
              htmlFor="fileUpload"
              className="absolute left-2 bottom-2 cursor-pointer text-muted-foreground hover:text-green-600 border p-1 rounded-sm"
            >
              <Paperclip className="h-5 w-5" />
            </label>
            {/* <label
              htmlFor="fileUpload"
              className="absolute left-3 bottom-2 cursor-pointer text-muted-foreground hover:text-green-600  border p-1 rounded-sm"
            >
              <Mic className="h-5 w-5" />
            </label> */}

            <Textarea
              ref={textareaRef}
              value={currentQuestion}
              onChange={(e) => setCurrentQuestion(e.target.value)}
              placeholder="Message Acadex AI..."
              className="w-full min-h-[52px] max-h-32 resize-none rounded-2xl 
               border-border bg-neutral-800 pr-12 pl-10 py-6 text-sm 
               focus:outline-none focus:ring-2 focus:ring-green-600/50 focus:border-transparent
               placeholder:text-muted-foreground placeholder:pb-4"
              disabled={isLoading}
            />
            {/* border p-1 rounded-sm */}

            <Button
              type="submit"
              size="sm"
              className="absolute right-2 bottom-2 h-8 w-8 p-0 rounded-xl bg-green-600 hover:bg-green-700"
              disabled={(!currentQuestion.trim() && !selectedFile) || isLoading}
            >
              <Send className="h-4 w-4" />
            </Button>

          </form>

          {/* File Preview */}
          {selectedFile && (
            <div className="flex items-center justify-between mt-2 px-3 py-2 rounded-lg bg-neutral-800 text-sm text-muted-foreground border border-border">
              <span className="truncate max-w-[80%]">{selectedFile.name}</span>
              <button
                onClick={removeFile}
                className="ml-2 text-red-500 hover:text-red-600"
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <p className="text-center text-xs text-muted-foreground mt-2">
            Acadex AI can make mistakes. Double-check explanations.
          </p>
        </div>
      </div>


      {/* Floating Quiz Button */}
      {showQuiz && (
        <Button
          className="fixed bottom-32 right-6 bg-green-600 hover:bg-green-700 text-white 
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