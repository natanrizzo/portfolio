"use server";

import { requireUser } from "@/lib/auth/current-user";
import { createUploadSignature } from "@/lib/cloudinary";

/**
 * Hands the browser a short-lived signature for a direct Cloudinary upload.
 * Gated behind `requireUser`, so only the signed-in admin can obtain one.
 */
export async function getUploadSignature(folder?: string) {
  await requireUser();
  return createUploadSignature(folder);
}
