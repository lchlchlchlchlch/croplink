"use client";
import { authClient } from "@/lib/auth-client";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { LogOutIcon } from "lucide-react";

const LogoutButton = () => {
  const router = useRouter();
  const logout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/"); // redirect to login page
        },
      },
    });
  };
  return (
    <Button onClick={logout} className="w-fit">
      Logout
      <LogOutIcon />
    </Button>
  );
};

export default LogoutButton;
