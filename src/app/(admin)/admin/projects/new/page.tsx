import { ArrowLeft } from "@solar-icons/react/ssr";
import Link from "next/link";

import { ProjectWizard } from "@/components/admin/project-wizard";
import { getAllTags } from "@/db/queries";

export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  const tags = await getAllTags();

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
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-medium tracking-tight text-primary">
            Novo projeto
          </h1>
          <p className="text-sm text-secondary">
            O progresso fica salvo neste navegador — pode fechar a aba e voltar
            depois.
          </p>
        </div>
      </header>

      <ProjectWizard tags={tags} />
    </div>
  );
}
