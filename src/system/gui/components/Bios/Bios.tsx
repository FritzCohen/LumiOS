import { useEffect, useMemo, useState } from "react";
import { MenuView } from "./MenuView";
import { useMenuEngine } from "./useMenuEngine";
import { BiosCommand } from "./biosTypes";
import { useFolderWatcher } from "../../../api/useFolderWatcher";
import executeBiosCommand from "./executeBiosCommand";
import collectMenus from "./collectMenus";
import { useWindow } from "../../../../context/window/WindowProvider";

const BIOS_ROOT = "System/BiosCommands/";

const Bios = () => {
  const { setShowBios: exit } = useWindow();

  const [menuId, setMenuId] = useState("MAIN");
  const [menus, setMenus] = useState<Record<string, BiosCommand[]>>({});

  useFolderWatcher(BIOS_ROOT, (entries) => {
    setMenus(collectMenus(entries));
  });

  // Hard exit support
  useEffect(() => {
    const handler = () => exit(false);
    window.addEventListener("bios-exit", handler);
    return () => window.removeEventListener("bios-exit", handler);
  }, [exit]);

  const currentCommands = menus[menuId] ?? [];

  /**
   * Subdirectories = navigable menus
   * A child menu is any menu whose parent path === current menu
   */
  const directoryCommands: BiosCommand[] = useMemo(() => {
    const prefix = menuId === "MAIN" ? "" : `${menuId}/`;

    return Object.keys(menus)
      .filter(id => id.startsWith(prefix) && id !== menuId)
      .filter(id => !id.slice(prefix.length).includes("/")) // only direct children
      .map(id => {
        const label = id.split("/").pop()!;
        return {
          id: `dir:${id}`,
          label,
          type: "action",
          run: () => setMenuId(id),
        };
      });
  }, [menus, menuId]);

  /**
   * Proper recursive back navigation
   */
  const backCommand: BiosCommand[] =
    menuId !== "MAIN"
      ? [
          {
            id: "back",
            label: "Back",
            run: () => {
              const parent =
                menuId.includes("/") ?
                  menuId.split("/").slice(0, -1).join("/") :
                  "MAIN";

              setMenuId(parent || "MAIN");
            },
          },
        ]
      : [];

  const fullMenu = [...directoryCommands, ...currentCommands, ...backCommand];

  const engine = useMenuEngine(
    fullMenu,
    (cmd) =>
      executeBiosCommand(cmd, {
        setCurrentMenu: setMenuId,
        exitBios: () => exit(false),
        ...(window as any).API
      }),
    () => setMenuId("MAIN")
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ background: "black" }}>
      <MenuView
        title={menuId.replace(/\//g, " / ")}
        options={fullMenu}
        {...engine}
      />
    </div>
  );
};

export default Bios;
