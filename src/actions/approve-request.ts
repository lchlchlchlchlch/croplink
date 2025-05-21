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
  await db
    .update(request)
    .set({ approved: true })
    .where(eq(request.id, chosenRequest.id));

  chosenRequest.requestItems.forEach(async (item) => {
    await db
      .update(crop)
      .set({ amount: sql`${crop.amount} + ${item.amount}` })
      .where(eq(crop.id, item.cropId));
  });

  revalidatePath("/");
}
