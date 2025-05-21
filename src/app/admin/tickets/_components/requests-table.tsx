"use client";

import approveRequest from "@/actions/approve-request";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RequestTableRow } from "@/types";
import { format } from "date-fns";
import { ArrowUpDownIcon, CheckIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

type SortField = "name" | "crops" | "dateSent" | "harvestDate" | "action";
type SortDirection = "asc" | "desc";

export function RequestsTable({ requests }: { requests: RequestTableRow[] }) {
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

  const handleApprove = async (request: RequestTableRow) => {
    await approveRequest({ chosenRequest: request });
    toast.success("Request approved successfully!");
  };

  const sortedRequests = [...requests].sort((a, b) => {
    const multiplier = sortDirection === "asc" ? 1 : -1;

    switch (sortField) {
      case "name":
        return multiplier * a.user.name.localeCompare(b.user.name);

      case "dateSent":
        const aDate = a.createdAt?.getTime();
        const bDate = b.createdAt?.getTime();

        if (!aDate || !bDate) return 0;

        return multiplier * (aDate - bDate);

      case "harvestDate":
        const aDateH = a.date?.getTime();
        const bDateH = b.date?.getTime();

        if (!aDateH || !bDateH) return 0;

        return multiplier * (aDateH - bDateH);

      case "action":
        return multiplier * (Number(a.approved) - Number(b.approved));

      case "crops":
        return multiplier * (a.requestItems.length - b.requestItems.length);

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
                Farm Name
                <ArrowUpDownIcon className="ml-1 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort("dateSent")}
                className="flex items-center font-semibold hover:bg-transparent p-0"
              >
                Date Sent
                <ArrowUpDownIcon className="ml-1 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort("harvestDate")}
                className="flex items-center font-semibold hover:bg-transparent p-0"
              >
                Harvest Date
                <ArrowUpDownIcon className="ml-1 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort("crops")}
                className="flex items-center font-semibold hover:bg-transparent p-0"
              >
                Crops
                <ArrowUpDownIcon className="ml-1 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort("action")}
                className="flex items-center font-semibold hover:bg-transparent p-0"
              >
                Action
                <ArrowUpDownIcon className="ml-1 h-4 w-4" />
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedRequests.map((req) => (
            <TableRow key={req.id}>
              <TableCell className="p-4 font-medium">
                <span>{req.user.name}</span>
              </TableCell>
              <TableCell className="p-4">
                {format(req.createdAt || new Date(), "MMM d, yyyy") ||
                  "Unknown"}
              </TableCell>
              <TableCell className="p-4">
                {format(new Date(req.date), "MMM d, yyyy")}
              </TableCell>
              <TableCell className="p-4">
                <div className="flex flex-col gap-2">
                  {req.requestItems.map((item) => (
                    <div key={item.id} className="flex gap-2 items-center">
                      <Image
                        src={item.image || ""}
                        alt={item.crop.name}
                        width={300}
                        height={300}
                        className="w-12 border border-primary object-cover aspect-square rounded-md"
                      />
                      <span className="font-medium">
                        {item.amount} lb{item.amount !== 1 && "s"}{" "}
                        {item.crop.name}
                      </span>
                    </div>
                  ))}
                </div>
              </TableCell>
              <TableCell className="p-4">
                {req.approved ? (
                  <div className="flex gap-2 items-center text-primary">
                    Approved <CheckIcon size={14} />
                  </div>
                ) : (
                  <Button
                    size={"sm"}
                    onClick={() => {
                      handleApprove(req);
                    }}
                  >
                    Approve <CheckIcon />{" "}
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
