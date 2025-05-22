import { cropsList } from "@/data/crops-list";
import { CropInfo } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// used to merge tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// returns crop info given its name
export function getCropInfo(name: string): CropInfo | undefined {
  return cropsList.find(
    (crop) => crop.name.toLowerCase() === name.toLowerCase(),
  );
}
