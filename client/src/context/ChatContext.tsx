import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import axios from "axios";
import { Chat, ChatContextType } from "@/types";
import { Message } from "@/types";
import { useChatHistory } from "@/hooks/useChatHistory";
const ChatContext = createContext<ChatContextType | undefined>(undefined);

axios.defaults.withCredentials = true;
axios.defaults.baseURL =  "https://acadex-tutor-ai.onrender.com";
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

      if (!chatId) setChatId(returnedChatId); // store it if it’s a new chat

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: aiReply, resources },
      ]);
      return { aiReply, resources };
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
      const res = await axios.get("/api/chat-history");

      if (res.data?.chats) {
        setChat(res.data.chats); // ✅ update the sidebar chat list
      }
    } catch (error) {
      console.error("Error fetching updated chats:", error);
    }
    await refresh()
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

  return (
    <ChatContext.Provider value={{ messages, setMessages, sendMessage, loading, chatId, loadChatHistory, startNewChat, chats, setChat, fetchSingleChat }}>
      {children}
    </ChatContext.Provider>
  );
};
