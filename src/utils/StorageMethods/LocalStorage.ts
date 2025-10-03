import { StorageHandler } from "../types";

export class LocalStorageHandler implements StorageHandler {
  private key = 'virtualFS';

  public async initialize(): Promise<void> {
    // No initialization required for LocalStorage
  }

  public async save(data: any): Promise<void> {
    localStorage.setItem(this.key, JSON.stringify(data));
  }

  public async load(): Promise<any> {
    const rawData = localStorage.getItem(this.key);
    return rawData ? JSON.parse(rawData) : null;
  }

  public async reset(): Promise<boolean> {
    try {
      localStorage.removeItem(this.key);
      return true;
    } catch (error) {
      console.error("Error resetting file system data:", error);
      return false;
    }
  }
}