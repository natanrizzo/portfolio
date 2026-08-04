import {
  ArrowRightUp,
  CodeSquare,
  DocumentText,
  Letter,
  LinkRound,
} from "@solar-icons/react/ssr";
import type { Metadata } from "next";
import Image from "next/image";

import { CloudinaryImage } from "@/components/site/cloudinary-image";
import { Markdown } from "@/components/site/markdown";
import { Reveal } from "@/components/site/reveal";
import { getProfile } from "@/db/queries";
import { githubProfile } from "@/lib/github-profile";
import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sobre",
  description: `Quem é ${siteConfig.name} e como entrar em contato.`,
};

export default async function AboutPage() {
  const profile = await getProfile();

  const contacts = [
    {
      href: profile?.githubUrl ?? githubProfile.url,
      label: "GitHub",
      detail: "Código e projetos abertos",
      Icon: CodeSquare,
    },
    profile?.linkedinUrl && {
      href: profile.linkedinUrl,
      label: "LinkedIn",
      detail: "Perfil profissional",
      Icon: LinkRound,
    },
    profile?.email && {
      href: `mailto:${profile.email}`,
      label: "E-mail",
      detail: profile.email,
      Icon: Letter,
    },
    profile?.resumeUrl && {
      href: profile.resumeUrl,
      label: "Currículo",
      detail: "Experiência e formação",
      Icon: DocumentText,
    },
  ].filter(Boolean) as {
    href: string;
    label: string;
    detail: string;
    Icon: typeof CodeSquare;
  }[];

  return (
    <div className="page-shell pb-12 pt-32 md:pb-20 md:pt-40">
      <header className="max-w-4xl">
        <h1 className="font-display text-[clamp(3.5rem,9vw,8rem)] leading-[0.84] font-medium tracking-[-0.08em] text-primary">
          Sobre o trabalho e quem o faz.
        </h1>
        <p className="mt-8 max-w-[54ch] text-base leading-7 text-secondary md:text-lg">
          Engenharia cuidadosa, curiosidade constante e uma obsessão saudável por interfaces que parecem simples.
        </p>
      </header>

      <section className="grid gap-12 py-20 md:grid-cols-12 md:py-28">
        <Reveal className="md:col-span-5">
          <div className="sticky top-28">
            <div className="surface-shell mx-auto max-w-md">
              <div className="surface-core relative aspect-4/5 overflow-hidden">
                {profile?.avatarPublicId ? (
                  <CloudinaryImage
                    publicId={profile.avatarPublicId}
                    alt={siteConfig.name}
                    width={720}
                    height={900}
                    priority
                    sizes="(max-width: 768px) 90vw, 38vw"
                    className="size-full object-cover grayscale-[18%]"
                  />
                ) : (
                  <Image
                    src="/images/hero-sculpture.png"
                    alt="Escultura abstrata em metal e vidro"
                    fill
                    priority
                    sizes="(max-width: 768px) 90vw, 38vw"
                    className="object-cover"
                  />
                )}
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.08} className="md:col-span-6 md:col-start-7">
          <div className="pt-2 md:pt-16">
            <h2 className="font-display text-3xl font-semibold tracking-[-0.045em] text-primary md:text-4xl">
              Olá, eu sou {siteConfig.name.split(" ")[0]}.
            </h2>
            <div className="mt-7">
              {profile?.bio ? (
                <Markdown content={profile.bio} />
              ) : (
                <div className="space-y-5 text-base leading-8 text-secondary">
                  <p>
                    Desenvolvo produtos web de ponta a ponta, conectando arquitetura, performance e experiência de uso em uma entrega coerente.
                  </p>
                  <p>
                    Gosto de transformar problemas complexos em sistemas claros, confiáveis e fáceis de manter.
                  </p>
                </div>
              )}
            </div>
          </div>
        </Reveal>
      </section>

      <section id="github" className="scroll-mt-28 py-20 md:py-28">
        <Reveal>
          <div className="grid gap-10 md:grid-cols-12 md:gap-8">
            <div className="md:col-span-5">
              <p className="font-mono text-[0.68rem] tracking-[0.14em] text-accent uppercase">
                Open source / {githubProfile.username}
              </p>
              <h2 className="mt-4 max-w-[11ch] font-display text-[clamp(2.7rem,5vw,4.8rem)] leading-[0.92] font-medium tracking-[-0.065em] text-primary">
                Código também conta uma história.
              </h2>
              <p className="mt-6 max-w-[48ch] text-base leading-7 text-secondary">
                {githubProfile.introduction}
              </p>
              <p className="mt-4 max-w-[48ch] text-sm leading-6 text-muted">
                {githubProfile.currentFocus}
              </p>
              <a
                href={githubProfile.url}
                target="_blank"
                rel="noreferrer noopener"
                className="group mt-7 inline-flex items-center gap-2 text-sm font-semibold text-accent"
              >
                Ver perfil completo
                <ArrowRightUp
                  size={16}
                  weight="Linear"
                  className="transition-transform duration-500 ease-[var(--ease-out-quint)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </a>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 md:col-span-7">
              {githubProfile.repositories.map((repository, index) => (
                <Reveal key={repository.name} delay={0.05 + index * 0.04}>
                  <a
                    href={repository.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="group flex min-h-48 h-full flex-col rounded-card border border-subtle bg-surface-elevated p-5 shadow-[var(--shadow-low)] transition-all duration-700 ease-[var(--ease-out-quint)] hover:-translate-y-1 hover:border-strong hover:shadow-[var(--shadow-mid)]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <CodeSquare size={21} weight="Linear" className="text-accent" />
                      <ArrowRightUp
                        size={17}
                        weight="Linear"
                        className="text-secondary transition-transform duration-500 ease-[var(--ease-out-quint)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary"
                      />
                    </div>
                    <div className="mt-auto pt-8">
                      <h3 className="font-display text-lg font-semibold tracking-[-0.025em] text-primary">
                        {repository.name}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-secondary">
                        {repository.description}
                      </p>
                      <span className="mt-4 inline-flex rounded-full bg-surface-sunken px-2.5 py-1 font-mono text-[0.62rem] tracking-[0.04em] text-muted">
                        {repository.language}
                      </span>
                    </div>
                  </a>
                </Reveal>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <section id="contact" className="scroll-mt-28 py-20 md:py-28">
        <Reveal>
          <h2 className="max-w-[12ch] font-display text-[clamp(2.7rem,6vw,5.3rem)] leading-[0.92] font-medium tracking-[-0.065em] text-primary">
            Onde me encontrar.
          </h2>
        </Reveal>

        {contacts.length > 0 ? (
          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {contacts.map(({ href, label, detail, Icon }, index) => (
              <Reveal key={label} delay={index * 0.05}>
                <a
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noreferrer noopener" : undefined}
                  className="group flex min-h-36 items-end justify-between gap-5 rounded-card border border-subtle bg-surface-elevated p-5 shadow-[var(--shadow-low)] transition-all duration-700 ease-[var(--ease-out-quint)] hover:-translate-y-1 hover:border-strong hover:shadow-[var(--shadow-mid)] sm:p-6"
                >
                  <div>
                    <Icon size={22} weight="Linear" className="mb-8 text-accent" />
                    <h3 className="font-display text-lg font-semibold text-primary">{label}</h3>
                    <p className="mt-1 truncate text-xs text-secondary sm:max-w-56">{detail}</p>
                  </div>
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-surface-sunken text-secondary transition-all duration-500 ease-[var(--ease-out-quint)] group-hover:bg-accent group-hover:text-accent-fg">
                    <ArrowRightUp size={17} weight="Linear" />
                  </span>
                </a>
              </Reveal>
            ))}
          </div>
        ) : (
          <p className="mt-8 max-w-[48ch] text-base leading-7 text-secondary">
            Os canais de contato serão publicados em breve.
          </p>
        )}
      </section>
    </div>
  );
}
