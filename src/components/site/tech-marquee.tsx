import { TechIconMark } from "@/components/ui/icon-picker";
import type { TechTag } from "@/db/schema";

/** Largura aproximada de uma pílula, usada só para estimar quantas cópias cabem. */
const PILL_WIDTH = 168;
const MIN_TRACK_WIDTH = 1800;

/**
 * Faixa das tecnologias cadastradas deslizando da direita para a esquerda, sem
 * fim. Renderiza no servidor: são imagens e texto, e a repetição é feita na
 * marcação, então não precisa de JavaScript no cliente para nada disso.
 */
export function TechMarquee({ tags }: { tags: TechTag[] }) {
  if (tags.length === 0) return null;

  // Poucas tecnologias não preencheriam a tela, e um trecho vazio girando
  // denunciaria a emenda. Repete a lista até cobrir a maior largura provável.
  const repeats = Math.max(
    1,
    Math.ceil(MIN_TRACK_WIDTH / (tags.length * PILL_WIDTH)),
  );
  const sequence = Array.from({ length: repeats }, () => tags).flat();
  const duration = Math.max(24, sequence.length * 3.2);

  return (
    <section
      aria-label="Tecnologias que utilizo"
      className="border-y border-subtle bg-surface-sunken/60 py-8"
    >
      <div className="page-shell mb-6">
        <p className="font-mono text-[11px] tracking-[0.22em] text-muted uppercase">
          Tecnologias que utilizo
        </p>
      </div>

      <div
        className="marquee-viewport relative"
        style={{ ["--marquee-duration" as string]: `${duration}s` }}
      >
        <div className="marquee-track gap-3 pr-3">
          {/* Duas passadas: a segunda é decorativa e some para leitores de tela. */}
          {[0, 1].map((copy) => (
            <ul key={copy} className="flex shrink-0 gap-3 pr-3" aria-hidden={copy === 1}>
              {sequence.map((tag, index) => (
                <li key={`${copy}-${tag.id}-${index}`}>
                  <TechPill tag={tag} />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}

function TechPill({ tag }: { tag: TechTag }) {
  return (
    <span className="flex items-center gap-2.5 rounded-full border border-subtle bg-surface-elevated py-2 pr-5 pl-2 whitespace-nowrap shadow-[var(--shadow-low)]">
      {tag.iconSlug ? (
        // `TechIconMark` troca por uma inicial se o SVG não existir. Marcas
        // sem ícone no Simple Icons apareceriam como imagem quebrada aqui.
        <TechIconMark slug={tag.iconSlug} size={22} className="rounded-full" />
      ) : (
        <span className="grid size-8.5 shrink-0 place-items-center rounded-full bg-surface-sunken font-mono text-xs text-muted uppercase">
          {tag.name.charAt(0)}
        </span>
      )}
      <span className="text-sm font-medium text-secondary">{tag.name}</span>
    </span>
  );
}
