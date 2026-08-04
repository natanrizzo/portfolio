import { ArrowRight, Code2, CursorSquare, Structure } from "@solar-icons/react/ssr";
import Image from "next/image";
import Link from "next/link";

import { CloudinaryImage } from "@/components/site/cloudinary-image";
import { HeroCopy, HeroVisualMotion } from "@/components/site/hero-motion";
import { ProjectCard } from "@/components/site/project-card";
import { Reveal } from "@/components/site/reveal";
import { TechMarquee } from "@/components/site/tech-marquee";
import { Badge } from "@/components/ui/badge";
import { CtaLink } from "@/components/ui/cta-link";
import {
  getAllTags,
  getFeaturedProjects,
  getProfile,
  getPublishedProjects,
} from "@/db/queries";
import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [profile, featured, published, tags] = await Promise.all([
    getProfile(),
    getFeaturedProjects(),
    getPublishedProjects(),
    getAllTags(),
  ]);

  const highlights = (featured.length > 0 ? featured : published).slice(0, 4);

  return (
    <>
      <section className="page-shell flex min-h-[100dvh] items-center pb-14 pt-28 md:pb-16 md:pt-24">
        <div className="grid w-full items-center gap-12 md:grid-cols-12 md:gap-8 lg:gap-14">
          <HeroCopy
            availability={profile?.availableForWork ? (
              <Badge variant="accent" className="mb-6 py-1.5 pr-3 pl-2">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-40" />
                  <span className="relative inline-flex size-2 rounded-full bg-accent" />
                </span>
                Disponível para novos projetos
              </Badge>
            ) : undefined}
            title={<h1 className="max-w-[15ch] font-display text-[clamp(3.35rem,6.1vw,6rem)] leading-[0.9] font-medium tracking-[-0.07em] text-balance text-primary">
              {profile?.headline ?? "Software com clareza, forma e propósito."}
            </h1>}
            description={<p className="mt-7 max-w-[52ch] text-base leading-7 text-secondary md:text-lg">
              {profile?.subheadline ??
                "Crio produtos digitais completos, da arquitetura à experiência que chega nas mãos das pessoas."}
            </p>}
            actions={<div className="mt-8 flex flex-wrap items-center gap-3">
              <CtaLink href="/projects">Explorar projetos</CtaLink>
              <Link
                href="/about"
                className="group inline-flex h-13 items-center gap-2 rounded-full px-5 text-sm font-semibold text-secondary transition-all duration-500 ease-[var(--ease-out-quint)] hover:bg-surface-sunken hover:text-primary active:scale-[0.98]"
              >
                Sobre mim
                <ArrowRight
                  size={16}
                  weight="Linear"
                  className="transition-transform duration-500 ease-[var(--ease-out-quint)] group-hover:translate-x-1"
                />
              </Link>
            </div>}
          />

          <div className="md:col-span-4 md:pl-2">
            <HeroVisualMotion>
              <div className="relative mx-auto max-w-[26rem]">
                <div className="absolute -inset-4 -rotate-3 rounded-[2.25rem] bg-accent-soft opacity-65" />
                <div className="surface-shell relative overflow-hidden p-1.5">
                  <div className="surface-core relative aspect-4/5 overflow-hidden bg-surface-sunken">
                    {profile?.avatarPublicId ? (
                      <CloudinaryImage
                        publicId={profile.avatarPublicId}
                        alt={siteConfig.name}
                        width={720}
                        height={900}
                        priority
                        sizes="(max-width: 768px) 88vw, 36vw"
                        className="size-full object-cover grayscale-[18%]"
                      />
                    ) : (
                      <Image
                        src="/images/hero-sculpture.png"
                        alt="Escultura abstrata em metal e vidro, visual de assinatura do portfólio"
                        fill
                        priority
                        sizes="(max-width: 768px) 88vw, 36vw"
                        className="object-cover"
                      />
                    )}
                    <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-[color-mix(in_srgb,var(--surface-sunken)_22%,transparent)] via-transparent to-transparent" />
                  </div>
                </div>
              </div>
            </HeroVisualMotion>
          </div>
        </div>
      </section>

      <TechMarquee tags={tags} />

      <section id="selected-work" className="page-shell scroll-mt-28 py-20 md:py-28">
        <Reveal>
          <div className="max-w-3xl">
            <h2 className="font-display text-[clamp(2.5rem,5vw,4.7rem)] leading-[0.95] font-medium tracking-[-0.065em] text-primary">
              Projetos que equilibram engenharia e experiência.
            </h2>
            <p className="mt-5 max-w-[56ch] text-base leading-7 text-secondary">
              Uma seleção de produtos construídos com decisões técnicas claras e atenção ao detalhe.
            </p>
          </div>
        </Reveal>

        {highlights.length > 0 ? (
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {highlights.map((project, index) => (
              <Reveal
                key={project.id}
                delay={index * 0.06}
                className={index === 0 ? "md:col-span-2" : undefined}
              >
                <ProjectCard project={project} priority={index === 0} />
              </Reveal>
            ))}
          </div>
        ) : (
          <EmptyProjects />
        )}

        {published.length > highlights.length ? (
          <div className="mt-10 flex justify-start">
            <Link
              href="/projects"
              className="group inline-flex items-center gap-3 rounded-full border border-subtle bg-surface-elevated px-5 py-3 text-sm font-semibold text-secondary shadow-[var(--shadow-low)] transition-all duration-500 ease-[var(--ease-out-quint)] hover:border-strong hover:text-primary hover:shadow-[var(--shadow-mid)]"
            >
              Ver todos os projetos
              <ArrowRight
                size={16}
                weight="Linear"
                className="transition-transform duration-500 ease-[var(--ease-out-quint)] group-hover:translate-x-1"
              />
            </Link>
          </div>
        ) : null}
      </section>

      <section id="approach" className="page-shell scroll-mt-28 py-20 md:py-28">
        <Reveal>
          <div className="grid overflow-hidden rounded-[2rem] bg-contrast text-contrast-text shadow-[var(--shadow-high)] md:grid-cols-12">
            <div className="flex min-h-80 flex-col justify-between p-7 sm:p-10 md:col-span-7 md:min-h-[30rem] md:p-12">
              <h2 className="max-w-[10ch] font-display text-[clamp(2.6rem,5vw,5rem)] leading-[0.92] font-medium tracking-[-0.065em]">
                Pensar bem. Construir melhor.
              </h2>
              <p className="mt-12 max-w-[45ch] text-sm leading-6 text-contrast-muted sm:text-base">
                Estratégia, interface e engenharia tratadas como um único sistema, do primeiro rascunho ao produto em produção.
              </p>
            </div>

            <div className="grid gap-px bg-contrast-line md:col-span-5">
              {[
                { Icon: CursorSquare, title: "Experiência", text: "Interfaces claras, responsivas e agradáveis de usar." },
                { Icon: Structure, title: "Arquitetura", text: "Bases técnicas preparadas para evoluir sem atrito." },
                { Icon: Code2, title: "Entrega", text: "Implementação cuidadosa, acessível e pronta para produção." },
              ].map(({ Icon, title, text }) => (
                <div key={title} className="flex gap-4 bg-contrast p-7 sm:p-8">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-accent text-accent-fg shadow-[0_8px_26px_-12px_color-mix(in_srgb,var(--accent)_80%,transparent)]">
                    <Icon size={20} weight="Linear" />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-semibold tracking-tight">{title}</h3>
                    <p className="mt-1 max-w-[34ch] text-sm leading-6 text-contrast-muted">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}

function EmptyProjects() {
  return (
    <div className="surface-shell mt-12">
      <div className="surface-core flex min-h-72 flex-col items-start justify-end p-7 sm:p-10">
        <Structure size={34} weight="Linear" className="mb-auto text-accent" />
        <h3 className="font-display text-2xl font-semibold tracking-tight text-primary">
          Novos projetos em preparação.
        </h3>
        <p className="mt-2 max-w-[48ch] text-sm leading-6 text-secondary">
          Os próximos estudos de caso aparecerão aqui. Enquanto isso, conheça mais sobre meu trabalho.
        </p>
        <Link
          href="/about"
          className="group mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent"
        >
          Conhecer minha trajetória
          <ArrowRight size={16} weight="Linear" className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
