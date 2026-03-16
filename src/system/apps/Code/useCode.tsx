import { useCallback, useEffect, useState } from "react";
import { NamedDirectory, NamedFile } from "../FileExplorer/fileExplorerTypes";
import { CodeState } from "./codeTypes";
import virtualFS from "../../api/virtualFS";
import normalizePath from "../../../constants/normalizePath";
import { OpenedApp } from "../../../context/kernal/kernal";
import { useKernel } from "../../../hooks/useKernal";
import FileBrowser from "../../gui/components/Popups/FileBrowser";

function buildItem<T extends NamedFile | NamedDirectory>(
	dirPath: string,
	name: string,
	item: Omit<T, "name" | "fullPath">
): T {
	// For folders, fullPath ends with '/'
	const fullPath =
		item.type === "directory"
			? normalizePath(`${dirPath}/${name}/`)
			: normalizePath(`${dirPath}/${name}`);

	return {
		...item,
		name,
		fullPath,
	} as T;
}

export function useCode(defaultPath: string, props: OpenedApp): CodeState {
	const { openApp } = useKernel();

	// Normalize initialPath with trailing slash if folder
	const initialPathRaw =
		props?.executable?.config?.defaultPath || defaultPath || "";
	const initialPath = initialPathRaw.endsWith("/")
		? normalizePath(initialPathRaw)
		: normalizePath(initialPathRaw + "/");

	const [selectedPath, setSelectedPath] = useState<string | null>(
		initialPath
	);
	const [openFilesMap, setOpenFilesMap] = useState<Record<string, NamedFile>>(
		{}
	);
	const [selectedFile, setSelectedFile] = useState<string | null>(null);
	const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});
	const [menu, setMenu] = useState<number>(2);

	// Store folder contents keyed by folder path (WITH trailing slash)
	const [allFoldersContent, setAllFoldersContent] = useState<
		Record<string, Record<string, NamedFile | NamedDirectory>>
	>({});

	// Fetch folder content and store in allFoldersContent keyed by folderPath WITH trailing slash
	const fetchFolder = useCallback(async (folderPath: string) => {
		// Make sure folderPath ends with slash
		const normFolderPath = folderPath.endsWith("/")
			? folderPath
			: folderPath + "/";

		try {
			const rawContent = await virtualFS.readdir(
				normFolderPath.slice(0, -1)
			); // pass path without trailing slash to FS API if needed

			const processed = Object.entries(rawContent).reduce(
				(acc, [name, item]) => {
					acc[name] = buildItem(
						normFolderPath.slice(0, -1),
						name,
						item
					);
					return acc;
				},
				{} as Record<string, NamedFile | NamedDirectory>
			);

			setAllFoldersContent((prev) => ({
				...prev,
				[normFolderPath]: processed,
			}));
			// DEBUG
			console.log(
				"Fetched folder content for",
				normFolderPath,
				processed
			);
		} catch (e) {
			console.error("Failed to read folder", folderPath, e);
			setAllFoldersContent((prev) => ({
				...prev,
				[normFolderPath]: {},
			}));
		}
	}, []);

	// Load content for selectedPath if it is folder (with trailing slash)
	useEffect(() => {
		if (selectedPath && selectedPath.endsWith("/")) {
			fetchFolder(selectedPath);
		}
	}, [selectedPath, fetchFolder]);

	// Toggle folder open/close
	const toggleFolder = useCallback(
		(folderPath: string) => {
			// folderPath must end with slash
			const normFolderPath = folderPath.endsWith("/")
				? folderPath
				: folderPath + "/";

			setOpenFolders((prev) => {
				const isOpening = !prev[normFolderPath];
				const newState = { ...prev, [normFolderPath]: isOpening };
				if (isOpening && !allFoldersContent[normFolderPath]) {
					fetchFolder(normFolderPath);
				}
				return newState;
			});
		},
		[allFoldersContent, fetchFolder]
	);

	const openFile = useCallback(async (fullPathRaw: string) => {
		const fullPath = fullPathRaw.endsWith("/")
			? fullPathRaw.slice(0, -1)
			: fullPathRaw;
		const lastSlash = fullPath.lastIndexOf("/");
		if (lastSlash === -1) return;

		const dir = fullPath.slice(0, lastSlash);
		const name = fullPath.slice(lastSlash + 1);

		try {
			const fileData = await virtualFS.readfile(dir, name);
			const file: NamedFile = {
				...fileData,
				name,
				type: "file",
				fullPath,
			};

			// Only insert that file, not all siblings
			setAllFoldersContent((prev) => ({
				...prev,
				[dir + "/"]: {
					...prev[dir + "/"],
					[name]: file,
				},
			}));

			setOpenFilesMap((prev) => ({
				...prev,
				[fullPath]: file,
			}));

			setSelectedFile(fullPath);
			setMenu(2);
		} catch (e) {
			console.error("Failed to open file", fullPath, e);
		}
	}, []);

	const closeFile = (path: string) => {
		setOpenFilesMap((prev) => {
			const copy = { ...prev };
			delete copy[path];
			return copy;
		});

		setSelectedFile((prevSelected) => {
			if (prevSelected === path) {
			const remaining = Object.keys(openFilesMap).filter((p) => p !== path);
			
			if (remaining.length === 0) setSelectedPath(null);

			return remaining.length > 0 ? remaining[0] : null;
			}
			return prevSelected;
		});

		// Do NOT reset selectedPath here
		setMenu(2);
	};

	const handleAddFileOrFolder = async (type: "file" | "directory") => {
		const basePath =
			selectedPath && selectedPath.endsWith("/")
				? selectedPath
				: selectedPath?.split("/").slice(0, -1).join("/") + "/";

		openApp({
			config: {
				name: "Open File",
				displayName: "Open File",
				permissions: 0,
				icon: "",
			},
			mainComponent: (props) => (
				<FileBrowser
					{...props}
					typeFilter={type}
					fileTypeFilter=""
					direct={basePath ?? "/"}
					allowFileCreation={true}
					allowFolderCreation={true}
					showNameInput={true}
					setDirect={() => {}}
					onComplete={(value, _, name) => {
						const fullPath =
							type === "directory"
								? normalizePath(`${basePath ?? "/"}${name}/`)
								: normalizePath(`${basePath ?? "/"}${name}`);

						if (type === "file") {
							openFile(fullPath);
						} else if (type === "directory") {
							setAllFoldersContent((prev) => ({
								...prev,
								[fullPath]: {}, // Add empty folder content
							}));
							setSelectedFile(null);
						}
					}}
				/>
			),
		});
	};

	return {
		directory: selectedPath?.endsWith("/")
			? selectedPath
			: selectedPath + "/",
		setDirectory: (path: string) => {
			const norm = normalizePath(path);
			setSelectedPath(norm.endsWith("/") ? norm : norm + "/");
		},
		menu: menu,
		setMenu: setMenu,
		content: allFoldersContent,
		openFolders,
		setOpenFolders,
		openFilesMap,
		setOpenFilesMap,
		selectedFile,
		setSelectedFile,
		openFiles: Object.keys(openFilesMap),
		openFile,
		closeFile,
		toggleFolder,
		handleAddFileOrFolder,
	};
}
