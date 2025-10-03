import { useCallback, useEffect, useState } from "react";
import { clipboardManager } from "./clipboardManager";
import { NamedDirectory, NamedFile } from "../../system/apps/FileExplorer/fileExplorerTypes";

export function useCopy(getItems?: () => (NamedFile | NamedDirectory)[]) {
  // Manual copy function
  const copy = useCallback((items: (NamedFile | NamedDirectory)[]) => {
    if (items.length === 0) return;
    clipboardManager.set(items);
  }, []);

  // Optional Ctrl+C handler
  useEffect(() => {
    if (!getItems) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "c") {
        const items = getItems();
        if (items.length === 0) return;
        clipboardManager.set(items);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [getItems]);

  return { copy };
}

export function usePaste(
  onPaste: (items: (NamedFile | NamedDirectory)[]) => Promise<void>,
  containerRef?: React.RefObject<HTMLElement>
) {
  const [items, setItems] = useState<(NamedFile | NamedDirectory)[]>(clipboardManager.get());

  // Auto-update when clipboard changes
  useEffect(() => {
    const unsubscribe = clipboardManager.subscribe(setItems);
    return unsubscribe;
  }, []);

  const paste = useCallback(async () => {
    const currentItems = clipboardManager.get();
    if (currentItems.length === 0) return;
    await onPaste(currentItems);
  }, [onPaste]);

  // Ctrl+V handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v") {
        if (containerRef?.current) {
          const active = document.activeElement;
          if (!containerRef.current.contains(active)) return;
        }
        paste();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [paste, containerRef]);

  return { paste, items };
}