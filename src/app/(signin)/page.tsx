import { auth } from "@/lib/auth";
import LoginForm from "./_components/login-form";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

// sign in page, the default page
export default async function Home() {
  // if user exists redirect them
  const session = await auth.api.getSession({ headers: await headers() });

  if (session?.user) {
    throw redirect(`${session.user.role}`);
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen">
      <LoginForm />
    </div>
  );
}
