import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";

async function getAuthenticatedUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/?error=unauthenticated&callbackUrl=/chat");
  return { id: (session.user as any).id as string };
}

export default async function ChatListPage() {
  const currentUser = await getAuthenticatedUser();
  const [userRecord] = await db
    .select({ role: schema.user.role })
    .from(schema.user)
    .where(eq(schema.user.id, currentUser.id));

  if (!userRecord) redirect("/?error=unauthenticated");
  if (userRecord.role !== "farmer") redirect("/");

  const admins = await db
    .select({ id: schema.user.id, name: schema.user.name })
    .from(schema.user)
    .where(eq(schema.user.role, "admin"));

  return (
    <main className="flex h-full">
      <aside className="w-64 border-r p-4">
        <h2 className="text-xl font-semibold mb-4">Admins</h2>
        <ul>
          {admins.map((admin) => (
            <li key={admin.id} className="mb-2">
              <Link
                href={`/farmer/chat/${admin.id}`}
                className="block p-2 hover:bg-gray-100 rounded"
              >
                {admin.name || "Unnamed Admin"}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
      <div className="flex-1 flex items-center justify-center">
        <p>Select an admin to start a private chat.</p>
      </div>
    </main>
  );
}