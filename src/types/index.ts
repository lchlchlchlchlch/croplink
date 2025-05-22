import { cropsList } from "@/data/crops-list";
import * as schema from "@/db/schema";
import { crop, request, requestItem, user } from "@/db/schema";

// all of the types used in CropLink

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

export type OrdersTableRow = {
  id: string;
  createdAt: Date;
  userId: string;
  amount: number;
  cropId: string;
  approved: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified?: boolean;
    image?: string | null;
    phone?: string | null;
    role?: string;
    address?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
  };
  crop: {
    id: string;
    name: string;
    type?: string;
    image: string | null;
    description?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
  };
};

export type Request = typeof request.$inferInsert;
export type RequestItem = typeof requestItem.$inferInsert;
export type Crop = typeof crop.$inferInsert;
export type User = typeof user.$inferInsert;

export type MessageWithSender = {
  id: string;
  content: string;
  createdAt: Date;
  senderId: string;
  senderName: string | null;
};

export type RawChatMessage = typeof schema.chatMessage.$inferSelect;

export type InventoryCrop = {
  id: string;
  name: string;
  plural: string | null;
  image?: string | null;
  amount: number;
  price: number; // price per pound
};
