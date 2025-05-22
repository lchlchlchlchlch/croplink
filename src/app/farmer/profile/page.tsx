import LogoutButton from "@/components/logout-button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";
import { WheatIcon } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

// profile page for farmers
const FarmerProfile = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    throw redirect("/");
  }

  return (
    <main>
      <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
        <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          <h1 className="text-base font-medium">Profile</h1>
        </div>
      </header>
      <div className="flex flex-col p-4 lg:p-6">
        <div className="flex md:flex-row flex-col gap-8 border rounded-lg items-center p-8 shadow">
          <div className="border-2 rounded-xl p-8 border-primary bg-primary/5">
            <WheatIcon className="text-primary" size={60} />
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="border border-primary rounded-md mb-2 px-2 py-1 w-fit bg-primary/10">
              <div className="text-sm font-semibold text-primary">
                {session.user.role?.toLocaleUpperCase()}
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-base text-muted-foreground font-medium">
                Organization:
              </span>
              <span className="font-medium text-lg">{session.user.name}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-base text-muted-foreground font-medium">
                Email:
              </span>
              <span className="font-medium text-lg">{session.user.email}</span>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <LogoutButton />
        </div>
      </div>
    </main>
  );
};

export default FarmerProfile;
