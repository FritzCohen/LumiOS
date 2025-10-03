import { StorageHandler, LoadingState, defaultLoadingState } from "../types";

export class LocalStorageHandler implements StorageHandler {
  private key = 'virtualFS';

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
      name: "Initializing LocalStorage",
      description: "Preparing local storage handler...",
      percentDone: 0,
      finished: false,
      error: null,
    };
    this.notify();

    // No actual initialization required
    this.loadingState.percentDone = 100;
    this.loadingState.finished = true;
    this.notify();
  }

  public async save(data: any): Promise<void> {
    this.loadingState = {
      name: "Saving Data",
      description: "Storing file system in LocalStorage...",
      percentDone: 0,
      finished: false,
      error: null,
    };

    try {
      localStorage.setItem(this.key, JSON.stringify(data));
      this.loadingState.percentDone = 100;
      this.loadingState.finished = true;
    } catch (error: any) {
      this.loadingState.error = error;
      this.loadingState.finished = true;
      console.error("Error saving data to LocalStorage:", error);
    }
  }

  public async load(): Promise<any> {
    this.loadingState = {
      name: "Loading Data",
      description: "Reading file system from LocalStorage...",
      percentDone: 0,
      finished: false,
      error: null,
    };
    this.notify();

    try {
      const rawData = localStorage.getItem(this.key);
      this.loadingState.percentDone = 100;
      this.loadingState.finished = true;

      this.notify();
      return rawData ? JSON.parse(rawData) : null;
    } catch (error: any) {
      this.loadingState.error = error;
      this.loadingState.finished = true;
      console.error("Error loading data from LocalStorage:", error);
      this.notify();
      return null;
    }
  }

  public async reset(): Promise<boolean> {
    this.loadingState = {
      name: "Resetting Data",
      description: "Clearing LocalStorage...",
      percentDone: 0,
      finished: false,
      error: null,
    };

    try {
      localStorage.removeItem(this.key);
      this.loadingState.percentDone = 100;
      this.loadingState.finished = true;
      return true;
    } catch (error: any) {
      this.loadingState.error = error;
      this.loadingState.finished = true;
      console.error("Error resetting file system data:", error);
      return false;
    }
  }

  public getLoadingState(): LoadingState {
    return this.loadingState;
  }
}