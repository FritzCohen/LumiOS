import { OpenedApp } from "../../../../context/kernal/kernal";
import { TaskbarDesktopItem } from "../../../../types/globals";
import { getIconForFile } from "../../../../constants/constants";
import { Directory, File } from "../../../api/types";

export function generateDisplayedTaskbarItems(
	openedApps: readonly OpenedApp[],
	taskbarItems: Record<string, File | Directory>,
	exeRegistryRef: React.MutableRefObject<
		Map<string, { icon: any; id: string; displayName: string; permission: number }>
	>
): TaskbarDesktopItem[] {
	const openedAppMap = new Map(
		openedApps.map((app) => [
			app.executable.config.displayName || "Unnamed App",
			app,
		])
	);

	const normalizedTaskbarItems = Object.entries(taskbarItems).map(
		([name, item]) => {
			const matchedApp = openedAppMap.get(name);
			const registryEntry = exeRegistryRef.current.get(name);

			if (matchedApp && !registryEntry) {
				exeRegistryRef.current.set(name, {
					icon: matchedApp.executable.config.icon,
					id: matchedApp.id,
					displayName:
						matchedApp.executable.config.displayName || name,
					permission:
						matchedApp.executable.config.permission ??
						item.permission ??
						0,
				});
			}

			const promoted =
				registryEntry ??
				(matchedApp && {
					icon: matchedApp.executable.config.icon,
					id: matchedApp.id,
					displayName:
						matchedApp.executable.config.displayName || name,
					permission:
						matchedApp.executable.config.permission ??
						item.permission ??
						0,
				});				

			return {
				title: name,
				type: item.type === "directory" ? "directory" : item.fileType,
				icon: promoted ? promoted.icon : getIconForFile(item),
				open: !!matchedApp,
				id: promoted ? promoted.id : null,
				displayName: promoted ? promoted.displayName : name,
				permission: promoted
					? promoted.permission
					: item.permission ?? null,
			};
		}
	);

	const taskbarTitles = new Set(Object.keys(taskbarItems));

	const additionalOpenedApps = openedApps
		.filter((app) => {
			const title = app.executable.config.displayName || "Unnamed App";
			return !taskbarTitles.has(title);
		})
		.map((app) => {
			const title = app.executable.config.displayName || "Unnamed App";

			exeRegistryRef.current.set(title, {
				icon: app.executable.config.icon,
				id: app.id,
				displayName: title,
				permission: app.executable.config.permission ?? 0,
			});

			return {
				type: "exe",
				title,
				icon: app.executable.config.icon,
				open: true,
				id: app.id,
				displayName: title,
				permission: app.executable.config.permission ?? 0,
			};
		});

	return [...normalizedTaskbarItems, ...additionalOpenedApps];
}

export function getTaskbarHeight(): number {
  const el = document.querySelector(".taskbar");
  if (el && el instanceof HTMLElement) {
    return el.offsetHeight;
  }
  return 0;
}