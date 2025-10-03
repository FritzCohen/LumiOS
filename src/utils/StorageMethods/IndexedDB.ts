import { StorageHandler } from "../types";

export class IndexedDBHandler implements StorageHandler {
  private db: IDBDatabase | null = null;
  private key: string = "virtualFS";

  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.key, 1);

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains("fs")) {
          db.createObjectStore("fs", { autoIncrement: true });
        }
      };

      request.onsuccess = event => resolve((event.target as IDBOpenDBRequest).result);
      request.onerror = event => reject((event.target as IDBOpenDBRequest).error);
    });
  }

  public async initialize(): Promise<void> {
    this.db = await this.openDB();
  }

  public async save(data: any): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");
    const transaction = this.db.transaction(['fs'], 'readwrite');
    const store = transaction.objectStore('fs');
    const putRequest = store.put(data, 'fs');
    return new Promise((resolve, reject) => {
      putRequest.onsuccess = () => resolve();
      putRequest.onerror = () => reject(putRequest.error);
    });
  }

  public async load(): Promise<any> {
    if (!this.db) throw new Error("Database not initialized");
    const transaction = this.db.transaction(['fs'], 'readonly');
    const store = transaction.objectStore('fs');
    const getRequest = store.get('fs');
    return new Promise((resolve, reject) => {
      getRequest.onsuccess = () => resolve(getRequest.result);
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  public async reset(): Promise<boolean> {
    try {
      await indexedDB.deleteDatabase(this.key);

      return true;
    } catch (error) {
      console.error("Error resetting file system data:", error);
      return false;
    }
  }
}