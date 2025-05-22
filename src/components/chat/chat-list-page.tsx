import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { MessageCircleIcon, UserIcon } from "lucide-react";
import { SidebarTrigger } from "../ui/sidebar";
import { Separator } from "../ui/separator";

// check if user is authenticated and return their id
async function getAuthenticatedUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/?error=unauthenticated&callbackUrl=/chat");
  return { id: session.user.id as string };
}

export async function ChatListPage({
  currentRole,
  otherRoles,
}: {
  currentRole: string;
  otherRoles: string[];
}) {
  const currentUser = await getAuthenticatedUser();

  // get user role from database
  const [userInfo] = await db
    .select({ role: schema.user.role })
    .from(schema.user)
    .where(eq(schema.user.id, currentUser.id));

  if (!userInfo) redirect("/?error=unauthenticated");
  if (userInfo.role !== currentRole) redirect("/");

  // fetch users that the current user can chat with
  const eligibleUsers = await db
    .select({ id: schema.user.id, name: schema.user.name })
    .from(schema.user)
    .where(inArray(schema.user.role, otherRoles));

  // format the role label for display
  const roleLabel =
    otherRoles.length > 1
      ? otherRoles.map((r) => r[0].toUpperCase() + r.slice(1)).join("/")
      : otherRoles[0][0].toUpperCase() + otherRoles[0].slice(1);

  return (
    <main className="flex flex-col h-[calc(100vh-1rem)]">
      {/* header with sidebar trigger */}
      <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
        <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          <h1 className="text-base font-medium">Chat</h1>
        </div>
      </header>
      <div className="flex flex-1">
        {/* empty state message */}
        <div className="flex-1 md:flex items-center justify-center hidden text-muted-foreground">
          <p>
            Select a{roleLabel.toLowerCase() === "admin" && "n"}{" "}
            {roleLabel.toLowerCase()} to start a private chat.
          </p>
        </div>
        {/* sidebar with user list */}
        <aside className="w-64 border-l p-4">
          <h2 className="text-xl px-2 font-medium text-primary mb-4 flex gap-1.5 items-center">
            <MessageCircleIcon size={20} /> {roleLabel}s
          </h2>
          <ul>
            {eligibleUsers.map((otherUser) => (
              <li key={otherUser.id} className="mb-2">
                <Link
                  href={`/${currentRole}/chat/${otherUser.id}`}
                  className="flex text-[14px] gap-1.5 items-center px-2 py-1 hover:bg-gray-50 rounded-md"
                >
                  <UserIcon size={18} />{" "}
                  {otherUser.name || `Unnamed ${roleLabel}`}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </main>
  );
}
