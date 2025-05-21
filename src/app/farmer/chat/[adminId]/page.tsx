import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getMessages, getOrCreatePrivateChatRoom } from "@/actions/chat";
import { ChatInterface } from "@/app/farmer/components/chat/ChatInterface";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";

async function getAuthenticatedUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/?error=unauthenticated&callbackUrl=/chat");
  return { id: (session.user as any).id as string };
}

interface AdminChatPageProps {
  params: { adminId: string };
}

export default async function AdminChatPage({
  params,
}: {
  params: Promise<{ adminId: string }>;
}) {
  const { adminId } = await params;
  const currentUser = await getAuthenticatedUser();
  const [userRecord] = await db
    .select({ role: schema.user.role })
    .from(schema.user)
    .where(eq(schema.user.id, currentUser.id));
  if (!userRecord) redirect("/?error=unauthenticated");
  if (userRecord.role !== "farmer") {
    redirect("/");
  }

  const admins = await db
    .select({ id: schema.user.id, name: schema.user.name, image: schema.user.image })
    .from(schema.user)
    .where(eq(schema.user.role, "admin"));

  const chatRoom = await getOrCreatePrivateChatRoom(
    currentUser.id,
    adminId
  );
  const initialMessages = await getMessages(chatRoom.id);

  return (
    <main className="flex flex-col h-full">
      <header className="flex h-12 items-center border-b px-4">
        <SidebarTrigger />
        <Separator orientation="vertical" className="mx-2 h-6" />
        <h1 className="text-lg font-medium">Chat with Admin</h1>
      </header>
      <ChatInterface
        initialMessages={initialMessages}
        chatRoomId={chatRoom.id}
        currentUserId={currentUser.id}
        allUsersMap={new Map(admins.map((a) => [a.id, { name: a.name, image: a.image }]))}
      />
    </main>
  );
}
