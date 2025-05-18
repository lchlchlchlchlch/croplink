import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import PickRoleForm from "./_components/pick-role-form";

export default async function PickRole() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    throw redirect("/");
  }
  if (session?.user.role !== "user") {
    throw redirect(`${session.user.role}`);
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen">
      <PickRoleForm userId={session.user.id} />
    </div>
  );
}
