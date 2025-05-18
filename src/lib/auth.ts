import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db"; // your drizzle instance
import { ac, admin, farmer, buyer, user } from "@/lib/permissions";
import { admin as adminPlugin } from "better-auth/plugins";

export const auth = betterAuth({
  trustedOrigins: [process.env.BETTER_AUTH_URl || "localhost:3000"],
  database: drizzleAdapter(db, {
    provider: "pg", // or "mysql", "sqlite"
  }),

  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      enabled: true,
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  plugins: [
    adminPlugin({
      ac,
      roles: {
        admin,
        user,
        farmer,
        buyer,
      },
      defaultRole: "user",
    }),
  ],
});
