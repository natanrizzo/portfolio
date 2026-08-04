"use client";

import { AltArrowDown, AltArrowUp } from "@solar-icons/react";
import { useState } from "react";

import { cn } from "@/lib/utils";

type Props = {
  id?: string;
  name?: string;
  value?: string;
  defaultValue?: string | number | null;
  onChange?: (value: string) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  className?: string;
};

/**
 * Campo numérico sem o spinner nativo: aquele par de setas minúsculas muda de
 * desenho em cada navegador, não respeita o tema e dispara no scroll do mouse.
 * Aqui o input é textual (`inputMode="numeric"`) e o passo fica em botões
 * próprios, com a mesma linguagem visual dos demais controles.
 */
export function NumberInput({
  id,
  name,
  value,
  defaultValue,
  onChange,
  min,
  max,
  step = 1,
  placeholder,
  className,
}: Props) {
  const [internalValue, setInternalValue] = useState(
    defaultValue === null || defaultValue === undefined
      ? ""
      : String(defaultValue),
  );
  const current = value ?? internalValue;

  function commit(next: string) {
    if (value === undefined) setInternalValue(next);
    onChange?.(next);
  }

  function clamp(next: number) {
    if (min !== undefined && next < min) return min;
    if (max !== undefined && next > max) return max;
    return next;
  }

  function nudge(direction: 1 | -1) {
    const parsed = Number.parseInt(current, 10);
    // Sem valor ainda: o primeiro clique cai no limite mais próximo, não em 0.
    const base = Number.isNaN(parsed) ? (min ?? 0) - direction * step : parsed;
    commit(String(clamp(base + direction * step)));
  }

  return (
    <div
      className={cn(
        "flex items-stretch rounded-control border border-subtle bg-surface-elevated transition-colors duration-200 focus-within:border-accent hover:border-strong",
        className,
      )}
    >
      {name ? <input type="hidden" name={name} value={current} /> : null}

      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder={placeholder}
        value={current}
        onChange={(event) => commit(event.target.value.replace(/[^\d-]/g, ""))}
        onBlur={() => {
          if (!current) return;
          const parsed = Number.parseInt(current, 10);
          commit(Number.isNaN(parsed) ? "" : String(clamp(parsed)));
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowUp") {
            event.preventDefault();
            nudge(1);
          }
          if (event.key === "ArrowDown") {
            event.preventDefault();
            nudge(-1);
          }
        }}
        className="w-full bg-transparent px-3.5 py-2.5 text-sm text-primary placeholder:text-muted focus:outline-none"
      />

      <div className="flex flex-col border-l border-subtle">
        <StepButton label="Aumentar" onClick={() => nudge(1)}>
          <AltArrowUp size={12} weight="Bold" />
        </StepButton>
        <div className="h-px bg-[var(--border-subtle)]" />
        <StepButton label="Diminuir" onClick={() => nudge(-1)}>
          <AltArrowDown size={12} weight="Bold" />
        </StepButton>
      </div>
    </div>
  );
}

function StepButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      tabIndex={-1}
      onClick={onClick}
      className="grid flex-1 w-9 place-items-center text-muted transition-colors duration-200 first:rounded-tr-control last:rounded-br-control hover:bg-surface-sunken hover:text-accent"
    >
      {children}
    </button>
  );
}
