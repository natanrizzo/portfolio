import { ShieldUser } from "@solar-icons/react/ssr";
import type { Metadata } from "next";
import Image from "next/image";

import { siteConfig } from "@/lib/site-config";

import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Entrar",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : "/admin";

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex items-center justify-center px-5 py-16 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-10 flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-full bg-surface-inverted text-inverted">
              <ShieldUser size={20} weight="Linear" />
            </span>
            <div>
              <p className="font-display text-sm font-semibold text-primary">{siteConfig.name}</p>
              <p className="text-xs text-muted">Workspace privado</p>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="font-display text-4xl font-semibold tracking-[-0.055em] text-primary sm:text-5xl">
              Bem-vindo de volta.
            </h1>
            <p className="mt-3 max-w-[42ch] text-sm leading-6 text-secondary">
              Entre para gerenciar projetos, conteúdo e informações do portfólio.
            </p>
          </div>

          <div className="surface-shell">
            <div className="surface-core p-6 sm:p-7">
              <LoginForm next={next} />
            </div>
          </div>
        </div>
      </div>

      <div className="relative hidden min-h-dvh overflow-hidden p-5 lg:block">
        <div className="relative size-full overflow-hidden rounded-[2rem] bg-surface-sunken">
          <Image
            src="/images/hero-sculpture.png"
            alt="Escultura abstrata em metal e vidro"
            fill
            priority
            sizes="50vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-[#0b0d0c]/60 via-transparent to-transparent" />
          <p className="absolute right-8 bottom-8 left-8 max-w-lg font-display text-3xl font-medium tracking-[-0.045em] text-[#edf1e9]">
            Conteúdo, projetos e identidade em um só lugar.
          </p>
        </div>
      </div>
    </div>
  );
}
