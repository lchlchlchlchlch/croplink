import "dotenv/config";
import { defineConfig } from "drizzle-kit";

// configure drizzle, an ORM to interact with the database
export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
