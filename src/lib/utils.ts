import { cropsList } from "@/data/crops-list";
import { CropType } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getCropInfo(name: string): CropType | undefined {
  return cropsList.find(
    (crop) => crop.name.toLowerCase() === name.toLowerCase(),
  );
}
