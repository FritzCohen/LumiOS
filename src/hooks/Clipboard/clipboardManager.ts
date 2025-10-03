import { NamedDirectory, NamedFile } from "../../system/apps/FileExplorer/fileExplorerTypes";

type ClipboardListener = (items: (NamedFile | NamedDirectory)[]) => void;

class ClipboardManager {
  private items: (NamedFile | NamedDirectory)[] = [];
  private listeners: ClipboardListener[] = [];

  set(items: (NamedFile | NamedDirectory)[]) {
    this.items = items;
    this.listeners.forEach(fn => fn(this.items));
  }

  get(): (NamedFile | NamedDirectory)[] {
    return this.items;
  }

  clear() {
    this.items = [];
    this.listeners.forEach(fn => fn(this.items));
  }

  subscribe(fn: ClipboardListener) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }
}

export const clipboardManager = new ClipboardManager();
