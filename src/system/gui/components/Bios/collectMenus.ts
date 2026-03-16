import { File, Directory } from "../../../api/types";
import { BiosCommand, deserializeCommand } from "./biosTypes";

function collectMenus(
  entries: Record<string, File | Directory>,
  path: string[] = []
): Record<string, BiosCommand[]> {
  const menus: Record<string, BiosCommand[]> = {};

  const menuId = path.length === 0 ? "MAIN" : path.join("/");

  const commands: BiosCommand[] = Object.values(entries)
    .filter(
      (entry): entry is File =>
        entry.type === "file" && entry.fileType === "biosCommand"
    )
    .map((file) => deserializeCommand(file.content));

  if (commands.length > 0) {
    menus[menuId] = commands;
  }

  for (const [name, entry] of Object.entries(entries)) {
    if (entry.type === "directory") {
      Object.assign(
        menus,
        collectMenus(entry.children, [...path, name])
      );
    }
  }

  return menus;
}

export default collectMenus;