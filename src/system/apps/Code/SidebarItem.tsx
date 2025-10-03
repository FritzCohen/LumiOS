import { NamedDirectory, NamedFile } from "../FileExplorer/fileExplorerTypes";
import SidebarFileItem from "./Items/SidebarFileItem";
import SidebarFolderItem from "./Items/SidebarFolderItem";

type SidebarItemProps = {
  name: string;
  fullPath: string;
  entry: NamedDirectory | NamedFile;
  selectedFile: string | null;
  isOpen: boolean;
  toggleFolder: (path: string) => void;
	handleFileSelect: (fullPath: string, isFolder?: boolean) => void;
  moveFile: (fileName: string, fromPath: string, toPath: string) => void;
  renderChildren: (
    children: Record<string, NamedDirectory | NamedFile>,
    parentPath: string
  ) => React.ReactNode;
};

const SidebarItem: React.FC<SidebarItemProps> = (props) => {
  const { entry } = props;

  if (entry.type === "directory") {
    return (
      <SidebarFolderItem
        {...props}
        entry={entry as NamedDirectory}
        fullPath={entry.fullPath}
      />
    );
  }

  return (
    <SidebarFileItem
      {...props}
      entry={entry as NamedFile} 
      fullPath={entry.fullPath}
    />
  );
};

export default SidebarItem;