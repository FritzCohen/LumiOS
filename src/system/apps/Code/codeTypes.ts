import { NamedDirectory, NamedFile } from "../FileExplorer/fileExplorerTypes";

export interface CodeState {
  openFolders: Record<string, boolean>;
  setOpenFolders: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;

  setOpenFilesMap: React.Dispatch<React.SetStateAction<Record<string, NamedFile>>>;

  selectedFile: string | null;
  setSelectedFile: React.Dispatch<React.SetStateAction<string | null>>;

  directory: string | null;
  setDirectory: (dir: string) => void;

  content: Record<string, Record<string, NamedDirectory | NamedFile>>

  menu: number;
  setMenu: (n: number) => void;

  openFiles: string[];
  openFilesMap: Record<string, NamedFile>;

  openFile: (path: string) => Promise<void>;
  closeFile: (path: string) => void;

  handleAddFileOrFolder: (type: "file" | "directory") => Promise<void>;

  // Toggle open/closed state of a folder
  toggleFolder: (path: string) => void;
}