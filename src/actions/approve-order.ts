"use server";

import { db } from "@/db";
import { crop, order } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function approveOrder({ orderId }: { orderId: string }) {
  const [targetOrder] = await db
    .select({ amount: order.amount, cropId: order.cropId })
    .from(order)
    .where(eq(order.id, orderId));

  if (!targetOrder) throw new Error("Order not found");

  await db.transaction(async (tx) => {
    await tx.update(order).set({ approved: true }).where(eq(order.id, orderId));

    await tx
      .update(crop)
      .set({ amount: sql`${crop.amount} - ${targetOrder.amount}` })
      .where(eq(crop.id, targetOrder.cropId));
  });

  revalidatePath("/admin");
}
