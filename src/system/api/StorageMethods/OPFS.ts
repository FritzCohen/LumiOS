import { StorageHandler, LoadingState, defaultLoadingState } from "../types";

export class OPFSHandler implements StorageHandler {
  private key = "virtualFS";

  private loadingState: LoadingState = defaultLoadingState;
  private listeners: ((state: LoadingState) => void)[] = [];

  private notify() {
    this.listeners.forEach(cb => cb({ ...this.loadingState }));
  }

  public subscribe(callback: (state: LoadingState) => void) {
    this.listeners.push(callback);
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private async openFileSystem(): Promise<FileSystemDirectoryHandle> {
    this.loadingState = {
      name: "Opening OPFS Directory",
      description: "Accessing OPFS root directory...",
      percentDone: 0,
      finished: false,
      error: null,
    };
    this.notify();

    try {
      const dir = await navigator.storage.getDirectory();
      this.loadingState.percentDone = 100;
      this.loadingState.finished = true;
      this.notify();
      return dir;
    } catch (error: any) {
      this.loadingState.error = error;
      this.loadingState.finished = true;
      console.error("Error opening OPFS directory:", error);
      throw error;
    }
  }

  public async initialize(): Promise<void> {
    this.loadingState = {
      name: "Initializing OPFS",
      description: "Preparing OPFS storage...",
      percentDone: 0,
      finished: false,
      error: null,
    };

    try {
      const rootDir = await this.openFileSystem();
      const fileHandle = await this.getFileHandle(rootDir);
      this.notify();

      this.loadingState.percentDone = 100;
      this.loadingState.finished = true;
      this.notify();

      if (!fileHandle) {
        console.log("No existing file system data. Ready for new data.");
      } else {
        console.log("OPFS initialized successfully.");
      }
    } catch (error: any) {
      this.loadingState.error = error;
      this.loadingState.finished = true;
    }
  }

  public async reset(): Promise<boolean> {
    this.loadingState = {
      name: "Resetting OPFS",
      description: "Clearing file system data...",
      percentDone: 0,
      finished: false,
      error: null,
    };
    this.notify();

    try {
      const rootDir = await this.openFileSystem();
      const fileHandle = await rootDir.getFileHandle(`${this.key}.json`, { create: true });
      await this.writeFile(fileHandle, JSON.stringify({}));
      this.loadingState.percentDone = 100;
      this.loadingState.finished = true;
      console.log("File system data successfully reset in OPFS.");
      return true;
    } catch (error: any) {
      this.loadingState.error = error;
      this.loadingState.finished = true;
      console.error("Error resetting file system data:", error);
      return false;
    }
  }

  public async load(): Promise<any | null> {
    this.loadingState = {
      name: "Loading OPFS",
      description: "Reading file system data...",
      percentDone: 0,
      finished: false,
      error: null,
    };
    this.notify();

    try {
      const rootDir = await this.openFileSystem();
      const fileHandle = await this.getFileHandle(rootDir);

      if (fileHandle) {
        this.loadingState.description = "Reading file...";
        this.loadingState.percentDone = 50;

        const fileSystemData = await this.readFile(fileHandle);

        this.loadingState.description = "File system loaded.";
        this.loadingState.percentDone = 100;
        this.loadingState.finished = true;

        this.notify();
        return fileSystemData ? JSON.parse(fileSystemData) : null;
      }

      console.log("No file system data found.");
      this.loadingState.finished = true;
      this.loadingState.percentDone = 100;
      this.notify();
      return null;
    } catch (error: any) {
      this.loadingState.error = error;
      this.loadingState.finished = true;
      console.error("Error loading file system data:", error);
      this.notify();
      return null;
    }
  }

  public async save(data: any): Promise<void> {
    this.loadingState = {
      name: "Saving OPFS",
      description: "Writing file system data...",
      percentDone: 0,
      finished: false,
      error: null,
    };

    try {
      const rootDir = await this.openFileSystem();
      const fileHandle = await rootDir.getFileHandle(`${this.key}.json`, { create: true });
      const serializedData = JSON.stringify(data);

      this.loadingState.percentDone = 50;

      await this.writeFile(fileHandle, serializedData);

      this.loadingState.percentDone = 100;
      this.loadingState.finished = true;
    } catch (error: any) {
      this.loadingState.error = error;
      this.loadingState.finished = true;
      console.error("Error saving file system data:", error);
    }
  }

  private async getFileHandle(rootDir: FileSystemDirectoryHandle): Promise<FileSystemFileHandle | null> {
    try {
      return await rootDir.getFileHandle(`${this.key}.json`, { create: true });
    } catch (error) {
      console.error("Error accessing file handle:", error);
      return null;
    }
  }

  private async readFile(fileHandle: FileSystemFileHandle): Promise<string | null> {
    try {
      const file = await fileHandle.getFile();
      return file ? await file.text() : null;
    } catch (error) {
      console.error("Error reading file:", error);
      return null;
    }
  }

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

  public getLoadingState(): LoadingState {
    return this.loadingState;
  }
}
