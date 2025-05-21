// src/app/chat/actions.ts
"use server";

import { db } from "@/db";
import * as schema from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache"; // Still useful for non-JS or if client misses an update
import { sendError } from "next/dist/server/api-utils";


export async function getOrCreateDefaultChatRoom() {
  // ... (same as before)
  const roomName = "General Chat";
  let chatRoom = await db.query.chatRoom.findFirst({
    where: eq(schema.chatRoom.name, roomName),
  });

  if (!chatRoom) {
    [chatRoom] = await db
      .insert(schema.chatRoom)
      .values({ name: roomName })
      .returning();
  }
  return chatRoom;
}

export type MessageWithSender = {
  id: number;
  content: string;
  createdAt: Date;
  senderId: string;
  senderName: string | null;
}
// Type for messages directly from chat_message table (what Supabase Realtime will send)
export type RawChatMessage = typeof schema.chatMessage.$inferSelect;

export async function getMessages(
  chatRoomId: string,
): Promise<MessageWithSender[]> {
  // ... (same as before, joins with user table)
  if (!chatRoomId) return [];
  try {
    const messages = await db
      .select({
        id: schema.chatMessage.id,
        content: schema.chatMessage.content,
        createdAt: schema.chatMessage.createdAt,
        senderId: schema.chatMessage.senderId,
        senderName: schema.user.name,
        senderRole: schema.user.role,
      })
      .from(schema.chatMessage)
      .leftJoin(schema.user, eq(schema.chatMessage.senderId, schema.user.id))
      .where(eq(schema.chatMessage.chatRoomId, chatRoomId))
      .orderBy(asc(schema.chatMessage.createdAt));
    return messages;
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
}

export async function sendMessageAction(
  _prevState: { error?: string; success?: boolean },
  formData: FormData, // formData will now contain userId
): Promise<{ error?: string; success?: boolean }> {
  const content = formData.get("message") as string;
  const chatRoomId = formData.get("chatRoomId") as string;
  const senderIdFromClient = formData.get("userId") as string; // <<<<<< GET userId FROM FORM

  // Basic validation
  if (!senderIdFromClient) {
    return { error: "User ID is missing. Cannot send message." };
  }
  if (!content || content.trim().length === 0) {
    return { error: "Message cannot be empty." };
  }
  if (!chatRoomId) {
    return { error: "Chat room ID is missing." };
  }

  try {
    // Drizzle inserts the message using the client-provided senderIdFromClient
    await db.insert(schema.chatMessage).values({
      chatRoomId: chatRoomId,
      senderId: senderIdFromClient, // Use the ID from the form
      content: content.trim(),
    });

    revalidatePath("/chat");
    return { success: true };

  } catch (error) {
    console.error("Error sending message:", error);
    // Check for foreign key constraint errors, e.g., if senderIdFromClient doesn't exist
    if (error instanceof Error && error.message.includes('violates foreign key constraint')) {
         if (error.message.includes('chat_message_sender_id_user_id_fk')) {
            return { error: "Invalid sender. User does not exist." };
         }
    }
    return { error: "Failed to send message. Please try again." };
  }
}
