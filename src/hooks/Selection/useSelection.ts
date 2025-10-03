import React, { useRef, useState, useEffect } from "react";

const THRESHOLD = 5; // pixels before drag starts

export default function useSelection(containerRef: React.RefObject<HTMLDivElement>) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const itemRefs = useRef(new Map<string, HTMLElement>());
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const isDragging = useRef(false);
  const [dragRect, setDragRect] = useState<DOMRect | null>(null);
  const modifierKeys = useRef({ shift: false, ctrl: false });

  function registerItem(id: string, el: HTMLElement | null) {
    if (el) {
      itemRefs.current.set(id, el);
    } else {
      itemRefs.current.delete(id);
    }
  }

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Get mouse position relative to container
    function getRelativePos(e: MouseEvent) {
      const rect = containerRef.current!.getBoundingClientRect();
      return {
        x: e.clientX - rect.left + containerRef.current!.scrollLeft,
        y: e.clientY - rect.top + containerRef.current!.scrollTop,
      };
    }

    function onMouseDown(e: MouseEvent) {
      if (e.button !== 0) return; // left click only
      if (e.target !== container) return; // only start on empty container

      dragStart.current = getRelativePos(e);
      isDragging.current = false;
      modifierKeys.current.shift = e.shiftKey;
      modifierKeys.current.ctrl = e.ctrlKey || e.metaKey;
      setDragRect(null);
    }

    function onMouseMove(e: MouseEvent) {
      if (!dragStart.current) return;

      const pos = getRelativePos(e);
      const dx = pos.x - dragStart.current.x;
      const dy = pos.y - dragStart.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (!isDragging.current && dist > THRESHOLD) {
        isDragging.current = true;
      }

      if (isDragging.current) {
        const x = Math.min(pos.x, dragStart.current.x);
        const y = Math.min(pos.y, dragStart.current.y);
        const width = Math.abs(dx);
        const height = Math.abs(dy);

        setDragRect(new DOMRect(x, y, width, height));
      }
    }

    function onMouseUp() {
      if (!dragStart.current) return;

      if (isDragging.current && dragRect) {
        const newSelected = new Set<string>(
          modifierKeys.current.shift || modifierKeys.current.ctrl ? [...selectedIds] : []
        );

        for (const [id, el] of itemRefs.current.entries()) {
          // Compute item rect relative to container
          const relLeft = el.offsetLeft;
          const relTop = el.offsetTop;
          const width = el.offsetWidth;
          const height = el.offsetHeight;

          const intersects =
            dragRect.right >= relLeft &&
            dragRect.left <= relLeft + width &&
            dragRect.bottom >= relTop &&
            dragRect.top <= relTop + height;

          if (intersects) {
            if (modifierKeys.current.ctrl && newSelected.has(id)) {
              newSelected.delete(id);
            } else {
              newSelected.add(id);
            }
          }
        }

        setSelectedIds(newSelected);
      } else {
        // Click on empty container clears selection (unless Shift/Ctrl)
        if (!modifierKeys.current.shift && !modifierKeys.current.ctrl) {
          setSelectedIds(new Set());
        }
      }

      dragStart.current = null;
      isDragging.current = false;
      setDragRect(null);
    }

    container.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      container.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [containerRef, dragRect, selectedIds]);

  const selectionBoxStyle: React.CSSProperties | null = dragRect
    ? {
        position: "absolute",
        top: dragRect.y,
        left: dragRect.x,
        width: dragRect.width,
        height: dragRect.height,
        backgroundColor: "rgba(0,123,255,0.2)",
        border: "1px dashed #007bff",
        pointerEvents: "none",
        zIndex: 9999,
      }
    : null;

  return { selectedIds, registerItem, selectionBoxStyle };
}
