import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { db } from "@/db";
import { WheatIcon } from "lucide-react";

// list of top suppliers

export async function Suppliers() {
  // fetch all users from db
  const suppliers = await db.query.user.findMany({
    with: {
      requestItems: true,
    },
  });

  // sort suppliers by most supplied, only include top 10
  const sortedSuppliers = suppliers
    .map((user) => {
      const totalAmount = user.requestItems.reduce(
        (sum, item) => sum + item.amount,
        0,
      );
      return { ...user, totalAmount };
    })
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 10);

  // add up all amounts to get a total
  const totalAllAmounts = suppliers.reduce((total, user) => {
    const userTotal = user.requestItems.reduce(
      (sum, item) => sum + item.amount,
      0,
    );
    return total + userTotal;
  }, 0);

  // define amounts object
  const amounts: Record<string, number> = {};

  // for each supplier add its amount to amounts object
  suppliers.forEach((user) => {
    const totalAmount = user.requestItems.reduce(
      (sum, item) => sum + item.amount,
      0,
    );
    amounts[user.name] = totalAmount;
  });

  return (
    <div className="space-y-6">
      {/* map through suppliers */}
      {sortedSuppliers.map((supplier) => (
        <div
          key={supplier.id}
          className="flex items-center justify-between space-x-4"
        >
          {/* supplier info section with avatar and details */}
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
                {amounts[supplier.name]} lb{amounts[supplier.name] !== 1 && "s"}
              </p>
            </div>
          </div>
          {/* progress bar showing supplier's proportion of total amount */}
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
