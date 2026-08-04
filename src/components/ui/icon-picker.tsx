"use client";

import {
  AltArrowDown,
  CloseCircle,
  Magnifer,
  MinimalisticMagnifer,
} from "@solar-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import {
  normalizeSearch,
  searchTechIcons,
  TECH_ICONS_BY_SLUG,
  techIconUrl,
} from "@/lib/tech-icons";

/**
 * Marca da tecnologia servida pelo Simple Icons. Fica sobre uma plaquinha clara
 * nos dois temas porque boa parte dos logos é preta e sumiria no modo escuro.
 * Slug inválido cai no fallback com a inicial, sem quebrar o layout.
 */
export function TechIconMark({
  slug,
  size = 22,
  className,
}: {
  slug: string;
  size?: number;
  className?: string;
}) {
  // Guarda o slug que falhou em vez de um booleano: trocar de ícone limpa o
  // erro sozinho, sem um efeito só para reagir à mudança de prop.
  const [failedSlug, setFailedSlug] = useState<string | null>(null);
  const failed = failedSlug === slug;

  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-[9px] bg-white shadow-[var(--shadow-low)]",
        className,
      )}
      style={{ width: size + 12, height: size + 12 }}
    >
      {failed ? (
        <span
          className="font-mono font-semibold text-[#171a18] uppercase"
          style={{ fontSize: size * 0.55 }}
        >
          {slug.charAt(0)}
        </span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- SVG externo de tamanho fixo, sem ganho em passar pelo otimizador.
        <img
          src={techIconUrl(slug)}
          alt=""
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          onError={() => setFailedSlug(slug)}
          style={{ width: size, height: size }}
        />
      )}
    </span>
  );
}

/** Slug do Simple Icons: minúsculas, dígitos e hífen. */
function isSlugLike(value: string) {
  return /^[a-z0-9-]{2,60}$/.test(normalizeSearch(value));
}

type Props = {
  name: string;
  defaultValue?: string | null;
  id?: string;
};

/**
 * Seletor visual no lugar de digitar o slug do Simple Icons de cabeça. A busca
 * casa rótulo, slug, grupo e sinônimos em português, então "banco de dados"
 * chega no Postgres e "contêiner" chega no Docker.
 */
