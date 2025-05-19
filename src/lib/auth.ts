import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db"; // your drizzle instance
import { ac, admin, farmer, buyer, user } from "@/lib/permissions";
import { admin as adminPlugin } from "better-auth/plugins";

export const auth = betterAuth({
  trustedOrigins: async (request: Request): Promise<string[]> => {
    const origin = request.headers.get("origin") || "";

    const staticOrigins = [
      "https://croplink.parthiv.dev",
      "https://tsa-software-dev-2025-prod.vercel.app",
    ];

    const localhostRegex = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
    const vercelPreviewRegex =
      /^https:\/\/(?:tsa-software-dev-2025)-.*\.vercel\.app$/;

    const dynamicOrigins: string[] = [];

    if (localhostRegex.test(origin) || vercelPreviewRegex.test(origin)) {
      dynamicOrigins.push(origin);
    }

    return [...staticOrigins, ...dynamicOrigins];
  },
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
