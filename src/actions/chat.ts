"use server";

import { db } from "@/db";
import * as schema from "@/db/schema";
import { MessageWithSender } from "@/types";
import { asc, eq, sql, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getOrCreatePrivateChatRoom(
  userId: string,
  otherUserId: string,
) {
  try {
    // Find rooms where both users are members
    const rooms = await db
      .select({ roomId: schema.chatRoom.id })
      .from(schema.chatRoom)
      .innerJoin(
        schema.chatRoomUser,
        eq(schema.chatRoom.id, schema.chatRoomUser.chatRoomId),
      )
      .where(
        or(
          eq(schema.chatRoomUser.userId, userId),
          eq(schema.chatRoomUser.userId, otherUserId),
        ),
      )
      .groupBy(schema.chatRoom.id)
      .having(sql`COUNT(DISTINCT ${schema.chatRoomUser.userId}) = 2`);

    // If room exists, return it, otherwise create a new room
    if (rooms.length) return { id: rooms[0].roomId };
    const [newRoom] = await db.insert(schema.chatRoom).values({}).returning();

    // Add both users to the new chat room
    await Promise.all([
      db
        .insert(schema.chatRoomUser)
        .values({ chatRoomId: newRoom.id, userId: userId }),
      db
        .insert(schema.chatRoomUser)
        .values({ chatRoomId: newRoom.id, userId: otherUserId }),
    ]);

    return { id: newRoom.id };
  } catch (err) {
    console.error("Error in createRequest:", err);
    throw new Error(
      err instanceof Error
        ? err.message
        : "Unexpected error while processing the request",
    );
  }
}

export async function getMessages(
  chatRoomId: string,
): Promise<MessageWithSender[]> {
  if (!chatRoomId) return [];
  try {
    // Fetch messages and join with user table to get sender details
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
  } catch (err) {
    console.error("Error in createRequest:", err);
    throw new Error(
      err instanceof Error
        ? err.message
        : "Unexpected error while processing the request",
    );
  }
}

export async function sendMessageAction(
  _prevState: { error?: string; success?: boolean },
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const content = formData.get("message") as string;
  const chatRoomId = formData.get("chatRoomId") as string;
  const senderIdFromClient = formData.get("userId") as string;

  // Validate required fields
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
    // Insert new message into the database
    await db.insert(schema.chatMessage).values({
      chatRoomId: chatRoomId,
      senderId: senderIdFromClient,
      content: content.trim(),
    });

    // Trigger revalidation of the chat page
    revalidatePath("/chat");
    return { success: true };
  } catch (error) {
    console.error("Error sending message:", error);
    // Handle foreign key constraint violation
    if (
      error instanceof Error &&
      error.message.includes("violates foreign key constraint")
    ) {
      if (error.message.includes("chat_message_sender_id_user_id_fk")) {
        return { error: "Invalid sender. User does not exist." };
      }
    }
    return { error: "Failed to send message. Please try again." };
  }
}
