import {
  MessageSquare,
  BarChart3,
  BookOpen,
  Bookmark,
  Library,
  Lightbulb,
  LayoutDashboard,
  User,
  Brain,
  Users2,
  NotebookPen,
  MoreHorizontal,
  Trash2,
  Edit3,
  FolderPlus,
  Archive,
  Share2,
  Share,
  Check,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { NavLink, useLocation, useNavigate, useParams } from "react-router-dom";

import { toast } from 'sonner'
import { useAuth } from "@/context/AuthContext";
import { useRenameChat } from "@/hooks/useRenameChat";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { useChatHistory } from "@/hooks/useChatHistory";
import { useChat } from "@/context/ChatContext";
import { useEffect, useState } from "react";

const navigation = [
  { title: "AI Mentor", url: "/ask", icon: MessageSquare, action: "new-chat" },
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Quizzes", url: "/quizzes", icon: BookOpen },
  { title: "Notes", url: "/note", icon: NotebookPen },
  // { title: "Projects", url: "/projects", icon: FolderPlus },
  { title: "Resources", url: "/resources", icon: Library },
];

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const location = useLocation();
  const { user } = useAuth();
  const { chatHistory, refresh } = useChatHistory();
  const { startNewChat, deleteChat, fetchSingleChat, OpenChat, shareChat, RenameChat, loading } = useChat();

  const [renameOpen, setRenameOpen] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  

  // State for share functionality
  const [sharingChatId, setSharingChatId] = useState<string | null>(null);
  const [copiedChatId, setCopiedChatId] = useState<string | null>(null);

  const params = useParams();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);

  // Check if screen is mobile size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const isCollapsed = state === "collapsed";
  const currentPath = location.pathname;
  const isActive = (path: string) => currentPath === path;

  const activeChatId = params.id || null;

  const getNavClasses = (path: string) => {
    return isActive(path)
      ? "bg-primary/10 text-primary border-r-2 border-primary font-medium"
      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground";
  };

  const getChatItemClasses = (chatId: string) => {
    return activeChatId === chatId
      ? "bg-green-500/10 text-green-600 border-r-2 border-green-500 font-medium"
      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground";
  };

  const getInitial = (name: string) => user.full_name ? name.charAt(0).toUpperCase() : "U";

  const handleNavigationClick = () => {
    if (isMobile) {
      toggleSidebar();
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    const response = await deleteChat(chatId);
    console.log(response, "deleted")
    if (response) {
      refresh();
      toast.success("Chat deleted successfully.");
    }
    console.log("Delete chat response:", response);
  };

  const handleRenameChat = (chatId: string) => {
    setSelectedChatId(chatId);
    const chat = chatHistory.find((c) => c.id === chatId);
    setNewName(chat?.title || "");
    setRenameOpen(true);
  };

  const handleAddToProject = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Add to project:", chatId);
  };

  const handleShare = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    setSharingChatId(chatId);
    
    try {
      const shareUrl = await shareChat(chatId);
      console.log("Sharing chat with ID:", chatId);
      if (shareUrl) {
        // Set copied state for visual feedback
        setCopiedChatId(chatId);
        console.log("Sharing chat with ID:", chatId);

        toast.success("Share link copied to clipboard!", {
          description: "Anyone with this link can view the conversation",
          action: {
            label: "Open",
            onClick: () => window.open(shareUrl, '_blank'),
          },
          duration: 4000,
        });

        // Reset copied state after 2 seconds
        setTimeout(() => setCopiedChatId(null), 2000);
      } else {
        toast.error("Failed to generate share link");
      }
    } catch (error) {
      console.error("Share error:", error);
      toast.error("Failed to share chat. Please try again.");
    } finally {
      setSharingChatId(null);
    }
  };

  return (
    <Sidebar className={isCollapsed ? "w-14" : "w-64"}>
      <SidebarContent className="border-r border-border flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-border">
          {!isCollapsed && (
            <div className="logo flex gap-2 items-center">
              <h1 className="bg-green-500 text-gray-800 font-bold py-0.5 px-2 rounded">A</h1>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-muted bg-background">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigation.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      {item.action === "new-chat" ? (
                        <button
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${getNavClasses(item.url)}`}
                          onClick={() => {
                            startNewChat();
                            navigate(item.url);
                            handleNavigationClick();
                          }}
                        >
                          <item.icon className="h-5 w-5 flex-shrink-0" />
                          {!isCollapsed && <span>{item.title}</span>}
                        </button>
                      ) : (
                        <NavLink
                          to={item.url}
                          onClick={handleNavigationClick}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${getNavClasses(item.url)}`}
                        >
                          <item.icon className="h-5 w-5 flex-shrink-0" />
                          {!isCollapsed && <span>{item.title}</span>}
                        </NavLink>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {!isCollapsed && chatHistory.length > 0 && (
            <SidebarGroup className="mt-4">
              <div className="px-4 py-2 text-xs font-semibold text-muted-foreground">
                <h1>Your Chats</h1>
              </div>
              <SidebarGroupContent>
                <SidebarMenu>
                  {chatHistory.map((chat) => (
                    <SidebarMenuItem key={chat.id}>
                      <div className={`group relative flex items-center gap-1 rounded-lg transition-all ${getChatItemClasses(chat.id)}`}>
                        <button
                          className="flex-1 text-sm px-3 py-2 text-left truncate"
                          onClick={() => {
                            navigate(`/chat/${chat.id}`);
                            handleNavigationClick();
                          }}
                        >
                          {chat.title}
                        </button>

                        {/* Options Menu */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              className="opacity-0 group-hover:opacity-100 p-1.5 mr-2 hover:bg-muted/80 rounded transition-opacity"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={(e) => handleRenameChat(chat.id)}
                              className="cursor-pointer"
                            >
                              <Edit3 className="mr-2 h-4 w-4" />
                              Rename chat
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => handleAddToProject(chat.id, e)}
                              className="cursor-pointer"
                            >
                              <FolderPlus className="mr-2 h-4 w-4" />
                              Add to project
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => handleShare(chat.id, e)}
                              className="cursor-pointer"
                              disabled={sharingChatId === chat.id}
                            >
                              {copiedChatId === chat.id ? (
                                <>
                                  <Check className="mr-2 h-4 w-4 text-green-600" />
                                  <span className="text-green-600">Link Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Share className="mr-2 h-4 w-4" />
                                  <span>{sharingChatId === chat.id ? "Sharing..." : "Share chat"}</span>
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => handleDeleteChat(chat.id)}
                              className="cursor-pointer border-t text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete chat
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </div>

        {/* User Info Section */}
        <div className="mt-auto p-2 border-t border-border">
          <button
            onClick={() => {
              navigate("/settings");
              handleNavigationClick();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-all text-left"
          >
            <div className="h-8 w-8 bg-green-500 font-bold text-gray-900 flex items-center justify-center rounded-full">
              {getInitial(user.full_name)}
            </div>
            {!isCollapsed && (
              <div className="flex flex-col text-sm">
                <span className="font-medium">{user.full_name}</span>
                <span className="text-xs text-muted-foreground truncate">{user.plan}</span>
              </div>
            )}
          </button>
        </div>
      </SidebarContent>

      {/* Rename Dialog */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename Chat</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter new chat name"
              className="w-full"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRenameOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!selectedChatId || !newName.trim()) return;
                await RenameChat(selectedChatId, newName.trim());
                toast.success("Chat renamed successfully!");
                refresh();
                setRenameOpen(false);
                setNewName("");
              }}
              disabled={loading || !newName.trim()}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent> 
      </Dialog>
    </Sidebar>
  );
}