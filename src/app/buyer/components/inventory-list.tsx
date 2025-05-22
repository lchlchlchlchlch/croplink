"use client";
import { orderCrop } from "@/actions/order-crop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

export type InventoryCrop = {
  id: string;
  name: string;
  image?: string | null;
  amount: number;
  price: number; // price per pound
};

type Props = {
  crops: InventoryCrop[];
  userId: string;
};

export default function InventoryList({ crops, userId }: Props) {
  const [filter, setFilter] = useState("");

  const filtered = crops.filter((c) =>
    c.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Input
        placeholder="Search crops..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="max-w-sm"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((crop) => (
          <CropCard key={crop.id} crop={crop} userId={userId} />
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full text-center text-muted-foreground">
            No crops match your search.
          </p>
        )}
      </div>
    </div>
  );
}

function CropCard({ crop, userId }: { crop: InventoryCrop; userId: string }) {
  const [qty, setQty] = useState<number>(1);
  const [ordering, setOrdering] = useState(false);

  const onOrder = async () => {
    setOrdering(true);
    try {
      await orderCrop({ cropId: crop.id, amount: qty, userId });
      toast.success(`Ordered ${qty} lb${qty !== 1 ? "s" : ""} of ${crop.name}`);
      setQty(1); // reset qty after success
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to place order");
    } finally {
      setOrdering(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 border rounded-lg p-6 shadow">
      <div className="flex items-center gap-4">
        {crop.image && (
          <Image
            src={crop.image}
            alt={crop.name}
            width={64}
            height={64}
            className="rounded-md object-cover aspect-square"
          />
        )}
        <div className="flex flex-col gap-0.5 flex-1">
          <span className="text-lg font-medium leading-none">{crop.name}</span>
          <span className="text-sm text-muted-foreground">
            ${crop.price.toFixed(2)} / lb
          </span>
        </div>
      </div>

      <div className="text-sm">
        Available: <span className="font-medium">{crop.amount}</span> lbs
      </div>

      <Input
        type="number"
        min={1}
        max={crop.amount}
        value={qty}
        onChange={(e) => setQty(Number(e.target.value))}
      />

      <Button
        disabled={ordering || qty < 1 || qty > crop.amount}
        onClick={onOrder}
        className="mt-auto"
      >
        {ordering ? "Ordering..." : "Order"}
      </Button>
    </div>
  );
}
