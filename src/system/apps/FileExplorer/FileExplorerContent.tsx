import React, { useCallback, useEffect, useRef } from "react";
import FileExplorerItem from "./FileExplorerItem";
import type { FileExplorerState } from "./fileExplorerTypes";
import useSelection from "../../../hooks/Selection/useSelection";
import { SelectableContainer } from "../../../hooks/Selection/SelectableContainer";
import { usePaste } from "../../../hooks/Clipboard/useClipboard";
import virtualFS from "../../api/virtualFS";
import useContextMenu from "../../gui/components/ContextMenu/useContextMenu";
import ContextMenu from "../../gui/components/ContextMenu/ContextMenu";
import { faArrowLeft, faArrowUpRightFromSquare, faClipboard, faCopy, faFileCirclePlus, faFolderPlus } from "@fortawesome/free-solid-svg-icons";
import { clipboardManager } from "../../../hooks/Clipboard/clipboardManager";
import getNeededApp from "../../../constants/betterGetNeededApp";

const FileExplorerContent: React.FC<{
  explorer: FileExplorerState;
  fileExplorerRef: React.RefObject<HTMLDivElement>;
}> = ({ explorer, fileExplorerRef }) => {
  const {
    content,
    selectedItems,
    setSelectedItems,
    handleItemSelect,
    openApp,
    setDirectory,
    handleCopy,
    handlePaste,
    handleCut,
    handleDelete,
    handleDrop,
    handleAddFile,
    handleAddFolder,
    handleBack,
    directory,
  } = explorer;
  const allKeys = Object.keys(content);

  const {
		contextMenuVisible,
		contextMenuItems,
		contextMenuPosition,
		showContextMenu,
		hideContextMenu,
	} = useContextMenu();

  // SELECTION BOX SHIT
  const containerRef = useRef(null);
  const { selectedIds, registerItem, selectionBoxStyle } = useSelection(containerRef);

  // --- Stable refs for selection
  const makeRef = useCallback(
    (id: string) => (el: HTMLDivElement | null) => {
      if (el) registerItem(id, el);
    },
    [registerItem]
  );

  useEffect(() => {
    const selectedItems = Object.keys(content).filter(value => selectedIds.has(value)).map(value => content[value]);
    
    setSelectedItems(selectedItems);
  }, [selectedIds]);
  // END OF SHIT

  // MORE SHIT
  const { paste } = usePaste(async (items) => {
    for (const item of items) {
      await virtualFS.copyItem(directory, item.name, item);
    }
  }, containerRef);
  // END OF MORE SHIT

  const handleItemsOpen = async () => {
    selectedItems.forEach(async (item) => {      
      openApp(await getNeededApp({
        item,
        path: item.fullPath,
        name: item.name,
      }));
    });
  };

  // Context menu
  	const handleContextMenu = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault();
      
      const items = clipboardManager.get();

      showContextMenu(e, [
        // Open
        ...(selectedItems.length != 0
            ? [{
                name: `Open ${selectedItems.length === 1 ? selectedItems[0]?.name : "All"}`,
                icon: faArrowUpRightFromSquare,
                action: handleItemsOpen
              }]
            : []),
        // Copy
        ...(selectedItems.length != 0
            ? [{
                name: `Copy ${selectedItems.length === 1 ? selectedItems[0]?.name : "All"}`,
                icon: faCopy,
                action: handleCopy
              }]
            : []),
        // Paste
        ...(items.length !== 0
            ? [{
                name: `Paste ${items.length == 1 ? items[0].name : "All"}`,
                icon: faClipboard,
                action: paste,
                gap: true,
              }]
            : []),
        {
          name: "Back",
          icon: faArrowLeft,
          action: handleBack,
        },
        {
          name: "New File",
          icon: faFileCirclePlus,
          action: handleAddFile,
        },
        {
          name: "New Folder",
          icon: faFolderPlus,
          action: handleAddFolder
        }
      ], containerRef);
    }, [showContextMenu]
    );
  return (
    <SelectableContainer className="flex flex-col gap-1 w-full h-full px-5 py-2 overflow-y-auto" ref={containerRef} tabIndex={0} onContextMenu={handleContextMenu}>
      {allKeys.length === 0 && <p>No items were found. At {directory}</p>}
      {allKeys.map((fileKey, index) => {
        const file = content[fileKey];
        const isSelected = selectedItems.includes(file);

        return (
          <FileExplorerItem
            key={fileKey}
            file={file}
            fileKey={fileKey}
            directory={directory}
            isSelected={isSelected}
            selectedItems={selectedItems}
            setSelectedItems={setSelectedItems}
            handleItemSelect={handleItemSelect}
            index={index}
            openApp={openApp}
            fileExplorerRef={fileExplorerRef}
            handleCopy={handleCopy}
            handlePaste={handlePaste}
            handleCut={handleCut}
            handleDelete={handleDelete}
            setDirectory={setDirectory}
            handleDrop={handleDrop}
            makeRef={makeRef(fileKey)}
          />
        );
      })}
			{selectionBoxStyle && <div style={selectionBoxStyle} />}
      {contextMenuVisible && (
				<ContextMenu
					menuPosition={contextMenuPosition}
					menuItems={contextMenuItems}
					hideMenu={hideContextMenu}
				/>
			)}
    </SelectableContainer>
  );
};

export default FileExplorerContent;