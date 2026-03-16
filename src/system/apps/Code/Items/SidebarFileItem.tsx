import { useRef } from "react";
import { NamedFile } from "../../FileExplorer/fileExplorerTypes";
import { useDraggable } from "../../../../hooks/DragAndDrop/useDragAndDrop";

type SidebarFileItemProps = {
  name: string;
  fullPath: string;
  entry: NamedFile;
  selectedFile: string | null;
  handleFileSelect: (path: string, isFolder?: boolean) => void;
  moveFile: (fileName: string, fromPath: string, toPath: string) => void;
};

const SidebarFileItem: React.FC<SidebarFileItemProps> = ({
  name,
  entry,
  fullPath,
  selectedFile,
  handleFileSelect,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useDraggable(ref, "file", entry, { path: fullPath, name });

  return (
    <div
      ref={ref}
      className={`code-item ${selectedFile === fullPath ? "active" : ""}`}
      onClick={() => handleFileSelect(fullPath, false)}
    >
      {name}
    </div>
  );
};

export default SidebarFileItem;