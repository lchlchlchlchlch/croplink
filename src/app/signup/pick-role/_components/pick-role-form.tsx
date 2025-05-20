"use client";
import { updateUserName } from "@/actions/update-user-name";
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
import { LoaderCircleIcon, WheatIcon } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  organizationName: z.string().min(1, {
    message: "Organization name is required.",
  }),
});

const PickRoleForm = ({ userId }: { userId: string }) => {
  const [role, setRole] = React.useState<"farmer" | "admin" | "buyer">(
    "farmer",
  );
  const [loading, setLoading] = React.useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      organizationName: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    const name = values.organizationName;

    await updateUserName({ id: userId, name: name });

    await authClient.admin.setRole({
      userId: userId,
      role: role.toLowerCase() as "farmer" | "admin" | "buyer",
    });

    window.location.href = `/${role}`;
  }

  return (
    <main className="flex flex-col gap-[32px] row-start-2 items-center w-full max-w-md">
      <WheatIcon size={70} className="text-primary" />

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
          <Button type="submit" className="w-full" disabled={loading}>
            Submit
            {loading && <LoaderCircleIcon className="animate-spin" />}
          </Button>
        </form>
      </Form>
    </main>
  );
};

export default PickRoleForm;
