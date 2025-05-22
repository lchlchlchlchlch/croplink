"use server";

import { db } from "@/db";
import { crop, order } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function orderCrop({
  cropId,
  amount,
  userId,
}: {
  cropId: string;
  amount: number;
  userId: string;
}) {
  try {
    // handle missing props
    if (!cropId || !userId) {
      throw new Error(
        "Missing required fields: cropId and userId are required",
      );
    }

    // min amount is 0
    if (amount <= 0) throw new Error("Amount must be greater than 0");

    await db.transaction(async (tx) => {
      try {
        // find crop amount
        const [current] = await tx
          .select({ amount: crop.amount })
          .from(crop)
          .where(eq(crop.id, cropId));

        if (!current) throw new Error("Crop not found");

        // handle excessive amount
        if (current.amount < amount) {
          throw new Error(`Only ${current.amount} lbs available`);
        }

        // update total
        await tx
          .update(crop)
          .set({ amount: sql`${crop.amount} - ${amount}` })
          .where(eq(crop.id, cropId));

        // insert order to db
        await tx.insert(order).values({
          cropId,
          amount,
          userId,
        });
      } catch (error) {
        throw error instanceof Error
          ? error
          : new Error("Failed to process crop order");
      }
    });

    revalidatePath("/buyer");
    return { success: true };
  } catch (error) {
    console.error("Error in orderCrop:", error);
    throw error instanceof Error
      ? error
      : new Error("An unexpected error occurred while processing your order");
  }
}
