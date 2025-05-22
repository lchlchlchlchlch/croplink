import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { db } from "@/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import RequestForm from "./_components/request-form";
import { eq } from "drizzle-orm";
import { request } from "@/db/schema";
import { CheckIcon, ClockIcon } from "lucide-react";
import Image from "next/image";
import { getCropInfo } from "@/lib/utils";

// farmer page component that displays request form and submitted requests
const FarmerPage = async () => {
  // get user session and validate access
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    throw redirect("/");
  }
  if (session.user.role !== "farmer") {
    throw redirect("/");
  }

  // fetch all requests for the current user
  const requests = await db.query.request.findMany({
    where: eq(request.userId, session.user.id),
    with: {
      requestItems: {
        with: {
          crop: true,
        },
      },
    },
  });

  // sort requests by date (newest first)
  const sortedRequests = requests.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <main className="h-screen md:h-[calc(100vh-1.5rem)] flex flex-col">
      {/* header section */}
      <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
        <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          <h1 className="text-base font-medium">Request</h1>
        </div>
      </header>
      {/* main content section */}
      <div className="p-4 lg:p-6 flex flex-col flex-1 overflow-auto min-h-0">
        <RequestForm userId={session.user.id} />

        <div className="text-xl font-semibold mt-10 border-b mb-6 pb-3">
          Submitted Requests
        </div>

        {/* requests grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {requests.length === 0 && (
            <div className="p-10 text-center col-span-1 md:col-span-2 w-full text-muted-foreground font-medium bg-slate-50 rounded-lg">
              No requests have been submitted.
            </div>
          )}
          {sortedRequests.map((item) => (
            <div
              key={item.id}
              className="flex flex-col border rounded-xl p-6 shadow-sm group hover:bg-zinc-50 transition duration-200 bg-white"
            >
              <div className="flex flex-col gap-4 flex-grow">
                {/* request header with date and status */}
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-0.5">
                      Harvest Date
                    </div>
                    <div className="text-sm font-semibold">
                      {new Date(item.date).toLocaleDateString()}
                    </div>
                  </div>
                  {item.approved ? (
                    <div className="flex gap-1.5 items-center text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
                      <CheckIcon size={14} />
                      Approved
                    </div>
                  ) : (
                    <div className="flex gap-1.5 items-center text-xs font-semibold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
                      <ClockIcon size={14} />
                      Pending
                    </div>
                  )}
                </div>
                {/* request price */}
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-0.5">
                    Total Value
                  </div>
                  <div className="text-sm font-semibold">${item.price}</div>
                </div>

                {/* request items list */}
                <div className="mt-2">
                  <div className="text-xs font-medium text-muted-foreground mb-1">
                    Items
                  </div>
                  <div className="flex flex-col gap-2">
                    {item.requestItems.map((crop) => (
                      <div
                        key={crop.id}
                        className="flex gap-3 items-center justify-between p-3 bg-zinc-50 group-hover:bg-zinc-100 rounded-md border transition duration-200 ease-in-out"
                      >
                        <div className="flex items-center gap-3">
                          <Image
                            className="w-10 h-10 object-cover rounded-md flex-shrink-0"
                            src={crop.image!}
                            alt={crop.crop.name}
                            height={40}
                            width={40}
                          />
                          <div>
                            <div className="text-sm font-medium">
                              {getCropInfo(crop.crop.name)?.plural}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {crop.amount} lb{crop.amount !== 1 && "s"}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default FarmerPage;
