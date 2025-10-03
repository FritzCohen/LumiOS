import { useCallback, useMemo, useRef, useState } from "react";
import { useUser } from "../../../../context/user/user";
import { useKernel } from "../../../../hooks/useKernal";
import {
	NamedDirectory,
	NamedFile,
} from "../../../apps/FileExplorer/fileExplorerTypes";
import { Directory, File } from "../../../api/types";
import { useFolderWatcher } from "../../../api/useFolderWatcher";
import virtualFS from "../../../api/virtualFS";
import getNeededApp from "../../../../constants/betterGetNeededApp";
import OpenWithPopup from "../Popups/OpenWithPopup";

type NamedItem = NamedFile | NamedDirectory;

/**
 * Holds the state of the taskbar
*/
export function useTaskbar() {
	const { userDirectory } = useUser();
	const { openApp } = useKernel();

	const [desktopItems, setDesktopItems] = useState<Record<string, NamedItem>>(
		{}
	);

	const [renamingId, setRenamingId] = useState<string | null>(null);
	const [tempName, setTempName] = useState<string>("");

	const directory = useMemo(() => {
		return `${userDirectory}/Taskbar/`;
	}, [userDirectory]);

	const previousItemsRef = useRef<Record<string, NamedItem>>({});

	// --- Smart set (avoids unnecessary re-renders)
	const smartSetDesktopItems = useCallback(
		(newItems: Record<string, File | Directory>) => {
			const namedContent = Object.keys(newItems).reduce((acc, key) => {
				const item = newItems[key];
				const fullPath = `${userDirectory}/Taskbar/${key}`;
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

			// @no-constant-condition since ts sucks
			previousItemsRef.current = { ...namedContent };
			setDesktopItems(namedContent);
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
		[directory]
	);

	const remove = useCallback(
		async (name: string) => {
			await virtualFS.deleteFile(directory, name);
			smartSetDesktopItems(await virtualFS.readdir(directory));
		},
		[directory, smartSetDesktopItems]
	);

	const refresh = useCallback(async () => {
		const updated = await virtualFS.readdir(directory);
		smartSetDesktopItems(updated);
	}, [directory, smartSetDesktopItems]);

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
		[openApp]
	);

	return {
		items: Object.values(desktopItems),
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
			openWith,
		},
	};
}