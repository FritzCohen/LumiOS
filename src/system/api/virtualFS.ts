import logger from "../../constants/logger";
import normalizePath from "../../constants/normalizePath";
import { FileErrorType, Permission } from "../../types/globals";
import defaultFS from "./defaultFS";
import { createError } from "./errors";
import { FileType } from "./FileTypes";
import { StorageManager } from "./storageManager";
import {
	Directory,
	File,
	FileContentMap,
	LoadingState,
	storageMethod,
} from "./types";

interface Handle extends FileSystemHandle {
	/** Creates a writable stream for the file. */
	createWritable: () => Promise<FileSystemWritableFileStream>;

	/** Retrieves the file associated with this handle. */
	getFile: () => Promise<File>;
}

// This is THE file that does everything important.

/**
 * Virtual File System (VFS) class for managing file and directory operations.
 *
 * The `path` parameter is used across methods to specify the location of files or directories.
 * It typically refers to a string representing the directory or file path in the virtual file system.
 *
 * `path` can be used as any of these /Example/Path/ or Example/Path or Example/Path/, since / are only used to seperate
 *
 * Methods in this class interact with file systems and directories, allowing for operations such as reading, writing, and moving files.
 * View {@link StorageManager} to see how they are saved
 */
export class VirtualFS {
	/** The current file system state. */
	private fileSystem: { root: Directory };

	/** Reference to the root directory of the file system. */
	private root: Directory;

	/** Handle to the virtual file used for persistence. */
	private fileHandle: Handle | null = null;

	/** Whether the file system has been interacted with during the session. */
	private interacted: boolean = false;

	/** Whether a file operation has been aborted. */
	private aborted: boolean = false;

	/** Prevents initial loading when the VirtualFS is not fully loaded */
	private loaded: boolean = false;
	private ready: Promise<void>;
	/** Used to manage storage across platforms (e.g., IndexedDB or OPFS). */
	private storageManager: StorageManager;

	/** Manages updates for files that depend on folder content */
	private listeners: Map<
		string,
		Set<(path: string) => Promise<void> | void>
	> = new Map();

	/**
	 * Creates a new instance of VirtualFS.
	 * @param storageMethod The storage method to use (default: 'indexedDB').
	 */
	constructor(storageMethod: storageMethod = "indexedDB") {
		// Set the default file system and root
		this.fileSystem = { ...defaultFS };
		this.root = this.fileSystem.root;

		// Initialize the StorageManager
		this.storageManager = new StorageManager(storageMethod);

		// Initialize the file system asynchronously
		this.ready = this.initialize();
	}

	/**
	 * Some method
	 *
	 * @returns void
	 */
	public async importFS(): Promise<void> {
		const input = document.createElement("input");
		input.type = "file";
		input.accept = "application/json"; // Accept only JSON files
		document.body.appendChild(input);

		input.click();
		input.remove();

		input.addEventListener("change", async () => {
			const files = input.files;
			if (files && files.length > 0) {
				const file = files[0];
				const reader = new FileReader();

				reader.onload = async () => {
					try {
						const fileContent = reader.result as string;
						const content = JSON.parse(fileContent); // Parse JSON content

						this.root = content;
						this.fileSystem = { root: content };
						await this.save();
					} catch (error) {
						console.error("Error parsing JSON:", error);
					}
				};

				reader.onerror = () => {
					console.error("Error reading file:", reader.error);
				};

				reader.readAsText(file);

				await this.save();
			}
		});
	}

	// Getters and setters for interacted and aborted flags
	public getInteracted(): boolean {
		return this.interacted;
	}

	public setInteracted(value: boolean): void {
		this.interacted = value;
	}

	public getAborted(): boolean {
		return this.aborted;
	}

	public setAborted(value: boolean): void {
		this.aborted = value;
	}

	public getRoot() {
		return this.root;
	}

	public getMethod(): storageMethod {
		return this.storageManager.getStorageMethod();
	}

	public getFileSystem(): Directory {
		return this.root;
	}

	public getLoaded(): boolean {
		return this.loaded;
	}

