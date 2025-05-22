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
import { ArrowUpDownIcon, CheckIcon, XIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

// define sort types
type SortField = "name" | "crops" | "dateSent" | "harvestDate" | "action";
type SortDirection = "asc" | "desc";

export function RequestsTable({ requests }: { requests: RequestTableRow[] }) {
  // state for sorting and image preview
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // handle sorting logic
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // handle request approval
  const handleApprove = async (request: RequestTableRow) => {
    await approveRequest({ chosenRequest: request });
    toast.success("Request approved successfully!");
  };

  // sort requests based on current sort field and direction
  const sortedRequests = [...requests].sort((a, b) => {
    const multiplier = sortDirection === "asc" ? 1 : -1;

    switch (sortField) {
      case "name":
        return multiplier * a.user.name.localeCompare(b.user.name);
      case "dateSent":
        return (
          multiplier *
          ((a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0))
        );
      case "harvestDate":
        return (
          multiplier * ((a.date?.getTime() || 0) - (b.date?.getTime() || 0))
        );
      case "action":
        return multiplier * (Number(a.approved) - Number(b.approved));
      case "crops":
        return multiplier * (a.requestItems.length - b.requestItems.length);
      default:
        return 0;
    }
  });

  return (
    <>
      {/* image preview modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white bg-black/40 hover:bg-black/60 rounded-full p-2"
          >
            <XIcon size={20} />
          </button>
          <Image
            src={selectedImage}
            alt="Preview"
            className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
            width={800}
            height={800}
          />
        </div>
      )}

      {/* main table container */}
      <div className="rounded-xl border">
        <div className="max-h-[calc(100vh-16rem)] overflow-auto">
          <Table>
            {/* table header with sort buttons */}
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
            {/* table body with request data */}
            <TableBody>
              {sortedRequests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell className="p-4 font-medium">
                    <span>{req.user.name}</span>
                  </TableCell>
                  <TableCell className="p-4">
                    {format(req.createdAt || new Date(), "MMM d, yyyy")}
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
                            onClick={() =>
                              item.image && setSelectedImage(item.image)
                            }
                            className="w-12 h-12 cursor-zoom-in border border-primary object-cover aspect-square rounded-md"
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
                      <Button size="sm" onClick={() => handleApprove(req)}>
                        Approve <CheckIcon />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
