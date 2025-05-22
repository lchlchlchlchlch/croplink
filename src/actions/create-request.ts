"use server";

import { db } from "@/db";
import { crop, request, requestItem } from "@/db/schema";
import { getCropInfo } from "@/lib/utils";
import { RequestFormValues } from "@/types";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createRequest({
  data,
  userId,
}: {
  data: RequestFormValues;
  userId: string;
}) {
  try {
    // calculate price of request
    const price = data.crops.reduce((sum, c) => {
      const info = getCropInfo(c.name);
      if (!info) throw new Error(`Invalid crop: ${c.name}`);
      return sum + c.amount * (info.buyFromFarmerPrice || 0);
    }, 0);

    const createdRequest = await db.transaction(async (tx) => {
      // create db request
      const [req] = await tx
        .insert(request)
        .values({
          userId,
          date: data.harvestDate,
          price: price.toString(),
        })
        .returning();

      if (!req) throw new Error("Failed to create request");

      for (const item of data.crops) {
        // try to find existing crop
        let [found] = await tx
          .select()
          .from(crop)
          .where(eq(crop.name, item.name));

        // if not found, insert new
        if (!found) {
          [found] = await tx
            .insert(crop)
            .values({ name: item.name, amount: 0 })
            .returning();

          if (!found) throw new Error(`Failed to create crop ${item.name}`);
        }

        // create the requestItem
        await tx.insert(requestItem).values({
          userId,
          cropId: found.id,
          requestId: req.id,
          amount: item.amount,
          image: item.image,
        });
      }

      return req;
    });

    // revalidate data
    revalidatePath("/farmer");

    return createdRequest;
  } catch (err) {
    console.error("Error in createRequest:", err);
    throw new Error(
      err instanceof Error
        ? err.message
        : "Unexpected error while processing the request",
    );
  }
}
