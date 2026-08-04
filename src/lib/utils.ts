import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function formatDate(date: Date | string | null | undefined) {
  if (!date) return null;
  const parsed = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(parsed.getTime())) return null;
  return dateFormatter.format(parsed).replace(".", "");
}

/**
 * Turns an unknown thrown value into a message safe to show in the UI.
 * Server Actions must never leak stack traces or driver errors to the client.
 */
export function toErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message && !error.message.includes("\n")) {
    return error.message;
  }
  return fallback;
}
