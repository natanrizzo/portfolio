import { ArrowRight, Structure } from "@solar-icons/react/ssr";
import type { Metadata } from "next";
import Link from "next/link";

import { ProjectCard } from "@/components/site/project-card";
import { Reveal } from "@/components/site/reveal";
import { getPublishedProjects } from "@/db/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Projetos",
  description: "Projetos publicados, com contexto, repositório e tecnologias utilizadas.",
};

export default async function ProjectsPage() {
  const projects = await getPublishedProjects();

  return (
    <div className="page-shell pb-16 pt-32 md:pb-24 md:pt-40">
      <header className="max-w-4xl">
        <h1 className="font-display text-[clamp(3.8rem,10vw,8.5rem)] leading-[0.84] font-medium tracking-[-0.08em] text-primary">
          Projetos selecionados.
        </h1>
        <p className="mt-8 max-w-[54ch] text-base leading-7 text-secondary md:text-lg">
          Produtos digitais explicados por dentro: contexto, escolhas de engenharia e resultado final.
        </p>
      </header>

      {projects.length > 0 ? (
        <div className="mt-16 grid gap-5 md:grid-cols-2 md:mt-20">
          {projects.map((project, index) => (
            <Reveal
              key={project.id}
              delay={Math.min(index, 4) * 0.055}
              className={index % 5 === 0 ? "md:col-span-2" : undefined}
            >
              <ProjectCard project={project} priority={index < 2} />
            </Reveal>
          ))}
        </div>
      ) : (
        <div className="surface-shell mt-16 md:mt-20">
          <div className="surface-core flex min-h-80 flex-col items-start justify-end p-7 sm:p-10">
            <Structure size={38} weight="Linear" className="mb-auto text-accent" />
            <h2 className="font-display text-3xl font-semibold tracking-tight text-primary">
              A próxima história está sendo construída.
            </h2>
            <p className="mt-3 max-w-[50ch] text-sm leading-6 text-secondary">
              Novos estudos de caso serão publicados aqui com o contexto e as decisões de cada produto.
            </p>
            <Link
              href="/about"
              className="group mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent"
            >
              Saiba mais sobre mim
              <ArrowRight size={16} weight="Linear" className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
