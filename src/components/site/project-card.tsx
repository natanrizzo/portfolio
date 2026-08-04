import { ArrowRight, CodeSquare, Structure } from "@solar-icons/react/ssr";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import type { PublishedProject } from "@/db/queries";
import { cn } from "@/lib/utils";

import { CloudinaryImage } from "./cloudinary-image";

export function ProjectCard({
  project,
  priority = false,
  className,
}: {
  project: PublishedProject;
  priority?: boolean;
  className?: string;
}) {
  const tags = project.tags.map((relation) => relation.tag).slice(0, 4);

  return (
    <article
      className={cn(
        "surface-shell group relative h-full transition-all duration-700 ease-[var(--ease-out-quint)] hover:-translate-y-1 hover:border-strong hover:shadow-[var(--shadow-high)]",
        className,
      )}
    >
      <div className="surface-core flex h-full flex-col overflow-hidden">
        {project.coverPublicId ? (
          <div className="relative aspect-16/10 overflow-hidden bg-surface-sunken">
            <CloudinaryImage
              publicId={project.coverPublicId}
              alt={project.coverAlt ?? project.title}
              width={1000}
              height={625}
              priority={priority}
              className="size-full object-cover transition-transform duration-700 ease-[var(--ease-out-quint)] group-hover:scale-[1.035]"
            />
            <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-[color-mix(in_srgb,var(--surface-sunken)_34%,transparent)] to-transparent opacity-70" />
          </div>
        ) : (
          <div className="relative grid aspect-16/10 place-items-center overflow-hidden bg-surface-sunken">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_40%,color-mix(in_srgb,var(--accent)_18%,transparent),transparent_42%)]" />
            <Structure
              size={58}
              weight="Linear"
              className="relative text-accent transition-transform duration-700 ease-[var(--ease-out-quint)] group-hover:rotate-6 group-hover:scale-110"
            />
          </div>
        )}

        <div className="flex flex-1 flex-col gap-5 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-5">
            <div className="min-w-0">
              <h3 className="font-display text-xl font-semibold tracking-[-0.035em] text-primary sm:text-2xl">
                <Link
                  href={`/projects/${project.slug}`}
                  className="after:absolute after:inset-0"
                >
                  {project.title}
                </Link>
              </h3>
              <p className="mt-2 max-w-[58ch] text-sm leading-6 text-secondary">
                {project.summary}
              </p>
            </div>
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-surface-sunken text-secondary transition-all duration-500 ease-[var(--ease-out-quint)] group-hover:bg-accent group-hover:text-accent-fg">
              <ArrowRight
                size={17}
                weight="Linear"
                className="transition-transform duration-500 ease-[var(--ease-out-quint)] group-hover:translate-x-0.5"
              />
            </span>
          </div>

          <div className="mt-auto flex flex-wrap items-end justify-between gap-4">
            {tags.length > 0 ? (
              <ul className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <li key={tag.id}>
                    <Badge variant="outline">{tag.name}</Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <span />
            )}
            {project.repoUrl ? (
              <CodeSquare size={18} weight="Linear" className="text-secondary" />
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
