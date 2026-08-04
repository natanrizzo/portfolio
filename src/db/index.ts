import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

type Database = PostgresJsDatabase<typeof schema>;

/**
 * Next dev reloads modules on every change, and each reload would otherwise
 * open a fresh pool. Cache the client on globalThis so there is one per process.
 */
const globalForDb = globalThis as unknown as {
  pgClient?: ReturnType<typeof postgres>;
  drizzleDb?: Database;
};

function createDatabase(): Database {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL não está definida. Copie .env.example para .env.local e preencha.",
    );
  }

  const client =
    globalForDb.pgClient ??
    postgres(connectionString, {
      max: process.env.NODE_ENV === "production" ? 10 : 3,
      idle_timeout: 20,
    });

  if (process.env.NODE_ENV !== "production") globalForDb.pgClient = client;

  return drizzle(client, { schema });
}

/**
 * Connection is created on first use, not on import.
 *
 * This matters for the Docker build: the image is built in CI where the
 * production database is unreachable and DATABASE_URL is unset. Next imports
 * every module while building, so connecting eagerly here would fail the build.
 */
export const db = new Proxy({} as Database, {
  get(_target, property) {
    globalForDb.drizzleDb ??= createDatabase();
    const value = Reflect.get(globalForDb.drizzleDb, property);
    // Bind to the real instance: Drizzle's classes use private fields, which
    // throw if a method is invoked with the proxy as `this`.
    return typeof value === "function"
      ? value.bind(globalForDb.drizzleDb)
      : value;
  },
});

export { schema };
