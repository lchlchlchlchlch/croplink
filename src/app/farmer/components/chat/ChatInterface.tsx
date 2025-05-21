// src/components/chat/ChatInterface.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { sendMessageAction, type MessageWithSender } from "@/actions/chat"; // Adjust the import path as necessary
import { supabase } from "@/lib/supabase/client"; // Import Supabase client
import type {
    RealtimeChannel,
    RealtimePostgresChangesPayload,
} from "@supabase/supabase-js";

// Type for the actual payload coming from Supabase Realtime (reflects DB column names)
type SupabaseChatMessagePayload = {
    id: number;
    content: string;
    created_at: string; // Supabase sends timestamps as ISO strings
    sender_id: string; // snake_case from database
    chat_room_id: string; // snake_case from database
    // Add any other columns from your chat_message table if needed
};

interface ChatInterfaceProps {
    initialMessages: MessageWithSender[];
    chatRoomId: string;
    currentUserId: string;
    // Used to map sender_id from realtime messages to full sender details
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

    // Scroll to bottom effect
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Handle form submission result
    useEffect(() => {
        if (sendMessageState.success) {
            setNewMessageInput(""); // Clear controlled input
            formRef.current?.reset(); // Reset the native form
        }
        if (sendMessageState.error) {
            alert(`Error: ${sendMessageState.error}`); // Or use a toast notification
            console.error("Send message error:", sendMessageState.error);
        }
    }, [sendMessageState]);

    // Supabase Realtime Subscription
    useEffect(() => {
        if (!chatRoomId) {
            console.warn(
                "ChatInterface: chatRoomId is not yet available for Supabase subscription."
            );
            return;
        }

        const channelId = `chat-room-${chatRoomId}`; // Unique channel name
        let channel: RealtimeChannel | null = null;

        const handleNewMessage = (
            payload: RealtimePostgresChangesPayload<SupabaseChatMessagePayload>
        ) => {
            console.log("Supabase Realtime Payload Received:", payload);
            if (payload.eventType === "INSERT" && payload.new) {
                const newDbRecord = payload.new;

                // Ensure the message is for the current chat room
                if (newDbRecord.chat_room_id !== chatRoomId) {
                    console.log(
                        `Realtime: Ignoring message for room ${newDbRecord.chat_room_id}, current room is ${chatRoomId}`
                    );
                    return;
                }

                // Get sender details from the map
                const senderDetails = allUsersMap.get(newDbRecord.sender_id);

                const newMessageForUI: MessageWithSender = {
                    id: newDbRecord.id,
                    content: newDbRecord.content,
                    createdAt: new Date(newDbRecord.created_at), // Convert ISO string to Date
                    senderId: newDbRecord.sender_id,
                    senderName: senderDetails?.name || "Unknown User",
                };

                setMessages((prevMessages) => {
                    // Avoid adding duplicate messages (e.g., if sender also receives their own message)
                    if (
                        prevMessages.find(
                            (msg) => msg.id === newMessageForUI.id
                        )
                    ) {
                        return prevMessages;
                    }
                    return [...prevMessages, newMessageForUI];
                });
            }
        };

        console.log(
            `Attempting to subscribe to Supabase channel: ${channelId}`
        );
        channel = supabase
            .channel(channelId)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public", // Assuming your tables are in the public schema
                    table: "chat_message", // The actual table name in your database
                    // Optional: Server-side filter (requires RLS to be set up correctly to allow this filter for the subscriber)
                    // filter: `chat_room_id=eq.${chatRoomId}`
                },
                handleNewMessage
            )
            .subscribe((status, err) => {
                if (status === "SUBSCRIBED") {
                    console.log(
                        `✅ Successfully subscribed to Supabase Realtime channel: ${channelId}`
                    );
                } else if (
                    status === "CHANNEL_ERROR" ||
                    status === "TIMED_OUT"
                ) {
                    console.error(
                        `❌ Supabase Realtime subscription error on channel ${channelId}:`,
                        status,
                        err
                    );
                } else {
                    console.log(
                        `ℹ️ Supabase Realtime channel ${channelId} status: ${status}`
                    );
                }
            });

        // Cleanup on component unmount or when chatRoomId changes
        return () => {
            if (channel) {
                console.log(
                    `🛑 Unsubscribing from Supabase Realtime channel ${channelId}`
                );
                supabase.removeChannel(channel).catch(console.error);
                channel = null;
            }
        };
    }, [chatRoomId, allUsersMap]); // Re-subscribe if chatRoomId or the user map changes

    return (
        <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex items-end gap-2 ${
                            msg.senderId === currentUserId
                                ? "justify-end"
                                : "justify-start"
                        }`}
                    >
                        {/* Avatar for other users
            {msg.senderId !== currentUserId && msg.senderImage && (
              <img src={msg.senderImage} alt={msg.senderName || 'User'} className="w-8 h-8 rounded-full object-cover"/>
            )} */}
                        <div
                            className={`max-w-[70%] rounded-lg p-3 text-sm break-words ${
                                msg.senderId === currentUserId
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted"
                            }`}
                        >
                            {/* Sender name for other users */}
                            {msg.senderId !== currentUserId &&
                                msg.senderName && (
                                    <p className="text-xs font-semibold mb-1 text-gray-600 dark:text-gray-400">
                                        {msg.senderName}
                                    </p>
                                )}
                            <p>{msg.content}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                                {new Date(msg.createdAt).toLocaleTimeString(
                                    [],
                                    { hour: "2-digit", minute: "2-digit" }
                                )}
                            </p>
                        </div>
                        {/* Avatar for current user */}
                        {/* {msg.senderId === currentUserId && msg.senderImage && (
              <img src={msg.senderImage} alt="You" className="w-8 h-8 rounded-full object-cover"/>
            )} */}
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
                        name="message" // For formData
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
