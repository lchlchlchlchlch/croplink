import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

async function getAuthenticatedUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/?error=unauthenticated&callbackUrl=/chat");
  return { id: (session.user as any).id as string };
}

export async function ChatListPage({
  currentRole,
  otherRoles,
}: {
  currentRole: string;
  otherRoles: string[];
}) {
  const currentUser = await getAuthenticatedUser();

  const [userInfo] = await db
    .select({ role: schema.user.role })
    .from(schema.user)
    .where(eq(schema.user.id, currentUser.id));

  if (!userInfo) redirect("/?error=unauthenticated");
  if (userInfo.role !== currentRole) redirect("/");

  const eligibleUsers = await db
    .select({ id: schema.user.id, name: schema.user.name })
    .from(schema.user)
    .where(inArray(schema.user.role, otherRoles));

  const roleLabel =
    otherRoles.length > 1
      ? otherRoles.map((r) => r[0].toUpperCase() + r.slice(1)).join("/")
      : otherRoles[0][0].toUpperCase() + otherRoles[0].slice(1);

  return (
    <main className="flex h-full">
      <aside className="w-64 border-r p-4">
        <h2 className="text-xl font-semibold mb-4">{roleLabel}</h2>
        <ul>
          {eligibleUsers.map((otherUser) => (
            <li key={otherUser.id} className="mb-2">
              <Link
                href={`/${currentRole}/chat/${otherUser.id}`}
                className="block p-2 hover:bg-gray-100 rounded"
              >
                {otherUser.name || `Unnamed ${roleLabel}`}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
      <div className="flex-1 flex items-center justify-center">
        <p>Select a {roleLabel.toLowerCase()} to start a private chat.</p>
      </div>
    </main>
  );
}
