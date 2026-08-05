/**
 * Static identity of the site. Anything editable from the admin lives in the
 * `profile` table instead. This file only holds build-time constants.
 */
export const siteConfig = {
  name: "Natan Lima",
  role: "Desenvolvedor de software",
  locale: "pt-BR",
  // `||`, not `??`: a build arg that is declared but empty arrives here as ""
  // rather than undefined, and `new URL("")` throws ERR_INVALID_URL while
  // collecting page data — which fails the whole build.
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  description:
    "Portfólio de projetos, com o código aberto no GitHub e o contexto de cada decisão técnica.",
} as const;

export const navigation = [
  { href: "/", label: "Início" },
  { href: "/projects", label: "Projetos" },
  { href: "/about", label: "Sobre" },
] as const;
