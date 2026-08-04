import "dotenv/config";

import { defineConfig } from "drizzle-kit";

/**
 * drizzle-kit does not read .env on its own, so we load it explicitly here.
 * `.env` is the single local env file: the Next dev server reads it too, and
 * docker compose only ever looks at `.env`. Keeping a separate `.env.local`
 * around causes the two to drift.
 *
 * `generate` only reads the schema and works without a database. `migrate` and
 * `studio` do connect, and fail loudly there if the URL is unset.
 */
export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgres://localhost:5432/placeholder",
  },
  strict: true,
  verbose: true,
});
