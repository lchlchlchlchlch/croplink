import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { CropsTable } from "./_components/crops-table";
import { db } from "@/db";
import { Suppliers } from "./_components/suppliers";
import { revalidatePath } from "next/cache";
import { Button } from "@/components/ui/button";
import { RefreshCwIcon } from "lucide-react";

// inventory page
const AdminPage = async () => {
  // verify user and user role
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    throw redirect("/");
  }
  if (session.user.role !== "admin") {
    throw redirect("/");
  }

  // fetch crops from db
  const crops = await db.query.crop.findMany({
    with: {
      requestItems: {
        with: {
          request: true,
        },
      },
    },
  });

  // used to refresh data
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
          <h1 className="text-base font-medium">Inventory</h1>
        </div>
      </header>
      <div className="p-6 flex flex-col flex-1 overflow-auto">
        {/* Tabs to pick between crops and suppliers */}
        <Tabs defaultValue="inventory">
          <div className="md:flex gap-4">
            <TabsList className="grid h-auto w-full grid-cols-2 gap-2 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
              <TabsTrigger
                value="inventory"
                className="w-full rounded-md py-1 text-sm font-medium hover:cursor-pointer data-[state=active]:bg-primary data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-200/70 transition-all duration-250"
              >
                Total Inventory
              </TabsTrigger>
              <TabsTrigger
                value="suppliers"
                className="w-full rounded-md py-1 text-sm font-medium hover:cursor-pointer data-[state=active]:bg-primary data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-200/70 transition-all duration-250"
              >
                Top Suppliers
              </TabsTrigger>
            </TabsList>
            <form action={refresh}>
              <Button
                className="w-full mt-2 md:mt-0 md:w-fit"
                variant={"outline"}
              >
                Refresh Data <RefreshCwIcon />
              </Button>
            </form>
          </div>
          <TabsContent value="inventory" className="mt-6">
            <CropsTable crops={crops} />
          </TabsContent>
          <TabsContent value="suppliers" className="mt-6">
            <Suppliers />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
};

export default AdminPage;
