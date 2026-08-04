/**
 * Creates (or updates) the single admin user and the profile row.
 *
 * Idempotent: running it twice does not duplicate anything, and re-running with
 * a different ADMIN_PASSWORD rotates the password and invalidates old sessions.
 *
 * Usage (local):  npm run db:seed
 * Usage (VPS):    docker compose run --rm migrate npx tsx scripts/seed.ts
 */
import { eq } from "drizzle-orm";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

import { adminUsers, profile } from "../src/db/schema";
import { hashPassword } from "../src/lib/auth/hashing";

async function main() {
  const url = process.env.DATABASE_URL;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? "Admin";

  if (!url) throw new Error("DATABASE_URL não definida.");
  if (!email || !password) {
    throw new Error(
      "Defina ADMIN_EMAIL e ADMIN_PASSWORD antes de rodar o seed.",
    );
  }
  if (password.length < 12) {
    throw new Error("ADMIN_PASSWORD precisa de ao menos 12 caracteres.");
  }

  const client = postgres(url, { max: 1 });
  const db = drizzle(client);

  const passwordHash = await hashPassword(password);
  const normalizedEmail = email.trim().toLowerCase();

  const existing = await db
    .select({ id: adminUsers.id, sessionVersion: adminUsers.sessionVersion })
    .from(adminUsers)
    .where(eq(adminUsers.email, normalizedEmail));

  if (existing.length > 0) {
    await db
      .update(adminUsers)
      .set({
        passwordHash,
        name,
        // Bumping the version logs out any session issued with the old password.
        sessionVersion: existing[0].sessionVersion + 1,
        updatedAt: new Date(),
      })
      .where(eq(adminUsers.id, existing[0].id));
    console.log(`Admin atualizado: ${normalizedEmail}`);
  } else {
    await db
      .insert(adminUsers)
      .values({ email: normalizedEmail, name, passwordHash });
    console.log(`Admin criado: ${normalizedEmail}`);
  }

  await db
    .insert(profile)
    .values({
      id: 1,
      headline: `${name}, desenvolvedor de software`,
      subheadline:
        "Construo produtos web do banco de dados à interface, com código aberto no GitHub.",
    })
    .onConflictDoNothing({ target: profile.id });

  await client.end();
  console.log("Seed concluído.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
