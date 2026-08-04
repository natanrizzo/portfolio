"use server";

import { and, eq, inArray, max, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { projectImages, projects, projectTags } from "@/db/schema";
import { requireUser } from "@/lib/auth/current-user";
import { deleteUpload } from "@/lib/cloudinary";
import { toErrorMessage } from "@/lib/utils";
import {
  projectGallerySchema,
  projectImageSchema,
  projectOrderSchema,
  projectSchema,
} from "@/lib/validations";

import type { ActionState } from "./auth";

/** Revalidates every surface a project can appear on. */
function revalidateProject(slug?: string) {
  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/admin/projects");
  if (slug) revalidatePath(`/projects/${slug}`);
}

function parseProjectForm(formData: FormData) {
  return projectSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    summary: formData.get("summary"),
    description: formData.get("description"),
    repoUrl: formData.get("repoUrl"),
    liveUrl: formData.get("liveUrl"),
    coverPublicId: formData.get("coverPublicId"),
    coverAlt: formData.get("coverAlt"),
    status: formData.get("status"),
    featured: formData.get("featured") === "on",
    position: formData.get("position") || 0,
    year: formData.get("year") ?? "",
    tagIds: formData.getAll("tagIds").filter(Boolean),
  });
}

/**
 * A galeria do assistente de criação viaja como JSON num único campo, porque
 * as imagens já estão no Cloudinary mas ainda não têm um projeto a que se ligar.
 * Erro aqui sobe para o catch da action: perder silenciosamente uma imagem já
 * enviada seria pior do que falhar a criação.
 */
function parseGallery(raw: FormDataEntryValue | null) {
  if (typeof raw !== "string" || raw.trim() === "") return [];
  return projectGallerySchema.parse(JSON.parse(raw));
}

async function syncTags(projectId: string, tagIds: string[]) {
  await db.delete(projectTags).where(eq(projectTags.projectId, projectId));
  if (tagIds.length > 0) {
    await db
      .insert(projectTags)
      .values(tagIds.map((tagId) => ({ projectId, tagId })));
  }
}

export async function createProject(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const parsed = parseProjectForm(formData);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { tagIds, ...data } = parsed.data;
  let newId: string;

  try {
    const gallery = parseGallery(formData.get("gallery"));

    const existing = await db.query.projects.findFirst({
      where: eq(projects.slug, data.slug),
      columns: { id: true },
    });
    if (existing) {
      return { fieldErrors: { slug: ["Já existe um projeto com esse slug"] } };
    }

    newId = await db.transaction(async (tx) => {
      // O projeto novo entra na frente: empurra todo mundo uma casa para baixo
      // e assume a posição 0. Depois disso a ordem é ajustada arrastando na
      // listagem, e não por um campo numérico no formulário.
      await tx
        .update(projects)
        .set({ position: sql`${projects.position} + 1` });

      const [row] = await tx
        .insert(projects)
        .values({
          ...data,
          // Sobrescreve o que veio do formulário: a posição do recém-criado é
          // sempre o topo, não um número digitado.
          position: 0,
          publishedAt: data.status === "published" ? new Date() : null,
        })
        .returning({ id: projects.id });

      if (tagIds.length > 0) {
        await tx
          .insert(projectTags)
          .values(tagIds.map((tagId) => ({ projectId: row.id, tagId })));
      }

      if (gallery.length > 0) {
        await tx.insert(projectImages).values(
          gallery.map((image, index) => ({
            projectId: row.id,
            publicId: image.publicId,
            alt: image.alt ?? null,
            position: index,
          })),
        );
      }

      return row.id;
    });
  } catch (error) {
    return { error: toErrorMessage(error, "Não foi possível criar o projeto.") };
  }

  revalidateProject(data.slug);
  // Devolve o destino em vez de redirecionar aqui: o assistente precisa do
  // retorno para limpar o rascunho salvo no navegador antes de sair da página.
  return { success: "Projeto criado.", redirectTo: `/admin/projects/${newId}` };
}

