import { useEffect, useState } from "react";
import { BiosCommand } from "./biosTypes";

export function useMenuEngine(
  options: BiosCommand[],
  onSelect: (opt: BiosCommand) => void,
  onExit?: () => void
) {
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        setSelected(v => (v - 1 + options.length + 1) % (options.length + 1));
      }

      if (e.key === "ArrowDown") {
        setSelected(v => (v + 1) % (options.length + 1));
      }

      if (e.key === "Enter") {
        if (selected === options.length) {
          onExit?.();
          return;
        }

        const opt = options[selected];
        onSelect(opt);
      }

      if (e.key === "Escape") {
        onExit?.();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [options, selected, onExit, onSelect]);

  return { selected };
}