	/**
	 * Initializes the virtual file system using the configured {@link StorageManager}.
	 *
	 * This method attempts to load a previously saved file system from storage.
	 * If no stored data is found, it initializes the file system with a default
	 * structure and saves it.
	 *
	 * @returns A promise that resolves once the initialization process is complete.
	 * @throws Logs errors to the console if initialization fails.
	 */
	public async initialize(): Promise<void> {
		try {
			// Initialize the storage manager
			await this.storageManager.initialize();

			// Try to load stored file system
			const storedFileSystem = await this.storageManager.load();

			const isValid =
				storedFileSystem &&
				typeof storedFileSystem === "object" &&
				"root" in storedFileSystem &&
				storedFileSystem.root;

			if (isValid) {
				// Use stored file system
				this.fileSystem = storedFileSystem;
				this.root = this.fileSystem.root;
			} else {
				// Fall back to default file system
				this.fileSystem = { ...defaultFS };
				this.root = this.fileSystem.root;

				// Save the default FS for next time
				await this.save();
			}
		} catch (error) {
			console.error("Error initializing VirtualFS:", error);

			// Fallback to default on error
			this.fileSystem = { ...defaultFS };
			this.root = this.fileSystem.root;
		}
	}

	/**
	 * Attempts to save the file to the intended {@link StorageManager}
	 */
	private async save(): Promise<void> {
		try {
			await this.storageManager.save(this.fileSystem);

			logger.info(
				`Saved ${this.storageManager.getStorageMethod()} successfully.`
			);
		} catch {
			logger.error("Failed to save the OS.");
		}
	}

	public openFileHandle(): FileSystemHandle | null {
		return this.fileHandle;
	}

	/**
	 * Subscribe to updates from the storage manager's loading state.
	 * @param callback A function called whenever loadingState changes.
	 * @returns A function to unsubscribe.
	 */
	public subscribeToStorageLoadingState(
		callback: (state: LoadingState) => void
	) {
		// Immediately emit current state so subscriber sees the latest
		callback(this.storageManager.getLoadingState());
		return this.storageManager.subscribe(callback);
	}

	// Check if the protocol is 'file://' (local file)
	public isFileProtocol(): boolean {
		return false;
	}

	/**
	 * Deletes the entire filesystem
	 */
	public async deleteFileSystem(): Promise<void> {
		await this.storageManager.reset();
	}

	/**
	 *
	 * @returns {Promise<Record<string, File | Directory>>} Files or directories
	 */
	public async readdir(
		path: string
	): Promise<Record<string, File | Directory>> {
		const currentDir = await this.getNode(path);		

		return currentDir.children;
	}

	/**
	 * @param name Name of the file
	 * @returns {Promise<File | Error>}
	 */
	public async readfile(path: string, name: string): Promise<File> {
		const files = await this.readdir(path);
		const file = files[name];

		if (!file)
			throw createError(FileErrorType.FileNotFound, {
				extra: `File ${name} at ${path}`,
			});

		if (file.type === "directory")
			throw createError(FileErrorType.FileNotFound);

		return file;
	}

	/**
	 *
	 * @param path Path to the file. See top for valid file paths
	 * @param name Name of the target file
	 * @param content Content of file
	 * @param fileType The target file type, as a key of {@link MIMETypes}.
	 * @param newName New name of the file
	 */
	public async updateFile<K extends FileType>(
		path: string,
		name: string,
		content: FileContentMap[K],
		fileType: FileType,
		newName?: string
	): Promise<void> {
		path = normalizePath(path);
		const currentDir = await this.getNode(path);

		const file = currentDir.children[name];

		if (!file || file.type !== "file") {
			throw new Error(`File ${name} does not exist at ${path}`);
		}

		// Update content directly
		file.content = content;
		file.fileType = fileType;
		file.date = new Date();

		// Rename if needed
		if (newName && newName !== name) {
			currentDir.children[newName] = file;
			delete currentDir.children[name];
		}

		this.save();
		this.triggerFolderChange(path);
	}

