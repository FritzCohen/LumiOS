import { LoadingState, StorageHandler, defaultLoadingState } from "../types";

export class IndexedDBHandler implements StorageHandler {
	private db: IDBDatabase | null = null;
	private readonly dbName = "virtualFS";
	private readonly storeName = "fs";
	private readonly key = "fs"; // metadata container
	private dbPromise: Promise<IDBDatabase> | null = null;
	private initializing: Promise<void> | null = null;

	private loadingState: LoadingState = { ...defaultLoadingState };
	private listeners: ((state: LoadingState) => void)[] = [];

	// --- subscription ---
	public subscribe(callback: (state: LoadingState) => void) {
		this.listeners.push(callback);
		return () => {
			this.listeners = this.listeners.filter((cb) => cb !== callback);
		};
	}

	private notify(partialState?: Partial<LoadingState>) {
		if (partialState) {
			this.loadingState = { ...this.loadingState, ...partialState };
		}
		this.listeners.forEach((cb) => cb({ ...this.loadingState }));
	}

	// --- open DB ---
	private async openDB(): Promise<IDBDatabase> {
		if (!this.dbPromise) {
			this.dbPromise = new Promise((resolve, reject) => {
				const request = indexedDB.open(this.dbName, 1);

				request.onupgradeneeded = (e) => {
					const db = (e.target as IDBOpenDBRequest).result;
					if (!db.objectStoreNames.contains(this.storeName)) {
						const store = db.createObjectStore(this.storeName);
						store.put({ keys: [] }, this.key); // bootstrap metadata
					}
				};

				request.onsuccess = (e) =>
					resolve((e.target as IDBOpenDBRequest).result);
				request.onerror = (e) =>
					reject((e.target as IDBOpenDBRequest).error);
			});
		}
		return this.dbPromise;
	}

	// --- initialize ---
	public async initialize(): Promise<void> {
		if (this.db) return;
		if (this.initializing) return this.initializing;

		this.notify({
			name: "Initializing IndexedDB",
			description: "Opening database...",
			percentDone: 0,
			finished: false,
			error: null,
		});

		this.initializing = (async () => {
			this.db = await this.openDB();
			this.notify({
				percentDone: 100,
				finished: true,
				description: "Database ready",
			});
		})();

		return this.initializing;
	}

	// --- save ---
	public async save(data: Record<string, any>): Promise<void> {
		if (!this.db) throw new Error("Database not initialized");

		/*this.notify({
      name: "Saving Data",
      description: "Writing files...",
      percentDone: 0,
      finished: false,
    });*/

		const transaction = this.db.transaction([this.storeName], "readwrite");
		const store = transaction.objectStore(this.storeName);

		const keys = Object.keys(data);
		store.put({ keys }, this.key);

		let lastPercent = 0;
		for (let i = 0; i < keys.length; i++) {
			store.put(data[keys[i]], keys[i]);
			const percent = Math.floor(((i + 1) / keys.length) * 100);
			if (percent >= lastPercent + 5 || percent === 100) {
				/*this.notify({
          description: `Saving ${i + 1}/${keys.length} files`,
          percentDone: percent,
        });*/
				lastPercent = percent;
			}
		}

		return new Promise((resolve, reject) => {
			transaction.oncomplete = () => {
				/*this.notify({
          finished: true,
          percentDone: 100,
          description: "All files saved",
        });*/
				resolve();
			};
			transaction.onerror = () => {
				/*this.notify({
          finished: true,
          error: transaction.error,
        });*/
				reject(transaction.error);
			};
		});
	}

	// --- load ---
	private loadingPromise: Promise<any> | null = null;

	public async load(): Promise<Record<string, any>> {
		if (this.loadingPromise) return this.loadingPromise;

		this.loadingPromise = (async () => {
			if (!this.db) throw new Error("Database not initialized");

			this.loadingState = {
				name: "Loading Data",
				description: "Fetching metadata...",
				percentDone: 0,
				finished: false,
				error: null,
			};
			this.notify();

			const store = this.db
				.transaction([this.storeName], "readonly")
				.objectStore(this.storeName);
			const metadata = await this.getFile(store, this.key);

			if (!metadata || !Array.isArray(metadata.keys)) {
				// bootstrap if missing
				return {};
			}

			if (!metadata?.keys?.length) {
				this.loadingState.finished = true;
				this.loadingState.percentDone = 100;
				this.loadingState.description = "No data found";
				this.notify();
				return {};
			}

			const result: Record<string, any> = {};
			const keys = metadata.keys;
			let completed = 0;

			for (const key of keys) {
				result[key] = await this.getFile(store, key);
				completed++;
				const percent = Math.floor((completed / keys.length) * 100);
				if (percent > this.loadingState.percentDone) {
					this.loadingState.percentDone = percent;
					this.loadingState.description = `Loading ${completed}/${keys.length} files`;
					this.notify();
				}
			}

			this.loadingState.finished = true;
			this.loadingState.percentDone = 100;
			this.loadingState.description = "All files loaded";
			this.notify();

			return result;
		})();

		try {
			return await this.loadingPromise;
		} finally {
			this.loadingPromise = null;
		}
	}

	// --- helper ---
	private async getFile(store: IDBObjectStore, key: string): Promise<any> {
		return new Promise((resolve, reject) => {
			const req = store.get(key);
			req.onsuccess = () => resolve(req.result);
			req.onerror = () => reject(req.error);
		});
	}

	// --- reset ---
	public async reset(): Promise<boolean> {
		try {
			this.db?.close();
			await indexedDB.deleteDatabase(this.dbName);
			this.db = null;
			this.dbPromise = null;
			this.initializing = null;

			this.notify({
				name: "Reset Database",
				description: "Database deleted",
				finished: true,
				percentDone: 100,
			});
			return true;
		} catch (error) {
			const err = error as Error | null;
			this.notify({
				finished: true,
				error: err,
			});
			return false;
		}
	}

	public getLoadingState(): LoadingState {
		return this.loadingState;
	}
}
