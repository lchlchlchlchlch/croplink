import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
import * as relations from "./relations";
import postgres from "postgres";

let connection: postgres.Sql;

// configure connection depending on dev or prod
if (process.env.NODE_ENV === "production") {
  connection = postgres(process.env.DATABASE_URL || "");
} else {
  const globalConnection = global as typeof globalThis & {
    connection: postgres.Sql;
  };

  if (!globalConnection.connection) {
    globalConnection.connection = postgres(process.env.DATABASE_URL || "");
  }

  connection = globalConnection.connection;
}

// pass in connection, schema, relations to drizzle
export const db = drizzle(connection, { schema: { ...schema, ...relations } });
