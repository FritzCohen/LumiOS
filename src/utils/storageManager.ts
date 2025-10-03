import { FileStorage } from "./StorageMethods/FileStorage";
import { IndexedDBHandler } from "./StorageMethods/IndexedDB";
import { LocalStorageHandler } from "./StorageMethods/LocalStorage";
import { OPFSHandler } from "./StorageMethods/OPFS";
import { StorageHandler, storageMethod } from "./types";

export class StorageManager implements StorageHandler {
  private handler: StorageHandler;
  private method: storageMethod;
  private saveQueue: any[] = []; // Queue to store data for saving
  private saveTimeout: NodeJS.Timeout | null = null; // Timeout for debouncing
  private readonly saveDebounceDelay = 250; // Delay in milliseconds for bundling save requests

  constructor(method: storageMethod) {
    switch (method) {
      case "indexedDB":
        this.handler = new IndexedDBHandler();
        break;
      case "localStorage":
        this.handler = new LocalStorageHandler();
        break;
      case "OPFS":
        this.handler = new OPFSHandler();
        break;
      case "fileStorage":
        this.handler = new FileStorage();
        break;
      default:
        throw new Error(`Unsupported storage method: ${method}`);
    }

    this.method = method;
  }

  public async initialize(): Promise<void> {
    await this.handler.initialize();
  }

  /**
   * Debounced save method to bundle frequent save requests.
   * @param data Data to save
   */
  public async save(data: any): Promise<void> {
    // Add data to the save queue
    this.saveQueue.push(data);

    // Clear any existing timeout and set a new one
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    // Save after the specified debounce delay
    this.saveTimeout = setTimeout(async () => {
      const bundledData = this.bundleSaveData();
      await this.handler.save(bundledData);
      console.log("Data saved successfully.");
    }, this.saveDebounceDelay);
  }

  /**
   * Bundles the queued data for saving.
   * @returns The combined data to save
   */
  private bundleSaveData(): any {
    // Merge or process data in the queue as needed
    const bundledData = this.saveQueue.reduce((acc, data) => {
      // Customize merging logic based on your data structure
      return { ...acc, ...data };
    }, {});
    this.saveQueue = []; // Clear the queue after bundling
    return bundledData;
  }

  public async load(): Promise<any> {
    return await this.handler.load();
  }

  public async reset(): Promise<boolean> {
    return await this.handler.reset();
  }

  /**
   * Fetches storage method
   * 
   * @returns method
   */
  public getStorageMethod(): storageMethod {
    return this.method;
  }
}