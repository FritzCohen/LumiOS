import React, { memo, useEffect, useRef, useState } from "react";
import { TaskbarDesktopItem } from "../../../../types/globals";
import { faArrowDown, faArrowUp } from "@fortawesome/free-solid-svg-icons";
import { useDraggable } from "../../../../hooks/DragAndDrop/useDragAndDrop";
import virtualFS from "../../../api/virtualFS";
import { File } from "../../../api/types";

interface DesktopItemSingleProps {
  item: TaskbarDesktopItem;
  selected: boolean;
  isRenaming: boolean;
  tempName: string;
  setTempName: (val: string) => void;
  onDoubleClick: (item: TaskbarDesktopItem) => void;
  startRenaming: (item: TaskbarDesktopItem) => void;
  finishRenaming: (item: TaskbarDesktopItem, commit: boolean) => void;
  handleDelete: (item: TaskbarDesktopItem) => void;
  handleMove: (item: TaskbarDesktopItem, direction: "up" | "down") => void;
  makeRef: (id: string) => (el: HTMLDivElement | null) => void;
  userDirectory: string;
  showContextMenu: (
    e: React.MouseEvent,
    menuItems: any[],
    targetRef: React.RefObject<HTMLDivElement>
  ) => void;
}

const DesktopItemSingle: React.FC<DesktopItemSingleProps> = memo(({
  item,
  selected,
  isRenaming,
  tempName,
  setTempName,
  onDoubleClick,
  startRenaming,
  finishRenaming,
  handleDelete,
  handleMove,
  makeRef,
  userDirectory,
  showContextMenu,
}) => {
    const [file, setFile] = useState<File | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
  const fetchFile = async () => {
    const fetched = await virtualFS.readfile(`${userDirectory}/Desktop/`, item.title);
    if (fetched && fetched.type === "file") {
      setFile(fetched);
    }
  };

  fetchFile();
}, [item.title, userDirectory]);

  useDraggable(
    ref,
    "file",
    file || { type: "file", date: new Date(), permission: 0, deleteable: true, content: "", fileType: "txt"},
    { path: `${userDirectory}/Desktop/`, name: item.title }
  );

  const getTextSizeClass = (text: string) => {
    if (text.length <= 10) return "text-sm";
    if (text.length <= 20) return "text-xs";
    if (text.length <= 30) return "text-[10px]";
    return "text-[9px]";
  };

  return (
    <div
      key={item.title}
        ref={(el) => {
        makeRef(item.title)(el); // call parent's ref setter

        // Update local ref only if different
        if (ref.current !== el) {
            (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
        }
      }}
      className={`desktop-item ${selected ? "selected" : ""}`}
      onDoubleClick={() => !isRenaming && onDoubleClick(item)}
      onContextMenu={(e) =>
        showContextMenu(
          e,
          [
            { name: "Rename", action: () => startRenaming(item) },
            {
              name: "Move Up/Down",
              children: [
                { name: "Up", icon: faArrowUp, action: () => handleMove(item, "up") },
                { name: "Down", icon: faArrowDown, action: () => handleMove(item, "down") },
              ],
            },
            { name: "Delete", action: () => handleDelete(item) },
          ],
          ref
        )
      }
    >
      <img src={item.icon} alt="" className="svg-wrapper" draggable={false} />

      {isRenaming ? (
        <input
          className={`rename-input text-center w-full max-w-[100%] bg-transparent border border-blue-500 px-1 py-0.5 outline-none ${getTextSizeClass(
            tempName
          )}`}
          style={{ color: "black" }}
          autoFocus
          value={tempName}
          onChange={(e) => setTempName(e.target.value)}
          onBlur={() => finishRenaming(item, false)}
          onKeyDown={(e) => {
            if (e.key === "Enter") finishRenaming(item, true);
            else if (e.key === "Escape") finishRenaming(item, false);
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <p
          className="w-fit h-fit"
          onDoubleClick={(e) => {
            e.stopPropagation();
            startRenaming(item);
          }}
        >
          {item.displayName || item.title}
        </p>
      )}
    </div>
  );
});

export default DesktopItemSingle;