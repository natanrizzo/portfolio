import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70dvh] flex-col items-center justify-center gap-5 px-6 text-center">
      <p className="font-mono text-sm text-accent">404</p>
      <h1 className="text-3xl font-medium tracking-tighter text-primary md:text-4xl">
        Essa página não existe
      </h1>
      <p className="max-w-[46ch] text-base leading-relaxed text-secondary">
        O endereço pode ter mudado, ou o projeto que você procura ainda não foi
        publicado.
      </p>
      <Link
        href="/"
        className="mt-2 inline-flex items-center rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg transition-all duration-300 hover:bg-accent-hover active:scale-[0.98]"
      >
        Voltar ao início
      </Link>
    </div>
  );
}
