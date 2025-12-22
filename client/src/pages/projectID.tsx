import { useState, useRef,useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bot,
  Send,
  Users,
  FileText,
  CheckSquare,
  Share2,
  Settings,
  ChevronLeft,
  UserPlus,
  MoreVertical,
  Circle,
  Paperclip,
  Sparkles,
  MessageSquare,
  Clock,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { useChat } from "../context/ChatContext"
import { Message } from "@/types";
import axios from "axios"
export default function ProjectWorkspace() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("editor");
  const [showAIMentor, setShowAIMentor] = useState(false);
  const [editorContent, setEditorContent] = useState("");
  const [aiMessages, setAiMessages] = useState<any[]>([]);
  const [aiInput, setAiInput] = useState("");
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const { sendMessage, setMessages, messages, loadChatHistory, summarizePDF } = useChat();
  const [inviteEmail, setInviteEmail] = useState("");
  const [sidebarTab, setSidebarTab] = useState("team");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { chatId } = useParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [highlightedText, setHighlightedText] = useState("");
  const [showSavePopup, setShowSavePopup] = useState(false);
  const navigate = useNavigate()

  // Mock project data
  const project = {
    name: "AI Tutor Assistant",
    description: "An interactive AI-based tutor for students",
    members: [
      { id: "1", name: "You", initials: "ME", status: "online", color: "bg-blue-500" },
      { id: "2", name: "Sarah Chen", initials: "SC", status: "online", color: "bg-green-500" },
      { id: "3", name: "Mike Johnson", initials: "MJ", status: "away", color: "bg-purple-500" },
      { id: "4", name: "Emma Davis", initials: "ED", status: "offline", color: "bg-orange-500" },
    ],
    tasks: [
      { id: "1", title: "Research AI tutoring methods", completed: true },
      { id: "2", title: "Design user interface", completed: true },
      { id: "3", title: "Implement core features", completed: false },
      { id: "4", title: "Testing and QA", completed: false },
    ],
  };

  const [tasks, setTasks] = useState(project.tasks);

  const handleSend = () => {
    if (!aiInput.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: aiInput,
      timestamp: new Date(),
    };

    setAiMessages([...aiMessages, userMessage]);
    setAiInput("");


    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        role: "assistant",
        content: "I can help you with that! Based on your project goals, I suggest breaking this down into smaller tasks. Would you like me to help you outline the next steps?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setAiMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

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

  const removeFile = () => {
    setSelectedFile(null);
    const input = document.getElementById("fileUpload") as HTMLInputElement;
    if (input) input.value = "";
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

  const handleSendAIMessage = async (e: React.FormEvent) => {
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
    console.log(userMessage, )

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
        console.log(response)
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

  const toggleTask = (taskId: string) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleInviteMember = () => {
    if (!inviteEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }
    toast.success(`Invitation sent to ${inviteEmail}`);
    setInviteEmail("");
    setInviteDialogOpen(false);
  };

  return (
    <div className="w-full h-screen flex flex-col bg-background">
      {/* Top Navigation Bar */}
      <div className="border-b bg-card">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold">{project.name}</h1>
              <p className="text-sm text-muted-foreground">{project.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Active Members */}
            <div className="flex items-center -space-x-2">
              {project.members.slice(0, 4).map((member) => (
                <div key={member.id} className="relative">
                  <Avatar className="h-8 w-8 border-2 border-background">
                    <AvatarFallback className={member.color}>
                      {member.initials}
                    </AvatarFallback>
                  </Avatar>
                  <Circle
                    className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background ${member.status === "online"
                      ? "fill-green-500 text-green-500"
                      : member.status === "away"
                        ? "fill-yellow-500 text-yellow-500"
                        : "fill-gray-400 text-gray-400"
                      }`}
                  />
                </div>
              ))}
            </div>

            <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Invite Team Member</DialogTitle>
                  <DialogDescription>
                    Invite someone to collaborate on this project
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Input
                    placeholder="Enter email address"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleInviteMember()}
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleInviteMember}>Send Invitation</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Project Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Export Project</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  Leave Project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Team & Tasks */}
        <div className="w-80 border-r bg-card overflow-y-auto">
          <div className="p-4 border-b">
            <div className="flex gap-2">
              <Button
                variant={sidebarTab === "team" ? "default" : "outline"}
                className="flex-1"
                size="sm"
                onClick={() => setSidebarTab("team")}
              >
                <Users className="h-4 w-4 mr-2" />
                Team
              </Button>
              <Button
                variant={sidebarTab === "tasks" ? "default" : "outline"}
                className="flex-1"
                size="sm"
                onClick={() => setSidebarTab("tasks")}
              >
                <CheckSquare className="h-4 w-4 mr-2" />
                Tasks
              </Button>
            </div>
          </div>

          <div className="p-4 space-y-2">
            {sidebarTab === "team" && project.members.map((member) => (
              <Card key={member.id} className="p-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar>
                      <AvatarFallback className={member.color}>
                        {member.initials}
                      </AvatarFallback>
                    </Avatar>
                    <Circle
                      className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${member.status === "online"
                        ? "fill-green-500 text-green-500"
                        : member.status === "away"
                          ? "fill-yellow-500 text-yellow-500"
                          : "fill-gray-400 text-gray-400"
                        }`}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{member.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {member.status}
                    </p>
                  </div>
                </div>
              </Card>
            ))}

            {sidebarTab === "tasks" && (
              <>
                {tasks.map((task) => (
                  <Card
                    key={task.id}
                    className="p-3 cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => toggleTask(task.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 h-5 w-5 rounded border-2 flex items-center justify-center ${task.completed
                          ? "bg-primary border-primary"
                          : "border-muted-foreground"
                          }`}
                      >
                        {task.completed && (
                          <Check className="h-3 w-3 text-primary-foreground" />
                        )}
                      </div>
                      <p
                        className={`text-sm flex-1 ${task.completed
                          ? "line-through text-muted-foreground"
                          : "text-foreground"
                          }`}
                      >
                        {task.title}
                      </p>
                    </div>
                  </Card>
                ))}
                <Button variant="outline" className="w-full mt-4">
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Center - Main Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b bg-card">
            <div className="flex gap-2">
              <Button
                variant={activeTab === "editor" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("editor")}
              >
                <FileText className="h-4 w-4 mr-2" />
                Document
              </Button>
              <Button
                variant={activeTab === "chat" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("chat")}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Team Chat
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden p-4">
            {activeTab === "editor" && (
              <Card className="h-full flex flex-col">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Project Document</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        Auto-saved
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Paperclip className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-0 overflow-hidden">
                  <Textarea
                    placeholder="Start writing your project document here... Your team members can see changes in real-time."
                    className="h-full w-full resize-none border-0 focus-visible:ring-0 p-6 text-base leading-relaxed"
                    value={editorContent}
                    onChange={(e) => setEditorContent(e.target.value)}
                  />
                </CardContent>
              </Card>
            )}

            {activeTab === "chat" && (
              <Card className="h-full flex flex-col">
                <CardHeader className="border-b">
                  <CardTitle className="text-base">Team Discussion</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-green-500">SC</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="font-medium text-sm">Sarah Chen</span>
                        <span className="text-xs text-muted-foreground">10:24 AM</span>
                      </div>
                      <p className="text-sm mt-1">
                        I've updated the introduction section. Can someone review it?
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-blue-500">ME</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="font-medium text-sm">You</span>
                        <span className="text-xs text-muted-foreground">10:26 AM</span>
                      </div>
                      <p className="text-sm mt-1">
                        Looks great! I'll work on the methodology section next.
                      </p>
                    </div>
                  </div>
                </CardContent>
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input placeholder="Type a message..." />
                    <Button size="icon">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Right Sidebar - AI Mentor */}
        <div
          className={`border-l bg-card transition-all duration-300 flex flex-col ${showAIMentor ? "w-96" : "w-0"
            } overflow-hidden`}
        >
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">AI Mentor</h3>
                <p className="text-xs text-muted-foreground">Always here to help</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAIMentor(false)}
            >
              Close
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h4 className="font-medium mb-2">AI Mentor Ready</h4>
                <p className="text-sm text-muted-foreground">
                  Ask me anything about your project, get suggestions, or request help with research.
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""
                    }`}
                >
                  {message.role === "assistant" && (
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={`flex-1 rounded-lg p-3 ${message.role === "user"
                      ? "bg-primary text-primary-foreground ml-8"
                      : "bg-muted mr-8"
                      }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    {/* <span className="text-xs opacity-70 mt-1 block">
                    {message.id}
                    </span> */}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                placeholder="Ask AI Mentor..."
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
              />
              <Button size="icon" onClick={handleSendAIMessage}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating AI Mentor Toggle */}
      {!showAIMentor && (
        <Button
          size="lg"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
          onClick={() => setShowAIMentor(true)}
        >
          <Bot className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}