	/**
	 * Renames a given item within a directory
	 * Preserves relative order
	 *
	 * @param path Path to the file. See top for valid file paths
	 * @param name Name of the target {@link File} or {@link Directory}
	 * @param newName New name for the {@link File} or {@link Directory}
	 */
	public async rename(
		path: string,
		name: string,
		newName: string
	): Promise<void> {
		const content = await this.getNode(path);

		if (!content || typeof content !== "object" || !content.children) {
			throw new Error(`Invalid path: ${path}`);
		}

		if (!content.children[name]) {
			throw new Error(`No item named "${name}" in path: ${path}`);
		}

		if (content.children[newName]) {
			throw new Error(
				`An item named "${newName}" already exists at this path`
			);
		}

		// Rebuild children preserving order, replacing old name with new name
		const newChildren: Record<string, File | Directory> = {};
		for (const key of Object.keys(content.children)) {
			if (key === name) {
				newChildren[newName] = content.children[key]; // rename here
			} else {
				newChildren[key] = content.children[key];
			}
		}

		content.children = newChildren;

		this.save();
		this.triggerFolderChange(path);
	}

	public async mv(
		path: string,
		newPath: string,
		fileName: string,
		newFileName = fileName,
		permission: Permission
	): Promise<void> {
		path = normalizePath(path);
		newPath = normalizePath(newPath);

		// Get the parent directory
		const parentDir = await this.getNode(path);
		if (!parentDir || parentDir.type !== "directory") {
			throw new Error(`Invalid source directory: ${path}`);
		}

		const fileOrDirectory = parentDir.children[fileName];
		if (!fileOrDirectory) {
			throw createError(FileErrorType.FileNotFound, {
				extra: `At $${path}.`,
			});
		}

		const targetPath = `${newPath}/${newFileName}`;

		if ("children" in fileOrDirectory) {
			// Create the directory at destination
			await this.writeDirectory(newPath, newFileName, permission);

			// Recursively move each child
			for (const [childName, childNode] of Object.entries(
				fileOrDirectory.children
			)) {
				if ("children" in childNode) {
					await this.mv(
						`${path}/${fileName}`, // child source parent
						targetPath, // child destination parent
						childName,
						childName,
						permission
					);
				} else {
					await this.writeFile(
						targetPath,
						childName,
						childNode.content,
						childNode.fileType
					);
				}
			}
		} else {
			// Handle files
			await this.writeFile(
				newPath,
				newFileName,
				fileOrDirectory.content,
				fileOrDirectory.fileType
			);
		}

		// Clean up original
		await this.deleteFile(path, fileName);
	}

	/**
	 * Better version of the mv command.
	 * Lacks any "new name" part to it.
	 *
	 * @param path Path from where to extract item
	 * @param newPath Path of target destination
	 * @param fileName Name of the target item
	 * @param permission Level of user access to move file
	 */
	public async updatedMV(
		path: string,
		newPath: string,
		fileName: string,
		permission: Permission
	): Promise<void> {
		path = normalizePath(path);
		newPath = normalizePath(newPath);

		// Get the source directory node
		const parentDir = await this.getNode(path);
		if (!parentDir || parentDir.type !== "directory") {
			throw new Error(`Invalid source directory: ${path}`);
		}

		const fileOrDirectory = parentDir.children[fileName];
		if (!fileOrDirectory) {
			throw createError(FileErrorType.FileNotFound, {
				extra: `At ${path}.`,
			});
		}

		const targetPath = `${newPath}/${fileName}`;

		if ("children" in fileOrDirectory) {
			// It's a directory: create it in the new location
			await this.writeDirectory(newPath, fileName, permission);

			// Recursively move children
			for (const [childName, childNode] of Object.entries(
				fileOrDirectory.children
			)) {
				if ("children" in childNode) {
					await this.updatedMV(
						`${path}/${fileName}`, // source parent path
						targetPath, // destination parent path
						childName,
						permission
					);
				} else {
					await this.writeFile(
						targetPath,
						childName,
						childNode.content,
						childNode.fileType
					);
				}
			}
		} else {
			// It's a file: write it to new location
			await this.writeFile(
				newPath,
				fileName,
				fileOrDirectory.content,
				fileOrDirectory.fileType
			);
		}

		// Delete the original file or directory
		await this.deleteFile(path, fileName);
	}

