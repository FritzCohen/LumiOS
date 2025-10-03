import { useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { NamedDirectory, NamedFile } from "../../FileExplorer/fileExplorerTypes";
import { useDroppable } from "../../../../hooks/DragAndDrop/useDragAndDrop";
import { Directory } from "../../../api/types";

type SidebarFolderItemProps = {
  name: string;
  fullPath: string;
  entry: NamedDirectory;
  isOpen: boolean;
  selectedFile: string | null;
  toggleFolder: (path: string) => void;
  moveFile: (fileName: string, fromPath: string, toPath: string) => void;
  handleFileSelect: (path: string, isFolder?: boolean) => void;
  renderChildren: (
    children: Record<string, NamedDirectory | NamedFile>,
    parentPath: string
  ) => React.ReactNode;
};

const SidebarFolderItem: React.FC<SidebarFolderItemProps> = ({
  name,
  fullPath,
  entry,
  isOpen,
  selectedFile,
  toggleFolder,
  handleFileSelect,
  moveFile,
  renderChildren,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useDroppable(ref, ["file"], (data, type, meta) => {
    if (!meta?.path || !meta?.name || meta.path === fullPath) return;
    moveFile(meta.name, meta.path, fullPath);
  });

  const convertedChildren = Object.fromEntries(
    Object.entries((entry as Directory).children).map(([key, val]) => {
      const childFullPath = `${fullPath}/${key}`;
      if (val.type === "directory") {
        return [
          key,
          { ...val, name: key, type: "directory", fullPath: childFullPath } as NamedDirectory,
        ];
      } else {
        return [
          key,
          { ...val, name: key, type: "file", fullPath: childFullPath } as NamedFile,
        ];
      }
    })
  );

  return (
    <div className="ml-3 mt-1 flex flex-col gap-1">
      <div
        ref={ref}
        className={`code-item ${selectedFile === fullPath ? "active" : ""}`}
        onClick={() => handleFileSelect(fullPath, true)}
      >
        <FontAwesomeIcon
          icon={isOpen ? faChevronDown : faChevronRight}
          className="mr-1 text-xs"
          onClick={(e) => {
            e.stopPropagation();
            toggleFolder(fullPath);            
          }}
        />
        <span>{name}</span> {/* No toggle on folder name */}
      </div>
      {isOpen && renderChildren(convertedChildren, fullPath)}
    </div>
  );
};

export default SidebarFolderItem;