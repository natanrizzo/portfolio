"use client";

import { Gallery, TrashBinMinimalistic, UploadMinimalistic } from "@solar-icons/react";
import { CldImage } from "next-cloudinary";
import { useRef, useState } from "react";

import {
  ACCEPTED_IMAGE_TYPES,
  useCloudinaryUpload,
} from "@/lib/use-cloudinary-upload";

type Props = {
  /**
   * Name of the hidden input carrying the public id into the parent form.
   * Omitido quando o pai já controla o valor por `onChange`.
   */
  name?: string;
  label: string;
  defaultPublicId?: string | null;
  folder?: string;
  /** Avisa o formulário pai quando a imagem muda, para o rascunho em cache. */
  onChange?: (publicId: string) => void;
};

/**
 * Uploads straight from the browser to Cloudinary using a signature minted on
 * the server, so the API secret never reaches the client. Only the resulting
 * public id is submitted with the surrounding form.
 */
export function ImageUploader({
  name,
  label,
  defaultPublicId,
  folder,
  onChange,
}: Props) {
  const [publicId, setPublicId] = useState(defaultPublicId ?? "");
  const { upload, progress, isUploading, error } = useCloudinaryUpload(folder);
  const inputRef = useRef<HTMLInputElement>(null);

  function apply(next: string) {
    setPublicId(next);
    onChange?.(next);
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-primary">{label}</span>
      {name ? <input type="hidden" name={name} value={publicId} /> : null}

      <div className="rounded-card border border-subtle bg-surface-elevated p-3">
        {publicId ? (
          <div className="flex flex-col gap-3">
            <div className="overflow-hidden rounded-control bg-surface-sunken">
              <CldImage
                src={publicId}
                alt="Pré-visualização"
                width={640}
                height={400}
                crop="fill"
                gravity="auto"
                format="auto"
                quality="auto"
                className="aspect-16/10 w-full object-cover"
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="truncate font-mono text-xs text-muted">
                {publicId}
              </span>
              <button
                type="button"
                onClick={() => apply("")}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-danger transition-colors hover:bg-danger-soft"
              >
                <TrashBinMinimalistic size={14} weight="Linear" />
                Remover
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="flex w-full flex-col items-center gap-2 rounded-control border border-dashed border-strong px-4 py-10 text-secondary transition-colors duration-300 hover:border-accent hover:text-primary disabled:opacity-60"
          >
            {isUploading ? (
              <>
                <UploadMinimalistic size={22} weight="Linear" />
                <span className="text-sm">Enviando, {progress}%</span>
              </>
            ) : (
              <>
                <Gallery size={22} weight="Linear" />
                <span className="text-sm">Escolher imagem</span>
                <span className="text-xs text-muted">
                  JPG, PNG, WebP ou AVIF, até 10 MB
                </span>
              </>
            )}
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(",")}
          className="hidden"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file) return;
            const uploaded = await upload(file);
            if (uploaded) apply(uploaded);
          }}
        />
      </div>

      {error ? (
        <p className="text-xs text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
