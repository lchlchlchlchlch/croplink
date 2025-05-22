"use client";
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
import { authClient } from "@/lib/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRightIcon, LoaderCircleIcon, WheatIcon } from "lucide-react";
import Link from "next/link";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import Google from "@/components/google-icon";
import Image from "next/image";

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
});

export default function SignupForm() {
  const [loading, setLoading] = React.useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await authClient.signIn.email(
      {
        email: values.email,
        password: values.password,
      },
      {
        onRequest: () => {
          setLoading(true);
        },
        onSuccess: () => {
          window.location.href = "/";
        },
        onError: (ctx) => {
          setLoading(false);
          console.log(ctx.error);
          toast.error(ctx.error.message);
        },
      },
    );
  }

  const googleSignIn = async (): Promise<void> => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: `/signup/pick-role`,
    });
  };

  return (
    <main className="flex flex-col gap-6 row-start-2 items-center w-full max-w-lg bg-white/60 py-8 px-12 rounded-xl border shadow-sm">
      <Image
        src={"/swdlog.png"}
        alt="Logo"
        width={300}
        height={300}
        className="w-16"
      />
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-gray-800">Welcome back</h1>
        <p className="text-sm text-gray-600 mt-1">
          Sign in to continue to your account
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 w-full"
        >
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
            Sign in
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
        <span>Sign in with Google</span>
      </Button>
      <Link
        href={"/signup"}
        className="text-sm text-primary hover:text-emerald-700 hover:underline"
      >
        Don&apos;t have an account? Sign up
        <ArrowRightIcon className="inline ml-1 h-4 w-4" />
      </Link>
    </main>
  );
}
