import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import BuyerOrderHistory from "../components/order-history";

const BuyerOrderHistoryPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || session.user.role !== "buyer") {
    throw redirect("/");
  }

  return (
    <main className="h-screen md:h-[calc(100vh-1.5rem)] flex flex-col">
      <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
        <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          <h1 className="text-base font-medium">Order History</h1>
        </div>
      </header>

      <div className="p-4 lg:p-6 flex flex-col flex-1 overflow-auto min-h-0">
        <BuyerOrderHistory />
      </div>
    </main>
  );
};

export default BuyerOrderHistoryPage;
