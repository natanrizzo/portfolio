"use client";

import { AltArrowDown, CheckCircle } from "@solar-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

import { cn } from "@/lib/utils";

export type SelectOption = {
  value: string;
  label: string;
  /** Linha secundária dentro da opção. */
  description?: string;
};

type Props = {
  id?: string;
  /** Quando presente, um input escondido carrega o valor para o form. */
  name?: string;
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  "aria-describedby"?: string;
};

/**
 * Listbox própria no lugar do `<select>` nativo: o menu do sistema operacional
 * ignora o tema do site (fundo branco, fonte do SO) e não aceita descrição por
 * opção. Aqui o menu é DOM comum, então herda a paleta e anima junto do resto.
 *
 * Aceita ser controlado (`value` + `onChange`) ou não (`defaultValue`).
 */
export function Select({
  id,
  name,
  options,
  value,
  defaultValue,
  onChange,
  placeholder = "Selecione",
  disabled,
  className,
  "aria-describedby": describedBy,
}: Props) {
  const generatedId = useId();
  const buttonId = id ?? generatedId;
  const listboxId = `${buttonId}-listbox`;

  const [internalValue, setInternalValue] = useState(defaultValue ?? "");
  const selected = value ?? internalValue;

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const reduceMotion = useReducedMotion();

  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedIndex = options.findIndex((option) => option.value === selected);
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  const commit = useCallback(
    (next: string) => {
      if (value === undefined) setInternalValue(next);
      onChange?.(next);
      setOpen(false);
    },
    [onChange, value],
  );

  // Fecha ao clicar fora ou ao rolar a página com o menu aberto.
  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  // Mantém a opção ativa visível enquanto o usuário navega pelo teclado.
  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  function openMenu(startAt = selectedIndex >= 0 ? selectedIndex : 0) {
    setActiveIndex(startAt);
    setOpen(true);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;

    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        openMenu();
      }
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((current) => (current + 1) % options.length);
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex(
          (current) => (current - 1 + options.length) % options.length,
        );
        break;
      case "Home":
        event.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        event.preventDefault();
        setActiveIndex(options.length - 1);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        if (options[activeIndex]) commit(options[activeIndex].value);
        break;
      case "Escape":
        event.preventDefault();
        setOpen(false);
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      {name ? <input type="hidden" name={name} value={selected} /> : null}

      <button
        type="button"
        id={buttonId}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-activedescendant={
          open && options[activeIndex]
            ? `${listboxId}-${activeIndex}`
            : undefined
        }
        aria-describedby={describedBy}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={handleKeyDown}
        className={cn(
          "flex w-full items-center justify-between gap-3 rounded-control border border-subtle bg-surface-elevated px-3.5 py-2.5 text-left text-sm transition-colors duration-200",
          "hover:border-strong disabled:pointer-events-none disabled:opacity-60",
          open && "border-accent",
          selectedOption ? "text-primary" : "text-muted",
        )}
      >
        <span className="truncate">{selectedOption?.label ?? placeholder}</span>
        <AltArrowDown
          size={16}
          weight="Linear"
          className={cn(
            "shrink-0 text-muted transition-transform duration-300 ease-[var(--ease-out-quint)]",
            open && "rotate-180 text-accent",
          )}
        />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-labelledby={buttonId}
            tabIndex={-1}
            initial={reduceMotion ? false : { opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="scrollbar-slim absolute inset-x-0 top-[calc(100%+0.375rem)] z-(--z-overlay) max-h-64 origin-top overflow-y-auto overscroll-contain rounded-control border border-subtle bg-surface-elevated p-1.5 shadow-[var(--shadow-mid)]"
          >
            {options.map((option, index) => {
              const isSelected = option.value === selected;
              return (
                <li key={option.value}>
                  <div
                    id={`${listboxId}-${index}`}
                    role="option"
                    data-index={index}
                    aria-selected={isSelected}
                    onPointerEnter={() => setActiveIndex(index)}
                    onClick={() => commit(option.value)}
                    className={cn(
                      "flex cursor-pointer items-center justify-between gap-3 rounded-[10px] px-3 py-2 text-sm transition-colors duration-150",
                      index === activeIndex
                        ? "bg-surface-sunken text-primary"
                        : "text-secondary",
                      isSelected && "text-accent",
                    )}
                  >
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate">{option.label}</span>
                      {option.description ? (
                        <span className="truncate text-xs text-muted">
                          {option.description}
                        </span>
                      ) : null}
                    </span>
                    {isSelected ? (
                      <CheckCircle
                        size={16}
                        weight="Bold"
                        className="shrink-0 text-accent"
                      />
                    ) : null}
                  </div>
                </li>
              );
            })}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
