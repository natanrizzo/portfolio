"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import type { ActionState } from "@/actions/auth";
import { updateProject } from "@/actions/projects";
import { Alert } from "@/components/admin/alert";
import { ImageUploader } from "@/components/admin/image-uploader";
import { SubmitButton } from "@/components/admin/submit-button";
import { TagPicker } from "@/components/admin/tag-picker";
import {
  Checkbox,
  Field,
  Input,
  NumberInput,
  Select,
  Textarea,
} from "@/components/ui/field";
import type { TechTag } from "@/db/schema";

type ProjectFormValues = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description: string | null;
  repoUrl: string | null;
  liveUrl: string | null;
  coverPublicId: string | null;
  coverAlt: string | null;
  status: "draft" | "published";
  featured: boolean;
  position: number;
  year: number | null;
  tagIds: string[];
};

const initialState: ActionState = {};

/**
 * Edição de um projeto que já existe. A criação passa pelo assistente em
 * `project-wizard.tsx`: aqui tudo aparece de uma vez, porque quem edita
 * costuma vir mexer num campo específico.
 */
export function ProjectForm({
  tags,
  project,
}: {
  tags: TechTag[];
  project: ProjectFormValues;
}) {
  const [state, formAction] = useActionState(updateProject, initialState);

  const [tagIds, setTagIds] = useState(project.tagIds);

  return (
    <form action={formAction} className="flex flex-col gap-8">
      <input type="hidden" name="id" value={project.id} />
      {/* A ordem não é mais editada aqui: ela vem do arrastar na listagem, e
          precisa trafegar intacta para o update não zerá-la. */}
      <input type="hidden" name="position" value={project.position} />

      <section className="flex flex-col gap-5 rounded-card border border-subtle bg-surface-elevated p-6">
        <Field label="Título" htmlFor="title" error={state.fieldErrors?.title}>
          <Input
            id="title"
            name="title"
            defaultValue={project.title}
            required
          />
        </Field>

        <Field
          label="Slug"
          htmlFor="slug"
          hint="Endereço público do projeto. Mudar isso quebra links já compartilhados."
          error={state.fieldErrors?.slug}
        >
          <Input id="slug" name="slug" defaultValue={project.slug} required />
        </Field>

        <Field
          label="Resumo"
          htmlFor="summary"
          hint="Aparece nos cards e na descrição para buscadores. Até 280 caracteres."
          error={state.fieldErrors?.summary}
        >
          <Textarea
            id="summary"
            name="summary"
            defaultValue={project.summary}
            maxLength={280}
            required
          />
        </Field>

        <Field
          label="Descrição"
          htmlFor="description"
          hint="Aceita Markdown: títulos, listas, links e blocos de código."
          error={state.fieldErrors?.description}
        >
          <Textarea
            id="description"
            name="description"
            defaultValue={project.description ?? ""}
            className="min-h-64 font-mono text-[13px]"
          />
        </Field>
      </section>

      <section className="flex flex-col gap-5 rounded-card border border-subtle bg-surface-elevated p-6">
        <h2 className="text-sm font-medium text-primary">Links</h2>

        <Field
          label="Repositório no GitHub"
          htmlFor="repoUrl"
          error={state.fieldErrors?.repoUrl}
        >
          <Input
            id="repoUrl"
            name="repoUrl"
            type="url"
            placeholder="https://github.com/usuario/repositorio"
            defaultValue={project.repoUrl ?? ""}
          />
        </Field>

        <Field label="Site publicado" htmlFor="liveUrl" error={state.fieldErrors?.liveUrl}>
          <Input
            id="liveUrl"
            name="liveUrl"
            type="url"
            placeholder="https://exemplo.com"
            defaultValue={project.liveUrl ?? ""}
          />
        </Field>
      </section>

      <section className="flex flex-col gap-5 rounded-card border border-subtle bg-surface-elevated p-6">
        <h2 className="text-sm font-medium text-primary">Capa</h2>

        <ImageUploader
          name="coverPublicId"
          label="Imagem de capa"
          defaultPublicId={project.coverPublicId}
        />

        <Field
          label="Texto alternativo da capa"
          htmlFor="coverAlt"
          hint="Descreva a imagem para leitores de tela."
          error={state.fieldErrors?.coverAlt}
        >
          <Input
            id="coverAlt"
            name="coverAlt"
            defaultValue={project.coverAlt ?? ""}
          />
        </Field>
      </section>

      <section className="flex flex-col gap-5 rounded-card border border-subtle bg-surface-elevated p-6">
        <TagPicker
          tags={tags}
          selected={tagIds}
          onChange={setTagIds}
          name="tagIds"
        />
      </section>

      <section className="flex flex-col gap-5 rounded-card border border-subtle bg-surface-elevated p-6">
        <h2 className="text-sm font-medium text-primary">Publicação</h2>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Status" htmlFor="status" error={state.fieldErrors?.status}>
            <Select
              id="status"
              name="status"
              defaultValue={project.status}
              options={[
                {
                  value: "draft",
                  label: "Rascunho",
                  description: "Invisível no site público",
                },
                {
                  value: "published",
                  label: "Publicado",
                  description: "Aparece na listagem e no sitemap",
                },
              ]}
            />
          </Field>

          <Field label="Ano" htmlFor="year" error={state.fieldErrors?.year}>
            <NumberInput
              id="year"
              name="year"
              defaultValue={project.year}
              min={1990}
              max={2100}
              placeholder="2026"
            />
          </Field>
        </div>

        <Checkbox
          name="featured"
          label="Destacar na página inicial"
          hint="Projetos em destaque aparecem na home, além da listagem."
          defaultChecked={project.featured}
        />
      </section>

      {state.error ? <Alert tone="error">{state.error}</Alert> : null}
      {state.success ? <Alert tone="success">{state.success}</Alert> : null}

      <div className="flex items-center gap-3">
        <SubmitButton>Salvar alterações</SubmitButton>
        <Link
          href="/admin/projects"
          className="rounded-full px-4 py-2 text-sm text-secondary transition-colors hover:text-primary"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}

export type { ProjectFormValues };
