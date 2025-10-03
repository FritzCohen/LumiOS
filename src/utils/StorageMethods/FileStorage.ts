import { StorageHandler } from "../types";

export class FileStorage implements StorageHandler {
  private fileSystem: any = {}; // Store file system temporarily
  private fileHandle: FileSystemFileHandle | null = null;
  private writable: FileSystemWritableFileStream | null = null;

  public async initialize(): Promise<void> {
    // No persistent storage - just a tool to load and manage the file system temporarily
    console.log("FileStorage initialized. No persistent file system storage.");
  }

  private async openFileHandle(): Promise<FileSystemFileHandle | null> {
    try {
      // Open a file picker to select a file (HTML file)
      const [fileHandle] = await (window as any).showOpenFilePicker({
        types: [{ description: 'HTML files', accept: { 'text/html': ['.html'] } }],
        excludeAcceptAllOption: true,
        startIn: 'downloads', // Default start directory
      });

      this.fileHandle = fileHandle; // Set file handle
      return fileHandle;
    } catch (error) {
      console.error('Error opening file handle:', error);
      return null;
    }
  }

  public async open(): Promise<void> {
    // Ensure we have a file handle before opening
    if (!this.fileHandle) {
      this.fileHandle = await this.openFileHandle();
    }

    if (this.fileHandle) {
      try {
        // Fetch the file and load its contents
        const file = await this.fileHandle.getFile();
        const fileData = await file.text();
        this.fileSystem = JSON.parse(fileData); // Assuming the file contains JSON data
        console.log("File system loaded from file.");
      } catch (error) {
        console.error("Error loading file system:", error);
      }
    }
  }

  public async save(): Promise<void> {
    // Ensure the file handle and writable stream are available
    if (!this.fileHandle) {
      console.error("No file selected to save.");
      return;
    }

    if (!this.writable) {
      // Create a writable stream to save changes to the file
      this.writable = await this.fileHandle.createWritable();
    }

    // Convert the file system to JSON format for saving
    let jsonData: string;
    try {
      jsonData = JSON.stringify(this.fileSystem);
      jsonData = jsonData.replace(/</g, '\\u003C').replace(/>/g, '\\u003E').replace(/&/g, '\\u0026');
    } catch (e) {
      console.error('Error serializing file system data:', e);
      return;
    }

    // Write the updated file system data to the file
    try {
      await this.writable.write(jsonData);
      await this.writable.close();
      console.log('File system saved successfully.');
    } catch (error) {
      console.error('Error saving file:', error);
    }
  }

  public async writeToFile(data: any): Promise<void> {
    this.fileSystem = data; // Temporarily update file system data

    // If fileHandle is not set, request file to save to
    if (!this.fileHandle) {
      await this.openFileHandle();
    }

    if (this.fileHandle && this.writable) {
      try {
        await this.save(); // Save the current changes to the file
      } catch (error) {
        console.error('Error writing to file:', error);
      }
    }
  }

  public async reset(): Promise<boolean> {
    // Reset the file system to an empty object
    this.fileSystem = {};
    console.log('File system reset successfully.');
    return true;
  }

  // New load() method to return the current file system or null if not loaded
  public async load(): Promise<any | null> {
    if (this.fileSystem && Object.keys(this.fileSystem).length > 0) {
      // Return the loaded file system data
      return this.fileSystem;
    } else {
      // Return null if no file system is loaded
      console.log('No file system loaded or available.');
      return null;
    }
  }
}