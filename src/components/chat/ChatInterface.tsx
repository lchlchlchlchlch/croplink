"use client";

import React, { useState, useEffect, useRef } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { sendMessageAction, type MessageWithSender } from "@/actions/chat";
import { supabase } from "@/lib/supabase/client";
import type {
  RealtimePostgresChangesPayload,
} from "@supabase/supabase-js";

interface ChatInterfaceProps {
  initialMessages: MessageWithSender[];
  chatRoomId: string;
  currentUserId: string;
  allUsersMap: Map<string, { name: string | null; image: string | null }>;
}

const SendButton = () => {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center whitespace-nowrap rounded-md bg-primary p-4 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
    >
      {pending ? "Sending..." : "Send"}
    </button>
  );
};

export function ChatInterface({
  initialMessages,
  chatRoomId,
  currentUserId,
  allUsersMap,
}: ChatInterfaceProps) {
  const [messages, setMessages] =
    useState<MessageWithSender[]>(initialMessages);
  const [newMessageInput, setNewMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [sendMessageState, formAction] = useActionState(sendMessageAction, {
    error: undefined,
    success: undefined,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (sendMessageState.success) {
      setNewMessageInput("");
      formRef.current?.reset();
    }
    if (sendMessageState.error) {
      alert(`Error: ${sendMessageState.error}`);
      console.error("Send message error:", sendMessageState.error);
    }
  }, [sendMessageState]);

    useEffect(() => {
      console.log("✅ ChatInterface mounted");
  
      return () => {
        console.log("🗑️ ChatInterface unmounted");
      };
    }, []);
  useEffect(() => {
    console.log("🔁 ChatInterface updated");
    if (!chatRoomId) return;
    console.log("Subscribing to chat room:", chatRoomId);
    
    const channel = supabase
      .channel(`chat-room-${chatRoomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_message",
          filter: `chat_room_id=eq.${chatRoomId}`,
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          const newMsg = payload.new;

          if (newMsg.chat_room_id !== chatRoomId) return;

          const sender = allUsersMap.get(newMsg.sender_id);
          const formattedMsg: MessageWithSender = {
            id: newMsg.id,
            content: newMsg.content,
            createdAt: new Date(newMsg.created_at),
            senderId: newMsg.sender_id,
            senderName: sender?.name || "Unknown User",
          };

          setMessages((prev) => {
            if (prev.find((m) => m.id === formattedMsg.id)) return prev;
            return [...prev, formattedMsg];
          });
        }
      )
      .subscribe((status, err) => {
        if (status === "SUBSCRIBED") {
          console.log("✅ Subscribed to Realtime chat channel");
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          console.error("❌ Supabase channel error:", status, err);
        }
      });

    return () => {
      supabase.removeChannel(channel).catch(console.error);
    };
  }, [chatRoomId]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-end gap-2 ${
              msg.senderId === currentUserId ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 text-sm break-words ${
                msg.senderId === currentUserId
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              {msg.senderId !== currentUserId && msg.senderName && (
                <p className="text-xs font-semibold mb-1 text-gray-600 dark:text-gray-400">
                  {msg.senderName}
                </p>
              )}
              <p>{msg.content}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                {new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t">
        <form
          action={formAction}
          ref={formRef}
          className="flex items-center gap-2"
        >
          <input type="hidden" name="chatRoomId" value={chatRoomId} />
          <input type="hidden" name="userId" value={currentUserId} />
          <input
            type="text"
            name="message"
            value={newMessageInput}
            onChange={(e) => setNewMessageInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-lg border border-input bg-background p-4 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            autoComplete="off"
          />
          <SendButton />
        </form>
        {sendMessageState?.error && (
          <p className="text-red-500 text-sm mt-2 px-1">
            {sendMessageState.error}
          </p>
        )}
      </div>
    </div>
  );
}
