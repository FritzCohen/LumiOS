import { useEffect } from "react";
import { Directory, File } from "./types";
import virtualFS from "./virtualFS";

export function useFolderWatcher(
  path: string | null | undefined,
  onChange: (entries: Record<string, File | Directory>) => void,
  dependencies: any[] = []
) {
  useEffect(() => {
    if (!path) return;

    let active = true;

    const handleChange = async () => {
      try {
        const updated = await virtualFS.readdir(path);
        if (active) {
          onChange(updated);
        }
      } catch (err) {
        console.error("Failed to read directory:", err);
      }
    };

    handleChange();

    virtualFS.onFolderChange(path, handleChange);

    return () => {
      active = false;
      virtualFS.offFolderChange(path, handleChange);
    };
  }, [path, ...dependencies]);
}