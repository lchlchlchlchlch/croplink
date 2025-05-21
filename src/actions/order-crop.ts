"use server";

import { db } from "@/db";
import { crop } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function orderCrop({
  cropId,
  amount,
}: {
  cropId: string;
  amount: number;
}) {
  if (amount <= 0) throw new Error("Amount must be greater than 0");

  await db.transaction(async (tx) => {
    // Fetch current quantity
    const [current] = await tx
      .select({ amount: crop.amount })
      .from(crop)
      .where(eq(crop.id, cropId));

    if (!current) throw new Error("Crop not found");
    if (current.amount < amount) {
      throw new Error(`Only ${current.amount} lbs available`);
    }

    // Deduct ordered quantity
    await tx
      .update(crop)
      .set({ amount: sql`${crop.amount} - ${amount}` })
      .where(eq(crop.id, cropId));
  });

  // Ensure buyers see fresh data
  revalidatePath("/buyer");
}
