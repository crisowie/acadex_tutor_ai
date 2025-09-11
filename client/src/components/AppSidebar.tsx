import {
  MessageSquare,
  BarChart3,
  BookOpen,
  Bookmark,
  Library,
  Lightbulb,
  LightbulbIcon,
  LayoutDashboard,
  User,
  Brain,
  Users2,
  NotebookPen,
  NotebookPenIcon,
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
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

import { useChatHistory } from "@/hooks/useChatHistory";
import { useChat } from "@/context/ChatContext";
import { useEffect, useState } from "react";

const navigation = [
  { title: "Ask A Question", url: "/ask", icon: MessageSquare, action: "new-chat" },
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Quizzes", url: "/quizzes", icon: BookOpen },
  { title: "Notes", url: "/note", icon: NotebookPenIcon },
  // { title: "Account", url: "/account", icon: User },
  { title: "Bookmarks", url: "/bookmarks", icon: Bookmark },
  { title: "Resources", url: "/resources", icon: Library },
  // { title: "Community", url: "/community", icon: Users2 },
  // { title: "Beta Features", url: "/beta", icon: LightbulbIcon },
  { title: "Profile Setup", url: "/profile-setup", icon: User },
];

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const location = useLocation();
  const { user } = useAuth();
  const { chatHistory } = useChatHistory();
  const { startNewChat } = useChat();

  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);

  // Check if screen is mobile size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint is 1024px
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const isCollapsed = state === "collapsed";
  const currentPath = location.pathname;
  const isActive = (path: string) => currentPath === path;

  const getNavClasses = (path: string) => {
    return isActive(path)
      ? "bg-primary/10 text-primary border-r-2 border-primary font-medium"
      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground";
  };

  const getInitial = (name: string) => user.full_name ? name.charAt(0).toUpperCase() : "U";

  // Function to handle navigation clicks - only close sidebar on mobile
  const handleNavigationClick = () => {
    if (isMobile) {
      toggleSidebar();
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
                      <SidebarMenuButton
                        className="text-sm px-3 py-2 hover:bg-muted/50 w-full text-left truncate"
                        onClick={() => {
                          navigate(`/chat/${chat.id}`);
                          handleNavigationClick();
                        }}
                      >
                        {chat.title}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </div>

        {/* User Info Section (Navigates to /settings) */}
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
    </Sidebar>
  );
}