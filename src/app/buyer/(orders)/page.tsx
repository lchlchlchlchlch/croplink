import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import InventoryList from "../_components/inventory-list";
import { cropsList } from "@/data/crops-list";
import { InventoryCrop } from "@/types";
import { getCropInfo } from "@/lib/utils";

// main buyer page component
const BuyerPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  // redirect if not authenticated or not a buyer
  if (!session || session.user.role !== "buyer") {
    throw redirect("/");
  }

  // fetch crops from db
  const crops = await db.query.crop.findMany();

  // map db crops to inventory format
  const inventory: InventoryCrop[] = crops.map((c) => {
    const info = cropsList.find((ci) => ci.name === c.name);
    return {
      id: c.id,
      name: c.name,
      plural: getCropInfo(c.name)?.plural || "",
      image: c.image,
      amount: c.amount,
      price: info?.price ?? 0,
      userId: session.user.id,
    };
  });

  return (
    <main className="h-screen md:h-[calc(100vh-1.5rem)] flex flex-col">
      {/* header with sidebar trigger */}
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

      {/* main content area with inventory list */}
      <div className="p-4 lg:p-6 flex flex-col flex-1 overflow-auto min-h-0 gap-8">
        <InventoryList crops={inventory} userId={session.user.id} />
      </div>
    </main>
  );
};

export default BuyerPage;
