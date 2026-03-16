import { RefObject, useEffect, useState } from "react";
import { DragType, DragTypeMap } from "./dragTypes";
import { dragManager } from "./dragManager";

// Draggable
export function useDraggable<T extends DragType>(
  ref: RefObject<HTMLElement>,
  type: T,
  payload: DragTypeMap[T],
  meta?: { path?: string; name?: string; [key: string]: any }
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleDragStart = (e: DragEvent) => {
      dragManager.setDrag({ type, payload, meta });
      e.dataTransfer?.setData("text/plain", "drag");
    };

    el.setAttribute("draggable", "true");
    el.addEventListener("dragstart", handleDragStart);

    return () => {
      el.removeEventListener("dragstart", handleDragStart);
    };
  }, [ref, type, payload, meta]);
}

// Droppable with multiple accepted types
export function useDroppable<T extends DragType>(
  ref: RefObject<HTMLElement>,
  accept: T[],
  onDrop: (data: DragTypeMap[T], type: T, meta?: { [key: string]: any }) => void
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleDragOver = (e: DragEvent) => {
      const current = dragManager.getDrag();
      if (current && accept.includes(current.type as T)) {
        e.preventDefault();
      }
    };

    const handleDrop = (e: DragEvent) => {
      const current = dragManager.getDrag();
      if (current && accept.includes(current.type as T)) {
        e.preventDefault();
        onDrop(current.payload as DragTypeMap[T], current.type as T, current.meta);
        dragManager.clearDrag();
      }
    };

    el.addEventListener("dragover", handleDragOver);
    el.addEventListener("drop", handleDrop);

    return () => {
      el.removeEventListener("dragover", handleDragOver);
      el.removeEventListener("drop", handleDrop);
    };
  }, [ref, accept, onDrop]);
}

// Hook to track drag state (optional)
export function useIsDragging() {
  const [isDragging, setDragging] = useState(false);

  useEffect(() => {
    const update = () => setDragging(!!dragManager.getDrag());
    const unsub = dragManager.subscribe(update);
    return () => {unsub()};
  }, []);

  return isDragging;
}