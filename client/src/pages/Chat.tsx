import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { ArrowLeft, Send, MessageCircle, User } from "lucide-react";

export default function ChatPage() {
  const [selectedUser, setSelectedUser] = useState<{ id: number; name: string } | null>(null);
  const [newMsg, setNewMsg] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations, isLoading } = trpc.dating.conversations.useQuery(undefined, {
    refetchInterval: 5000,
  });
  const { data: messages, refetch: refetchMsgs } = trpc.dating.messages.useQuery(
    { otherUserId: selectedUser?.id || 0 },
    { enabled: !!selectedUser, refetchInterval: 3000 }
  );
  const sendMutation = trpc.dating.sendMessage.useMutation({
    onSuccess: () => {
      setNewMsg("");
      refetchMsgs();
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!newMsg.trim() || !selectedUser) return;
    sendMutation.mutate({ otherUserId: selectedUser.id, content: newMsg.trim() });
  };

  const convs = (conversations as any[]) || [];
  const msgs = (messages as any[]) || [];

  if (selectedUser) {
    return (
      <div className="flex flex-col h-[calc(100vh-80px)]">
        {/* Header */}
        <div className="flex items-center gap-3 p-3 border-b border-purple-900/50">
          <button onClick={() => setSelectedUser(null)} className="text-purple-400 hover:text-purple-300">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <User className="w-5 h-5 text-purple-400" />
          <span className="font-medium">{selectedUser.name}</span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {msgs.length === 0 && (
            <p className="text-center text-gray-500 text-sm mt-8">
              No messages yet. Say hello!
            </p>
          )}
          {msgs.map((m: any) => {
            const isMine = m.sender_id !== selectedUser.id;
            return (
              <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                    isMine
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-md"
                      : "bg-gray-800 text-gray-200 rounded-bl-md"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-purple-900/50 flex gap-2">
          <input
            value={newMsg}
            onChange={e => setNewMsg(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="flex-1 bg-gray-900 border border-purple-800 rounded-xl px-4 py-2 text-sm text-gray-100 placeholder-gray-600 focus:border-purple-500 outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!newMsg.trim() || sendMutation.isPending}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-2 rounded-xl hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-purple-400" /> Messages
      </h1>

      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-pulse-mystic text-2xl mb-2">💬</div>
          <p className="text-gray-400 text-sm">Loading conversations...</p>
        </div>
      )}

      {!isLoading && convs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">No conversations yet.</p>
          <Link href="/dating">
            <span className="text-purple-400 text-sm hover:underline mt-2 inline-block">
              Find matches to start chatting
            </span>
          </Link>
        </div>
      )}

      <div className="space-y-2">
        {convs.map((c: any) => (
          <button
            key={c.other_id}
            onClick={() => setSelectedUser({ id: c.other_id, name: c.other_name })}
            className="w-full glass-card rounded-xl p-4 text-left hover:border-purple-500/50 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-900/50 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{c.other_name}</div>
                <div className="text-xs text-gray-500 truncate">{c.last_message || "Start a conversation"}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
