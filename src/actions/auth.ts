"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/current-user";
import {
  getDummyDigest,
  hashPassword,
  verifyPassword,
} from "@/lib/auth/hashing";
import {
  createSessionCookie,
  destroySessionCookie,
} from "@/lib/auth/session";
import { loginSchema, passwordChangeSchema } from "@/lib/validations";

export type ActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string[]>;
  /**
   * Rota para onde o cliente deve navegar depois do sucesso. Usado quando a
   * action precisa devolver o controle ao navegador antes da troca de página,
   * em vez de chamar `redirect` no servidor.
   */
  redirectTo?: string;
};

/**
 * Only allow relative paths, so `?next=` cannot be used as an open redirect.
 */
function safeRedirect(target: FormDataEntryValue | null) {
  const value = typeof target === "string" ? target : "";
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  return "/admin";
}

export async function login(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const user = await db.query.adminUsers.findFirst({
    where: eq(adminUsers.email, parsed.data.email),
  });

  // Always run a hash comparison so a missing user and a wrong password take
  // roughly the same time, which avoids leaking which emails exist.
  const digest = user?.passwordHash ?? (await getDummyDigest());
  const valid = await verifyPassword(digest, parsed.data.password);

  if (!user || !valid) {
    return { error: "E-mail ou senha incorretos." };
  }

  await createSessionCookie({
    userId: user.id,
    email: user.email,
    sessionVersion: user.sessionVersion,
  });

  redirect(safeRedirect(formData.get("next")));
}

export async function logout() {
  await destroySessionCookie();
  redirect("/login");
}

export async function changePassword(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Sessão expirada. Entre novamente." };

  const parsed = passwordChangeSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const row = await db.query.adminUsers.findFirst({
    where: eq(adminUsers.id, user.id),
  });
  if (!row) return { error: "Usuário não encontrado." };

  const valid = await verifyPassword(
    row.passwordHash,
    parsed.data.currentPassword,
  );
  if (!valid) {
    return { fieldErrors: { currentPassword: ["Senha atual incorreta"] } };
  }

  const nextVersion = row.sessionVersion + 1;
  await db
    .update(adminUsers)
    .set({
      passwordHash: await hashPassword(parsed.data.newPassword),
      sessionVersion: nextVersion,
      updatedAt: new Date(),
    })
    .where(eq(adminUsers.id, user.id));

  // Re-issue the cookie with the new version, otherwise the current tab would
  // be logged out along with every other session.
  await createSessionCookie({
    userId: row.id,
    email: row.email,
    sessionVersion: nextVersion,
  });

  return { success: "Senha atualizada. As outras sessões foram encerradas." };
}
