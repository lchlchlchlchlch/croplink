import { cropsList } from "@/data/crops-list";
import { crop, request, requestItem } from "@/db/schema";

export type CropInfo = (typeof cropsList)[number];

export type RequestFormValues = {
  harvestDate: Date;
  crops: {
    name: string;
    image: string;
    amount: number;
  }[];
};

export type Request = typeof request.$inferInsert;
export type RequestItem = typeof requestItem.$inferInsert;
export type Crop = typeof crop.$inferInsert;