	public async deleteFile(path: string, fileName: string): Promise<void> {
		const currentDir = await this.getNode(path);

		try {
			delete currentDir.children[fileName];
		} catch (error) {
			console.error(error);
		}

		this.save();
		this.triggerFolderChange(path);
	}

	public async writeFile<K extends FileType>(
		path: string,
		name: string,
		content: FileContentMap[K],
		type: FileType
	): Promise<void> {
		path = normalizePath(path);
		const currentDir = await this.getNode(path);

		name = await this.getUniqueName(path, name);

		currentDir.children[name] = {
			type: "file",
			fileType: type,
			content: content,
			date: new Date(),
			permission: Permission.ELEVATED,
			deleteable: true,
		} as File;

		this.save();
		this.triggerFolderChange(path);
	}

	public async writeDirectory(
		path: string,
		name: string,
		permission: Permission
	): Promise<void> {
		if (permission > 2)
			throw new Error(
				`Permission level exceeded avalible permissions. Said ${permission}, max: ${Permission.SYSTEM}`
			);

		const currentDir = await this.getNode(path);
		name = await this.getUniqueName(path, name);

		// Special handling for file named "children"
		currentDir.children[name] = {
			type: "directory",
			date: new Date(),
			permission: permission,
			deleteable: true,
			children: {},
		} as Directory;

		this.save();
		this.triggerFolderChange(path);
	}

	/**
	 * Copys an item to a new directory.
	 *
	 * Items that already exist have a (number) as part of the new name
	 *
	 * @param path Path to copy the file to
	 * @param name Name of the item to be copied
	 * @param item Item to be copied
	 */
	public async copyItem(
		path: string,
		name: string,
		item: File | Directory
	): Promise<void> {
		path = normalizePath(path);

		if (item.type === "directory") {
			await this.writeDirectory(path, name, item.permission);

			const childPath = `${path}/${name}`;
			await Promise.all(
				Object.entries(item.children).map(([key, child]) => this.copyItem(childPath, key, child))
			);
		} else {
			await this.writeFile(path, name, item.content, item.fileType);
		}
	}

	public async moveUpOrDown(
		path: string,
		name: string,
		direction: "up" | "down"
	): Promise<void> {
		path = normalizePath(path);
		const currentDir = await this.getNode(path);

		if (!currentDir || currentDir.type !== "directory") {
			throw new Error(`Invalid directory: ${path}`);
		}

		const entries = Object.entries(currentDir.children);
		const index = entries.findIndex(([key]) => key === name);

		if (index === -1) {
			throw new Error(`Item "${name}" not found in ${path}`);
		}

		const targetIndex = direction === "up" ? index - 1 : index + 1;

		if (targetIndex < 0 || targetIndex >= entries.length) {
			return; // no-op if moving out of bounds
		}

		// Swap items
		const temp = entries[index];
		entries[index] = entries[targetIndex];
		entries[targetIndex] = temp;

		// Clear existing children keys to force reordering
		for (const key of Object.keys(currentDir.children)) {
			delete currentDir.children[key];
		}

		// Re-add in new order
		for (const [key, value] of entries) {
			currentDir.children[key] = value;
		}

		this.save();
		this.triggerFolderChange(path);
	}

	public async exists(path: string, name: string): Promise<boolean> {
		try {
			const currentDir = await this.getNode(path);

			if (!currentDir.children[name]) return false;

			return true;
		} catch {
			return false;
		}
	}

