"use server";

import { db } from "@/db";
import { crop, request } from "@/db/schema";
import { RequestTableRow } from "@/types";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export default async function approveRequest({
  chosenRequest,
}: {
  chosenRequest: RequestTableRow;
}) {
  try {
    // Begin transaction to ensure data consistency
    await db.transaction(async (tx) => {
      // Update request status
      await tx
        .update(request)
        .set({ approved: true })
        .where(eq(request.id, chosenRequest.id));

      // Update crop amounts
      for (const item of chosenRequest.requestItems) {
        await tx
          .update(crop)
          .set({ amount: sql`${crop.amount} + ${item.amount}` })
          .where(eq(crop.id, item.cropId));
      }
    });

    // revalidate data
    revalidatePath("/");
  } catch (err) {
    console.error("Error in createRequest:", err);
    throw new Error(
      err instanceof Error
        ? err.message
        : "Unexpected error while processing the request",
    );
  }
}
