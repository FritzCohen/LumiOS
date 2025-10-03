// FileExplorerSidebar.tsx
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { FileExplorerState, NamedDirectory } from "./fileExplorerTypes";
import virtualFS from "../../api/virtualFS";

const FileExplorerSidebar: React.FC<{ explorer: FileExplorerState }> = ({ explorer }) => {
  const { openFolders, toggleFolder, directory, handleSidebarChange } =
    explorer;

  const renderFolderChildren = (folder: NamedDirectory, parent: string) => {
    return Object.keys(folder.children).map((childName, index) => (
      <div key={index} className="pl-4 my-1">
        {folder.children[childName].type === "directory" ? (
          <>
            <div className="flex flex-row items-center">
              <div
                className={`file-list-item file-list-item-hover file-list-folder ${
                  directory.includes(childName) ? "file-list-item-active" : ""
                }`}
              >
                <FontAwesomeIcon
                  icon={
                    openFolders[childName] ? faChevronDown : faChevronRight
                  }
                  onClick={() => toggleFolder(childName)}
                  className="file-list-icon"
                />
                <span
                  className="w-full"
                  onClick={() => handleSidebarChange(childName, parent)}
                >
                  {childName}
                </span>
              </div>
            </div>
            {openFolders[childName] &&
              renderFolderChildren(folder.children[childName] as NamedDirectory, `${parent}/${childName}`)}
          </>
        ) : (
          <div className="file-list-item file-list-item-hover px-2 p-1">
            {childName}
          </div>
        )}
      </div>
    ));
  };

  const getSidebarContent = () => {
    const root = virtualFS.getRoot() as NamedDirectory;
    if (!root) return null;

    return Object.keys(root.children).map((folderName, index) => (
      <React.Fragment key={index}>
        {root.children[folderName].type === "directory" ? (
          <div className="my-1">
            <div className="flex flex-row items-center">
              <div
                className={`file-list-item ${
                  directory.includes(folderName) ? "file-list-item-active" : ""
                }`}
              >
                <FontAwesomeIcon
                  icon={
                    openFolders[folderName] ? faChevronDown : faChevronRight
                  }
                  onClick={() => toggleFolder(folderName)}
                  className="file-list-icon"
                />
                <span
                  onClick={() => handleSidebarChange(folderName, "")}
                  className="w-full"
                >
                  {folderName}
                </span>
              </div>
            </div>
            {openFolders[folderName] &&
              renderFolderChildren(root.children[folderName] as NamedDirectory, folderName)}
          </div>
        ) : (
          <div
            className={`w-full flex flex-row items-center rounded p-1 px-2 cursor-pointer font-bold hover:shadow transition-all duration-200 
                  ${directory.includes(folderName) ? "bg-secondary-light" : ""}`}
          >
            {folderName}
          </div>
        )}
      </React.Fragment>
    ));
  };

  return <>{getSidebarContent()}</>;
};

export default FileExplorerSidebar;