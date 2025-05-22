"use server";

import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function updateUserName({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  try {
    // verify name is not empty
    if (!name.trim()) {
      throw new Error("Name cannot be empty");
    }

    // update user name in db
    const result = await db.update(user).set({ name }).where(eq(user.id, id));

    // handle no user found
    if (!result) {
      throw new Error(`User with id ${id} not found`);
    }
  } catch (err) {
    console.error("Error in createRequest:", err);
    throw new Error(
      err instanceof Error
        ? err.message
        : "Unexpected error while processing the request",
    );
  }
}
