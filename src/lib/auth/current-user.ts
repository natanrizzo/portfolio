import "server-only";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { cache } from "react";

import { db } from "@/db";
import { adminUsers } from "@/db/schema";

import { readSessionToken, verifySessionToken } from "./session";

/**
 * Resolves the signed-in admin, verifying the token AND the database row.
 * The middleware only checks the signature (Edge runtime cannot reach Postgres),
 * so this is the real authorization gate and every admin page/action uses it.
 *
 * `cache` dedupes the query across a single render pass.
 */
export const getCurrentUser = cache(async () => {
  const payload = await verifySessionToken(await readSessionToken());
  if (!payload) return null;

  const user = await db.query.adminUsers.findFirst({
    where: eq(adminUsers.id, payload.userId),
    columns: { id: true, email: true, name: true, sessionVersion: true },
  });

  if (!user) return null;
  // Password was rotated after this token was issued.
  if (user.sessionVersion !== payload.sessionVersion) return null;

  return user;
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
