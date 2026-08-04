"use client";

import { Moon, Sun2 } from "@solar-icons/react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      aria-label="Alternar entre tema claro e escuro"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="grid size-10 place-items-center rounded-full text-secondary transition-all duration-500 ease-[var(--ease-out-quint)] hover:bg-surface-sunken hover:text-primary active:scale-[0.94]"
    >
      <Moon size={18} weight="Linear" className="dark:hidden" />
      <Sun2 size={18} weight="Linear" className="hidden dark:block" />
    </button>
  );
}
