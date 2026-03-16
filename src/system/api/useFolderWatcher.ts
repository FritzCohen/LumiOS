import { useEffect } from "react";
import { Directory, File } from "./types";
import virtualFS from "./virtualFS";

/**
 * Watcher for when a directory updates
 * 
 * @param path Path to the target file
 * @param onChange Callback for directory update
 * @param dependencies If present, effect will only activate if the values in the list change.
 * 
 * @returns File | Directory entries
 */
export function useFolderWatcher(
  path: string | null | undefined,
  onChange: (entries: Record<string, File | Directory>) => void,
  dependencies: any[] = []
) {
  useEffect(() => {
    if (!path) return;

    let active = true;

    // Call to folder content
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

    // Subscribe to folder updates
    virtualFS.onFolderChange(path, handleChange);

    // Unsubscriber
    return () => {
      active = false;
      virtualFS.offFolderChange(path, handleChange);
    };
  }, [path, ...dependencies]);
}