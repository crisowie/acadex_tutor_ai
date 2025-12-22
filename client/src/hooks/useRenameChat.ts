import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useChatHistory } from "./useChatHistory";

axios.defaults.withCredentials = true;

export const useRenameChat = () => {
  const [loading, setLoading] = useState(false);
  const { refresh } = useChatHistory();

  const renameChat = async (chatId: string, newName: string) => {
    setLoading(true);
    try {
      const res = await axios.put(`/api/rename-chat/${chatId}`, { newName });
      console.log("Rename response:", res);

      if (res.status === 200) {
        toast.success("Chat renamed successfully");
        await refresh(); // refresh the chat list
      }
    } catch (err: any) {
      const message = err.response?.data?.error || "Failed to rename chat";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return { renameChat, loading };
};
