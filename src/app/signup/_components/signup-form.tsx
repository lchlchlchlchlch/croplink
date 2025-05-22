"use client";
import Google from "@/components/google-icon";
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
import { ArrowLeftIcon, LoaderCircleIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

// schema of the form, contains all the fields
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
  // possible roles
  const [role, setRole] = React.useState<"farmer" | "admin" | "buyer">(
    "farmer",
  );
  const [loading, setLoading] = React.useState(false);

  // handle form using useForm from react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      organizationName: "",
    },
  });

  // handle form submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
    const email = values.email;
    const password = values.password;
    const name = values.organizationName;

    // sign up user using betterauth
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

    // handle role assignment and redirection to portal
    if (!(user instanceof Error)) {
      const userData = user?.data;

      if (userData && "user" in userData && userData.user) {
        const userId = userData.user.id;
        await authClient.admin.setRole({
          userId: userId,
          role: role.toLowerCase() as "farmer" | "admin" | "buyer",
        });
        window.location.href = `/${role}`;
      }
    }
  }

  // handle google sign in
  const googleSignIn = async (): Promise<void> => {
    await authClient.signIn.social({
      provider: "google",
      // redirect url after completing sign in
      callbackURL: `/signup/pick-role`,
    });
  };

  return (
    <main className="flex flex-col gap-6 row-start-2 items-center w-full max-w-lg bg-white/60 py-8 px-12 rounded-xl border shadow-sm">
      <Image
        src={"/swdlogo.png"}
        alt="Logo"
        width={300}
        height={300}
        className="w-16"
      />
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-gray-800">
          Create an account
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Enter your details below to create your account
        </p>
      </div>

      <Tabs
        className="w-full"
        defaultValue="farmer"
        value={role}
        onValueChange={(value) =>
          setRole(value as "farmer" | "admin" | "buyer")
        }
      >
        {/* tabs to choose role */}
        <TabsList className="grid h-auto w-full grid-cols-3 gap-2 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
          <TabsTrigger
            value="farmer"
            className="w-full rounded-md py-1 text-sm font-medium hover:cursor-pointer data-[state=active]:bg-primary data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-200/70 transition-all duration-250"
          >
            Farmer
          </TabsTrigger>
          <TabsTrigger
            value="admin"
            className="w-full rounded-md py-1 text-sm font-medium hover:cursor-pointer data-[state=active]:bg-primary data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-200/70 transition-all duration-250"
          >
            Admin
          </TabsTrigger>
          <TabsTrigger
            value="buyer"
            className="w-full rounded-md py-1 text-sm font-medium hover:cursor-pointer data-[state=active]:bg-primary data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-200/70 transition-all duration-250"
          >
            Buyer
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* form component to enter in details */}
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
                <FormLabel className="text-gray-700">
                  Organization Name
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Organization Name..."
                    {...field}
                    className="bg-white/70 border-gray-300 focus-visible:border-emerald-500/70 focus-visible:ring-emerald-500/20"
                  />
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
                <FormLabel className="text-gray-700">Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="you@example.com"
                    {...field}
                    className="bg-white/70 border-gray-300 focus-visible:border-emerald-500/70 focus-visible:ring-emerald-500/20"
                  />
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
                <FormLabel className="text-gray-700">Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    {...field}
                    className="bg-white/70 border-gray-300 focus-visible:border-emerald-500/70 focus-visible:ring-emerald-500/20"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-emerald-700 text-white py-4 text-sm"
            disabled={loading}
          >
            {loading && (
              <LoaderCircleIcon className="animate-spin mr-2 h-5 w-5" />
            )}
            Sign up
          </Button>
        </form>
      </Form>
      <div className="relative w-full">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white/80 px-2 text-gray-500">
            OR CONTINUE WITH
          </span>
        </div>
      </div>
      <Button
        variant={"outline"}
        className="bg-white w-full border-gray-300 hover:bg-gray-50 py-4 text-sm text-gray-700"
        onClick={googleSignIn}
      >
        <Google className="mr-2 h-5 w-5" />
        <span>Google</span>
      </Button>

      {/* redirect to sign in */}
      <Link
        href={"/"}
        className="text-sm text-primary hover:text-emerald-700 hover:underline"
      >
        <ArrowLeftIcon className="inline mr-1 h-4 w-4" />
        Already have an account? Sign in
      </Link>
    </main>
  );
}
