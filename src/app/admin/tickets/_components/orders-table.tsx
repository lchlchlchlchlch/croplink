"use client";

import { approveOrder } from "@/actions/approve-order";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrdersTableRow } from "@/types";
import { format } from "date-fns";
import { ArrowUpDownIcon, CheckIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

// define sorting types
type SortField = "buyer" | "crop" | "date" | "amount" | "status";
type SortDirection = "asc" | "desc";

export function OrdersTable({ orders }: { orders: OrdersTableRow[] }) {
  // track approval state and sorting preferences
  const [approving, setApproving] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("buyer");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // handle order approval
  const handleApprove = async (orderId: string) => {
    setApproving(orderId);
    try {
      await approveOrder({ orderId });
      toast.success("Order approved.");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to approve order.";
      toast.error(message);
    } finally {
      setApproving(null);
    }
  };

  // handle column sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // sort orders based on selected field and direction
  const sortedOrders = [...orders].sort((a, b) => {
    const multiplier = sortDirection === "asc" ? 1 : -1;
    switch (sortField) {
      case "buyer":
        return multiplier * a.user.name.localeCompare(b.user.name);
      case "crop":
        return multiplier * a.crop.name.localeCompare(b.crop.name);
      case "date":
        return (
          multiplier *
          (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        );
      case "amount":
        return multiplier * (a.amount - b.amount);
      case "status":
        return multiplier * (Number(a.approved) - Number(b.approved));
      default:
        return 0;
    }
  });

  return (
    <div className="rounded-xl border">
      <Table>
        {/* table header with sort buttons */}
        <TableHeader>
          <TableRow>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort("buyer")}
                className="flex items-center font-semibold hover:bg-transparent p-0"
              >
                Buyer
                <ArrowUpDownIcon className="ml-1 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort("crop")}
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
                onClick={() => handleSort("date")}
                className="flex items-center font-semibold hover:bg-transparent p-0"
              >
                Date
                <ArrowUpDownIcon className="ml-1 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort("status")}
                className="flex items-center font-semibold hover:bg-transparent p-0"
              >
                Status
                <ArrowUpDownIcon className="ml-1 h-4 w-4" />
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        {/* table body with sorted order data */}
        <TableBody>
          {sortedOrders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="p-4 font-medium">
                {order.user.name}
              </TableCell>
              <TableCell className="p-4">
                <div className="flex items-center gap-2">
                  {order.crop.image && (
                    <Image
                      src={order.crop.image}
                      alt={order.crop.name}
                      width={40}
                      height={40}
                      className="w-12 border border-primary object-cover aspect-square rounded-md"
                    />
                  )}
                  <span>{order.crop.name}</span>
                </div>
              </TableCell>
              <TableCell className="p-4">{order.amount} lbs</TableCell>
              <TableCell className="p-4">
                {format(new Date(order.createdAt), "MMM d, yyyy")}
              </TableCell>
              <TableCell className="p-4">
                {order.approved ? (
                  <div className="flex items-center gap-2 text-primary">
                    Approved <CheckIcon size={14} />
                  </div>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleApprove(order.id)}
                    disabled={approving === order.id}
                  >
                    Approve <CheckIcon className="ml-1 h-4 w-4" />
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
