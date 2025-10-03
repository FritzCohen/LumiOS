// /Desktop/components/DesktopItems/DesktopItems.tsx
import { useRef, useCallback, useMemo } from "react";
import DesktopItem from "./DesktopItem";
import { useDesktop } from "./useDesktop";
import useSelection from "../../../../hooks/Selection/useSelection";
import useContextMenu from "../ContextMenu/useContextMenu";
import ContextMenu from "../ContextMenu/ContextMenu";
import { useDroppable } from "../../../../hooks/DragAndDrop/useDragAndDrop";
import virtualFS from "../../../api/virtualFS";
import "./style.css";
import {
	faCirclePlus,
	faClipboard,
	faFileCirclePlus,
	faFolderPlus,
	faPaintBrush,
	faRefresh,
	faTerminal,
} from "@fortawesome/free-solid-svg-icons";
import { useCopy, usePaste } from "../../../../hooks/Clipboard/useClipboard";
import { NamedDirectory, NamedFile } from "../../../apps/FileExplorer/fileExplorerTypes";

const DesktopItems = () => {
	const containerRef = useRef<HTMLDivElement>(null);

	const desktop = useDesktop();
	const { selectedIds, registerItem, selectionBoxStyle } =
		useSelection(containerRef);

	const selectedItems = useMemo(() => {
		return Array.from(selectedIds)
			.map((id) => desktop.items.find((item) => item.name === id))
			.filter(Boolean);
	}, [selectedIds]);

	const {
		contextMenuVisible,
		contextMenuItems,
		contextMenuPosition,
		showContextMenu,
		hideContextMenu,
	} = useContextMenu();

	// Copy and paste logique
	const { copy } = useCopy(() => selectedItems as (NamedFile | NamedDirectory)[]);
	const { items, paste } = usePaste(async (items) => {
		console.log(items);

		for (const item of items) {
			await virtualFS.copyItem(desktop.directory, item.name, item);
		}
	}, containerRef);

	// --- Drag & drop for desktop
	useDroppable(
		containerRef,
		["file", "directory"],
		async (data, type, meta) => {
			if (!meta) return;
			const { path, name } = meta;
			if (!path || !name) return;

			const targetPath = `${
				desktop.items[0]?.fullPath.split("/Desktop/")[0]
			}/Desktop`; // base path
			try {
				await virtualFS.mv(path, targetPath, name, name, 1);
				desktop.actions.refresh();
			} catch (err) {
				console.error("Drag-drop move failed:", err);
			}
		}
	);

	// --- Stable refs for selection
	const makeRef = useCallback(
		(id: string) => (el: HTMLDivElement | null) => {
			if (el) registerItem(id, el);
		},
		[registerItem]
	);

	// --- Context menu for desktop background
	const handleContextMenu = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault();

			showContextMenu(
				e,
				[
					...(selectedItems.length
						? [
								{
									name: `Open ${
										selectedItems.length == 1
											? selectedItems[0]?.name
											: "All"
									}`,
									action: () =>
										selectedItems.forEach(
											async (item) =>
												item &&
												desktop.actions.open(item)
										),
								},
								{
									name: `Copy ${
										selectedItems.length == 1
											? selectedItems[0]?.name
											: "All"
									}`,
									action: () =>
										copy(
											selectedItems as (
												| NamedFile
												| NamedDirectory
											)[]
										),
								},
								{
									name: `Delete ${
										selectedItems.length == 1
											? selectedItems[0]?.name
											: "All"
									}`,
									action: () =>
										selectedItems.forEach(
											async (item) =>
												item &&
												desktop.actions.remove(item.name)
										),
								},
						  ]
						: []),
					...(items.length != 0 ? [{
						name: "Paste All",
						icon: faClipboard,
						action: paste,
						gap: true
					}] : []),
					{
						name: "Refresh",
						icon: faRefresh,
						action: desktop.actions.refresh,
					},
					{
						name: "Personalize",
						icon: faPaintBrush,
						action: desktop.actions.openSettings,
					},
					{
						name: "Open in Terminal",
						icon: faTerminal,
						action: desktop.actions.openTerminal,
						gap: true
					},
					{
						name: "New",
						children: [
							{
								name: "New File",
								icon: faFileCirclePlus,
								action: desktop.actions.createFile,
							},
							{
								name: "New Folder",
								icon: faFolderPlus,
								action: desktop.actions.createFolder,
							},
							{
								name: "Shortcut",
								icon: faCirclePlus,
								action: desktop.actions.createShortcut,
							},
						],
					},
					{
						name: "Sort By",
						children: [
							{
								name: "Name (A-Z)",
								action: () =>
									desktop.actions.setSortMethod("ascending"),
							},
							{
								name: "Name (Z-A)",
								action: () =>
									desktop.actions.setSortMethod("descending"),
							},
							{
								name: "Type",
								action: () =>
									desktop.actions.setSortMethod("type"),
							},
							{
								name: "As Is",
								action: () =>
									desktop.actions.setSortMethod("asis"),
							},
						],
					},
				],
				containerRef
			);
		},
		[desktop.actions, showContextMenu]
	);

	return (
		<div
			ref={containerRef}
			tabIndex={0}
			className="desktop-item-grid"
			style={{ position: "relative", userSelect: "none" }}
			onContextMenu={handleContextMenu}
		>
			{desktop.items.map((item) => (
				<DesktopItem
					key={item.name}
					item={item}
					itemPosition={desktop.itemPositions[item.name]}
					selected={selectedIds.has(item.name)}
					makeRef={makeRef(item.name)}
					renamingId={desktop.renamingId}
					setRenamingId={desktop.setRenamingId}
					tempName={desktop.tempName}
					setTempName={desktop.setTempName}
					desktop={desktop} // pass whole hook
					selectedIds={selectedIds}
				/>
			))}

			{selectionBoxStyle && <div style={selectionBoxStyle} />}
			{contextMenuVisible && (
				<ContextMenu
					menuPosition={contextMenuPosition}
					menuItems={contextMenuItems}
					hideMenu={hideContextMenu}
				/>
			)}
		</div>
	);
};

export default DesktopItems;
