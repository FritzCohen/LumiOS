// fileExplorerTypes.ts
import { File, Directory } from "../../api/types";

export type NamedFile = File & {
	name: string;
  fullPath: string;
};

export interface NamedDirectory extends Directory {
    name: string;
    fullPath: string
}
export interface ClipboardItem {
  item: NamedDirectory | NamedFile;
  directory: string;
  name: string;
}

export interface FileExplorerState {
  directory: string;
  setDirectory: (dir: string) => void;

  content: Record<string, NamedDirectory | NamedFile>;
  selectedItems: (NamedDirectory | NamedFile)[];
  setSelectedItems: (items: (NamedDirectory | NamedFile)[]) => void;

  clipboard: {
    type: "cut" | "copy";
    items: ClipboardItem[];
  };

  openFolders: Record<string, boolean>;
  toggleFolder: (name: string) => void;

  // Methods
  handleBack: () => void;
  handleAddFile: () => Promise<void>;
  handleAddFolder: () => Promise<void>;
  handleCut: () => void;
  handleCopy: () => void;
  handlePaste: () => Promise<void>;
  handleDelete: () => Promise<void>;
  handleFileUpload: () => Promise<void>;

  handleSidebarChange: (name: string, parentPath: string) => void;

  handleItemSelect: (
    e: React.MouseEvent,
    item: NamedDirectory | NamedFile,
    index: number
  ) => void;
  handleDragStart: (item: NamedDirectory | NamedFile) => void;
  handleDrop: (target: NamedDirectory, key: string) => void;

  openApp: (app: any) => void;
  getNeededApp: (file: NamedFile, dir: string) => any;
}