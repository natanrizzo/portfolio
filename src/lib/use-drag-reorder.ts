"use client";

import { useState, type DragEvent, type KeyboardEvent } from "react";

export function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (from === to || to < 0 || to >= items.length) return items;
  const next = items.slice();
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

type Options = {
  /** Reordena o estado local. Chamado a cada item cruzado durante o arrasto. */
  onMove: (from: number, to: number) => void;
  count: number;
};

/**
 * Reordenação por arrastar sobre a API nativa de drag and drop — sem
 * dependência extra e com o cursor "grab" do sistema de graça.
 *
 * O `draggable` só liga quando o ponteiro desce sobre a alça, senão o navegador
 * tentaria arrastar o link dentro da linha em vez da linha inteira. A mesma alça
 * responde às setas do teclado, que é o caminho de quem não usa mouse.
 *
 * Persistir a nova ordem é responsabilidade de quem chama: o hook só mexe na
 * lista, e o dono do estado sabe quando e como gravá-la.
 */
export function useDragReorder({ onMove, count }: Options) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [armedIndex, setArmedIndex] = useState<number | null>(null);

  function reset() {
    setDragIndex(null);
    setArmedIndex(null);
  }

  return {
    dragIndex,
    itemProps(index: number) {
      return {
        draggable: armedIndex === index,
        onDragStart(event: DragEvent<HTMLElement>) {
          setDragIndex(index);
          event.dataTransfer.effectAllowed = "move";
          // O Firefox só inicia o arrasto se houver payload.
          event.dataTransfer.setData("text/plain", String(index));
        },
        onDragEnter() {
          if (dragIndex === null || dragIndex === index) return;
          onMove(dragIndex, index);
          setDragIndex(index);
        },
        onDragOver(event: DragEvent<HTMLElement>) {
          event.preventDefault();
          event.dataTransfer.dropEffect = "move";
        },
        onDrop(event: DragEvent<HTMLElement>) {
          event.preventDefault();
        },
        onDragEnd() {
          reset();
        },
      };
    },
    handleProps(index: number) {
      return {
        onPointerDown: () => setArmedIndex(index),
        onPointerUp: () => setArmedIndex(null),
        onKeyDown(event: KeyboardEvent<HTMLElement>) {
          const delta =
            event.key === "ArrowUp" ? -1 : event.key === "ArrowDown" ? 1 : 0;
          if (!delta) return;
          const target = index + delta;
          if (target < 0 || target >= count) return;

          event.preventDefault();
          onMove(index, target);
        },
      };
    },
  };
}
