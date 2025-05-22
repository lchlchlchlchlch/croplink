"use client";

import { sendMessageAction } from "@/actions/chat";
import { supabase } from "@/lib/supabase/client";
import { ArrowLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "../ui/button";
import { MessageWithSender } from "@/types";
import { toast } from "sonner";

// props interface for the chat interface component
interface ChatInterfaceProps {
  initialMessages: MessageWithSender[];
  chatRoomId: string;
  currentUserId: string;
  allUsersMap: Map<string, { name: string | null; image: string | null }>;
}

// button component for sending messages
const SendButton = () => {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-12 inline-flex items-center justify-center whitespace-nowrap rounded-md bg-primary p-4 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
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
  const router = useRouter();
  const [messages, setMessages] =
    useState<MessageWithSender[]>(initialMessages);
  const [newMessageInput, setNewMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [sendMessageState, formAction] = useActionState(sendMessageAction, {
    error: undefined,
    success: undefined,
  });

  // scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // handle form submission states
  useEffect(() => {
    if (sendMessageState.success) {
      setNewMessageInput("");
      formRef.current?.reset();
    }
    if (sendMessageState.error) {
      toast.error("There was an error sending your message.");
    }
  }, [sendMessageState]);

  // setup real-time message subscription
  useEffect(() => {
    if (!chatRoomId) return;

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
        (payload) => {
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
        },
      )
      .subscribe();

    // cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel).catch(console.error);
    };
  }, [chatRoomId, allUsersMap]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col items-end gap-1`}>
            <div
              className={`max-w-[70%] leading-normal rounded-lg p-3 text-sm break-words ${
                msg.senderId === currentUserId
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted self-start"
              }`}
            >
              {msg.senderId !== currentUserId && msg.senderName && (
                <p className="text-xs font-semibold mb-1 text-gray-600 dark:text-gray-400">
                  {msg.senderName}
                </p>
              )}
              <p>{msg.content}</p>
            </div>
            <p
              className={`text-xs font-medium text-gray-500 mt-1 text-right ${msg.senderId !== currentUserId && "self-start"}`}
            >
              Sent at{" "}
              {new Date(msg.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t">
        <form
          action={formAction}
          ref={formRef}
          className="flex gap-2 items-stretch"
        >
          <Button
            onClick={() => router.back()}
            type="button"
            className="h-12"
            variant={"secondary"}
          >
            <ArrowLeftIcon />
            Back
          </Button>
          <input type="hidden" name="chatRoomId" value={chatRoomId} />
          <input type="hidden" name="userId" value={currentUserId} />
          <input
            type="text"
            name="message"
            value={newMessageInput}
            onChange={(e) => setNewMessageInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-lg border border-input bg-background p-4 h-12 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
