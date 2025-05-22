import { db } from "@/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { order } from "@/db/schema";
import Image from "next/image";
import { format } from "date-fns";
import { CheckIcon, ClockIcon } from "lucide-react";

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

  const sortedOrders = orders.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="p-4 lg:p-6 flex flex-col flex-1 overflow-auto min-h-0">
      <div className="text-xl font-semibold mb-6 border-b pb-3">
        Order History
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {orders.length === 0 && (
          <div className="p-10 text-center col-span-1 md:col-span-2 w-full text-muted-foreground font-medium bg-slate-50 rounded-lg">
            No orders have been placed yet.
          </div>
        )}
        {sortedOrders.map((order) => (
          <div
            key={order.id}
            className="flex flex-col border rounded-xl p-6 shadow-sm group hover:bg-zinc-50 transition duration-200 bg-white"
          >
            <div className="flex flex-col gap-4 flex-grow">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-0.5">
                    Order Date
                  </div>
                  <div className="text-sm font-semibold">
                    {format(new Date(order.createdAt), "MMM d, yyyy")}
                  </div>
                </div>
                {order.approved ? (
                  <div className="flex gap-1.5 items-center text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
                    <CheckIcon size={14} /> Approved
                  </div>
                ) : (
                  <div className="flex gap-1.5 items-center text-xs font-semibold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
                    <ClockIcon size={14} /> Pending
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-3 border rounded-md bg-zinc-50 p-3">
                  {order.crop.image && (
                    <Image
                      className="w-10 h-10 object-cover rounded-md flex-shrink-0"
                      src={order.crop.image}
                      alt={order.crop.name}
                      height={40}
                      width={40}
                    />
                  )}
                  <div>
                    <div className="text-sm font-medium">{order.crop.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {order.amount} lb{order.amount !== 1 && "s"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-xs text-muted-foreground mt-2">
                ID: {order.id}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BuyerOrderHistory;
