import { TaskbarDesktopItem } from "../../../../types/globals";
import { getIconForFile } from "../../../../constants/constants";
import { Directory, File } from "../../../api/types";

/**
 * Build desktop items from the file system while
 *   – using persisted icon/permission/id if previously opened
 */
export function generateDisplayedDesktopItems(
  taskbarItems: Record<string, File | Directory>,
  exeRegistryRef: React.MutableRefObject<
    Map<string, { icon: string; id: string; displayName: string; permission: number }>
  >
): TaskbarDesktopItem[] {
  return Object.entries(taskbarItems).map(([name, item]) => {
    const cachedEntry = exeRegistryRef.current.get(name);

    return <TaskbarDesktopItem>{
      title: name,
      type:
        cachedEntry
          ? "exe"
          : item.type === "directory"
            ? "directory"
            : item.fileType,
      icon: cachedEntry ? cachedEntry.icon : getIconForFile(item),
      open: false, // No longer tracking open state
      id: cachedEntry ? cachedEntry.id : undefined,
      displayName: cachedEntry ? cachedEntry.displayName : name,
      permission: cachedEntry ? cachedEntry.permission : item.permission ?? null,
    };
  });
}