import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Chat, ChatContextType } from "@/types";
import { Message } from "@/types";
import { useChatHistory } from "@/hooks/useChatHistory";
import { toast } from "@/components/ui/use-toast";
const ChatContext = createContext<ChatContextType | undefined>(undefined);

axios.defaults.withCredentials = true;
axios.defaults.baseURL = "https://acadex-tutor-ai.onrender.com";
// axios.defaults.baseURL = "http://localhost:5050";

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat must be used within ChatProvider");
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chats, setChat] = useState<Chat[]>([])
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null); // add chatId tracking
  const { chatHistory, refresh } = useChatHistory()
  const navigate = useNavigate();
  const [bookmark,setBookmarks] = useState<any []>()

  const sendMessage = async (userMessage: string) => {
    setLoading(true);
    const newMessages: Message[] = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);

    try {
      const res = await axios.post("/api/send-message", {
        message: userMessage,
        chat_id: chatId, // send it if already exists
      });
      console.log(res)

      const aiReply = res.data.reply;
      const returnedChatId = res.data.chat_id;
      const resources = res.data.resources || []

      if (!chatId) {
        setChatId(returnedChatId);
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: aiReply, resources },
      ]);
      return { aiReply: String(aiReply), resources: [], chat_id: returnedChatId };
    } catch (err) {
      console.error("Chat error:", err);
      const errorReply = "Sorry, I couldn't respond.";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: errorReply },
      ]);
      return errorReply; // ✅ still return a fallback reply
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const existingChatId = localStorage.getItem('chatId');
    if (existingChatId) setChatId(existingChatId);
  }, []);

  useEffect(() => {
    if (chatId) localStorage.setItem('chatId', chatId);
  }, [chatId]);

  const startNewChat = async () => {
    localStorage.removeItem("chatId");  // Clear the stored chatId
    setChatId(null);                    // Reset the chatId in memory

    // Add a default assistant message
    setMessages([
      {
        role: "assistant",
        content: "Hi! I'm your study AI assistant. What would you like to learn today?",
        timestamp: new Date(),
      },
    ]);

    try {
      // Fetch updated chats from the server
      const res = await axios.get("/api/chats-history");

      if (res.data?.chats) {
        setChat(res.data.chats); // ✅ update the sidebar chat list
      }
    } catch (error) {
      console.error("Error fetching updated chats:", error);
    }
    await refresh()
  };

  // inside ChatContext or PdfContext
  const summarizePDF = async (pdfFile: File, chat_id: string): Promise<{ chat_id: string; aiReply: string; resources: any[] }> => {
    setLoading(true);

    const formData = new FormData();
    formData.append("file", pdfFile);
    if (chat_id) formData.append("chat_id", chat_id);

    try {
      const res = await axios.post("/api/pdf-summarizer", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const aiReply = res.data.reply ?? "";
      const returnedChatId = res.data.chat_id ?? chat_id;
      const resources = res.data.resources ?? [];

      if (!chat_id && returnedChatId) {
        setChatId(returnedChatId);
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: aiReply, timestamp: new Date(), resources },
      ]);

      return { chat_id: returnedChatId, aiReply: String(aiReply), resources };

    } catch (err) {
      console.error("PDF summarize error:", err);
      const errorReply = "Sorry, I couldn’t summarize that PDF.";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: errorReply, timestamp: new Date(), resources: [] },
      ]);
      return { chat_id: chat_id, aiReply: errorReply, resources: [] };
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    const interval = setInterval(() => {
      refresh();
    }, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, []);

  const loadChatHistory = async (id: string) => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/chat-history/${id}`);
      if (res.data?.messages) {
        setMessages(
          res.data.messages.map((chat: any) => ({
            ...chat,
            timestamp: new Date(chat.timestamp || chat.created_at),
          }))
        );

        setChatId(id); // store this chat as current
      }
    } catch (error) {
      console.error("Failed to load chat history:", error);
    } finally {
      setLoading(false);
    }
  }; 

  const fetchSingleChat = async (id: string) => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/chat-history/${id}`);
      if (res.data?.messages) {
        setMessages(
          res.data.messages.map((chat: any) => ({
            ...chat,
            timestamp: new Date(chat.timestamp || chat.created_at),
          }))
        );

        setChatId(id); // store this chat as current
      }
    } catch (error) {
      console.error("Failed to load chat history:", error);
    } finally {
      setLoading(false);
    }
  };
  // 🔹 Delete chat function
  const deleteChat = async (chatId: string) => {
    // optimistic update pattern:
    const prev = chats;
    setChat(current => current.filter(c => c.id !== chatId));

    try {
      const res = await axios.delete(`/api/delete-chat/${chatId}`);
      if (!(res.status === 200 || res.status === 204)) {
        // rollback on unexpected response
        setChat(prev);
        console.error("Delete returned unexpected status:", res.status, res.data);
        return false
      } else {
        return true
      }
    } catch (err: any) {
      // rollback on error
      setChat(prev);
      console.error("Failed to delete chat (server):", err.response?.data ?? err.message);
    }
  };

  const shareChat = async (chatId: string) => {
    try {
      const res = await axios.post(`/api/share/${chatId}`);
      const shareUrl = res.data.shareUrl;
      await navigator.clipboard.writeText(shareUrl);
      return shareUrl;
    } catch (error: any) {
      console.error("Share chat error:", error);
      throw error; // ✅ Throw error instead of returning undefined
    }
  };

  const OpenChat = useCallback(async (shareId: string) => {
    try {
      const res = await axios.get(`/api/get-share/${shareId}`);
      if (res.data?.messages && Array.isArray(res.data.messages)) {
        setMessages(res.data.messages);
      } else {
        console.warn("No messages found in shared chat");
      }
      return res.data;
    } catch (error) {
      console.error("Open shared chat error:", error);
    }
  }, []);

  const RenameChat = async (chatId: string, newName: string) => {
    try {
      const res = await axios.patch(`/api/rename-chat/${chatId}`, { newName }); // match backend
      if (res.data?.chat) {
        setChat((prevChats) =>
          prevChats.map((chat) => (chat.id === chatId ? { ...chat, title: newName } : chat))
        );
      }
    } catch (error) {
      console.error("Failed to rename chat:", error);
    }
  };

  const BookmarkHistory = async ()=>{
    const response = await axios.get("/api/history")
    if(response.data.bookmarks && Array.isArray(response.data)){
      setBookmarks(response.data || [])
    }else{
      setBookmarks([])
    }
  }
  

  const value = { messages, setMessages, sendMessage, loading, chatId, loadChatHistory, startNewChat, chats, setChat, fetchSingleChat, summarizePDF, deleteChat, shareChat, OpenChat, RenameChat,BookmarkHistory };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
