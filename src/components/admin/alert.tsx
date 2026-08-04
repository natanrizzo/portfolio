import { CheckCircle, DangerCircle } from "@solar-icons/react/ssr";

import { cn } from "@/lib/utils";

export function Alert({
  tone,
  children,
  className,
}: {
  tone: "success" | "error";
  children: React.ReactNode;
  className?: string;
}) {
  const Icon = tone === "success" ? CheckCircle : DangerCircle;

  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex items-center gap-2 rounded-control px-3.5 py-2.5 text-sm",
        tone === "success"
          ? "bg-accent-soft text-accent"
          : "bg-danger-soft text-danger",
        className,
      )}
    >
      <Icon size={17} weight="Linear" className="shrink-0" />
      {children}
    </p>
  );
}