export async function updateProject(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const id = formData.get("id");
  if (typeof id !== "string") return { error: "Projeto inválido." };

  const parsed = parseProjectForm(formData);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { tagIds, ...data } = parsed.data;

  try {
    const current = await db.query.projects.findFirst({
      where: eq(projects.id, id),
      columns: { slug: true, status: true, publishedAt: true },
    });
    if (!current) return { error: "Projeto não encontrado." };

    const clash = await db.query.projects.findFirst({
      where: eq(projects.slug, data.slug),
      columns: { id: true },
    });
    if (clash && clash.id !== id) {
      return { fieldErrors: { slug: ["Já existe um projeto com esse slug"] } };
    }

    await db
      .update(projects)
      .set({
        ...data,
        // Stamp publishedAt the first time it goes live, then leave it alone.
        publishedAt:
          data.status === "published"
            ? (current.publishedAt ?? new Date())
            : null,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, id));

    await syncTags(id, tagIds);

    if (current.slug !== data.slug) revalidatePath(`/projects/${current.slug}`);
  } catch (error) {
    return {
      error: toErrorMessage(error, "Não foi possível salvar o projeto."),
    };
  }

  revalidateProject(data.slug);
  return { success: "Projeto salvo." };
}

/**
 * Grava a ordem definida arrastando os cards na listagem do admin. Recebe os
 * ids já na ordem final e reescreve `position` como 0, 1, 2… — reindexar tudo
 * é mais barato do que tentar deduzir o delta de cada linha.
 */
export async function reorderProjects(orderedIds: string[]) {
  await requireUser();

  const parsed = projectOrderSchema.safeParse(orderedIds);
  if (!parsed.success) return { error: "Ordem inválida." };

  const ids = parsed.data;

  try {
    const known = await db
      .select({ id: projects.id })
      .from(projects)
      .where(inArray(projects.id, ids));

    if (known.length !== ids.length) {
      return { error: "A lista mudou. Recarregue a página." };
    }

    // Um único UPDATE com CASE, para não abrir uma ida ao banco por projeto.
    const cases = sql.join(
      ids.map(
        (id, index) =>
          // `index` é a posição no array, nunca entrada do usuário.
          sql`when ${projects.id} = ${id} then ${sql.raw(String(index))}`,
      ),
      sql` `,
    );

    await db
      .update(projects)
      .set({ position: sql`case ${cases} else ${projects.position} end` })
      .where(inArray(projects.id, ids));
  } catch (error) {
    return {
      error: toErrorMessage(error, "Não foi possível salvar a nova ordem."),
    };
  }

  revalidateProject();
  return { success: "Ordem salva." };
}

export async function deleteProject(formData: FormData) {
  await requireUser();

  const id = formData.get("id");
  if (typeof id !== "string") return;

  const project = await db.query.projects.findFirst({
    where: eq(projects.id, id),
    with: { images: true },
  });
  if (!project) return;

  // Remove the assets from Cloudinary before the rows disappear, otherwise the
  // public ids are lost and the files linger in the account forever.
  const publicIds = [
    project.coverPublicId,
    ...project.images.map((image) => image.publicId),
  ].filter((value): value is string => Boolean(value));

  await Promise.allSettled(publicIds.map((publicId) => deleteUpload(publicId)));

  // project_images and project_tags cascade on delete.
  await db.delete(projects).where(eq(projects.id, id));

  revalidateProject(project.slug);
  redirect("/admin/projects");
}

export async function addProjectImage(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const parsed = projectImageSchema.safeParse({
    projectId: formData.get("projectId"),
    publicId: formData.get("publicId"),
    alt: formData.get("alt"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    const [{ value: currentMax } = { value: null }] = await db
      .select({ value: max(projectImages.position) })
      .from(projectImages)
      .where(eq(projectImages.projectId, parsed.data.projectId));

    await db.insert(projectImages).values({
      ...parsed.data,
      position: (currentMax ?? -1) + 1,
    });
  } catch (error) {
    return {
      error: toErrorMessage(error, "Não foi possível adicionar a imagem."),
    };
  }

  revalidatePath(`/admin/projects/${parsed.data.projectId}`);
  revalidateProject();
  return { success: "Imagem adicionada." };
}

export async function deleteProjectImage(formData: FormData) {
  await requireUser();

  const id = formData.get("imageId");
  const projectId = formData.get("projectId");
  if (typeof id !== "string" || typeof projectId !== "string") return;

  const image = await db.query.projectImages.findFirst({
    where: and(
      eq(projectImages.id, id),
      eq(projectImages.projectId, projectId),
    ),
  });
  if (!image) return;

  await Promise.allSettled([deleteUpload(image.publicId)]);
  await db.delete(projectImages).where(eq(projectImages.id, id));

  revalidatePath(`/admin/projects/${projectId}`);
  revalidateProject();
}
