import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { db } from "@/db";
import { WheatIcon } from "lucide-react";

export async function Suppliers() {
  const suppliers = await db.query.user.findMany({
    with: {
      requestItems: true,
    },
  });

  const sortedSuppliers = suppliers
    .map((user) => {
      const totalAmount = user.requestItems.reduce(
        (sum, item) => sum + item.amount,
        0,
      );
      return { ...user, totalAmount };
    })
    .sort((a, b) => b.totalAmount - a.totalAmount);

  const totalAllAmounts = suppliers.reduce((total, user) => {
    const userTotal = user.requestItems.reduce(
      (sum, item) => sum + item.amount,
      0,
    );
    return total + userTotal;
  }, 0);

  const amounts: Record<string, number> = {};

  suppliers.forEach((user) => {
    const totalAmount = user.requestItems.reduce(
      (sum, item) => sum + item.amount,
      0,
    );
    amounts[user.name] = totalAmount;
  });

  return (
    <div className="space-y-6">
      {sortedSuppliers.map((supplier) => (
        <div
          key={supplier.id}
          className="flex items-center justify-between space-x-4"
        >
          <div className="flex items-center space-x-3">
            <Avatar className="h-11 w-11 bg-primary/10 border">
              <AvatarFallback className="text-green-700">
                <WheatIcon />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium leading-none">
                {supplier.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {amounts[supplier.name]} lbs
              </p>
            </div>
          </div>
          <div className="w-1/2">
            <Progress
              value={(amounts[supplier.name] / totalAllAmounts) * 100}
              className="h-2"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
