import { cropsList } from "@/data/crops-list";
import { crop, request, requestItem, user } from "@/db/schema";

export type CropInfo = (typeof cropsList)[number];

export type RequestFormValues = {
  harvestDate: Date;
  crops: {
    name: string;
    image: string;
    amount: number;
  }[];
};

export type RequestTableRow = {
  id: string;
  date: Date;
  createdAt: Date | null;
  userId: string;
  price: string;
  approved: boolean;
  user: User;
  requestItems: {
    image: string | null;
    id: string;
    userId: string;
    amount: number;
    requestId: string;
    cropId: string;
    crop: Crop;
  }[];
};

export type Request = typeof request.$inferInsert;
export type RequestItem = typeof requestItem.$inferInsert;
export type Crop = typeof crop.$inferInsert;
export type User = typeof user.$inferInsert;
