import { getMessages, getOrCreatePrivateChatRoom } from "@/actions/chat";
import { ChatInterface } from "@/components/chat/chat-interface";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq, inArray } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

// helper function to get the authenticated user or redirect
async function getAuthenticatedUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/?error=unauthenticated&callbackUrl=/chat");
  return { id: session.user.id as string };
}

// main chat page component for role-based messaging
export async function RoleBasedChatPage({
  params,
  currentRole,
  otherRoles,
}: {
  params: Promise<{ userId: string }>;
  currentRole: string;
  otherRoles: string[];
}) {
  const { userId } = await params;
  const currentUser = await getAuthenticatedUser();

  // verify user role and permissions
  const [userRecord] = await db
    .select({ role: schema.user.role })
    .from(schema.user)
    .where(eq(schema.user.id, currentUser.id));
  if (!userRecord) redirect("/?error=unauthenticated");
  if (userRecord.role !== currentRole) {
    redirect("/");
  }

  // get all users with specified roles
  const users = await db
    .select({
      id: schema.user.id,
      name: schema.user.name,
      image: schema.user.image,
    })
    .from(schema.user)
    .where(inArray(schema.user.role, otherRoles));

  // get details of the user being chatted with
  const otherUser = await db
    .select({ name: schema.user.name })
    .from(schema.user)
    .where(eq(schema.user.id, userId))
    .then((res) => res[0]);

  // setup chat room and load initial messages
  const chatRoom = await getOrCreatePrivateChatRoom(currentUser.id, userId);
  const initialMessages = await getMessages(chatRoom.id);

  return (
    <main className="flex flex-col h-[calc(100vh-1rem)]">
      <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
        <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          <h1 className="text-base font-medium">
            Chat with {otherUser?.name ?? "User"}
          </h1>
        </div>
      </header>
      <ChatInterface
        initialMessages={initialMessages}
        chatRoomId={chatRoom.id}
        currentUserId={currentUser.id}
        allUsersMap={
          new Map(users.map((a) => [a.id, { name: a.name, image: a.image }]))
        }
      />
    </main>
  );
}
