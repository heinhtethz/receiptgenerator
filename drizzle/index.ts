import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

// 1. Create a global variable type for the database connection
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

// 2. Check if a connection already exists in the global object.
// If not, create a new one.
const conn = globalForDb.conn ?? postgres(connectionString, { prepare: false });

// 3. Save the connection to the global object ONLY in development mode.
if (process.env.NODE_ENV !== "production") {
  globalForDb.conn = conn;
}

export const db = drizzle(conn, { schema });
