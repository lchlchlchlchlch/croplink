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
    // Calculate total price in one pass
    const price = data.crops.reduce((sum, crop) => {
      const cropInfo = getCropInfo(crop.name);
      if (!cropInfo) {
        throw new Error(`Invalid crop: ${crop.name}`);
      }
      return sum + crop.amount * (cropInfo.buyFromFarmerPrice || 0);
    }, 0);

    console.log(price);

    // Create request in transaction
    const result = await db.transaction(async (tx) => {
      // Create the request first
      const createdRequest = await tx
        .insert(request)
        .values({
          userId,
          date: data.harvestDate,
          price: price.toString(),
        })
        .returning();

      if (!createdRequest[0]) {
        throw new Error("Failed to create request");
      }

      // Process all crops in parallel
      await Promise.all(
        data.crops.map(async (item) => {
          // Find or create crop
          let foundCrop = await tx
            .select()
            .from(crop)
            .where(eq(crop.name, item.name));

          if (!foundCrop || foundCrop.length === 0) {
            foundCrop = await tx
              .insert(crop)
              .values({
                name: item.name,
                amount: 0,
              })
              .returning();
          }

          if (!foundCrop[0]) {
            throw new Error(`Failed to process crop: ${item.name}`);
          }

          // Create request item
          await tx.insert(requestItem).values({
            userId,
            cropId: foundCrop[0].id,
            requestId: createdRequest[0].id,
            amount: item.amount,
            image: item.image,
          });

          // Update crop amount
          await tx
            .update(crop)
            .set({ amount: foundCrop[0].amount + item.amount })
            .where(eq(crop.name, item.name));
        }),
      );

      return createdRequest[0];
    });

    revalidatePath("/farmer");

    return result;
  } catch (error) {
    // Log the error for debugging
    console.error("Error in createRequest:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "An unexpected error occurred while processing the request",
    );
  }
}
