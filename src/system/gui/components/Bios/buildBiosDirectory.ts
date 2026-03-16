import { Permission } from "../../../../types/globals";
import { File, Directory } from "../../../api/types";
import { serializeCommand } from "./biosTypes";
import { BiosMenuNode } from "./defaultBiosMenus";

function buildBiosDirectory(node: BiosMenuNode): Directory {
  const children: Record<string, File | Directory> = {};

  // 1. Commands -> files
  for (const cmd of node.commands) {
    children[`${cmd.id}.biosCommand`] = {
      type: "file",
      fileType: "biosCommand",
      content: serializeCommand(cmd),
      date: new Date(),
      permission: Permission.SYSTEM,
      deleteable: false,
    };
  }

  // 2. Child menus -> directories (recursive)
  if (node.children) {
    for (const [name, childNode] of Object.entries(node.children)) {
      children[name] = buildBiosDirectory(childNode);
    }
  }

  return {
    type: "directory",
    date: new Date(),
    permission: Permission.SYSTEM,
    deleteable: false,
    children,
  };
}

export default buildBiosDirectory;