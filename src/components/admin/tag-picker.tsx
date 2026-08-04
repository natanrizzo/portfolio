"use client";

import { MinimalisticMagnifer } from "@solar-icons/react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { TechIconMark } from "@/components/ui/icon-picker";
import type { TechTag } from "@/db/schema";
import { normalizeSearch } from "@/lib/tech-icons";
import { cn } from "@/lib/utils";

type Props = {
  tags: TechTag[];
  selected: string[];
  onChange: (next: string[]) => void;
  /** Quando presente, espelha a seleção em inputs escondidos para o form. */
  name?: string;
};

/**
 * Chips de tecnologia com filtro. A busca só aparece quando a lista fica grande
 * o bastante para valer o campo extra.
 */
export function TagPicker({ tags, selected, onChange, name }: Props) {
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const term = normalizeSearch(query);
    if (!term) return tags;
    return tags.filter((tag) => normalizeSearch(tag.name).includes(term));
  }, [tags, query]);

  function toggle(id: string) {
    onChange(
      selected.includes(id)
        ? selected.filter((value) => value !== id)
        : [...selected, id],
    );
  }

  if (tags.length === 0) {
    return (
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-primary">Tecnologias</span>
        <p className="text-sm text-secondary">
          Nenhuma tecnologia cadastrada.{" "}
          <Link
            href="/admin/technologies"
            className="text-accent transition-opacity hover:opacity-80"
          >
            Cadastrar agora
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {name
        ? selected.map((id) => (
            <input key={id} type="hidden" name={name} value={id} />
          ))
        : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm font-medium text-primary">
          Tecnologias
          {selected.length > 0 ? (
            <span className="ml-2 text-xs font-normal text-muted">
              {selected.length} selecionada{selected.length > 1 ? "s" : ""}
            </span>
          ) : null}
        </span>

        {tags.length > 8 ? (
          <div className="flex items-center gap-2 rounded-full border border-subtle bg-surface-sunken px-3 py-1.5 transition-colors duration-200 focus-within:border-accent">
            <MinimalisticMagnifer
              size={14}
              weight="Linear"
              className="shrink-0 text-muted"
            />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filtrar"
              className="w-28 bg-transparent text-sm text-primary placeholder:text-muted focus:outline-none"
            />
          </div>
        ) : null}
      </div>

      {visible.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {visible.map((tag) => {
            const active = selected.includes(tag.id);
            return (
              <li key={tag.id}>
                <button
                  type="button"
                  onClick={() => toggle(tag.id)}
                  aria-pressed={active}
                  className={cn(
                    "flex items-center gap-2 rounded-full border py-1.5 pr-3.5 pl-1.5 text-sm transition-colors duration-300",
                    active
                      ? "border-accent bg-accent-soft text-accent"
                      : "border-subtle text-secondary hover:border-strong",
                  )}
                >
                  {tag.iconSlug ? (
                    <TechIconMark slug={tag.iconSlug} size={14} />
                  ) : (
                    <span className="size-[26px] rounded-[9px] bg-surface-sunken" />
                  )}
                  {tag.name}
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-secondary">
          Nenhuma tecnologia com “{query}”.
        </p>
      )}
    </div>
  );
}
