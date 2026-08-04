"use client";

import { TrashBinMinimalistic } from "@solar-icons/react";
import { CldImage } from "next-cloudinary";
import { useActionState } from "react";

import type { ActionState } from "@/actions/auth";
import { addProjectImage, deleteProjectImage } from "@/actions/projects";
import { Alert } from "@/components/admin/alert";
import { ImageUploader } from "@/components/admin/image-uploader";
import { SubmitButton } from "@/components/admin/submit-button";
import { Field, Input } from "@/components/ui/field";
import type { ProjectImage } from "@/db/schema";

const initialState: ActionState = {};

export function ProjectGallery({
  projectId,
  images,
}: {
  projectId: string;
  images: ProjectImage[];
}) {
  const [state, formAction] = useActionState(addProjectImage, initialState);

  return (
    <section className="flex flex-col gap-5 rounded-card border border-subtle bg-surface-elevated p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-medium text-primary">Galeria</h2>
        <p className="text-sm text-secondary">
          Telas adicionais mostradas abaixo da descrição do projeto.
        </p>
      </div>

      {images.length > 0 ? (
        <ul className="grid gap-3 sm:grid-cols-3">
          {images.map((image) => (
            <li
              key={image.id}
              className="group relative overflow-hidden rounded-control border border-subtle bg-surface-sunken"
            >
              <CldImage
                src={image.publicId}
                alt={image.alt ?? "Imagem do projeto"}
                width={400}
                height={250}
                crop="fill"
                gravity="auto"
                format="auto"
                quality="auto"
                className="aspect-16/10 w-full object-cover"
              />
              <form action={deleteProjectImage}>
                <input type="hidden" name="imageId" value={image.id} />
                <input type="hidden" name="projectId" value={projectId} />
                <button
                  type="submit"
                  aria-label="Remover imagem"
                  className="absolute top-2 right-2 grid size-8 place-items-center rounded-full bg-[color-mix(in_srgb,var(--surface)_82%,transparent)] text-danger opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100 focus-visible:opacity-100"
                >
                  <TrashBinMinimalistic size={15} weight="Linear" />
                </button>
              </form>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-control border border-dashed border-strong px-4 py-8 text-center text-sm text-secondary">
          Nenhuma imagem na galeria ainda.
        </p>
      )}

      <form
        action={formAction}
        className="flex flex-col gap-4 border-t border-subtle pt-5"
      >
        <input type="hidden" name="projectId" value={projectId} />

        <ImageUploader
          name="publicId"
          label="Nova imagem"
          folder={`portfolio/projects/${projectId}`}
        />

        <Field
          label="Texto alternativo"
          htmlFor="alt"
          hint="Descreva o que a tela mostra."
          error={state.fieldErrors?.alt}
        >
          <Input id="alt" name="alt" />
        </Field>

        {state.error ? <Alert tone="error">{state.error}</Alert> : null}
        {state.success ? <Alert tone="success">{state.success}</Alert> : null}

        <SubmitButton variant="secondary" className="w-fit">
          Adicionar à galeria
        </SubmitButton>
      </form>
    </section>
  );
}
