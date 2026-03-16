import { StorageHandler, LoadingState, defaultLoadingState } from "../types";

export class FileStorage implements StorageHandler {
  private fileSystem: any = {}; // Store file system temporarily
  private fileHandle: FileSystemFileHandle | null = null;
  private writable: FileSystemWritableFileStream | null = null;

  // Loading stuffs
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

  public async initialize(): Promise<void> {
    this.loadingState = {
      name: "Initializing FileStorage",
      description: "Preparing temporary file system...",
      percentDone: 0,
      finished: false,
      error: null,
    };
    console.log("FileStorage initialized. No persistent file system storage.");
    this.loadingState.finished = true;
    this.loadingState.percentDone = 100;
  }

  private async openFileHandle(): Promise<FileSystemFileHandle | null> {
    this.loadingState = {
      name: "Opening File Picker",
      description: "Waiting for user to select a file...",
      percentDone: 0,
      finished: false,
      error: null,
    };
    this.notify();

    try {
      const [fileHandle] = await (window as any).showOpenFilePicker({
        types: [{ description: 'HTML files', accept: { 'text/html': ['.html'] } }],
        excludeAcceptAllOption: true,
        startIn: 'downloads',
      });

      this.fileHandle = fileHandle;
      this.loadingState.percentDone = 100;
      this.loadingState.finished = true;
      this.notify();

      return fileHandle;
    } catch (error: any) {
      this.loadingState.error = error;
      this.loadingState.finished = true;
      console.error('Error opening file handle:', error);
      return null;
    }
    this.notify();
  }

  public async open(): Promise<void> {
    this.loadingState = {
      name: "Loading File System",
      description: "Starting to load file...",
      percentDone: 0,
      finished: false,
      error: null,
    };

    if (!this.fileHandle) {
      this.fileHandle = await this.openFileHandle();
    }

    if (this.fileHandle) {
      try {
        const file = await this.fileHandle.getFile();
        const fileData = await file.text();
        this.loadingState.description = "Parsing file content...";
        this.loadingState.percentDone = 50;

        this.fileSystem = JSON.parse(fileData); // Assuming JSON data
        this.loadingState.description = "File system loaded.";
        this.loadingState.percentDone = 100;
        this.loadingState.finished = true;

        console.log("File system loaded from file.");
      } catch (error: any) {
        this.loadingState.error = error;
        this.loadingState.finished = true;
        console.error("Error loading file system:", error);
      }
    }
  }

  public async save(): Promise<void> {
    if (!this.fileHandle) {
      console.error("No file selected to save.");
      return;
    }

    this.loadingState = {
      name: "Saving File System",
      description: "Preparing to save file...",
      percentDone: 0,
      finished: false,
      error: null,
    };

    if (!this.writable) {
      this.writable = await this.fileHandle.createWritable();
    }

    try {
      let jsonData = JSON.stringify(this.fileSystem);
      jsonData = jsonData.replace(/</g, '\\u003C').replace(/>/g, '\\u003E').replace(/&/g, '\\u0026');

      this.loadingState.description = "Writing data to file...";
      this.loadingState.percentDone = 50;

      await this.writable.write(jsonData);
      await this.writable.close();

      this.loadingState.percentDone = 100;
      this.loadingState.finished = true;
      console.log('File system saved successfully.');
    } catch (error: any) {
      this.loadingState.error = error;
      this.loadingState.finished = true;
      console.error('Error saving file:', error);
    }
  }

  public async writeToFile(data: any): Promise<void> {
    this.fileSystem = data;

    if (!this.fileHandle) {
      await this.openFileHandle();
    }

    if (this.fileHandle) {
      await this.save();
    }
  }

  public async reset(): Promise<boolean> {
    this.fileSystem = {};
    this.loadingState = {
      name: "Reset File System",
      description: "Clearing file system...",
      percentDone: 100,
      finished: true,
      error: null,
    };
    console.log('File system reset successfully.');
    return true;
  }

  public async load(): Promise<any | null> {
    if (this.fileSystem && Object.keys(this.fileSystem).length > 0) {
      return this.fileSystem;
    } else {
      console.log('No file system loaded or available.');
      return null;
    }
  }

  public getLoadingState(): LoadingState {
    return this.loadingState;
  }
}