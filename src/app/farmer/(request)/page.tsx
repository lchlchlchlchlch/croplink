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

const FarmerPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    throw redirect("/");
  }
  if (session.user.role !== "farmer") {
    throw redirect("/");
  }

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

  return (
    <main className="h-screen md:h-[calc(100vh-1.5rem)] flex flex-col">
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
      <div className="p-4 lg:p-6 flex flex-col flex-1 overflow-auto min-h-0">
        <RequestForm userId={session.user.id} />

        <div className="text-xl font-medium mt-8 border-b mb-4 pb-4">
          Submitted Requests
        </div>

        <div className="grid grid-cols-2 gap-4">
          {requests.length === 0 && (
            <div className="p-8 text-center col-span-2 w-full text-muted-foreground font-medium">
              No requests have been submitted.
            </div>
          )}
          {requests.map((item) => (
            <div
              key={item.id}
              className="flex border rounded-lg p-8 shadow gap-8 justify-between"
            >
              <div className="flex flex-col gap-2">
                <div>
                  <div className="font-medium text-sm text-muted-foreground">
                    Date:
                  </div>
                  <div className="text-base font-medium">
                    {new Date(item.date).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="font-medium text-sm text-muted-foreground">
                    Value:
                  </div>
                  <div className="text-base font-medium">${item.price}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">
                    {item.approved ? (
                      <div className="flex gap-2 items-center text-green-600">
                        Approved <CheckIcon size={18} />
                      </div>
                    ) : (
                      <div className="flex gap-2 items-center text-yellow-600">
                        Awaiting Approval <ClockIcon size={18} />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-8">
                {item.requestItems.map((crop) => (
                  <div
                    key={crop.id}
                    className="flex gap-4 items-center justify-end"
                  >
                    <div className="text-base font-medium">
                      {crop.amount} lb{crop.amount !== 1 && "s"}{" "}
                      {getCropInfo(crop.crop.name).plural}
                    </div>
                    <Image
                      className="w-14 object-cover aspect-square rounded-md"
                      src={crop.image || ""}
                      alt={crop.id}
                      height={300}
                      width={300}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default FarmerPage;
