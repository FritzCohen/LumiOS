import { useRef, memo } from "react";
import { useDraggable } from "../../../../hooks/DragAndDrop/useDragAndDrop";
import useContextMenu from "../ContextMenu/useContextMenu";
import { faArrowUp, faArrowDown, faArrowUpRightFromSquare, faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons";
import { NamedFile, NamedDirectory } from "../../../apps/FileExplorer/fileExplorerTypes";
import { getIconForFile } from "../../../../constants/constants";
import { File } from "../../../api/types";
import ContextMenu from "../ContextMenu/ContextMenu";
import { Position } from "react-rnd";

type NamedItem = NamedFile | NamedDirectory;

interface DesktopItemProps {
  item: NamedItem;
  itemPosition: Position | null;
  selected: boolean;
  makeRef: (el: HTMLDivElement | null) => void;
  renamingId: string | null;
  setRenamingId: (id: string | null) => void;
  tempName: string;
  setTempName: (val: string) => void;
  desktop: any;
  selectedIds: Set<string>;
}

const DesktopItem: React.FC<DesktopItemProps> = memo(
  ({ item, selected, makeRef, renamingId, setRenamingId, tempName, setTempName, desktop }) => {
    const ref = useRef<HTMLDivElement>(null);
    const {
      contextMenuVisible,
      contextMenuItems,
      contextMenuPosition,
      showContextMenu,
      hideContextMenu,
    } = useContextMenu();

    // --- Drag & drop
    useDraggable(ref, "file", item as File, {
      path: `${item.fullPath.split("/Desktop/")[0]}/Desktop`,
      name: item.name,
    });

    const finishRename = async (commit: boolean) => {
      if (commit && tempName.trim() && renamingId) {
        await desktop.actions.rename(renamingId, tempName.trim());
      }
      setRenamingId(null);
    };

    const handleContextMenu = (e: React.MouseEvent) => {
      e.preventDefault();
      showContextMenu(
        e,
        [
          { name: "Open", icon: faArrowUpRightFromSquare, action: () => desktop.actions.open(item) },
          { name: "Open With", icon: faArrowUpRightFromSquare, action: () => desktop.actions.openWith(item, item.name, item.fullPath) },
          {
            name: "Rename",
			      icon: faPenToSquare,
            action: () => {
              setRenamingId(item.name);
              setTempName(item.name);
            },
          },
          {
            name: "Move",
            children: [
              { name: "Up", icon: faArrowUp, action: () => {} },
              { name: "Down", icon: faArrowDown, action: () => {} },
            ],
          },
          { name: "Delete", icon: faTrash, action: () => desktop.actions.remove(item.name) },
        ],
        ref
      );
    };

    return (
      <div
        ref={(el) => {
          makeRef(el);
        }}
        className={`desktop-item ${selected ? "selected" : ""}`}
        onDoubleClick={() => {
          if (renamingId !== item.name) desktop.actions.open(item);
        }}
        onContextMenu={handleContextMenu}
      >
        <img src={getIconForFile(item)} alt={item.name} className="svg-wrapper" draggable={false} />

        {renamingId === item.name ? (
          <input
            className="rename-input"
            style={{ width: "70px", textAlign: "center", color: "black" }} // limits input width
            autoFocus
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onBlur={() => finishRename(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter") finishRename(true);
              else if (e.key === "Escape") finishRename(false);
            }}
            onClick={(e) => e.stopPropagation()} // prevent parent double-click
          />
        ) : (
          <p
            className="desktop-item-label"
            onDoubleClick={(e) => {
              e.stopPropagation(); // prevent opening app
              setRenamingId(item.name);
              setTempName(item.name);
            }}
          >
            {item.name}
          </p>
        )}

        {contextMenuVisible && (
          <ContextMenu
            menuPosition={contextMenuPosition}
            menuItems={contextMenuItems}
            hideMenu={hideContextMenu}
          />
        )}
      </div>
    );
  }
);

export default DesktopItem;
