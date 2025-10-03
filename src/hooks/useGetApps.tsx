import { useMemo, useState } from "react";
import { Directory, File } from "../system/api/types";
import { useFolderWatcher } from "../system/api/useFolderWatcher";
import { useUser } from "../context/user/user";
import { Executable } from "../types/globals";
import { components } from "../system/apps/Components";
import Shortcut from "../system/apps/Shortcut/Shortcut";
import shortcutIcon from "../assets/Icons/shortcut.png";

/**
 * Hook that gets every user app that they have installed
 * Only acceptable types are shortcut, and exe
 * 
 * For html or other file types use a shortcut that maps to the needed file
 * 
 * @returns All user installed apps as Executables
 */
const useGetApps = (): Executable[] => {
  const [rawApps, setRawApps] = useState<Record<string, File | Directory>>({});
  const { userDirectory } = useUser();

  useFolderWatcher(`${userDirectory}/Apps/`, setRawApps, []);

  const ACCEPTABLE_TYPES = ["exe", "shortcut"];

return useMemo(() => {
  return Object.entries(rawApps)
    .filter((entry): entry is [string, File] => {
      const app = entry[1];
      if (app.type !== "file") return false;
      return ACCEPTABLE_TYPES.some(value => app.fileType.includes(value));
    })
    .map(([name, app]) => {
      let executable: Omit<Executable, "mainComponent"> =
        app.content as Omit<Executable, "mainComponent">;

      let Component =
        app.fileType === "exe"
          ? components[executable.config.name || executable.config.displayName]
          : undefined;

      if (app.fileType === "shortcut") {
        Component = Shortcut;
        executable = {
          config: {
            name,
            displayName: name,
            permissions: 1,
            icon: shortcutIcon,
          },
        };
      }

      if (!Component) Component = () => undefined;

      return {
        ...executable,
        mainComponent: (props: any) =>
          app.fileType === "shortcut" ? (
            <Component name={name} path={`${userDirectory}/Apps/`} {...props} />
          ) : (
            <Component {...props} />
          ),
      };
    });
}, [rawApps]);

};

export default useGetApps;