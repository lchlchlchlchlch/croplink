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
    <main className="flex flex-col gap-[32px] row-start-2 items-center w-full max-w-md">
      <WheatIcon size={70} className="text-emerald-600" />

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
            Sign in
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
        <span>Sign in with Google</span>
      </Button>
      <Link href={"/signup"}>
        <Button variant={"link"}>
          Don&apos;t have an account? Sign up
          <ArrowRightIcon />
        </Button>
      </Link>
    </main>
  );
}
