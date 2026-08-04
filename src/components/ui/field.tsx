import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Base dos controles de texto. O anel de foco substitui o `outline` global
 * porque o offset de 3px destoa dentro de grades densas de formulário.
 */
const controlBase =
  "w-full rounded-control border border-subtle bg-surface-elevated px-3.5 py-2.5 text-sm text-primary transition-[border-color,box-shadow] duration-200 placeholder:text-muted hover:border-strong focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-soft)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-60";

/** Label sits above the control, error below it. Placeholders are never labels. */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string[];
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium text-primary"
      >
        {label}
      </label>
      {children}
      {hint && !error?.length ? (
        <p className="text-xs text-secondary">{hint}</p>
      ) : null}
      {error?.length ? (
        <p className="text-xs text-danger" role="alert">
          {error[0]}
        </p>
      ) : null}
    </div>
  );
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(controlBase, className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(controlBase, "min-h-32 resize-y leading-relaxed", className)}
      {...props}
    />
  );
}

/**
 * Caixa desenhada em CSS. O `accent-color` nativo só pinta o preenchimento: a
 * borda, o raio e o tamanho continuam vindo do sistema operacional.
 */
export function Checkbox({
  label,
  hint,
  className,
  ...props
}: ComponentProps<"input"> & { label: string; hint?: string }) {
  return (
    <label
      className={cn(
        "flex w-fit cursor-pointer items-start gap-3 text-sm text-primary select-none",
        className,
      )}
    >
      <input type="checkbox" className="peer sr-only" {...props} />
      <span
        aria-hidden
        className="mt-px grid size-5 shrink-0 place-items-center rounded-[7px] border border-strong bg-surface-elevated text-transparent transition-all duration-200 ease-[var(--ease-out-quint)] peer-hover:border-accent peer-checked:border-accent peer-checked:bg-accent peer-checked:text-accent-fg peer-focus-visible:shadow-[0_0_0_3px_var(--accent-soft)] [&>svg]:scale-50 [&>svg]:transition-transform [&>svg]:duration-200 peer-checked:[&>svg]:scale-100"
      >
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-3"
        >
          <path d="M3 8.4 6.2 11.6 13 4.8" />
        </svg>
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="leading-5">{label}</span>
        {hint ? <span className="text-xs text-secondary">{hint}</span> : null}
      </span>
    </label>
  );
}

export { controlBase };
export { Select, type SelectOption } from "./select";
export { NumberInput } from "./number-input";
