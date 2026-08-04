"use client";

import { useActionState } from "react";

import { changePassword, type ActionState } from "@/actions/auth";
import { Alert } from "@/components/admin/alert";
import { SubmitButton } from "@/components/admin/submit-button";
import { Field, Input } from "@/components/ui/field";

const initialState: ActionState = {};

export function PasswordForm() {
  const [state, formAction] = useActionState(changePassword, initialState);

  return (
    <form
      action={formAction}
      className="flex max-w-md flex-col gap-5 rounded-card border border-subtle bg-surface-elevated p-6"
    >
      <h2 className="text-sm font-medium text-primary">Trocar a senha</h2>

      <Field
        label="Senha atual"
        htmlFor="currentPassword"
        error={state.fieldErrors?.currentPassword}
      >
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
        />
      </Field>

      <Field
        label="Nova senha"
        htmlFor="newPassword"
        hint="Mínimo de 12 caracteres."
        error={state.fieldErrors?.newPassword}
      >
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          required
        />
      </Field>

      <Field
        label="Confirmar nova senha"
        htmlFor="confirmPassword"
        error={state.fieldErrors?.confirmPassword}
      >
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
        />
      </Field>

      {state.error ? <Alert tone="error">{state.error}</Alert> : null}
      {state.success ? <Alert tone="success">{state.success}</Alert> : null}

      <SubmitButton className="w-fit">Atualizar senha</SubmitButton>
    </form>
  );
}
