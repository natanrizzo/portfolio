import {
  ArrowRightUp,
  CodeSquare,
  Global,
  Letter,
  LinkRound,
} from "@solar-icons/react/ssr";

import { getProfile } from "@/db/queries";
import { githubProfile } from "@/lib/github-profile";
import { siteConfig } from "@/lib/site-config";

export async function SiteFooter() {
  const profile = await getProfile();

  const links = [
    {
      href: profile?.githubUrl ?? githubProfile.url,
      label: "GitHub",
      Icon: CodeSquare,
    },
    profile?.linkedinUrl && {
      href: profile.linkedinUrl,
      label: "LinkedIn",
      Icon: LinkRound,
    },
    profile?.websiteUrl && {
      href: profile.websiteUrl,
      label: "Site",
      Icon: Global,
    },
    profile?.email && {
      href: `mailto:${profile.email}`,
      label: "E-mail",
      Icon: Letter,
    },
  ].filter(Boolean) as {
    href: string;
    label: string;
    Icon: typeof CodeSquare;
  }[];

  return (
    <footer className="page-shell pb-5 pt-20 md:pt-28">
      <div className="overflow-hidden rounded-[2rem] bg-contrast px-6 py-8 text-contrast-text shadow-[var(--shadow-high)] sm:px-9 sm:py-10 md:px-12 md:py-12">
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="font-mono text-[0.68rem] tracking-[0.14em] text-contrast-muted uppercase">
              Disponível para boas ideias
            </p>
            <h2 className="mt-4 font-display text-[clamp(2.3rem,6vw,4.6rem)] leading-[0.95] font-medium tracking-[-0.065em] text-balance">
              Vamos construir algo que mereça existir.
            </h2>
          </div>

          {profile?.email ? (
            <a
              href={`mailto:${profile.email}`}
              className="group inline-flex h-14 w-fit items-center gap-4 rounded-full bg-accent py-1.5 pr-1.5 pl-6 text-sm font-semibold whitespace-nowrap text-accent-fg transition-transform duration-500 ease-[var(--ease-out-quint)] hover:scale-[1.025] active:scale-[0.98]"
            >
              Fale comigo
              <span className="grid size-11 place-items-center rounded-full bg-[color-mix(in_srgb,var(--accent-fg)_15%,transparent)]">
                <ArrowRightUp
                  size={17}
                  weight="Linear"
                  className="transition-transform duration-500 ease-[var(--ease-out-quint)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </span>
            </a>
          ) : null}
        </div>

        <div className="mt-14 flex flex-col gap-5 border-t border-contrast-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-contrast-muted">
            {siteConfig.name} &copy; {new Date().getFullYear()}
          </p>

          {links.length > 0 ? (
            <ul className="flex flex-wrap items-center gap-1">
              {links.map(({ href, label, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel={href.startsWith("http") ? "noreferrer noopener" : undefined}
                    aria-label={label}
                    className="grid size-10 place-items-center rounded-full text-contrast-muted transition-all duration-500 ease-[var(--ease-out-quint)] hover:bg-contrast-line hover:text-contrast-text"
                  >
                    <Icon size={18} weight="Linear" />
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
