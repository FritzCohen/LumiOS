import { useState, useRef, useCallback, useMemo } from "react";
import { useUser } from "../../../../context/user/user";
import { useFolderWatcher } from "../../../api/useFolderWatcher";
import virtualFS from "../../../api/virtualFS";
import { createError } from "../../../api/errors";
import { FileErrorType } from "../../../../types/globals";
import getNeededApp from "../../../../constants/betterGetNeededApp";
import { useKernel } from "../../../../hooks/useKernal";
import {
	NamedDirectory,
	NamedFile,
} from "../../../apps/FileExplorer/fileExplorerTypes";
import { Directory, File } from "../../../api/types";
import TextPopup from "../Popups/TextPopup";
import CreateShortcutPopup from "../Popups/CreateShortcut";
import OpenWithPopup from "../Popups/OpenWithPopup";

type NamedItem = NamedFile | NamedDirectory;

type sortMethods = "ascending" | "descending" | "asis" | "type";

// Used for getting position of items
interface Position {
	x: number;
	y: number;
}

export function useDesktop() {
	const { userDirectory } = useUser();
	const { openApp } = useKernel();

	const [desktopItems, setDesktopItems] = useState<Record<string, NamedItem>>(
		{}
	);

	const [itemPositions, setItemPositions] = useState<
		Record<string, Position>
	>({});

	const directory = useMemo(() => {
		return `${userDirectory}/Desktop/`;
	}, [userDirectory]);

	const [sortMethod, setSortMethod] = useState<sortMethods>("asis");

	const [renamingId, setRenamingId] = useState<string | null>(null);
	const [tempName, setTempName] = useState<string>("");

	const previousItemsRef = useRef<Record<string, NamedItem>>({});

	// --- Smart set (avoids unnecessary re-renders)
	const smartSetDesktopItems = useCallback(
		(newItems: Record<string, File | Directory>) => {
			const namedContent = Object.keys(newItems).reduce((acc, key) => {
				const item = newItems[key];
				const fullPath = `${userDirectory}/Desktop/${key}`;
				if (item.type === "directory") {
					acc[key] = {
						...(item as Directory),
						name: key,
						fullPath,
					} as NamedDirectory;
				} else {
					acc[key] = {
						...(item as File),
						name: key,
						fullPath,
					} as NamedFile;
				}
				return acc;
			}, {} as Record<string, NamedItem>);

			/*
			const old = previousItemsRef.current;
      
			const oldKeys = Object.keys(old);
			const newKeys = Object.keys(namedContent);

			const orderChanged =
				oldKeys.length !== newKeys.length ||
				oldKeys.some((key, i) => key !== newKeys[i]);

			const valueChanged = Object.entries(old).some(
				([k, v]) => namedContent[k] !== v
			);
      */
			// @no-constant-condition since ts sucks
			previousItemsRef.current = { ...namedContent };
			setDesktopItems(namedContent);

			// getItemPositions();
		},
		[userDirectory]
	);

	useFolderWatcher(directory, smartSetDesktopItems);

	// --- Actions
	const open = useCallback(
		async (item: NamedItem) => {
			const exe = await getNeededApp({ item, path: userDirectory });
			openApp(exe);
		},
		[openApp, userDirectory]
	);

	const rename = useCallback(
		async (oldName: string, newName: string) => {
			await virtualFS.rename(directory, oldName, newName);
			setRenamingId(null);
		},
		[userDirectory]
	);

	const remove = useCallback(
		async (name: string) => {
			await virtualFS.deleteFile(directory, name);
			smartSetDesktopItems(await virtualFS.readdir(directory));
		},
		[userDirectory, smartSetDesktopItems]
	);

	const refresh = useCallback(async () => {
		const updated = await virtualFS.readdir(directory);
		smartSetDesktopItems(updated);
	}, [userDirectory, smartSetDesktopItems]);

	const openSettings = useCallback(async () => {
		const file = await virtualFS.readfile(
			`${userDirectory}/Apps/`,
			"Settings"
		);
		if (file.fileType !== "exe")
			throw createError(FileErrorType.InvalidFileType);

		openApp({
			config: { ...file.content.config, defaultPath: 1 },
			mainComponent: () => undefined,
		});
	}, [userDirectory, openApp]);

	const openTerminal = useCallback(async () => {
		const file = await virtualFS.readfile(
			`${userDirectory}/Apps/`,
			"Terminal"
		);
		if (file.fileType !== "exe")
			throw createError(FileErrorType.InvalidFileType);

		openApp({
			config: { ...file.content.config, defaultPath: 1 },
			mainComponent: () => undefined,
		});
	}, [userDirectory, openApp]);

	const openWith = useCallback(
		async (item: NamedFile, name: string, path: string) => {
			openApp({
				config: {
					name: "Open With",
					displayName: "Open With",
					permissions: 1,
					icon: "",
				},
				mainComponent: (props) => (
					<OpenWithPopup
						itemToPass={item}
						fileType={item.fileType}
						fileName={name}
						path={path}
						{...props}
					/>
				),
			});
		},
		[userDirectory, openApp]
	);

	const createFile = useCallback(() => {
		openApp({
			config: {
				name: "New File",
				displayName: "New File",
				permissions: 0,
				icon: "",
				onCompleteHandler: () => {},
			},
			mainComponent: (props) => (
				<TextPopup
					props={props}
					type="text"
					text="Enter new name:"
					onComplete={async (value: string) => {
						await virtualFS.writeFile(directory, value, "", "txt");
						refresh();
					}}
				/>
			),
		});
	}, [userDirectory, openApp, refresh]);

	const createFolder = useCallback(() => {
		openApp({
			config: {
				name: "New Folder",
				displayName: "New Folder",
				permissions: 0,
				icon: "",
				onCompleteHandler: () => {},
			},
			mainComponent: (props) => (
				<TextPopup
					props={props}
					type="text"
					text="Enter folder name:"
					onComplete={async (value: string) => {
						await virtualFS.writeDirectory(directory, value, 0);
						refresh();
					}}
				/>
			),
		});
	}, [userDirectory, openApp, refresh]);

	const createShortcut = useCallback(() => {
		openApp({
			config: {
				name: "Create Shortcut",
				displayName: "Create Shortcut",
				permissions: 0,
				icon: "",
				onCompleteHandler: () => {},
			},
			mainComponent: (props) => (
				<CreateShortcutPopup
					props={props}
					direct={directory}
					setDirect={() => {}}
					onComplete={async (_, path: string, name: string) => {						
						await virtualFS.writeFile(
							directory,
							name,
							{ name, path },
							"shortcut"
						);
						refresh();
					}}
				/>
			),
		});
	}, [userDirectory, openApp, refresh]);

	const sortedItems = useMemo(() => {
		const itemsArray = Object.values(desktopItems);
		switch (sortMethod) {
			case "ascending":
				return itemsArray.sort((a, b) => a.name.localeCompare(b.name));
			case "descending":
				return itemsArray.sort((a, b) => b.name.localeCompare(a.name));
			case "type":
				return itemsArray.sort((a, b) => a.type.localeCompare(b.type));
			case "asis":
			default:
				return itemsArray;
		}
	}, [desktopItems, sortMethod]);

	/*
	// For use in mapping the files and shit
	// I didn't use it since the selection wouldn't work with any movable components
	const getItemPositions = useCallback(async () => {
		const dir = await virtualFS.readdir(`${userDirectory}DesktopPositions`);
		const itemNames = Object.keys(desktopItems);

		const positions = Object.entries(dir).reduce((acc, [name, value]) => {
			if (value.type === "directory") return acc;
			if (!itemNames.includes(name)) return acc;
			if (value.fileType !== "sys") return acc;
			if (value.content?.x == null || value.content?.y == null)
				return acc;

			acc[name] = {
				x: value.content.x,
				y: value.content.y,
			};
			return acc;
		}, {} as Record<string, Position>);

		setItemPositions(positions);
	}, [desktopItems, userDirectory]);
	*/

	// --- update single position ---
	const updateItemPosition = useCallback(
		async (name: string, newPos: Position) => {
			const path = `${userDirectory}DesktopPositions`;

			// persist to virtual FS
			await virtualFS.updateFile(path, name, newPos, "sys");

			// update local state
			setItemPositions((prev) => ({
				...prev,
				[name]: newPos,
			}));
		},
		[userDirectory]
	);

	return {
		items: sortedItems,
		itemPositions,
		renamingId,
		setRenamingId,
		tempName,
		setTempName,
		directory,
		actions: {
			open,
			rename,
			remove,
			refresh,
			openSettings,
			openTerminal,
			openWith,
			createFile,
			createFolder,
			createShortcut,
			setSortMethod,
			updateItemPosition,
		},
	};
}
