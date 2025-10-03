import { File, Directory, Permission, storageMethod } from "./types";
import { MIMETypes } from "./MIMETypes";
import defaultFS from "./defaultFS";
import { StorageManager } from "./storageManager";

/**
 * Represents the default virtual file system structure.
 */
interface DefaultFS {
  /** The root directory of the file system. */
  root: Directory;
}

/**
 * Extended handle that adds helper methods for file access.
 */
interface Handle extends FileSystemHandle {
  /** Creates a writable stream for the file. */
  createWritable: () => Promise<FileSystemWritableFileStream>;

  /** Retrieves the file associated with this handle. */
  getFile: () => Promise<any>;
}

/*
// Old code for servers
// OPFS while faster and better in every way
// Requires https or localhost to upload data
// Sad day when I found out about that

  constructor () {
    this.fileSystem = { ...defaultFS };
    this.db = null;
    this.dbName = 'VirtualFileSystemDB';
    "fs" = 'fileSystem';
    this.root = this.fileSystem.root;
    this.initialize();
  }
  // Open OPFS
  private async openFileSystem(): Promise<FileSystemDirectoryHandle> {
    try {
      // Request access to the Origin Private File System (OPFS)
      const rootDir = await navigator.storage.getDirectory();
      // await this.resetDirectory(rootDir);

      console.log('Opened OPFS directory.');
      return rootDir;
    } catch (error) {
      console.error('Error opening OPFS directory:', error);
      throw error;
    }
  }

  public async deleteFileSystem(): Promise<void> {
    const rootDir = await navigator.storage.getDirectory();

    await this.resetDirectory(rootDir);
  }

  // Initialize file system
  public async initialize(): Promise<void> {
    try {
      // Open the OPFS root directory
      const rootDir = await this.openFileSystem();

      // Try to get the file that stores the file system data
      let fileHandle;
      try {
        fileHandle = await rootDir.getFileHandle('fileSystem.json', { create: true });
        
      } catch (error) {
        if (error instanceof Error) {
          if (error.name === 'NotFoundError') {
            console.log('No stored file system found, using default.');
            this.fileSystem = { ...defaultFS };
            this.root = this.fileSystem.root;
            await this.save(); // Save the default file system if no existing one is found
            return;
          } else {
            throw error; // Re-throw if it's a different error
          }
        } else {
          console.error('Unknown error:', error); // Handle unexpected error types
        }
      }

      // Read the file system data
      const file = await fileHandle?.getFile();
      const fileSystemData = await file?.text();

      // Deserialize and set the file system data
      this.fileSystem = JSON.parse(fileSystemData || "") as DefaultFS;
      this.root = this.fileSystem.root;
      console.log('File system loaded from OPFS:', 'lots of stuff, so it worked!');
    } catch (error) {
      console.error('Error initializing VirtualFS:', error);
    }
  }

  private async resetDirectory(directoryHandle: any) {
    for await (const [name, handle] of directoryHandle.entries()) {
        if (handle.kind === 'file') {
            // Remove file
            await directoryHandle.removeEntry(name);
        } else if (handle.kind === 'directory') {
            // Recursively remove folder and its contents
            await directoryHandle.removeEntry(name, { recursive: true });
        }
    }
}

  // Save file system
  public async save(): Promise<void> {
    try {
      // Open the OPFS root directory
      const rootDir = await this.openFileSystem();

      // Create or overwrite the file that stores the file system data
      const fileHandle = await rootDir.getFileHandle('fileSystem.json', { create: true });
      const writable = await fileHandle.createWritable();

      // Serialize the file system
      const serializedFileSystem = JSON.stringify(this.fileSystem);

      // Write serialized file system data to the file
      await writable.write(serializedFileSystem);
      await writable.close();
      console.log('File system saved successfully to OPFS.');
    } catch (error) {
      console.error('Error saving file system:', error);
    }
  }

*/

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
  private fileSystem: DefaultFS;

  /** Reference to the root directory of the file system. */
  private root: any;

  /** Handle to the virtual file used for persistence. */
  private fileHandle: Handle | null = null;

  /** Whether the file system has been interacted with during the session. */
  private interacted: boolean = false;

  /** Whether a file operation has been aborted. */
  private aborted: boolean = false;

  /** Used to manage storage across platforms (e.g., IndexedDB or OPFS). */
  private storageManager: StorageManager;

  /**
   * Creates a new instance of VirtualFS.
   * @param storageMethod The storage method to use (default: 'indexedDB').
   */
  constructor(storageMethod: storageMethod = 'indexedDB') {
    // Set the default file system and root
    this.fileSystem = { ...defaultFS };
    this.root = this.fileSystem.root;

    // Initialize the StorageManager
    this.storageManager = new StorageManager(storageMethod);

    // Initialize the file system asynchronously
    this.initialize().then(() => {
      console.log("VirtualFS initialized successfully.");
    }).catch(error => {
      console.error("Failed to initialize VirtualFS:", error);
    });
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

      // Load the stored file system or use the default one
      const storedFileSystem = await this.storageManager.load();

      if (storedFileSystem) {
        this.fileSystem = storedFileSystem;
        this.root = this.fileSystem.root;
      } else {
        // If no stored data, initialize with the default file system
        this.fileSystem = { ...defaultFS };
        this.root = this.fileSystem.root;

        // Save the default file system
        await this.save();
      }
    } catch (error) {
      console.error("Error initializing VirtualFS:", error);
    }
  }

  /**
   * Attempts to save the file to the intended {@link StorageManager}
   */
  private async save(): Promise<void> {
    try {
      await this.storageManager.save(this.fileSystem);

      // Dispatch a custom event to notify listeners of updates
      document.dispatchEvent(new CustomEvent('fs_update', {}));
      console.log(`Saved ${this.storageManager.getStorageMethod()} successfully.`);
    } catch (error) {
      console.error("Error saving file system:", error);
    }
  }
  
  public openFileHandle(): FileSystemHandle | null {
    return this.fileHandle;
  }

  // Check if the protocol is 'file://' (local file)
  public isFileProtocol(): boolean {    
    return false ;
  }

  /**
   * Updates the operating system to the latest version.
   *
   * @deprecated This method was moved from `System.tsx` in the Settings app.
   * It may be removed in future versions.
  */
  public async updateOS(): Promise<void> {
    if (!this.fileHandle) {
      //this.openFileSystem(true);
    }

    if (!this.fileHandle) return;

    const versionResponse = await fetch("https://raw.githubusercontent.com/LuminesenceProject/LumiOS/main/Info.json");

    if (!versionResponse.ok) {
        throw new Error(`HTTP error! Status: ${versionResponse.status}`);
    }

    const version = Number((await  versionResponse.json())[0].version);

    // Fetch the new content from the server
    const response = await fetch(`https://raw.githubusercontent.com/LuminesenceProject/LumiOS/main/LumiOS.v${version}.html`);
    if (!response.ok) throw new Error('Network response was not ok');
    
    const newContent = await response.text();

    const writable = await this.fileHandle.createWritable();

    // Write and close the new content to the file
    await writable.write(newContent);
    await writable.close();
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
  public async readdir(path: string): Promise<Record<string, File | Directory>> {
    const parts = path.split('/').filter(Boolean); // Remove empty parts
    let currentDir = this.root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];

      currentDir = (currentDir.children as Record<string, File | Directory>)[part] as Directory;
    }

    return currentDir.children;
  }

  /**
   * @param name Name of the file
   * @returns {Promise<File | Error>}
   */
  public async readfile(path: string, name: string): Promise<File> {
    const files = await this.readdir(path);
    const file = files[name] as File;
    
    if (!file && typeof file !== "undefined") throw new Error("File is of type Directory.");

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
  public async updateFile(path: string, name: string, content: any, fileType: string, newName?: string): Promise<void> {
    await virtualFS.deleteFile(path, name);
    if (newName) {
      await virtualFS.writeFile(path, newName, content, fileType);
    } else {
      await virtualFS.writeFile(path, name, content, fileType);
    }
  }

  public async mv(
    path: string,
    newPath: string,
    fileName: string,
    newFileName = fileName,
    permission: Permission
  ): Promise<void> {
    const parts = path.split('/').filter(Boolean); // Remove empty parts
    let currentDir = this.root;
  
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      currentDir = (currentDir.children as Record<string, File | Directory>)[part] as Directory;
    }
  
    const fileOrDirectory = currentDir.children[fileName] as File | Directory | undefined;
  
    if (!fileOrDirectory) {
      throw new Error(`File or Directory not found at ${path}`);
    }
  
    if ("children" in fileOrDirectory) {
      // It's a directory, move the entire directory
      await this.writeDirectory(newPath, newFileName, permission);
      
      // Move all children of the directory recursively
      for (const [childName] of Object.entries(fileOrDirectory.children)) {
        const childPath = `${path}/${fileName}/${childName}`;
        const newChildPath = `${newPath}/${newFileName}`;
        await this.mv(childPath, newChildPath, childName, childName, permission);
      }
    } else {
      // It's a file, move it
      let props: any = {};
      try {
        props = { ...fileOrDirectory.content }; // Copy the file content
        props.name = newFileName; // Set new file name
      } catch (error) {
        props = fileOrDirectory.content; // Fallback in case of an error
        console.log(error);
      }

      await this.writeFile(newPath, newFileName, props, fileOrDirectory.fileType);
    }
  
    // Delete the old file or directory after moving
    await this.deleteFile(path, fileName);
  }
  
  public async deleteFile(path: string, fileName: string): Promise<void> {
    const parts = path.split('/').filter(Boolean); // Remove empty parts
    let currentDir = this.root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];

      currentDir = (currentDir.children as Record<string, File | Directory>)[part] as Directory;
    }

    try {
      delete currentDir.children[fileName];
    } catch (error) {
      console.error(error);
    }

    this.save();
  }

  public async writeFile(path: string, name: string, content: string | any, type: keyof typeof MIMETypes): Promise<void> {
    const parts = path.replace(/^\/|\/$/g, "").split("/");
    let currentDir = this.root;

    // If the path is the root directory, set currentDir as root
    if (path === "/" || path === "") {
      currentDir = this.root;
    } else {
      // Traverse the directory path
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];

        if (currentDir.children == undefined) {
          currentDir.children = {};
        }

        currentDir = currentDir.children[part] as Directory;
      }
    }

    // Special handling for file named "children"
    currentDir.children[name] = {
      type: "file",
      fileType: type,
      content: content,
      date: new Date(),
      permission: Permission.ELEVATED,
      deleteable: true,
    } as File;

    this.save();
  }

  public async writeDirectory(path: string, name: string, permission: Permission): Promise<void> {
    if (permission > 2) throw new Error(`Permission level exceeded avalible permissions. Said ${permission}, max: ${Permission.SYSTEM}`);

    const parts = path.replace(/^\/|\/$/g, "").split("/");
    let currentDir = this.root;

    // If the path is the root directory, set currentDir as root
    if (path === "/" || path === "") {      
      currentDir = this.root;
    } else {
      // Traverse the directory path
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];

        if (currentDir.children == undefined) {
          currentDir.children = {};
        }

        currentDir = currentDir.children[part] as Directory;
      }
    }

    // Special handling for file named "children"
    currentDir.children[name] = {
      type: "directory",
      date: new Date(),
      permission: permission,
      deleteable: true,
      children: {},
    } as Directory;

    this.save();
  }

  public async exists(path: string, name: string): Promise<boolean> {
    try {
      await this.readfile(path, name);
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

    console.log(targetDir, sourceDir);
    
  
    if (!targetDir) throw new Error(`Target directory not found: ${path}`);
    if (!sourceDir) throw new Error(`Source directory not found: ${targetPath}`);
  
    if (replaceMatchingContent) {
      // Iterate over sourceDir to replace or add missing content
      for (const key in sourceDir.children) {
        if (targetDir.children[key]) {
          // If the item exists in both, update it (if it's a file)
          if (targetDir.children[key].type === "file") {
            targetDir.children[key] = { ...sourceDir.children[key] };
          }
        } else {
          // If the item does not exist in targetDir, add it
          targetDir.children[key] = { ...sourceDir.children[key] };
        }
      }    
    } else {
      // Replace everything inside targetDir with sourceDir's contents
      for (const key in sourceDir.children) {
        if (sourceDir.children[key].type === 'file') {
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
    const parts = path.split('/').filter(Boolean);
    let currentDir: Directory = this.fileSystem.root;
    
    if (def) {
      currentDir = defaultFS.root;
    }
  
    for (const part of parts) {
      if (!currentDir.children[part] || currentDir.children[part].type !== 'directory') {
        return null;
      }
      currentDir = currentDir.children[part] as Directory;
    }
  
    return currentDir;
  }
  
}

const virtualFS = new VirtualFS();

/**
 * @returns An instance of {@link VirtualFS}
 */
export default virtualFS;