export function IconPicker({ name, defaultValue, id }: Props) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const reduceMotion = useReducedMotion();

  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const groups = useMemo(() => searchTechIcons(query), [query]);
  const total = useMemo(
    () => groups.reduce((count, group) => count + group.icons.length, 0),
    [groups],
  );
  const selected = value ? TECH_ICONS_BY_SLUG.get(value) : undefined;

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    // Abrir já com o cursor na busca: é sempre o próximo passo.
    searchRef.current?.focus();

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function choose(slug: string) {
    setValue(slug);
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={rootRef} className="relative">
      <input type="hidden" name={name} value={value} />

      <div className="flex items-center gap-2">
        <button
          type="button"
          id={id}
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          className={cn(
            "flex flex-1 items-center justify-between gap-3 rounded-control border border-subtle bg-surface-elevated p-2 pr-3.5 text-left text-sm transition-colors duration-200 hover:border-strong",
            open && "border-accent",
          )}
        >
          <span className="flex min-w-0 items-center gap-2.5">
            {value ? (
              <TechIconMark slug={value} size={20} />
            ) : (
              <span className="grid size-8 shrink-0 place-items-center rounded-[9px] bg-surface-sunken text-muted">
                <Magnifer size={15} weight="Linear" />
              </span>
            )}
            <span className="flex min-w-0 flex-col">
              <span
                className={cn(
                  "truncate",
                  value ? "text-primary" : "text-muted",
                )}
              >
                {selected?.label ?? (value ? value : "Escolher ícone")}
              </span>
              {value ? (
                <span className="truncate font-mono text-[11px] text-muted">
                  {value}
                </span>
              ) : null}
            </span>
          </span>
          <AltArrowDown
            size={16}
            weight="Linear"
            className={cn(
              "shrink-0 text-muted transition-transform duration-300 ease-[var(--ease-out-quint)]",
              open && "rotate-180 text-accent",
            )}
          />
        </button>

        {value ? (
          <button
            type="button"
            onClick={() => setValue("")}
            aria-label="Remover ícone"
            className="grid size-9 shrink-0 place-items-center rounded-full text-muted transition-colors duration-200 hover:bg-danger-soft hover:text-danger"
          >
            <CloseCircle size={17} weight="Linear" />
          </button>
        ) : null}
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            role="dialog"
            aria-label="Escolher ícone da tecnologia"
            initial={reduceMotion ? false : { opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-(--z-overlay) origin-top overflow-hidden rounded-card border border-subtle bg-surface-elevated shadow-[var(--shadow-high)]"
          >
            <div className="border-b border-subtle p-3">
              <div className="flex items-center gap-2 rounded-control border border-subtle bg-surface-sunken px-3 py-2 transition-colors duration-200 focus-within:border-accent">
                <MinimalisticMagnifer
                  size={16}
                  weight="Linear"
                  className="shrink-0 text-muted"
                />
                <input
                  ref={searchRef}
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar: react, banco de dados, nuvem…"
                  className="w-full bg-transparent text-sm text-primary placeholder:text-muted focus:outline-none"
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      searchRef.current?.focus();
                    }}
                    aria-label="Limpar busca"
                    className="shrink-0 text-muted transition-colors hover:text-primary"
                  >
                    <CloseCircle size={15} weight="Linear" />
                  </button>
                ) : null}
              </div>
            </div>

            <div className="scrollbar-slim max-h-[19rem] overflow-y-auto overscroll-contain p-3">
              {total === 0 ? (
                <div className="flex flex-col items-center gap-3 px-2 py-8 text-center">
                  <p className="text-sm text-secondary">
                    Nada encontrado para “{query}”.
                  </p>
                  <p className="max-w-[38ch] text-xs text-muted">
                    Tente o nome da marca em inglês. Algumas, como AWS, Azure,
                    Slack e os produtos da Adobe, foram retiradas do Simple
                    Icons por questão de marca registrada e não têm ícone.
                  </p>
                  {/* Escape para qualquer slug que o catálogo não cubra: o
                      Simple Icons ganha marcas novas o tempo todo. */}
                  {isSlugLike(query) ? (
                    <button
                      type="button"
                      onClick={() => choose(normalizeSearch(query))}
                      className="inline-flex items-center gap-2 rounded-full border border-subtle px-4 py-2 text-xs text-secondary transition-colors hover:border-accent hover:text-accent"
                    >
                      Usar “{normalizeSearch(query)}” como slug mesmo assim
                    </button>
                  ) : null}
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {groups.map((group) => (
                    <section key={group.id} className="flex flex-col gap-2">
                      <h4 className="sticky -top-3 z-10 -mx-3 -mt-1 bg-surface-elevated px-4 pt-1 pb-1.5 text-[11px] font-medium tracking-[0.14em] text-muted uppercase">
                        {group.label}
                      </h4>
                      <ul className="grid grid-cols-[repeat(auto-fill,minmax(4.5rem,1fr))] gap-1">
                        {group.icons.map((icon) => (
                          <li key={icon.slug}>
                            <button
                              type="button"
                              onClick={() => choose(icon.slug)}
                              title={`${icon.label} (${icon.slug})`}
                              aria-pressed={icon.slug === value}
                              className={cn(
                                "flex w-full flex-col items-center gap-1.5 rounded-control border border-transparent px-1 py-2.5 transition-colors duration-200 hover:border-subtle hover:bg-surface-sunken",
                                icon.slug === value &&
                                  "border-accent bg-accent-soft",
                              )}
                            >
                              <TechIconMark slug={icon.slug} size={22} />
                              <span className="w-full truncate px-0.5 text-center text-[11px] text-secondary">
                                {icon.label}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </section>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
