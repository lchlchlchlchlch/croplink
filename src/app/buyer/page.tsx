import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import InventoryList, { InventoryCrop } from "./components/inventory-list";
import { cropsList } from "@/data/crops-list";

const BuyerPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || session.user.role !== "buyer") {
    throw redirect("/");
  }

  const crops = await db.query.crop.findMany();

  const inventory: InventoryCrop[] = crops.map((c) => {
    const info = cropsList.find((ci) => ci.name === c.name);
    return {
      id: c.id,
      name: c.name,
      image: c.image,
      amount: c.amount,
      price: info?.price ?? 0,
    };
  });

  return (
    <main className="h-screen md:h-[calc(100vh-1.5rem)] flex flex-col">
      <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
        <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          <h1 className="text-base font-medium">Order</h1>
        </div>
      </header>

      <div className="p-4 lg:p-6 flex flex-col flex-1 overflow-auto min-h-0">
        <InventoryList crops={inventory} />
      </div>
    </main>
  );
};

export default BuyerPage;
