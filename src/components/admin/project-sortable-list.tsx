"use client";

import { CheckCircle, MenuDots, Refresh } from "@solar-icons/react";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";

import { reorderProjects } from "@/actions/projects";
import { Badge } from "@/components/ui/badge";
import { moveItem, useDragReorder } from "@/lib/use-drag-reorder";
import { cn } from "@/lib/utils";

export type SortableProject = {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "published";
  featured: boolean;
};

type SaveState = "idle" | "saving" | "saved" | "error";

/**
 * A ordem do portfólio é definida arrastando os cards. O projeto criado por
 * último já nasce no topo, então esta tela existe para os ajustes finos — por
 * isso o campo numérico de posição saiu do formulário.
 */
export function ProjectSortableList({
  projects: initial,
}: {
  projects: SortableProject[];
}) {
  // `initial` é a ordem gravada. O estado local diverge dela enquanto o
  // arrasto ainda não foi salvo, e volta a coincidir quando a revalidação
  // devolve a página com a ordem nova.
  const [projects, setProjects] = useState(initial);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const savedTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (savedTimer.current) window.clearTimeout(savedTimer.current);
    },
    [],
  );

  const dnd = useDragReorder({
    count: projects.length,
    onMove: (from, to) => setProjects((current) => moveItem(current, from, to)),
  });

  /**
   * Grava sempre que a ordem local divergir da que veio do servidor. Cobrir o
   * arrastar e as setas do teclado num único ponto evita ler a lista antes do
   * React aplicar o movimento, e a folga junta uma sequência de setas em um
   * único salvamento.
   */
  useEffect(() => {
    const localOrder = projects.map((item) => item.id).join();
    if (localOrder === initial.map((item) => item.id).join()) return;

    const timer = window.setTimeout(() => {
      setSaveState("saving");
      setErrorMessage(null);

      startTransition(async () => {
        const result = await reorderProjects(
          projects.map((item) => item.id),
        );

        if (result?.error) {
          setSaveState("error");
          setErrorMessage(result.error);
          return;
        }

        setSaveState("saved");
        if (savedTimer.current) window.clearTimeout(savedTimer.current);
        savedTimer.current = window.setTimeout(() => setSaveState("idle"), 2400);
      });
    }, 450);

    return () => window.clearTimeout(timer);
  }, [projects, initial]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex min-h-5 items-center justify-between gap-3">
        <p className="text-xs text-muted">
          Arraste pela alça para reordenar. A ordem vale para a home e para a
          listagem pública.
        </p>
        <StatusHint state={saveState} pending={isPending} />
      </div>

      {errorMessage ? (
        <p className="text-xs text-danger" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <ul className="flex flex-col gap-2">
        {projects.map((project, index) => (
          <li
            key={project.id}
            {...dnd.itemProps(index)}
            className={cn(
              "flex items-center gap-3 rounded-card border border-subtle bg-surface-elevated px-3 py-3.5 transition-[border-color,opacity,box-shadow] duration-300 hover:border-strong sm:px-4",
              dnd.dragIndex === index &&
                "border-accent opacity-60 shadow-[var(--shadow-mid)]",
            )}
          >
            <button
              type="button"
              {...dnd.handleProps(index)}
              aria-label={`Reordenar ${project.title}. Use as setas para cima e para baixo.`}
              className="grid size-9 shrink-0 cursor-grab place-items-center rounded-[10px] text-muted transition-colors duration-200 hover:bg-surface-sunken hover:text-primary active:cursor-grabbing"
            >
              <MenuDots size={17} weight="Bold" className="rotate-90" />
            </button>

            <span className="w-6 shrink-0 text-center font-mono text-xs text-muted tabular-nums">
              {index + 1}
            </span>

            <Link
              href={`/admin/projects/${project.id}`}
              className="flex min-w-0 flex-1 flex-col gap-1"
              // Sem isso o navegador arrasta a URL do link em vez da linha.
              draggable={false}
            >
              <span className="truncate font-medium text-primary">
                {project.title}
              </span>
              <span className="truncate font-mono text-xs text-muted">
                /projects/{project.slug}
              </span>
            </Link>

            <div className="flex shrink-0 items-center gap-2">
              {project.featured ? (
                <Badge variant="outline" className="hidden sm:inline-flex">
                  Destaque
                </Badge>
              ) : null}
              <Badge
                variant={project.status === "published" ? "accent" : "neutral"}
              >
                {project.status === "published" ? "Publicado" : "Rascunho"}
              </Badge>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StatusHint({
  state,
  pending,
}: {
  state: SaveState;
  pending: boolean;
}) {
  if (state === "saving" || pending) {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 text-xs text-muted">
        <Refresh size={13} weight="Linear" className="animate-spin" />
        Salvando ordem
      </span>
    );
  }

  if (state === "saved") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 text-xs text-accent">
        <CheckCircle size={13} weight="Bold" />
        Ordem salva
      </span>
    );
  }

  return null;
}
