"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCropInfo } from "@/lib/utils";
import { format } from "date-fns";
import { ArrowUpDownIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

type CropTableRows = {
  id: string;
  name: string;
  image: string | null;
  amount: number;
  requestItems: {
    id: string;
    image: string | null;
    userId: string;
    amount: number;
    requestId: string;
    cropId: string;
    request: {
      date: Date;
      userId: string;
      price: string;
      id?: string | undefined;
      createdAt?: Date | null | undefined;
      approved?: boolean | undefined;
    };
  }[];
}[];

// ways to sort data
type SortField = "name" | "amount" | "lastReceived" | "saleValue";
type SortDirection = "asc" | "desc";

// table displaying crop inventory

export function CropsTable({ crops }: { crops: CropTableRows }) {
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedCrops = [...crops].sort((a, b) => {
    const multiplier = sortDirection === "asc" ? 1 : -1;

    // handle sort differently depending on sort method
    switch (sortField) {
      case "name":
        return multiplier * a.name.localeCompare(b.name);

      case "amount":
        return multiplier * (a.amount - b.amount);

      case "lastReceived":
        const aDate =
          a.requestItems?.length > 0
            ? new Date(
                a.requestItems
                  .slice()
                  .sort(
                    (x, y) =>
                      new Date(y.request?.date ?? 0).getTime() -
                      new Date(x.request?.date ?? 0).getTime()
                  )[0]?.request?.date ?? ""
              ).getTime()
            : 0;

        const bDate =
          b.requestItems?.length > 0
            ? new Date(
                b.requestItems
                  .slice()
                  .sort(
                    (x, y) =>
                      new Date(y.request?.date ?? 0).getTime() -
                      new Date(x.request?.date ?? 0).getTime()
                  )[0]?.request?.date ?? ""
              ).getTime()
            : 0;

        return multiplier * (aDate - bDate);

      case "saleValue":
        const aValue = a.amount * (getCropInfo(a.name)?.bulkSalePrice || 0);
        const bValue = b.amount * (getCropInfo(b.name)?.bulkSalePrice || 0);
        return multiplier * (aValue - bValue);

      default:
        return 0;
    }
  });

  return (
    <div className="rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort("name")}
                className="flex items-center font-semibold hover:bg-transparent p-0"
              >
                Crop
                <ArrowUpDownIcon className="ml-1 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort("amount")}
                className="flex items-center font-semibold hover:bg-transparent p-0"
              >
                Amount
                <ArrowUpDownIcon className="ml-1 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort("lastReceived")}
                className="flex items-center font-semibold hover:bg-transparent p-0"
              >
                Last Received
                <ArrowUpDownIcon className="ml-1 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort("saleValue")}
                className="flex items-center font-semibold hover:bg-transparent p-0"
              >
                Sale Value
                <ArrowUpDownIcon className="ml-1 h-4 w-4" />
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedCrops.map((crop) => (
            <TableRow key={crop.id}>
              <TableCell className="p-4 font-medium">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-md bg-green-100 flex items-center justify-center">
                    <Image
                      src={crop.image || "/placeholder.png"}
                      alt={crop.name}
                      width={400}
                      height={400}
                      className="object-cover w-full h-full rounded-md"
                    />
                  </div>
                  <span>{crop.name}</span>
                </div>
              </TableCell>
              <TableCell className="p-4">
                {crop.amount} lb{crop.amount !== 1 && "s"}
              </TableCell>
              <TableCell className="p-4">
                {crop.requestItems?.length > 0
                  ? format(
                      new Date(
                        crop.requestItems
                          .slice()
                          .sort(
                            (a, b) =>
                              new Date(b.request?.date ?? 0).getTime() -
                              new Date(a.request?.date ?? 0).getTime()
                          )[0]?.request?.date ?? ""
                      ),
                      "MMM d, yyyy"
                    )
                  : "No requests"}
              </TableCell>
              <TableCell className="p-4">
                $
                {(
                  crop.amount * (getCropInfo(crop.name)?.bulkSalePrice || 0)
                ).toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
