// useFileExplorerLogic.ts
import { useEffect, useState } from "react";
import virtualFS from "../../api/virtualFS";
import {
	FileExplorerState,
	ClipboardItem,
	NamedDirectory,
	NamedFile,
} from "./fileExplorerTypes";
import { useKernel } from "../../../hooks/useKernal";
import { OpenedApp } from "../../../context/kernal/kernal";
import fileTypes, { FileType } from "../../api/FileTypes";
import getNeededApp from "../../../constants/getNeededApp";
import { useFolderWatcher } from "../../api/useFolderWatcher";
import { useCallback } from "react";
import { useUser } from "../../../context/user/user";
import VerifyUserPopup from "../../gui/components/Popups/VerifyUserPopup";
import { createError } from "../../api/errors";
import { PermissionErrorType } from "../../../types/globals";
import { useCopy } from "../../../hooks/Clipboard/useClipboard";

export function useFileExplorer(
	defaultPath: string,
	props: OpenedApp
): FileExplorerState {
	const { openApp } = useKernel();
	const { currentUser } = useUser();

	// Directory path
	const [directory, setDirectory] = useState(() => {
		if (props?.executable?.config?.defaultPath) {
			return props.executable.config.defaultPath;
		}
		return defaultPath || "";
	});

	// Directory contents
	const [content, setContent] = useState<
		Record<string, NamedDirectory | NamedFile>
	>({});

	// Selected items
	const [selectedItems, setSelectedItems] = useState<
		(NamedDirectory | NamedFile)[]
	>([]);
	const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(
		null
	);

	// Drag and drop
	const [draggedItems, setDraggedItems] = useState<
		(NamedDirectory | NamedFile)[]
	>([]);

	// Clipboard (cut/copy)
	const [clipboard, setClipboard] = useState<{
		type: "cut" | "copy";
		items: ClipboardItem[];
	}>({
		type: "copy",
		items: [],
	});

	const { copy } = useCopy(() => clipboard.items.map(item => item.item));

	// Sidebar folder toggles
	const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});

	const fetchContent = useCallback(async () => {
		try {
			const fetchedContent = await virtualFS.readdir(directory);
			const contentWithNames = Object.keys(fetchedContent).reduce(
				(acc, key) => {
					const item = fetchedContent[key];
					acc[key] = { ...item, name: key, fullPath: "" };
					return acc;
				},
				{} as Record<string, NamedDirectory | NamedFile>
			);
			setContent(contentWithNames);
		} catch (e) {
			setContent({});
			console.error("Failed to fetch directory content", e);
		}
	}, [directory]);

	useEffect(() => {
		fetchContent();
	}, [fetchContent]);

	useEffect(() => {
		setDirectory((d: string) => d.replace("//", "/"));
	}, [directory]);

	// This is the key part:
	useFolderWatcher(
		directory,
		(updatedContent) => {
			// updatedContent is the content returned by virtualFS.readdir
			// convert it the same way you do in fetchContent
			const contentWithNames = Object.keys(updatedContent).reduce(
				(acc, key) => {
					const item = updatedContent[key];
					acc[key] = { ...item, name: key, fullPath: "" };
					return acc;
				},
				{} as Record<string, NamedDirectory | NamedFile>
			);

			setContent(contentWithNames);
		},
		[directory]
	);

	// Toggle folder open state in sidebar
	const toggleFolder = (folderName: string) => {
		setOpenFolders((prev) => ({
			...prev,
			[folderName]: !prev[folderName],
		}));
	};
	// Navigate back folder
	const handleBack = () => {
		const parts = directory.split("/").filter(Boolean);
		parts.pop();
		const updatedPath = parts.join("/");
		setDirectory(
			updatedPath.startsWith("/") ? `/${updatedPath}` : updatedPath
		);
	};

	// File/folder add handlers
	const handleAddFile = async (): Promise<void> => {
		const newFileName = prompt("Enter the file name:");
		if (!newFileName) return;

		if (content[newFileName]) {
			alert("File already exists.");
			return;
		}

		const newFileTypeInput = prompt(
			`File type? Options: ${Object.values(fileTypes || {})
				.map((f) => f.name)
				.join(", ")}`
		);
		const newFileType = (newFileTypeInput as FileType) || "txt";

		try {
			await virtualFS.writeFile(directory, newFileName, "", newFileType);
			await fetchContent();
		} catch (e) {
			console.error("Error creating file:", e);
		}
	};

	const handleAddFolder = async (): Promise<void> => {
		const newFolderName = prompt("Enter the folder name:");
		if (!newFolderName) return;

		if (content[newFolderName]) {
			alert("Folder already exists.");
			return;
		}

		try {
			await virtualFS.writeDirectory(directory, newFolderName, currentUser?.permission || 1);
			await fetchContent();
		} catch (e) {
			console.error("Error creating folder:", e);
		}
	};

	// Select item logic with ctrl/cmd and shift support
	const handleItemSelect = (
		e: React.MouseEvent,
		item: NamedDirectory | NamedFile,
		index: number
	) => {
		if (e.ctrlKey || e.metaKey) {
			if (selectedItems.includes(item)) {
				setSelectedItems((prev) => prev.filter((i) => i !== item));
			} else {
				setSelectedItems((prev) => [...prev, item]);
			}
		} else if (e.shiftKey && lastSelectedIndex !== null) {
			const allItems = Object.values(content);
			const start = Math.min(lastSelectedIndex, index);
			const end = Math.max(lastSelectedIndex, index);
			const rangeItems = allItems.slice(start, end + 1);
			setSelectedItems(rangeItems);
		} else {
			setSelectedItems([item]);
		}
		setLastSelectedIndex(index);
	};

	// Drag start
	const handleDragStart = (item: NamedDirectory | NamedFile) => {
		if (!selectedItems.includes(item)) {
			setSelectedItems((prev) => [...prev, item]);
		}
		setDraggedItems([...selectedItems, item]);
	};

	// Drop items into target directory
	const handleDrop = async (
		targetDirectory: NamedDirectory,
	) => {
		if (draggedItems.length === 0) return;

		for (const item of draggedItems) {
			const itemName = item.name;
			if (!itemName) continue;

			try {
				if (targetDirectory.type === "directory") {
					await virtualFS.mv(
						directory,
						`${directory}/${targetDirectory.name}`,
						itemName,
						itemName,
						currentUser?.permission || 1
					);
				}
			} catch (error) {
				console.error(`Failed to move item: ${itemName}`, error);
			}
		}
		setDraggedItems([]);
		await fetchContent();
	};

	// Clipboard handlers
	const handleCut = () => {
		const items = selectedItems.map((item) => ({
			item,
			directory,
			name: item.name,
		}));
		setClipboard({ type: "cut", items });
		setSelectedItems([]);
	};

	const handleCopy = () => {
		const items = selectedItems.map((item) => ({
			item,
			directory,
			name: item.name,
		}));
		setClipboard({ type: "copy", items });
		copy(selectedItems);
	};

	const recursiveWrite = async (srcPath: string, destPath: string) => {
		const items = await virtualFS.readdir(srcPath);
		for (const name in items) {
			const item = items[name];
			const srcFullPath = `${srcPath}/${name}`;
			const destFullPath = `${destPath}/${name}`;

			if (item.type === "directory") {
				await virtualFS.writeDirectory(destPath, name, currentUser?.permission || 1);
				await recursiveWrite(srcFullPath, destFullPath);
			} else {
				await virtualFS.writeFile(
					destPath,
					name,
					item.content,
					item.fileType
				);
			}
		}
	};

	const handlePaste = async () => {
		const { type, items } = clipboard;
		if (items.length === 0) return;

		for (const { item, directory: originalDir } of items) {
			const itemName = item.name;
			if (!itemName) continue;

			try {
				if (type === "cut") {
					if (item.type === "directory") {
						await virtualFS.writeDirectory(directory, itemName, currentUser?.permission || 1);
						await recursiveWrite(
							`${originalDir}/${itemName}`,
							`${directory}/${itemName}`
						);
						await virtualFS.deleteFile(originalDir, itemName);
					} else {
						await virtualFS.mv(
							originalDir,
							directory,
							itemName,
							itemName,
							currentUser?.permission || 1
						);
					}
				} else if (type === "copy") {
					if (item.type === "directory") {
						await virtualFS.writeDirectory(directory, itemName, currentUser?.permission || 1);
						await recursiveWrite(
							`${originalDir}/${itemName}`,
							`${directory}/${itemName}`
						);
					} else {
						await virtualFS.writeFile(
							directory,
							itemName,
							item.content,
							item.fileType
						);
					}
				}
			} catch (error) {
				console.error(`Failed to paste item: ${itemName}`, error);
			}
		}
		setClipboard({ type: "copy", items: [] });
		await fetchContent();
	};

	// Delete selected items
	const handleDelete = async () => {
		for (const item of selectedItems) {			
			if (!item.name || !item.deleteable) continue;
			
			if (currentUser && item.permission < currentUser.permission) {
				const result = await openApp({
					config: {
						name: "Verify User",
						displayName: "Verify User",
						permissions: 0,
						icon: "",
					},
					mainComponent: (props) => 
						<VerifyUserPopup props={props} intent="Modify new user props" {...props} />
				});

				if (!result) throw createError(PermissionErrorType.AccessDenied);
			}

			try {
				await virtualFS.deleteFile(directory, item.name);
			} catch (e) {
				console.warn(`Failed to delete ${item.name}`, e);
			}
		}
		setSelectedItems([]);
		await fetchContent();
	};

	// File upload (simplified prompt + file reader)
	const handleFileUpload = async (): Promise<void> => {
		const newFileName = prompt("Enter the file name:");
		if (!newFileName) return;

		if (content[newFileName]) {
			alert("File already exists.");
			return;
		}

		const input = document.createElement("input");
		input.type = "file";

		input.onchange = () => {
			const file = input.files?.[0];
			if (!file) return;

			const reader = new FileReader();
			reader.readAsText(file, "UTF-8");
			reader.onload = async (e) => {
				const fileContent = e.target?.result as string;
				const fileType = (file.type.replace("text/", "") ||
					"txt") as any;
				try {
					await virtualFS.writeFile(
						directory,
						newFileName,
						fileContent,
						fileType
					);
					await fetchContent();
				} catch (err) {
					console.error("Error writing uploaded file:", err);
				}
			};
		};

		input.click();
	};

	// Sidebar folder change
	const handleSidebarChange = (name: string, parentPath: string) => {
		const newPath = parentPath ? `${parentPath}/${name}` : name;
		setDirectory(newPath);
	};

	return {
		directory,
		setDirectory,
		content,
		selectedItems,
		setSelectedItems,
		clipboard,
		openFolders,
		toggleFolder,
		handleBack,
		handleAddFile,
		handleAddFolder,
		handleCut,
		handleCopy,
		handlePaste,
		handleDelete,
		handleFileUpload,
		handleSidebarChange,
		handleItemSelect,
		handleDragStart,
		handleDrop,
		openApp,
		getNeededApp,
	};
}
