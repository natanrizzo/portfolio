import { sql } from "drizzle-orm";

import { db } from "@/db";

export const dynamic = "force-dynamic";

/**
 * Used by the Docker healthcheck and by the deploy workflow to decide whether
 * the new container came up correctly. Touches the database on purpose: an app
 * that cannot reach Postgres is not healthy, even if it serves HTML.
 */
export async function GET() {
  try {
    await db.execute(sql`select 1`);
    return Response.json({ status: "ok" });
  } catch {
    return Response.json({ status: "degraded" }, { status: 503 });
  }
}
