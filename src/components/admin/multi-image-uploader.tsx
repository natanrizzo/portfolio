"use client";

import {
  GalleryAdd,
  MenuDots,
  TrashBinMinimalistic,
  UploadMinimalistic,
} from "@solar-icons/react";
import { CldImage } from "next-cloudinary";
import { useRef } from "react";

import { Input } from "@/components/ui/field";
import { moveItem, useDragReorder } from "@/lib/use-drag-reorder";
import {
  ACCEPTED_IMAGE_TYPES,
  useCloudinaryUpload,
} from "@/lib/use-cloudinary-upload";
import { cn } from "@/lib/utils";

export type GalleryDraftImage = {
  publicId: string;
  alt: string;
};

type Props = {
  value: GalleryDraftImage[];
  onChange: (next: GalleryDraftImage[]) => void;
  folder?: string;
  max?: number;
};

/**
 * Galeria do projeto ainda em rascunho: as imagens já vão para o Cloudinary,
 * mas as linhas de `project_images` só nascem quando o projeto é criado, então
 * a lista vive no estado do formulário até lá.
 */
export function MultiImageUploader({
  value,
  onChange,
  folder,
  max = 12,
}: Props) {
  const { upload, progress, isUploading, error } = useCloudinaryUpload(folder);
  const inputRef = useRef<HTMLInputElement>(null);

  const dnd = useDragReorder({
    count: value.length,
    onMove: (from, to) => onChange(moveItem(value, from, to)),
  });

  const remaining = max - value.length;

  async function handleFiles(files: File[]) {
    // Sequencial de propósito: o Cloudinary limita uploads simultâneos por
    // conta e a barra de progresso só sabe descrever um envio por vez.
    const uploaded: GalleryDraftImage[] = [];
    for (const file of files.slice(0, remaining)) {
      const publicId = await upload(file);
      if (publicId) uploaded.push({ publicId, alt: "" });
    }
    if (uploaded.length > 0) onChange([...value, ...uploaded]);
  }

  return (
    <div className="flex flex-col gap-3">
      {value.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {value.map((image, index) => (
            <li
              key={image.publicId}
              {...dnd.itemProps(index)}
              className={cn(
                "flex items-center gap-3 rounded-control border border-subtle bg-surface-elevated p-2.5 transition-[opacity,border-color] duration-200",
                dnd.dragIndex === index && "border-accent opacity-50",
              )}
            >
              <button
                type="button"
                {...dnd.handleProps(index)}
                aria-label={`Mover imagem ${index + 1}. Use as setas para reordenar.`}
                className="grid size-8 shrink-0 cursor-grab place-items-center rounded-[9px] text-muted transition-colors hover:bg-surface-sunken hover:text-primary active:cursor-grabbing"
              >
                <MenuDots size={16} weight="Bold" className="rotate-90" />
              </button>

              <div className="size-14 shrink-0 overflow-hidden rounded-[10px] bg-surface-sunken">
                <CldImage
                  src={image.publicId}
                  alt=""
                  width={112}
                  height={112}
                  crop="fill"
                  gravity="auto"
                  format="auto"
                  quality="auto"
                  className="size-full object-cover"
                />
              </div>

              <Input
                value={image.alt}
                placeholder="Texto alternativo: o que a tela mostra"
                onChange={(event) =>
                  onChange(
                    value.map((item, position) =>
                      position === index
                        ? { ...item, alt: event.target.value }
                        : item,
                    ),
                  )
                }
                className="py-2"
              />

              <button
                type="button"
                onClick={() =>
                  onChange(value.filter((_, position) => position !== index))
                }
                aria-label="Remover imagem"
                className="grid size-9 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-danger-soft hover:text-danger"
              >
                <TrashBinMinimalistic size={15} weight="Linear" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {remaining > 0 ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="flex w-full flex-col items-center gap-1.5 rounded-control border border-dashed border-strong px-4 py-8 text-secondary transition-colors duration-300 hover:border-accent hover:text-primary disabled:opacity-60"
        >
          {isUploading ? (
            <>
              <UploadMinimalistic size={20} weight="Linear" />
              <span className="text-sm">Enviando, {progress}%</span>
            </>
          ) : (
            <>
              <GalleryAdd size={20} weight="Linear" />
              <span className="text-sm">
                {value.length > 0 ? "Adicionar mais imagens" : "Adicionar imagens"}
              </span>
              <span className="text-xs text-muted">
                Pode escolher várias de uma vez. Restam {remaining}.
              </span>
            </>
          )}
        </button>
      ) : (
        <p className="text-xs text-muted">
          Limite de {max} imagens na galeria.
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        className="hidden"
        onChange={async (event) => {
          const files = Array.from(event.target.files ?? []);
          event.target.value = "";
          if (files.length > 0) await handleFiles(files);
        }}
      />

      {error ? (
        <p className="text-xs text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
