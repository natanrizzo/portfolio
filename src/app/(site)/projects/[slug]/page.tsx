import { ArrowLeft, ArrowRightUp, CodeSquare } from "@solar-icons/react/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CloudinaryImage } from "@/components/site/cloudinary-image";
import { Markdown } from "@/components/site/markdown";
import { Badge } from "@/components/ui/badge";
import { getProjectBySlug } from "@/db/queries";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project || project.status !== "published") return {};

  return {
    title: project.title,
    description: project.summary,
    openGraph: {
      title: project.title,
      description: project.summary,
      type: "article",
    },
  };
}

export default async function ProjectPage({
  params,
}: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project || project.status !== "published") notFound();

  const tags = project.tags.map((relation) => relation.tag);
  const published = formatDate(project.publishedAt);

  return (
    <article className="page-shell pb-16 pt-32 md:pb-24 md:pt-36">
      <Link
        href="/projects"
        className="group inline-flex items-center gap-2 text-sm font-semibold text-secondary transition-colors duration-500 hover:text-primary"
      >
        <ArrowLeft
          size={16}
          weight="Linear"
          className="transition-transform duration-500 ease-[var(--ease-out-quint)] group-hover:-translate-x-1"
        />
        Todos os projetos
      </Link>

      <header className="mt-10 max-w-5xl">
        <h1 className="font-display text-[clamp(3.4rem,8vw,7.8rem)] leading-[0.88] font-medium tracking-[-0.075em] text-balance text-primary">
          {project.title}
        </h1>
        <p className="mt-7 max-w-[62ch] text-lg leading-8 text-secondary md:text-xl">
          {project.summary}
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          {project.repoUrl ? (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-accent-fg transition-all duration-500 ease-[var(--ease-out-quint)] hover:bg-accent-hover active:scale-[0.98]"
            >
              <CodeSquare size={18} weight="Linear" />
              Ver código
            </a>
          ) : null}
          {project.liveUrl ? (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex h-12 items-center gap-2 rounded-full border border-subtle bg-surface-elevated px-5 text-sm font-semibold text-secondary shadow-[var(--shadow-low)] transition-all duration-500 ease-[var(--ease-out-quint)] hover:border-strong hover:text-primary"
            >
              <ArrowRightUp size={17} weight="Linear" />
              Visitar projeto
            </a>
          ) : null}
        </div>

        {tags.length > 0 || published || project.year ? (
          <div className="mt-9 flex flex-wrap items-center gap-2">
            {tags.map((tag) => (
              <Badge key={tag.id} variant="outline">{tag.name}</Badge>
            ))}
            {project.year ? (
              <Badge variant="neutral">{project.year}</Badge>
            ) : published ? (
              <Badge variant="neutral">{published}</Badge>
            ) : null}
          </div>
        ) : null}
      </header>

      {project.coverPublicId ? (
        <div className="surface-shell mt-12 md:mt-16">
          <div className="surface-core overflow-hidden">
            <CloudinaryImage
              publicId={project.coverPublicId}
              alt={project.coverAlt ?? project.title}
              width={1600}
              height={1000}
              priority
              sizes="(max-width: 1280px) 92vw, 1200px"
              className="aspect-16/10 w-full object-cover"
            />
          </div>
        </div>
      ) : null}

      {project.description ? (
        <div className="mx-auto mt-16 max-w-3xl md:mt-24">
          <Markdown content={project.description} />
        </div>
      ) : null}

      {project.images.length > 0 ? (
        <section className="mt-20 md:mt-28">
          <h2 className="font-display text-3xl font-semibold tracking-[-0.045em] text-primary md:text-4xl">
            Detalhes do produto
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {project.images.map((image, index) => (
              <div
                key={image.id}
                className={`surface-shell overflow-hidden ${index % 3 === 0 ? "md:col-span-2" : ""}`}
              >
                <div className="surface-core overflow-hidden">
                  <CloudinaryImage
                    publicId={image.publicId}
                    alt={image.alt ?? `${project.title}, imagem do projeto`}
                    width={1200}
                    height={750}
                    className="aspect-16/10 w-full object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
