import { AddCircle } from "@solar-icons/react/ssr";
import Link from "next/link";

import { getAllProjects, getProfile } from "@/db/queries";
import { requireUser } from "@/lib/auth/current-user";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const user = await requireUser();
  const [projects, profile] = await Promise.all([
    getAllProjects(),
    getProfile(),
  ]);

  const published = projects.filter((p) => p.status === "published").length;
  const drafts = projects.length - published;

  const stats = [
    { label: "Publicados", value: published },
    { label: "Rascunhos", value: drafts },
    { label: "Total", value: projects.length },
  ];

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-medium tracking-tight text-primary">
            Olá, {user.name.split(" ")[0]}
          </h1>
          <p className="text-sm text-secondary">
            Gerencie os projetos que aparecem no site.
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

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="surface-shell"
          >
            <div className="surface-core p-5">
              <p className="font-display text-4xl font-semibold tracking-[-0.05em] text-primary">{stat.value}</p>
              <p className="mt-1 text-sm text-secondary">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {!profile ? (
        <div className="rounded-card border border-dashed border-strong bg-surface-sunken p-5">
          <h2 className="text-sm font-medium text-primary">
            Seu perfil ainda não foi preenchido
          </h2>
          <p className="mt-1 text-sm text-secondary">
            O título da home e a página Sobre usam esses dados.
          </p>
          <Link
            href="/admin/profile"
            className="mt-3 inline-block text-sm text-accent transition-opacity hover:opacity-80"
          >
            Preencher perfil
          </Link>
        </div>
      ) : null}
    </div>
  );
}
