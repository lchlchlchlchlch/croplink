import { db } from "@/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { order, crop } from "@/db/schema";

const BuyerOrderHistory = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || session.user.role !== "buyer") {
    throw redirect("/");
  }

  const orders = await db.query.order.findMany({
    where: eq(order.userId, session.user.id),
    with: {
      crop: true,
    },
    orderBy: (o) => o.createdAt,
  });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Order History</h2>
      {orders.length === 0 ? (
        <p className="text-muted-foreground">No orders have been placed yet.</p>
      ) : (
        <ul className="space-y-3">
          {orders.map((item) => (
            <li
              key={item.id}
              className="border p-4 rounded shadow flex justify-between items-center"
            >
              <div className="text-base">
                {item.crop.name}
                <div className="text-sm text-muted-foreground">
                  Ordered: {item.amount} lbs
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(item.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="text-sm">Crop ID: {item.cropId}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BuyerOrderHistory;
