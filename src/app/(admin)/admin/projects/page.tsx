import { AddCircle } from "@solar-icons/react/ssr";
import Link from "next/link";

import { ProjectSortableList } from "@/components/admin/project-sortable-list";
import { getAllProjects } from "@/db/queries";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const projects = await getAllProjects();

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-medium tracking-tight text-primary">
            Projetos
          </h1>
          <p className="text-sm text-secondary">
            Rascunhos ficam invisíveis no site público. A ordem daqui é a ordem
            do site.
          </p>
        </div>
        <Link
          href="/admin/projects/new"
          className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg transition-all duration-300 hover:bg-accent-hover active:scale-[0.98]"
        >
          <AddCircle size={17} weight="Bold" />
          Novo projeto
        </Link>
      </header>

      {projects.length > 0 ? (
        <ProjectSortableList
          projects={projects.map((project) => ({
            id: project.id,
            title: project.title,
            slug: project.slug,
            status: project.status,
            featured: project.featured,
          }))}
        />
      ) : (
        <div className="rounded-card border border-dashed border-strong bg-surface-sunken px-6 py-16 text-center">
          <h2 className="text-base font-medium text-primary">
            Nenhum projeto cadastrado
          </h2>
          <p className="mx-auto mt-1 max-w-[46ch] text-sm text-secondary">
            Crie o primeiro projeto para começar a montar o portfólio.
          </p>
          <Link
            href="/admin/projects/new"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg transition-all duration-300 hover:bg-accent-hover"
          >
            <AddCircle size={17} weight="Bold" />
            Novo projeto
          </Link>
        </div>
      )}
    </div>
  );
}
