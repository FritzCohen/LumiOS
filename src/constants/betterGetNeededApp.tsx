import { Directory, File } from "../system/api/types";
import { Executable, Permission } from "../types/globals";
import { components } from "../system/apps/Components";
import fileTypes from "../system/api/FileTypes";
import normalizePath from "./normalizePath";
import Shortcut from "../system/apps/Shortcut/Shortcut";
import virtualFS from "../system/api/virtualFS";
import { getIconForFile } from "./constants";

type OpenableItem = File | Directory;

interface GetNeededAppProps {
	item?: OpenableItem;
	path?: string;
	name?: string;
}

// Type guard to check if item is a File
const isFile = (item: OpenableItem): item is File => "fileType" in item;

// Read the file if only path + name is provided
const resolveItem = async (
	item?: OpenableItem,
	path?: string,
	name?: string
) => {
	if (!item && path && name) {
		return await virtualFS.readfile(name, path);
	}
	if (!item) {
		throw new Error(
			"You must provide either an item or both path and name."
		);
	}
	return item;
};

// Determine the type of the item
const resolveType = (item: OpenableItem) =>
	isFile(item) ? item.fileType : item.type;

// Determine the name for display and exe lookup
const resolveName = (item: OpenableItem, type: string, name?: string) => {
	if (name) return name;

	if (type === "exe" && isFile(item) && item.fileType === "exe") {
		return item.content?.config?.name ?? "Default";
	}

	if (isFile(item) && item.fileType === "shortcut") {
		return item.content.name;
	}

	return isFile(item) ? item.displayName ?? "Default" : "Default";
};

const resolveDisplayName = (item: OpenableItem, type: string, name?: string) => {
	if (type === "exe" && isFile(item) && item.fileType === "exe") {
		return item.content.config.displayName;
	}

	return resolveName(item, type, name);
};

// Determine the permission
const resolvePermission = (item: OpenableItem): Permission =>
	"permission" in item && item.permission != null ? item.permission : 0;

// Determine which component to use
const resolveComponentKey = (
	type: string,
	item: OpenableItem,
	resolvedName: string
): string | null => {
	switch (type) {
		case "exe":
			return resolvedName; // Use exe's config name
		case "shortcut":
			return "Shortcuts";
		case "directory":
			return "FileExplorer";
		case "html":
			return "HTMLViewer";
		case "swf":
			return "SWFPlayer";
		default:
			return type in fileTypes ? "Notepad" : null;
	}
};

const resolvePath = (item: OpenableItem, path: string): string => {
	if (item.type === "file" && item.fileType === "shortcut") return item.content.path;

	return path;
};

const getNeededApp = async ({
	item,
	path,
	name,
}: GetNeededAppProps): Promise<Executable> => {
	item = await resolveItem(item, path, name);

	const type = resolveType(item);
	const resolvedName = resolveName(item, type, name);
	const displayName = resolveDisplayName(item, type, name);
	const permission = resolvePermission(item);
	const componentKey = resolveComponentKey(type, item, resolvedName);
	const Component = componentKey ? components[componentKey] : null;

	const resolvedPath = resolvePath(item, path || "");

	const config = {
		name: resolvedName,
		displayName: displayName,
		permissions: permission,
		icon: getIconForFile(item),
		defaultPath: normalizePath(path || ""),
	};

	const mainComponent = () =>
		Component ? (
			type === "shortcut" ? (
				<Shortcut name={resolvedName} path={resolvedPath} />
			) : (
				<Component
					props={config}
					defaultPath={path}
					defaultName={resolvedName}
					file={item}
					name={resolvedName}
					path={path}
				/>
			)
		) : (
			<div>nothing...</div>
		);

	return { config, mainComponent };
};

export default getNeededApp;
