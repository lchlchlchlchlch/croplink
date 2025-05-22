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
import { CheckIcon, ClockIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { OrderWithCropAndUser, approveOrder } from "@/actions/admin-orders";

export function OrdersTable({ orders }: { orders: OrderWithCropAndUser[] }) {
  const [approving, setApproving] = useState<string | null>(null);

  const handleApprove = async (orderId: string) => {
    setApproving(orderId);
    try {
      await approveOrder({ orderId });
      toast.success("Order approved.");
    } catch (err: any) {
      toast.error(err.message ?? "Failed to approve order.");
    } finally {
      setApproving(null);
    }
  };

  return (
    <div className="rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Buyer</TableHead>
            <TableHead>Crop</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>{order.user.name}</TableCell>
              <TableCell className="flex items-center gap-2">
                {order.crop.image && (
                  <Image
                    src={order.crop.image}
                    alt={order.crop.name}
                    width={40}
                    height={40}
                    className="rounded-md object-cover border"
                  />
                )}
                {order.crop.name}
              </TableCell>
              <TableCell>{order.amount} lbs</TableCell>
              <TableCell>
                {format(new Date(order.createdAt), "PPP p")}
              </TableCell>
              <TableCell>
                {order.approved ? (
                  <div className="flex items-center gap-2 text-green-600">
                    Approved <CheckIcon size={16} />
                  </div>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleApprove(order.id)}
                    disabled={approving === order.id}
                  >
                    {approving === order.id ? "Approving..." : "Approve"}
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
