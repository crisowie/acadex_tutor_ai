import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Bot, Share2, AlertCircle, Share } from "lucide-react";
import { toast } from "sonner";
import { useChat } from "@/context/ChatContext";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function SharedChat() {
  const { shareId } = useParams<{ shareId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { OpenChat } = useChat();

  useEffect(() => {
    const fetchSharedChat = async () => {
      if (!shareId) {
        setError("Invalid share link");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const data = await OpenChat(shareId);

        // ✅ Correct structure check
        if (data?.messages && Array.isArray(data.messages)) {
          setMessages(data.messages);
        } else {
          setError("Invalid chat data format");
          console.error("Unexpected data:", data);
        }                         
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to load shared chat";
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchSharedChat();
  }, [shareId, OpenChat]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-4xl mx-auto py-12 px-4">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Share2 className="w-6 h-6 text-gray-400 animate-pulse" />
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !messages.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Alert className="max-w-md border-red-200 bg-red-50 shadow-sm">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <AlertDescription className="text-gray-700 ml-2">
            {error ||
              "No messages found for this shared chat. The conversation may have been removed or the link is invalid."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto py-12 px-4">
        <header className="flex items-center justify-center gap-3 mb-8">
          <Share2 className="w-6 h-6 text-gray-700" />
          <h1 className="text-3xl font-semibold text-gray-900">Shared Chat</h1>
        </header>

        <div className="space-y-6">
          {messages.map((msg, idx) => {
            const isUser = msg.role === "user";

            return (
              <div
                key={idx}
                className={`flex gap-4 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center shadow-md">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}

                <Card
                  className={`max-w-2xl shadow-md transition-all hover:shadow-lg ${
                    isUser
                      ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <CardContent className="p-5">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
                      {msg.content}
                    </p>
                  </CardContent>
                </Card>

                {isUser && (
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
