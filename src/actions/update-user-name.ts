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
  await db.update(user).set({ name }).where(eq(user.id, id));
}
