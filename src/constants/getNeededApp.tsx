import { Executable, Permission } from "../types/globals";
import { components } from "../system/apps/Components";
import fileTypes from "../system/api/FileTypes";
import normalizePath from "./normalizePath";
import Shortcut from "../system/apps/Shortcut/Shortcut";
import { type File, Directory } from "../system/api/types";

type OpenableItem = File | Directory;

const getNeededApp = (item: OpenableItem, path?: string, name?: string): Executable => {
  const type = "fileType" in item ? item.fileType : item.type;

  const resolvedName: string = name ?? ("name" in item ? item.name as string : item?.displayName ?? "");
  const displayName: string = item?.displayName || resolvedName as string;
  const permission = "permission" in item ? item.permission : 0;

  let componentKey: string | null = null;

  switch (type) {
    case "exe":
      componentKey = resolvedName;
      break;
    case "shortcut":
      componentKey = "Shortcuts";
      break;
    case "file":
      componentKey = "Notepad";
      break;
    case "directory":
      componentKey = "FileExplorer";
      break;
    case "html":
      componentKey = "HTMLViewer";
      break;
    case "swf":
      componentKey = "SWFPlayer";
      break;
    default:
      componentKey = type in fileTypes ? "Notepad" : null;
  }

  const Component = componentKey ? components[componentKey] : null;

  const config = {
    name: resolvedName || "Default",
    permissions: permission as Permission || 0,
    displayName,
    icon: "icon" in item ? item.icon : "",
    defaultPath: normalizePath(path || "")
  };

  return {
    config,
    mainComponent: () =>
      Component ? (
        type === "shortcut" ? (
          <Shortcut
            name={resolvedName}
            path={path as string}
          />
        ) : (
          <Component
            props={config}
            defaultPath={path}
            defaultName={resolvedName}
            file={item}
            name={name}
            path={path}
          />
        )
      ) : (
        <div>nothing...</div>
      ),
  };
};

export default getNeededApp;
