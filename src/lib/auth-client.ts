import { createAuthClient } from "better-auth/react";
import { ac, admin, farmer, buyer, user } from "@/lib/permissions";
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",

  plugins: [
    adminClient({
      ac,
      roles: {
        admin,
        user,
        farmer,
        buyer,
      },
    }),
  ],
});
