import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import PickRoleForm from "./_components/pick-role-form";

// page for people who use google to sign up to allow them to pick a role
export default async function PickRole() {
  // verify logged in
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    throw redirect("/");
  }
  if (session?.user.role !== "user") {
    throw redirect(`/${session.user.role}`);
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen">
      {/* form to decide role */}
      <PickRoleForm userId={session.user.id} />
    </div>
  );
}
