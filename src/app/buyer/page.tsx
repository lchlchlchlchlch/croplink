import LogoutButton from "@/components/logout-button";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const BuyerPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    throw redirect("/");
  }
  if (session.user.role !== "buyer") {
    throw redirect("/");
  }

  return (
    <div className="container mx-auto mt-12 flex flex-col">
      {session.user.email}
      <LogoutButton />
    </div>
  );
};

export default BuyerPage;
