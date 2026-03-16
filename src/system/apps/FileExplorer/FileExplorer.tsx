// FileExplorer.tsx
import React, { useRef } from "react";
import Sidebar from "./FileExplorerSidebar";
import FileContent from "./FileExplorerContent";
import FileExplorerControls from "./FileExplorerControls";
import { OpenedApp } from "../../../context/kernal/kernal";
import { TaskbarDesktopItem } from "../../../types/globals";
import { FileExplorerState } from "./fileExplorerTypes";
import "./fileExplorer.css";
import { useFileExplorer } from "./useFileExplorerLogic";

interface FileExplorerProps {
  defaultPath: string;
  props: OpenedApp;
  item: TaskbarDesktopItem;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ defaultPath, props }) => {
  const fileExplorerRef = useRef<HTMLDivElement>(null);
  const explorer: FileExplorerState = useFileExplorer(defaultPath, props);

  return (
    <div
      className="flex flex-col w-full h-full"
      id="fileexplorer"
      ref={fileExplorerRef}
    >
      <FileExplorerControls explorer={explorer} />

      <div className="flex flex-row flex-grow overflow-auto">
        <div className="w-1/3 min-w-[33%] overflow-hidden">
          <div className="h-full overflow-y-auto px-1">
            <Sidebar explorer={explorer} />
          </div>
        </div>
        <div
          className="w-full h-full overflow-y-auto flex flex-col gap-2 px-2"
          id="file-content"
        >
          <FileContent explorer={explorer} fileExplorerRef={fileExplorerRef} />
        </div>
      </div>
    </div>
  );
};

export default FileExplorer;