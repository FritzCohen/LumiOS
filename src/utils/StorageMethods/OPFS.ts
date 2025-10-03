import { StorageHandler } from "../types";

export class OPFSHandler implements StorageHandler {
  private key = "virtualFS";

  // Load the file system root directory
  private async openFileSystem(): Promise<FileSystemDirectoryHandle> {
    try {
      return await navigator.storage.getDirectory();
    } catch (error) {
      console.error("Error opening OPFS directory:", error);
      throw error;
    }
  }

  // Initialize the OPFS storage handler
  public async initialize(): Promise<void> {
    try {
      const rootDir = await this.openFileSystem();
      const fileHandle = await this.getFileHandle(rootDir);

      if (!fileHandle) {
        console.log("No existing file system data. Ready for new data.");
      } else {
        console.log("OPFS initialized successfully.");
      }
    } catch (error) {
      console.error("Error initializing OPFSHandler:", error);
    }
  }

  // Reset the file system data in OPFS
  public async reset(): Promise<boolean> {
    try {
      const rootDir = await this.openFileSystem();
      const fileHandle = await rootDir.getFileHandle(`${this.key}.json`, { create: true });
      await this.writeFile(fileHandle, JSON.stringify({})); // Reset to an empty object
      console.log("File system data successfully reset in OPFS.");
      return true;
    } catch (error) {
      console.error("Error resetting file system data:", error);
      return false;
    }
  }

  // Load data from OPFS
  public async load(): Promise<any | null> {
    try {
      const rootDir = await this.openFileSystem();
      const fileHandle = await this.getFileHandle(rootDir);

      if (fileHandle) {
        const fileSystemData = await this.readFile(fileHandle);
        console.log("File system data successfully loaded from OPFS.");
        return fileSystemData ? JSON.parse(fileSystemData) : null;
      }

      console.log("No file system data found.");
      return null;
    } catch (error) {
      console.error("Error loading file system data:", error);
      return null;
    }
  }

  // Save data to OPFS
  public async save(data: any): Promise<void> {
    try {
      const rootDir = await this.openFileSystem();
      const fileHandle = await rootDir.getFileHandle(`${this.key}.json`, { create: true });
      const serializedData = JSON.stringify(data);
      await this.writeFile(fileHandle, serializedData);
    } catch (error) {
      console.error("Error saving file system data:", error);
    }
  }

  // Utility: Get a file handle
  private async getFileHandle(rootDir: FileSystemDirectoryHandle): Promise<FileSystemFileHandle | null> {
    try {
      // Attempt to get the file handle or create it if it doesn't exist
      const fileHandle = await rootDir.getFileHandle(`${this.key}.json`, { create: true });
      
      // console.log("Successfully found file handle.");
      
      return fileHandle;
    } catch (error) {
      console.error("Error accessing file handle:", error);
      return null;
    }
  }

  // Utility: Read file contents
  private async readFile(fileHandle: FileSystemFileHandle): Promise<string | null> {
    try {
      // Check if the file exists by accessing its metadata
      const file = await fileHandle.getFile();
      if (file) {
        return await file.text(); // Read and return file content
      } else {
        console.error("File does not exist.");
        return null;
      }
    } catch (error) {
      // Log any error that occurs while reading the file
      console.error("Error reading file:", error);
      return null;
    }
  }
  
  // Utility: Write data to a file
  private async writeFile(fileHandle: FileSystemFileHandle, data: string): Promise<void> {
    try {
      const writable = await fileHandle.createWritable();
      await writable.write(data);
      await writable.close();
    } catch (error) {
      console.error("Error writing to file:", error);
      throw error;
    }
  }
}