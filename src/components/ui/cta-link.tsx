import { ArrowRightUp } from "@solar-icons/react/ssr";
import Link from "next/link";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/**
 * Primary call to action. The trailing arrow lives inside its own circular
 * well flush with the button's right padding, and shifts diagonally on hover
 * while the whole control compresses slightly on press.
 */
export function CtaLink({
  children,
  className,
  ...props
}: ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn(
        "group inline-flex h-13 items-center gap-3 rounded-full bg-accent py-1.5 pr-1.5 pl-6 text-sm font-semibold whitespace-nowrap text-accent-fg shadow-[var(--shadow-low)] transition-all duration-500 ease-[var(--ease-out-quint)] hover:bg-accent-hover hover:shadow-[var(--shadow-mid)] active:scale-[0.98]",
        className,
      )}
      {...props}
    >
      {children}
      <span className="grid size-10 place-items-center rounded-full bg-[color-mix(in_srgb,var(--accent-fg)_18%,transparent)] transition-transform duration-500 ease-[var(--ease-out-quint)] group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105">
        <ArrowRightUp size={16} weight="Linear" />
      </span>
    </Link>
  );
}
