"use client";

import { useActionState } from "react";

import { login, type ActionState } from "@/actions/auth";
import { Alert } from "@/components/admin/alert";
import { SubmitButton } from "@/components/admin/submit-button";
import { Field, Input } from "@/components/ui/field";

const initialState: ActionState = {};

export function LoginForm({ next }: { next: string }) {
  const [state, formAction] = useActionState(login, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="next" value={next} />

      <Field label="E-mail" htmlFor="email" error={state.fieldErrors?.email}>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          autoFocus
        />
      </Field>

      <Field label="Senha" htmlFor="password" error={state.fieldErrors?.password}>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </Field>

      {state.error ? <Alert tone="error">{state.error}</Alert> : null}

      <SubmitButton className="w-full" pendingLabel="Entrando">
        Entrar
      </SubmitButton>
    </form>
  );
}
