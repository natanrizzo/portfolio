"use client";

import { ArrowRightUp, Logout } from "@solar-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { logout } from "@/actions/auth";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Início" },
  { href: "/admin/projects", label: "Projetos" },
  { href: "/admin/technologies", label: "Tecnologias" },
  { href: "/admin/profile", label: "Perfil" },
  { href: "/admin/account", label: "Conta" },
];

export function AdminNav({ userName }: { userName: string }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-[var(--z-sticky)] px-3 pt-3 sm:px-5 sm:pt-4">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 rounded-[1.25rem] border border-subtle bg-[color-mix(in_srgb,var(--surface-elevated)_86%,transparent)] px-3 py-3 shadow-[var(--shadow-mid)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:rounded-full sm:py-2">
        <nav className="flex items-center gap-1 overflow-x-auto">
          {links.map((link) => {
            const active =
              link.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-all duration-500 ease-[var(--ease-out-quint)]",
                  active
                    ? "bg-surface-sunken text-primary"
                    : "text-secondary hover:text-primary",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <span className="hidden text-xs text-muted md:inline">
            {userName}
          </span>
          <Link
            href="/"
            target="_blank"
            aria-label="Abrir o site publicado"
            className="grid size-10 place-items-center rounded-full text-secondary transition-all duration-500 hover:bg-surface-sunken hover:text-primary"
          >
            <ArrowRightUp size={17} weight="Linear" />
          </Link>
          <ThemeToggle />
          <form action={logout}>
            <button
              type="submit"
              aria-label="Sair"
              className="grid size-10 place-items-center rounded-full text-secondary transition-all duration-500 hover:bg-danger-soft hover:text-danger"
            >
              <Logout size={17} weight="Linear" />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
