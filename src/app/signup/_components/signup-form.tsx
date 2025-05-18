"use client";
import Google from "@/app/_components/google-icon";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/lib/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon, LoaderCircleIcon, WheatIcon } from "lucide-react";
import Link from "next/link";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  organizationName: z.string().min(1, {
    message: "Organization name is required.",
  }),
});

export default function SignupForm() {
  const [role, setRole] = React.useState<"farmer" | "admin" | "buyer">(
    "farmer",
  );
  const [loading, setLoading] = React.useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      organizationName: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const email = values.email;
    const password = values.password;
    const name = values.organizationName;

    const user = await authClient.signUp.email(
      {
        email,
        password,
        name,
      },
      {
        onRequest: () => {
          setLoading(true);
        },
        onError: (ctx) => {
          setLoading(false);
          toast.error(ctx.error.message);
        },
      },
    );

    if (!(user instanceof Error)) {
      const userData = user?.data;

      if (userData && "user" in userData && userData.user) {
        const userId = userData.user.id;
        await authClient.admin.setRole({
          userId: userId,
          role: role.toLowerCase() as "farmer" | "admin" | "buyer",
        });
      }
    }
    window.location.href = `/${role}`;
  }

  const googleSignIn = async (): Promise<void> => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: `/signup/pick-role`,
    });
  };

  return (
    <main className="flex flex-col gap-[32px] row-start-2 items-center w-full max-w-md">
      <WheatIcon size={70} className="text-emerald-600" />

      <Tabs
        className="w-full"
        defaultValue="Farmer"
        value={role}
        onValueChange={(value) =>
          setRole(value as "farmer" | "admin" | "buyer")
        }
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="farmer">Farmer</TabsTrigger>
          <TabsTrigger value="admin">Admin</TabsTrigger>
          <TabsTrigger value="buyer">Buyer</TabsTrigger>
        </TabsList>
      </Tabs>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 w-full"
        >
          <FormField
            control={form.control}
            name="organizationName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organization Name</FormLabel>
                <FormControl>
                  <Input placeholder="Organization Name..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            Sign up
            {loading && <LoaderCircleIcon className="animate-spin" />}
          </Button>
        </form>
      </Form>
      <Button
        variant={"outline"}
        className="bg-white w-full"
        onClick={googleSignIn}
      >
        <Google />
        <span>Sign up with Google</span>
      </Button>
      <Link href={"/"}>
        <Button variant={"link"}>
          <ArrowLeftIcon />
          Already have an account? Sign in
        </Button>
      </Link>
    </main>
  );
}
