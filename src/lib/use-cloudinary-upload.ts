"use client";

import { useCallback, useState } from "react";

import { getUploadSignature } from "@/actions/uploads";

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

/**
 * Envia o arquivo direto do navegador para o Cloudinary com uma assinatura
 * emitida no servidor, então o segredo da API nunca chega ao cliente. Só o
 * public id volta para quem chamou.
 *
 * O XHR existe por causa do progresso: `fetch` ainda não expõe upload progress.
 */
export function useCloudinaryUpload(folder?: string) {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(
    async (file: File): Promise<string | null> => {
      setError(null);

      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        setError("Use uma imagem JPG, PNG, WebP ou AVIF.");
        return null;
      }
      if (file.size > MAX_UPLOAD_BYTES) {
        setError("A imagem precisa ter no máximo 10 MB.");
        return null;
      }

      setIsUploading(true);
      setProgress(0);

      try {
        const signed = await getUploadSignature(folder);

        const body = new FormData();
        body.append("file", file);
        body.append("api_key", signed.apiKey);
        body.append("timestamp", String(signed.timestamp));
        body.append("signature", signed.signature);
        body.append("folder", signed.folder);

        return await new Promise<string>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open(
            "POST",
            `https://api.cloudinary.com/v1_1/${signed.cloudName}/image/upload`,
          );
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              setProgress(Math.round((event.loaded / event.total) * 100));
            }
          };
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(JSON.parse(xhr.responseText).public_id as string);
            } else {
              reject(new Error("Falha no upload"));
            }
          };
          xhr.onerror = () => reject(new Error("Falha de rede no upload"));
          xhr.send(body);
        });
      } catch {
        setError("Não foi possível enviar a imagem. Tente novamente.");
        return null;
      } finally {
        setIsUploading(false);
        setProgress(0);
      }
    },
    [folder],
  );

  return { upload, progress, isUploading, error, setError };
}