	/**
	 *
	 * @param path Path whose content will be modified
	 * @param targetPath Content that will replace path's content
	 * @param replaceMatchingContent true if only matched content should be replaced; false if EVERYTHING should be replaced
	 */
	public async updateSpecificDirectory(
		path: string,
		targetPath: string,
		replaceMatchingContent: boolean
	): Promise<void> {
		const targetDir = this.getDirectoryByPath(path);
		const sourceDir = this.getDirectoryByPath(targetPath, true);

		if (!targetDir) throw new Error(`Target directory not found: ${path}`);
		if (!sourceDir)
			throw new Error(`Source directory not found: ${targetPath}`);

		if (replaceMatchingContent) {
			// Iterate over sourceDir to replace or add missing content
			for (const key in sourceDir.children) {
				if (targetDir.children[key]) {
					// If the item exists in both, update it (if it's a file)
					if (targetDir.children[key].type === "file") {
						targetDir.children[key] = {
							...sourceDir.children[key],
						};
					}
				} else {
					// If the item does not exist in targetDir, add it
					targetDir.children[key] = { ...sourceDir.children[key] };
				}
			}
		} else {
			// Replace everything inside targetDir with sourceDir's contents
			for (const key in sourceDir.children) {
				if (sourceDir.children[key].type === "file") {
					targetDir.children[key] = { ...sourceDir.children[key] };
				}
			}
		}

		await this.save();
	}

	/**
	 * Helper function to retrieve a directory by path.
	 */
	private getDirectoryByPath(path: string, def?: boolean): Directory | null {
		const parts = path.split("/").filter(Boolean);
		let currentDir: Directory = this.fileSystem.root;

		if (def) {
			currentDir = defaultFS.root;
		}

		for (const part of parts) {
			if (
				!currentDir.children[part] ||
				currentDir.children[part].type !== "directory"
			) {
				return null;
			}
			currentDir = currentDir.children[part] as Directory;
		}

		return currentDir;
	}

	/**
	 * Helper method to take children from directory
	 */

	private async getNode(path: string): Promise<Directory> {
		await this.ready;

		const parts = path
			.replace("//", "/")
			.replace(/^\/|\/$/g, "")
			.split("/");
		let currentDir = this.root;

		// If the path is the root directory, set currentDir as root
		if (path === "/" || path === "") {
			currentDir = this.root;
		} else {
			// Traverse the directory path
			for (let i = 0; i < parts.length; i++) {
				const part = parts[i];

				if (!currentDir) {
					throw new Error(
						`Invalid path: part "${parts[i]}" does not exist at`
					);
				}

				if (!currentDir.children) {
					currentDir.children = {};
				}

				currentDir = currentDir.children[part] as Directory;
			}
		}

		return currentDir;
	}

	private async getUniqueName(path: string, name: string): Promise<string> {
		let base = name;
		let ext = "";

		// split extension
		const lastDot = name.lastIndexOf(".");
		if (lastDot > 0 && lastDot < name.length - 1) {
			base = name.slice(0, lastDot);
			ext = name.slice(lastDot);
		}

		// regex to detect " (n)" at the end
		const match = base.match(/^(.*)\s\((\d+)\)$/);
		let root = base;
		let counter = 1;

		if (match) {
			root = match[1]; // "file"
			counter = parseInt(match[2], 10) + 1; // start after the existing number
		}

		let candidate = `${root}${ext}`;
		while (await this.exists(path, candidate)) {
			candidate = `${root} (${counter++})${ext}`;
		}

		return candidate;
	}

	public getLoadingState(): LoadingState {
		return this.storageManager.getLoadingState();
	}

	/**
	 * Methods for watching updated content
	 *
	 * Used in taskbar/desktop files
	 */
	// Subscribe to changes at a specific path
	onFolderChange(path: string, callback: (path: string) => void) {
		const normalized = normalizePath(path);
		if (!this.listeners.has(normalized)) {
			this.listeners.set(normalized, new Set());
		}
		this.listeners.get(normalized)!.add(callback);
	}

	offFolderChange(path: string, callback: (path: string) => void) {
		const normalized = normalizePath(path);
		this.listeners.get(normalized)?.delete(callback);
	}

	private async triggerFolderChange(path: string) {
		const normalized = normalizePath(path);
		const set = this.listeners.get(normalized);
		if (set) {
			await Promise.all([...set].map((cb) => cb(normalized)));
		} else {
			// console.warn("No listeners found for path:", normalized);
		}
	}
}

const virtualFS = new VirtualFS();

/**
 * @returns An instance of {@link VirtualFS}
 */
export default virtualFS;
