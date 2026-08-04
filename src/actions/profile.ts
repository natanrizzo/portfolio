"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { profile, techTags } from "@/db/schema";
import { requireUser } from "@/lib/auth/current-user";
import { slugify, toErrorMessage } from "@/lib/utils";
import { profileSchema, tagSchema } from "@/lib/validations";

import type { ActionState } from "./auth";

export async function updateProfile(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const parsed = profileSchema.safeParse({
    headline: formData.get("headline"),
    subheadline: formData.get("subheadline"),
    bio: formData.get("bio"),
    avatarPublicId: formData.get("avatarPublicId"),
    resumeUrl: formData.get("resumeUrl"),
    email: formData.get("email"),
    githubUrl: formData.get("githubUrl"),
    linkedinUrl: formData.get("linkedinUrl"),
    websiteUrl: formData.get("websiteUrl"),
    availableForWork: formData.get("availableForWork") === "on",
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    // The profile is a single row pinned to id = 1.
    await db
      .insert(profile)
      .values({ id: 1, ...parsed.data })
      .onConflictDoUpdate({
        target: profile.id,
        set: { ...parsed.data, updatedAt: new Date() },
      });
  } catch (error) {
    return { error: toErrorMessage(error, "Não foi possível salvar o perfil.") };
  }

  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/admin/profile");
  return { success: "Perfil salvo." };
}

export async function createTag(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const parsed = tagSchema.safeParse({
    name: formData.get("name"),
    iconSlug: formData.get("iconSlug"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const slug = slugify(parsed.data.name);
  if (!slug) return { fieldErrors: { name: ["Nome inválido"] } };

  try {
    const existing = await db.query.techTags.findFirst({
      where: eq(techTags.slug, slug),
      columns: { id: true },
    });
    if (existing) return { fieldErrors: { name: ["Essa tecnologia já existe"] } };

    await db.insert(techTags).values({
      name: parsed.data.name,
      slug,
      // Sem ícone escolhido é sem ícone mesmo. Antes caía no slug da tag, o que
      // pedia um SVG que quase nunca existia no Simple Icons.
      iconSlug: parsed.data.iconSlug ?? null,
    });
  } catch (error) {
    return {
      error: toErrorMessage(error, "Não foi possível criar a tecnologia."),
    };
  }

  revalidatePath("/admin/technologies");
  return { success: "Tecnologia criada." };
}

export async function deleteTag(formData: FormData) {
  await requireUser();

  const id = formData.get("id");
  if (typeof id !== "string") return;

  // project_tags rows cascade, so projects simply lose the association.
  await db.delete(techTags).where(eq(techTags.id, id));
  revalidatePath("/admin/technologies");
  revalidatePath("/projects");
}
