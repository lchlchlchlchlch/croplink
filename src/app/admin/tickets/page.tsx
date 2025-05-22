import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { revalidatePath } from "next/cache";
import { Button } from "@/components/ui/button";
import { RefreshCwIcon } from "lucide-react";
import { RequestsTable } from "./_components/requests-table";
import { OrdersTable } from "./_components/orders-table";

// admin page component that handles requests and orders
const AdminPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  // redirect if user is not authenticated or not an admin
  if (!session) {
    throw redirect("/");
  }
  if (session.user.role !== "admin") {
    throw redirect("/");
  }

  // fetch requests and orders data in parallel
  const [requests, orders] = await Promise.all([
    db.query.request.findMany({
      with: {
        user: true,
        requestItems: {
          with: {
            crop: true,
          },
        },
      },
    }),
    db.query.order.findMany({
      with: {
        user: true,
        crop: true,
      },
    }),
  ]);

  // server action to refresh the page data
  const refresh = async () => {
    "use server";
    revalidatePath("/");
  };

  return (
    <main className="flex flex-col h-[calc(100vh-1rem)]">
      <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
        <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          <h1 className="text-base font-medium">Tickets</h1>
        </div>
      </header>
      <div className="p-6 flex flex-col flex-1">
        {/* tabs component for switching between requests and orders */}
        <Tabs defaultValue="requests">
          <div className="md:flex gap-4">
            <TabsList className="grid h-auto w-full grid-cols-2 gap-2 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
              <TabsTrigger
                value="requests"
                className="w-full rounded-md py-1 text-sm font-medium hover:cursor-pointer data-[state=active]:bg-primary data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-200/70 transition-all duration-250"
              >
                Requests
              </TabsTrigger>
              <TabsTrigger
                value="orders"
                className="w-full rounded-md py-1 text-sm font-medium hover:cursor-pointer data-[state=active]:bg-primary data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-200/70 transition-all duration-250"
              >
                Orders
              </TabsTrigger>
            </TabsList>
            {/* refresh button with server action */}
            <form action={refresh}>
              <Button
                className="w-full mt-2 md:mt-0 md:w-fit"
                variant={"outline"}
              >
                Refresh Data <RefreshCwIcon />
              </Button>
            </form>
          </div>
          <TabsContent value="requests" className="mt-6">
            <RequestsTable requests={requests} />
          </TabsContent>
          <TabsContent value="orders" className="mt-6">
            <OrdersTable orders={orders} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
};

export default AdminPage;
