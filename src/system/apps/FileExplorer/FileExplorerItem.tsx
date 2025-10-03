// FileExplorerItem.tsx
import React, { useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faArrowUpFromBracket,
	faArrowUpRightFromSquare,
	faClipboard,
	faCopy,
	faCut,
	faPaste,
	faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { getIconForFile } from "../../../constants/constants";
import type { NamedFile, NamedDirectory } from "./fileExplorerTypes";
import { useDraggable } from "../../../hooks/DragAndDrop/useDragAndDrop";
import getNeededApp from "../../../constants/getNeededApp";
import useContextMenu from "../../gui/components/ContextMenu/useContextMenu";
import ContextMenu from "../../gui/components/ContextMenu/ContextMenu";
import { Executable } from "../../../types/globals";

import FileExplorerIcon from "../../../assets/Icons/explorer.png";
import NotepadIcon from "../../../assets/Icons/notepad.png";

import FileExplorer from "./FileExplorer";
import Notepad from "../Notepad/Notepad";
import { useCopy, usePaste } from "../../../hooks/Clipboard/useClipboard";

interface FileExplorerItemProps {
	file: NamedFile | NamedDirectory;
	fileKey: string;
	directory: string;
	isSelected: boolean;
	selectedItems: (NamedFile | NamedDirectory)[]
	setSelectedItems: (items: (NamedFile | NamedDirectory)[]) => void;
	handleItemSelect: (
		e: React.MouseEvent,
		item: NamedFile | NamedDirectory,
		index: number
	) => void;
	index: number;
	openApp: (app: Executable) => void;
	fileExplorerRef: React.RefObject<HTMLDivElement>;
	handleCopy: () => void;
	handlePaste: () => void;
	handleCut: () => void;
	handleDelete: () => void;
	setDirectory: (path: string) => void;
	handleDrop: (targetDirectory: NamedDirectory, path: string) => void;
	makeRef: (el: HTMLDivElement | null, id: string) => void;
}

const FileExplorerItem: React.FC<FileExplorerItemProps> = ({
	file,
	fileKey,
	directory,
	isSelected,
	selectedItems,
	setSelectedItems,
	handleItemSelect,
	index,
	openApp,
	fileExplorerRef,
	handleCut,
	handleDelete,
	setDirectory,
	handleDrop,
	makeRef,
}) => {
	const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) makeRef(ref.current, fileKey);
  }, [ref, fileKey, makeRef]);


	const {
		contextMenuPosition,
		contextMenuVisible,
		showContextMenu,
		hideContextMenu,
		contextMenuItems,
	} = useContextMenu();

	useDraggable(ref, file.type === "directory" ? "directory" : "file", file, {
		path: `${directory}`,
		name: file.name,
	});

	const { copy } = useCopy(() => selectedItems);
	const { paste } = usePaste(async () => {});

	const handleItemClick = () => {
		if (file.type === "directory") {
			setDirectory(`${directory}/${fileKey}/`);
		} else {
			openApp(getNeededApp(file, directory));
		}
	};

	// For opening a new folder in new window and shit
	const handleNewWindow = (path: string) => {
		openApp({
			config: {
				name: "FileExplorer",
				displayName: "File Explorer",
				permissions: 1,
				icon: FileExplorerIcon,
			},
			mainComponent: (props) => (
				<FileExplorer defaultPath={path} {...props} />
			),
		});
	};

	const handleNotepadOpen = (file: NamedFile, path: string) => {
		openApp({
			config: {
				name: "Notepad",
				displayName: "Notepad",
				permissions: 1,
				icon: NotepadIcon,
			},
			mainComponent: (props) => (
				<Notepad
					defaultName={file.name}
					defaultPath={path}
					file={file}
					{...props}
				/>
			),
		});
	};

	const getFileOrFolderContext = () =>
		file.type === "directory"
			? [
					{
						name: "Navigate",
						icon: faArrowUpFromBracket,
						action: () =>
							setDirectory(`${directory}/${file.name}/`),
					},
					{
						name: "Open in New Window",
						icon: faArrowUpRightFromSquare,
						action: () =>
							handleNewWindow(`${directory}/${file.name}/`),
					},
			  ]
			: [
					{
						name: "Open",
						icon: faArrowUpRightFromSquare,
						action: handleItemClick,
					},
					{
						name: "Open With",
						children: [
							{
								name: "Notepad",
								icon: faClipboard,
								action: () =>
									handleNotepadOpen(file, directory),
							},
						],
					},
					{
						name: "Copy",
						icon: faCopy,
						action: () => {
							setSelectedItems([file]);
							copy([file]);
						},
					},
					{
						name: "Paste",
						icon: faPaste,
						action: () => {
							setSelectedItems([file]);
							paste();
						},
					},
					{
						name: "Cut",
						icon: faCut,
						action: () => {
							setSelectedItems([file]);
							handleCut();
						},
					},
					{
						name: "Delete",
						icon: faTrash,
						action: () => {
							setSelectedItems([file]);
							handleDelete();
						},
					},
			  ];

	const iconOrImage = getIconForFile(file);

	return (
		<>
			{contextMenuVisible && (
				<ContextMenu
					menuPosition={contextMenuPosition}
					menuItems={contextMenuItems}
					hideMenu={hideContextMenu}
				/>
			)}
			<div
				key={index}
				ref={ref}
				className={`content-item ${isSelected ? "active" : ""}`}
				onContextMenu={(e) =>
					showContextMenu(
						e,
						getFileOrFolderContext(),
						fileExplorerRef
					)
				}
				onDragOver={
					file.type === "directory"
						? (e) => e.preventDefault()
						: undefined
				}
				onDrop={
					file.type === "directory"
						? () => handleDrop(file as NamedDirectory, fileKey)
						: undefined
				}
				onClick={(e) => handleItemSelect(e, file, index)}
				onDoubleClick={handleItemClick}
				draggable={false} // draggable handled by useDraggable
			>
				<div className="flex items-center gap-2">
					{typeof iconOrImage === "string" ? (
						<img
							src={iconOrImage}
							alt={`${file.type} icon`}
							className="icon"
						/>
					) : (
						<FontAwesomeIcon icon={iconOrImage} className="icon" />
					)}
					{fileKey}
				</div>
			</div>
		</>
	);
};

export default FileExplorerItem;
