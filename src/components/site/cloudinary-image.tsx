"use client";

import { CldImage } from "next-cloudinary";

/**
 * Thin wrapper over CldImage so every image in the project gets the same
 * delivery defaults: automatic format and quality, and a real intrinsic size
 * so the browser can reserve space (keeps CLS near zero).
 *
 * O `"use client"` é obrigatório: `next-cloudinary` não marca os próprios
 * módulos e o `CldImage` usa `useState` internamente, então sem a diretiva o
 * componente estoura em qualquer página renderizada no servidor.
 */
export function CloudinaryImage({
  publicId,
  alt,
  width,
  height,
  priority = false,
  sizes = "(max-width: 768px) 100vw, 50vw",
  className,
}: {
  publicId: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  return (
    <CldImage
      src={publicId}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
      format="auto"
      quality="auto"
      crop="fill"
      gravity="auto"
      className={className}
    />
  );
}
