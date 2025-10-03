import { Executable, Shortcut, Theme } from "../../types/globals";
import { Game } from "../apps/Appstore/appstoreTypes";
import { FileType } from "./FileTypes";

// Core Item Interface
export interface Item {
  type: 'directory' | 'file';
  date: Date;
  permission: any;
  deleteable: boolean;
}

// Directory Interface
export interface Directory extends Item {
  type: 'directory';
  children: {
    [key: string]: Directory | File;
  };
}

// Map FileType to actual content types
export interface FileContentMap {
  txt: string;
  img: Uint8Array | string;
  exe: Omit<Executable, 'mainComponent'>;
  theme: Theme
  js: string;
  css: string;   
  html: string;
  sys: Record<string, any>;
  swf: Uint8Array;
  game: Game;
  shortcut: Shortcut;
}

// Discriminated Union for Files
type FileBase = Omit<Item, "type"> & {
  type: "file";
  displayName?: string;
};

type FileVariants = {
  [K in keyof FileContentMap]: FileBase & {
    fileType: K;
    content: FileContentMap[K];
  };
};
// Union of all file types
export type File = FileVariants[FileType];

/**
 * Method for storing data in the filesystem
 * 
 * OPFS is a non-static storage system
 * 
 * indexedDB is good for having large amounts of data
 * 
 * NOTE: Sometimes it will not save with frequent loading
 * 
 * localStorage is good for cloud service
 * 
 * fileStorage only works with chrome and edge
 */
export type storageMethod = 'OPFS' | 'indexedDB' | 'localStorage' | 'fileStorage';

export interface LoadingState {
  name: string
  description: string
  percentDone: number
  finished: boolean
  error: Error | null
}

// Storage interface
export interface StorageHandler {
  initialize(): Promise<void>;
  save(data: any): Promise<void>;
  load(): Promise<any>;
  reset(): Promise<boolean>;
  getLoadingState(): LoadingState;
  subscribe?(callback: (state: LoadingState) => void): () => void; 
  // Optional subscribe method for progress updates
}

export const defaultLoadingState: LoadingState = {
  name: "Idle",
  description: "No operation in progress",
  percentDone: 0,
  finished: false,
  error: null,
};