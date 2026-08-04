import "server-only";

import { v2 as cloudinary } from "cloudinary";

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

export const CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER ?? "portfolio";

export function assertCloudinaryConfigured() {
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary não está configurado. Defina NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY e CLOUDINARY_API_SECRET.",
    );
  }
}

/**
 * Builds a signature for a direct browser upload.
 *
 * The API secret never leaves the server: the browser receives only the
 * signature, timestamp and public api key, and Cloudinary rejects any upload
 * whose parameters do not match what we signed. Unsigned upload presets are
 * deliberately not used, since anyone could then push files into the account.
 */
export function createUploadSignature(folder: string = CLOUDINARY_FOLDER) {
  assertCloudinaryConfigured();

  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = { folder, timestamp };
  const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret!);

  return { signature, timestamp, folder, apiKey: apiKey!, cloudName: cloudName! };
}

export async function deleteUpload(publicId: string) {
  assertCloudinaryConfigured();
  await cloudinary.uploader.destroy(publicId, { invalidate: true });
}

export { cloudinary };
