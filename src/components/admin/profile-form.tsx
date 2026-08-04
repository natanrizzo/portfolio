"use client";

import { useActionState } from "react";

import type { ActionState } from "@/actions/auth";
import { updateProfile } from "@/actions/profile";
import { Alert } from "@/components/admin/alert";
import { ImageUploader } from "@/components/admin/image-uploader";
import { SubmitButton } from "@/components/admin/submit-button";
import { Checkbox, Field, Input, Textarea } from "@/components/ui/field";
import type { Profile } from "@/db/schema";

const initialState: ActionState = {};

export function ProfileForm({ profile }: { profile: Profile | null }) {
  const [state, formAction] = useActionState(updateProfile, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-8">
      <section className="flex flex-col gap-5 rounded-card border border-subtle bg-surface-elevated p-6">
        <Field
          label="Título principal"
          htmlFor="headline"
          hint="É o H1 da página inicial."
          error={state.fieldErrors?.headline}
        >
          <Input
            id="headline"
            name="headline"
            defaultValue={profile?.headline ?? ""}
            required
          />
        </Field>

        <Field
          label="Subtítulo"
          htmlFor="subheadline"
          hint="Uma frase curta abaixo do título. Até 20 palavras."
          error={state.fieldErrors?.subheadline}
        >
          <Textarea
            id="subheadline"
            name="subheadline"
            defaultValue={profile?.subheadline ?? ""}
            className="min-h-20"
          />
        </Field>

        <Field
          label="Biografia"
          htmlFor="bio"
          hint="Texto da página Sobre. Aceita Markdown."
          error={state.fieldErrors?.bio}
        >
          <Textarea
            id="bio"
            name="bio"
            defaultValue={profile?.bio ?? ""}
            className="min-h-48 font-mono text-[13px]"
          />
        </Field>

        <ImageUploader
          name="avatarPublicId"
          label="Foto"
          defaultPublicId={profile?.avatarPublicId}
          folder="portfolio/profile"
        />

        <Checkbox
          name="availableForWork"
          label="Mostrar que estou disponível para novos projetos"
          defaultChecked={profile?.availableForWork}
        />
      </section>

      <section className="flex flex-col gap-5 rounded-card border border-subtle bg-surface-elevated p-6">
        <h2 className="text-sm font-medium text-primary">Contato e links</h2>

        <Field label="E-mail" htmlFor="email" error={state.fieldErrors?.email}>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={profile?.email ?? ""}
          />
        </Field>

        <Field label="GitHub" htmlFor="githubUrl" error={state.fieldErrors?.githubUrl}>
          <Input
            id="githubUrl"
            name="githubUrl"
            type="url"
            placeholder="https://github.com/usuario"
            defaultValue={profile?.githubUrl ?? ""}
          />
        </Field>

        <Field
          label="LinkedIn"
          htmlFor="linkedinUrl"
          error={state.fieldErrors?.linkedinUrl}
        >
          <Input
            id="linkedinUrl"
            name="linkedinUrl"
            type="url"
            placeholder="https://linkedin.com/in/usuario"
            defaultValue={profile?.linkedinUrl ?? ""}
          />
        </Field>

        <Field label="Site" htmlFor="websiteUrl" error={state.fieldErrors?.websiteUrl}>
          <Input
            id="websiteUrl"
            name="websiteUrl"
            type="url"
            defaultValue={profile?.websiteUrl ?? ""}
          />
        </Field>

        <Field
          label="Currículo"
          htmlFor="resumeUrl"
          hint="Link para o PDF hospedado onde você preferir."
          error={state.fieldErrors?.resumeUrl}
        >
          <Input
            id="resumeUrl"
            name="resumeUrl"
            type="url"
            defaultValue={profile?.resumeUrl ?? ""}
          />
        </Field>
      </section>

      {state.error ? <Alert tone="error">{state.error}</Alert> : null}
      {state.success ? <Alert tone="success">{state.success}</Alert> : null}

      <SubmitButton className="w-fit">Salvar perfil</SubmitButton>
    </form>
  );
}
