import "server-only";

import { asc, desc, eq } from "drizzle-orm";
import { cache } from "react";

import { db } from "@/db";
import { profile, projectImages, projects } from "@/db/schema";

/**
 * `position` manda, e o admin a define arrastando os cards. O desempate por
 * data de criação é o que faz um projeto recém-criado nascer na frente — a
 * mesma regra que a listagem do admin usa, senão arrastar lá mudaria a ordem
 * daqui de um jeito diferente do que a tela mostrou.
 */
export const getPublishedProjects = cache(async () => {
  return db.query.projects.findMany({
    where: eq(projects.status, "published"),
    orderBy: [asc(projects.position), desc(projects.createdAt)],
    with: {
      tags: { with: { tag: true } },
    },
  });
});

export const getFeaturedProjects = cache(async () => {
  const all = await getPublishedProjects();
  return all.filter((project) => project.featured);
});

export const getProjectBySlug = cache(async (slug: string) => {
  return db.query.projects.findFirst({
    where: eq(projects.slug, slug),
    with: {
      images: { orderBy: [asc(projectImages.position)] },
      tags: { with: { tag: true } },
    },
  });
});

export const getPublishedSlugs = cache(async () => {
  return db
    .select({ slug: projects.slug, updatedAt: projects.updatedAt })
    .from(projects)
    .where(eq(projects.status, "published"));
});

export const getProfile = cache(async () => {
  return db.query.profile.findFirst({ where: eq(profile.id, 1) });
});

/** Admin listing includes drafts. */
export const getAllProjects = cache(async () => {
  return db.query.projects.findMany({
    orderBy: [asc(projects.position), desc(projects.createdAt)],
    with: { tags: { with: { tag: true } } },
  });
});

export const getProjectById = cache(async (id: string) => {
  return db.query.projects.findFirst({
    where: eq(projects.id, id),
    with: {
      images: { orderBy: [asc(projectImages.position)] },
      tags: { with: { tag: true } },
    },
  });
});

export const getAllTags = cache(async () => {
  return db.query.techTags.findMany({
    orderBy: (tags, { asc: ascending }) => [ascending(tags.name)],
  });
});

export type PublishedProject = Awaited<
  ReturnType<typeof getPublishedProjects>
>[number];
export type ProjectDetail = NonNullable<
  Awaited<ReturnType<typeof getProjectBySlug>>
>;
