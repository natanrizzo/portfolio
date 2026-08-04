import { ArrowLeft, ArrowRightUp } from "@solar-icons/react/ssr";
import Link from "next/link";
import { notFound } from "next/navigation";

import { deleteProject } from "@/actions/projects";
import { ProjectForm } from "@/components/admin/project-form";
import { ProjectGallery } from "@/components/admin/project-gallery";
import { getAllTags, getProjectById } from "@/db/queries";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({
  params,
}: PageProps<"/admin/projects/[id]">) {
  const { id } = await params;
  const [project, tags] = await Promise.all([getProjectById(id), getAllTags()]);

  if (!project) notFound();

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <Link
          href="/admin/projects"
          className="inline-flex w-fit items-center gap-2 text-sm text-secondary transition-colors hover:text-primary"
        >
          <ArrowLeft size={16} weight="Linear" />
          Projetos
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-medium tracking-tight text-primary">
            {project.title}
          </h1>
          {project.status === "published" ? (
            <Link
              href={`/projects/${project.slug}`}
              target="_blank"
              className="inline-flex items-center gap-2 rounded-full border border-subtle px-4 py-2 text-sm text-secondary transition-colors hover:text-primary"
            >
              <ArrowRightUp size={16} weight="Linear" />
              Ver publicado
            </Link>
          ) : null}
        </div>
      </header>

      <ProjectForm
        tags={tags}
        project={{
          id: project.id,
          title: project.title,
          slug: project.slug,
          summary: project.summary,
          description: project.description,
          repoUrl: project.repoUrl,
          liveUrl: project.liveUrl,
          coverPublicId: project.coverPublicId,
          coverAlt: project.coverAlt,
          status: project.status,
          featured: project.featured,
          position: project.position,
          year: project.year,
          tagIds: project.tags.map((relation) => relation.tag.id),
        }}
      />

      <ProjectGallery projectId={project.id} images={project.images} />

      <section className="rounded-card border border-danger-soft bg-danger-soft/40 p-6">
        <h2 className="text-sm font-medium text-primary">Excluir projeto</h2>
        <p className="mt-1 max-w-[60ch] text-sm text-secondary">
          Remove o projeto, as imagens no Cloudinary e as associações de
          tecnologia. Não há como desfazer.
        </p>
        <form action={deleteProject} className="mt-4">
          <input type="hidden" name="id" value={project.id} />
          <button
            type="submit"
            className="rounded-full border border-danger px-4 py-2 text-sm text-danger transition-colors duration-300 hover:bg-danger hover:text-surface-elevated"
          >
            Excluir definitivamente
          </button>
        </form>
      </section>
    </div>
  );
}
