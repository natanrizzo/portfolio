"use client";

import { TrashBinMinimalistic } from "@solar-icons/react";
import { useActionState } from "react";

import type { ActionState } from "@/actions/auth";
import { createTag, deleteTag } from "@/actions/profile";
import { Alert } from "@/components/admin/alert";
import { SubmitButton } from "@/components/admin/submit-button";
import { Field, Input } from "@/components/ui/field";
import { IconPicker, TechIconMark } from "@/components/ui/icon-picker";
import type { TechTag } from "@/db/schema";

const initialState: ActionState = {};

export function TagManager({ tags }: { tags: TechTag[] }) {
  const [state, formAction] = useActionState(createTag, initialState);

  return (
    <div className="flex flex-col gap-6">
      <form
        action={formAction}
        className="flex flex-col gap-5 rounded-card border border-subtle bg-surface-elevated p-6"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Nome" htmlFor="name" error={state.fieldErrors?.name}>
            <Input id="name" name="name" placeholder="TypeScript" required />
          </Field>

          <Field
            label="Ícone"
            htmlFor="iconSlug"
            hint="Opcional. Busque pelo nome da marca ou pelo que ela faz."
            error={state.fieldErrors?.iconSlug}
          >
            <IconPicker id="iconSlug" name="iconSlug" />
          </Field>
        </div>

        {state.error ? <Alert tone="error">{state.error}</Alert> : null}
        {state.success ? <Alert tone="success">{state.success}</Alert> : null}

        <SubmitButton className="w-fit">Adicionar tecnologia</SubmitButton>
      </form>

      {tags.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <li key={tag.id}>
              <form action={deleteTag} className="contents">
                <input type="hidden" name="id" value={tag.id} />
                <span className="inline-flex items-center gap-2 rounded-full border border-subtle bg-surface-elevated py-1.5 pr-1.5 pl-1.5 text-sm text-secondary">
                  {tag.iconSlug ? (
                    <TechIconMark slug={tag.iconSlug} size={16} />
                  ) : (
                    <span className="size-7 rounded-[9px] bg-surface-sunken" />
                  )}
                  {tag.name}
                  <button
                    type="submit"
                    aria-label={`Remover ${tag.name}`}
                    className="grid size-6 place-items-center rounded-full text-muted transition-colors hover:bg-danger-soft hover:text-danger"
                  >
                    <TrashBinMinimalistic size={13} weight="Linear" />
                  </button>
                </span>
              </form>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-card border border-dashed border-strong px-6 py-10 text-center text-sm text-secondary">
          Nenhuma tecnologia cadastrada ainda.
        </p>
      )}
    </div>
  );
}
