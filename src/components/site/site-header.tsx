"use client";

import { CloseCircle, HamburgerMenu } from "@solar-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { navigation, siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const initials = siteConfig.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-[var(--z-sticky)] pt-4 md:pt-5">
      <motion.nav
        aria-label="Navegação principal"
        className="pointer-events-auto mx-auto flex h-15 w-[calc(100%-2rem)] max-w-5xl items-center justify-between rounded-full border border-subtle/80 bg-[color-mix(in_srgb,var(--surface-elevated)_82%,transparent)] px-2.5 pl-3 shadow-[var(--shadow-mid)] backdrop-blur-xl"
        initial={false}
      >
        <Link
          href="/"
          aria-label={`${siteConfig.name}, início`}
          className="grid size-10 place-items-center rounded-full bg-surface-inverted font-display text-sm font-semibold tracking-[-0.06em] text-inverted transition-transform duration-500 ease-[var(--ease-out-quint)] hover:scale-[1.04] active:scale-[0.97]"
        >
          {initials}
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {navigation.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative rounded-full px-4 py-2 text-[0.82rem] font-medium transition-all duration-500 ease-[var(--ease-out-quint)]",
                    active
                      ? "bg-surface-sunken text-primary"
                      : "text-secondary hover:bg-surface-sunken/60 hover:text-primary",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-1.5">
          <Link
            href="/about#contact"
            className="hidden h-10 items-center rounded-full bg-surface-inverted px-4 text-xs font-semibold text-inverted transition-transform duration-500 ease-[var(--ease-out-quint)] hover:scale-[1.025] active:scale-[0.97] sm:inline-flex"
          >
            Vamos conversar
          </Link>
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            className="grid size-10 place-items-center rounded-full text-secondary transition-all duration-500 ease-[var(--ease-out-quint)] hover:bg-surface-sunken hover:text-primary active:scale-[0.94] md:hidden"
          >
            <HamburgerMenu size={19} weight="Linear" />
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {open ? (
        <motion.div
          className="pointer-events-auto fixed inset-0 z-[var(--z-overlay)] bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] backdrop-blur-2xl md:hidden"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex h-full flex-col px-6 py-5">
            <div className="flex items-center justify-between">
              <span className="font-display text-sm font-semibold tracking-tight text-primary">
                {siteConfig.name}
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fechar menu"
                className="grid size-11 place-items-center rounded-full bg-surface-elevated text-secondary shadow-[var(--shadow-low)]"
              >
                <CloseCircle size={22} weight="Linear" />
              </button>
            </div>

            <ul className="my-auto flex flex-col">
              {navigation.map((item, index) => (
                <motion.li
                  key={item.href}
                  className="border-b border-subtle"
                  initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: 10 }}
                  transition={{
                    duration: 0.55,
                    delay: reduceMotion ? 0 : 0.08 + index * 0.06,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                  className="block py-5 font-display text-[clamp(2.4rem,13vw,4.5rem)] leading-none font-medium tracking-[-0.06em] text-primary"
                >
                  {item.label}
                </Link>
                </motion.li>
              ))}
            </ul>

            <Link
              href="/about#contact"
              onClick={() => setOpen(false)}
              className="inline-flex h-13 items-center justify-center rounded-full bg-accent px-6 text-sm font-semibold text-accent-fg"
            >
              Iniciar uma conversa
            </Link>
          </div>
        </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
