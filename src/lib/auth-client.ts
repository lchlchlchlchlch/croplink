import { createAuthClient } from "better-auth/react";
import { ac, admin, farmer, buyer, user } from "@/lib/permissions";
import { adminClient } from "better-auth/client/plugins";

// client used to handle signin, signup, and more
export const authClient = createAuthClient({
  plugins: [
    // plugin to assign permissions to users with certain roles
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
