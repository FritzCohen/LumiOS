import { faUpRightFromSquare, faX, faTrashCan, faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import { TaskbarDesktopItem } from "../../../../types/globals";
import { OpenedApp } from "../../../../context/kernal/kernal";
import { useCallback } from "react";

interface TaskbarItemProps {
  item: TaskbarDesktopItem;
  app?: OpenedApp;
  desktopItemExists: boolean;
  handleClick: (item: TaskbarDesktopItem) => void;
  handleDelete: (item: TaskbarDesktopItem) => void;
  taskbarRef: React.RefObject<HTMLDivElement>;
}

const TaskbarItem = ({ item, app, desktopItemExists, handleClick, handleDelete, taskbarRef }: TaskbarItemProps) => {
  const onContextMenu = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (!taskbarRef.current) return;

      const menuItems = [
        {
          name: app ? (app.minimized ? "Maximize" : "Minimize") : "Open",
          icon: faUpRightFromSquare,
          action: () => handleClick(item),
        },
        {
          name: desktopItemExists ? "Remove" : "Add",
          icon: desktopItemExists ? faTrashCan : faPlusCircle,
          action: () => handleDelete(item),
        },
        {
          name: "Close",
          icon: faX,
          gap: true,
          action: () => {}
        },
      ];

      // showContextMenu(e, menuItems, taskbarRef);
    },
    [app, desktopItemExists, handleClick, handleDelete, item, taskbarRef]
  );

  return (
    <div
      className={`taskbar-item text-[10px] ${item.open ? "underline border" : ""}`}
      onClick={() => handleClick(item)}
      onContextMenu={onContextMenu}
    >
      <img src={item.icon} alt={item.title} />
      <p>{item.displayName}</p>
    </div>
  );
};

export default TaskbarItem;