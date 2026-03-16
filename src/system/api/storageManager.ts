import { FileStorage } from "./StorageMethods/FileStorage";
import { IndexedDBHandler } from "./StorageMethods/IndexedDB";
import { LocalStorageHandler } from "./StorageMethods/LocalStorage";
import { OPFSHandler } from "./StorageMethods/OPFS";
import { storageMethod, StorageHandler, LoadingState } from "./types";

export class StorageManager implements StorageHandler {
  private handler: StorageHandler;
  private method: storageMethod;
  private saveQueue: any[] = [];
  private saveTimeout: NodeJS.Timeout | null = null;
  private readonly saveDebounceDelay = 250;
  private listeners: ((state: LoadingState) => void)[] = [];

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

    // Subscribe to handler updates and relay to StorageManager subscribers
    if (this.handler.subscribe) this.handler.subscribe(state => this.notify(state));
  }

  private notify(state: LoadingState) {
    this.listeners.forEach(cb => cb({ ...state }));
  }

  public subscribe(callback: (state: LoadingState) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  public async initialize(): Promise<void> {
    await this.handler.initialize();
  }

  public async save(data: any): Promise<void> {
    this.saveQueue.push(data);
    if (this.saveTimeout) clearTimeout(this.saveTimeout);

    this.saveTimeout = setTimeout(async () => {
      const bundled = this.saveQueue.reduce((acc, d) => ({ ...acc, ...d }), {});
      this.saveQueue = [];
      await this.handler.save(bundled);
    }, this.saveDebounceDelay);
  }

  public async load(): Promise<any> {
    return this.handler.load();
  }

  public async reset(): Promise<boolean> {
    return this.handler.reset();
  }

  public getStorageMethod(): storageMethod {
    return this.method;
  }

  public getLoadingState(): LoadingState {
    return this.handler.getLoadingState();
  }
}