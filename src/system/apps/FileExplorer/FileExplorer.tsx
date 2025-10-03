import React, { ReactNode, useEffect, useState } from "react";
import { ContextMenuItem, Directory, File, Permission } from "../../../utils/types";
import "./FileExplorer.css";
import InputBar from "./InputBar";
import virtualFS from "../../../utils/VirtualFS";
import cut from "../../../assets/Icons/Settings/cut.png";
import copy from "../../../assets/Icons/Settings/copy.png";
import paste from "../../../assets/Icons/Settings/paste.png";
import garbage from "../../../assets/Icons/Settings/garbage.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpFromBracket, faArrowUpRightFromSquare, faBackward, faChevronDown, faChevronRight, faClipboard, faCopy, faCut, faDownload, faFileCirclePlus, faFolderPlus, faPaste, faTrash } from "@fortawesome/free-solid-svg-icons";
import ContextMenu from "../../../components/ContextMenu/ContextMenu";
import { useKernal } from "../../../Providers/KernalProvider";
import { MIMETypes } from "../../../utils/MIMETypes";
import { getIcon } from "../../../utils/Process";
import { useUser } from "../../../Providers/UserProvider";
import { useApplications } from "../../../Providers/ApplicationProvider";
import UserInput from "../../lib/UserInput";
import useContextMenu from "../../../components/ContextMenu/useContextMenu";

interface NamedFile extends File {
    name: string;
  }
  
interface NamedDirectory extends Directory {
    name: string;
}

const FileExplorer = () => {
  const { addOpenedApp, addPopup, removePopup, optionalProperties, resetOptionalProperties, setOptionProperties } = useKernal();
  const { installedApps: apps } = useApplications();
  const { currentUser } = useUser(); // For permissions level
  const [directory, setDirectory] = useState<string>(optionalProperties.path === "" ? `Users/${currentUser?.username}/` : optionalProperties.path);
  const [content, setContent] = useState<Record<string, NamedDirectory | NamedFile>>({});
  const [selectedItems, setSelectedItems] = useState<(NamedDirectory | NamedFile)[]>([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
  const [draggedItems, setDraggedItems] = useState<(NamedDirectory | NamedFile)[]>([]);
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});
  const [admin, setAdmin] = useState<Permission>(currentUser?.permission || Permission.USER);
  const { contextMenuVisible, contextMenuPosition, contextMenuItems, showContextMenu, hideContextMenu } = useContextMenu();
  const [clipboard, setClipboard] = useState<{
    type: 'cut' | 'copy';
    items: { item: NamedDirectory | NamedFile; directory: string; name: string; }[];
  }>({ type: 'copy', items: [] });

  const fetchContent = async () => {
      const fetchedContent = await virtualFS.readdir(directory);
      const contentWithNames = Object.keys(fetchedContent).reduce((acc, key) => {
          const item = fetchedContent[key];
          acc[key] = { ...item, name: key }; // Add the name property
          return acc;
      }, {} as Record<string, NamedDirectory | NamedFile>);
      
      setContent(contentWithNames);
  };

  useEffect(() => {
      fetchContent();
      setDirectory(directory.replace("//", "/"));
  }, [directory]);

  useEffect(() => {
    resetOptionalProperties();
  }, []);

  useEffect(() => {
    fetchContent();
  }, [optionalProperties.menu]);

  const handleItemSelect = (
    e: React.MouseEvent,
    item: NamedDirectory | NamedFile,
    index: number
  ) => {
    if (e.ctrlKey || e.metaKey) {
      // Ctrl or Cmd key: Toggle selection of individual items
      if (selectedItems.includes(item)) {
        setSelectedItems((prev) => prev.filter((i) => i !== item));
      } else {
        setSelectedItems((prev) => [...prev, item]);
      }
    } else if (e.shiftKey && lastSelectedIndex !== null) {
      // Shift key: Select range from last selected to current
      const allItems = Object.keys(content).map((key) => content[key]);
      const start = Math.min(lastSelectedIndex, index);
      const end = Math.max(lastSelectedIndex, index);
      const rangeItems = allItems.slice(start, end + 1);
      setSelectedItems(rangeItems);
    } else {
      // Single click: Select single item
      setSelectedItems([item]);
    }

    // Update last selected index
    setLastSelectedIndex(index);
  };

  const handleDragStart = (item: NamedDirectory | NamedFile) => {
    if (!selectedItems.includes(item)) {
      setSelectedItems((prev) => [...prev, item]);
    }
    setDraggedItems([...selectedItems, item]);
  };

  const handleDrop = async (targetDirectory: NamedDirectory, path: string) => {
    const newPath = `${directory}${path}/`;

    if (draggedItems.length > 0) {
      for (const item of draggedItems) {
        const itemName = item.name; // Use the item's name directly
        if (!itemName) continue;

        try {
          if (targetDirectory.type === "directory") {
            await virtualFS.mv(directory, newPath, itemName, itemName, Permission.USER);
          }
        } catch (error) {
          console.error(`Failed to move item: ${itemName}`, error);
        }
      }
      setDraggedItems([]);
      fetchContent();
    }
  };

  const handleCut = () => {
    const clipboardItems = selectedItems.map(item => ({
      item,
      directory,
      name: item.name,
    }));
    setClipboard({ type: 'cut', items: clipboardItems });
    setSelectedItems([]);
  };

  const handleCopy = () => {
    const clipboardItems = selectedItems.map(item => ({
      item,
      directory,
      name: item.name,
    }));
    setClipboard({ type: 'copy', items: clipboardItems });
  };

  const handlePaste = async () => {
    const { type, items } = clipboard;
    if (items.length == 0) return;

    for (const { item, directory: originalDirectory } of items) {
      const itemName = item.name; // Use the name directly
      if (!itemName) continue;

      //const newPath = `${directory}/${itemName}`;
      
      try {
        if (type === 'cut') {
          if (item.type === "directory") {
            await virtualFS.writeDirectory(directory, itemName, Permission.USER);
            await recursiveWrite(`${originalDirectory}/${itemName}`, `${directory}/${itemName}`);
            await virtualFS.deleteFile(originalDirectory, itemName);
          } else {
            await virtualFS.mv(originalDirectory, directory, itemName, itemName, Permission.USER);
          }
        } else if (type === 'copy') {
          if (item.type === "directory") {
            await virtualFS.writeDirectory(directory, itemName, Permission.USER);
            await recursiveWrite(`${originalDirectory}/${itemName}`, `${directory}/${itemName}`);
          } else {
            await virtualFS.writeFile(directory, itemName, item.content, item.fileType.toString());
          }
        }
      } catch (error) {
        console.error(`Failed to paste item: ${itemName}`, error);
      }
    }
    setClipboard({ type: 'copy', items: [] });
    fetchContent();
  };

  const recursiveWrite = async (path: string, newPath: string) => {
    const content = await virtualFS.readdir(path);
  
    for (const name of Object.keys(content)) {
      const item = content[name];
      const fullOldPath = `${path}/${name}`;
      const fullNewPath = `${newPath}/${name}`;
    
      if (item.type === "directory") {
        // Create the folder: path = newPath, name = folder name
        await virtualFS.writeDirectory(newPath.replace("//", "/"), name, Permission.USER);
        await recursiveWrite(fullOldPath, fullNewPath.replace("//", "/"));
      } else {
        // Ensure parent folder exists before writing
        await ensureDirectoryExists(newPath);        
        await virtualFS.writeFile(newPath.replace("//", "/"), name, item.content, item.fileType);
      }
    }
  };
  
  const ensureDirectoryExists = async (fullPath: string) => {
    try {
      await virtualFS.readdir(fullPath); // Folder exists
    } catch {
      const parts = fullPath.split('/');
      const name = parts.pop()!;
      const path = parts.join('/') || '/'; // default to root
      await virtualFS.writeDirectory(path, name, Permission.USER);
    }
  };

  const handlePermissionsError = (
    item: NamedDirectory | NamedFile,
    method: () => Promise<void>
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      // const itemName = item.name;

      if (item.permission > admin) {
        const verify = async (good: boolean): Promise<boolean> => {
          if (!good) {
            resolve(false);
            return false;
          }

          await method();
          setAdmin(item.permission);
          await fetchContent();
          setSelectedItems([]);
          removePopup("Permissions Error");

          resolve(true);
          return true;
        };

        addPopup({
          name: "Permissions Error",
          description: "Requesting sudo permissions.",
          minimized: false,
          appName: "FileExplorer",
          onAccept: async () => {}, // no-op here
          children: (
            <UserInput
              name="Permissions Error"
              closePopup={() => removePopup("Permissions Error")}
              verified={verify}
            />
          ),
        });
      } else {
        // User already has permission
        method().then(() => resolve(true)).catch(() => resolve(false));
      }
    });
  };
  
  const handleDelete = async () => {
    for (const item of selectedItems) {
      const itemName = item.name;
      if (!itemName) continue;

      const success = await handlePermissionsError(item, async () => {
        await virtualFS.deleteFile(directory, itemName);
      });

      if (!success) {
        console.warn(`Permission denied or verification failed for: ${itemName}`);
        return; // Stop deleting further items if one fails due to permissions
      }
    }

    setSelectedItems([]);
    await fetchContent();
  };

  const handleFileUpload = async (): Promise<void> => {
    const newFileName = prompt("Enter the file name:");
    if (newFileName) {
      try {
        let fileExists = false;

        if (Object.keys(content).includes(newFileName)) {
          fileExists = true;
        }

        if (!fileExists) {
          const input = document.createElement("input");
          input.type = "file";

          input.onchange = () => {
            const file = input.files?.[0];
            
            if (!file) return;

            const reader = new FileReader();

            reader.readAsText(file, "UTF-8");
            reader.onload = async (event) => {
              const newFile = event.target?.result as string;
              const fileType = file.type.replace("text/", "") || "txt";
              
                await virtualFS.writeFile(directory, newFileName, newFile, fileType);
                await fetchContent();
            };
          };

          input.click();
        } else {
          alert("File already exists.");
          console.error("File already exists:", newFileName);
        }
      } catch (error) {
        console.error("Error creating file:", error);
      }
    }
  };

  const handleAddFile = async (): Promise<void> => {
    const newFileName = prompt("Enter the file name:");
    if (newFileName) {
      try {
        let fileExists = false;

        if (Object.keys(content).includes(newFileName)) {
          fileExists = true;
        }

        if (!fileExists) {
          enum AllowedFileTypes {
            TXT = "txt",
            JPG = "jpg",
            HTML = "html",
            SHRT = "shrt",
            PINN = "pinn",
            APP = "app",
            JS = "js",
          }
          
          const newFileTypeInput = prompt(`File type? Options: ${Object.values(AllowedFileTypes).join(", ")}`);

          // Check if the input is a valid file type
          const newFileType: AllowedFileTypes | undefined = Object.values(AllowedFileTypes).includes(newFileTypeInput as AllowedFileTypes)
            ? newFileTypeInput as AllowedFileTypes
            : undefined;

          if (!newFileType) return alert("Not allowed file type.");
        
          await virtualFS.writeFile(directory, newFileName, "", newFileType);
          await fetchContent();
        } else {
          alert("File already exists.");
          console.error("File already exists:", newFileName);
        }
      } catch (error) {
        console.error("Error creating file:", error);
      }
    }
  };

  const handleAddFolder = async (): Promise<void> => {
    const newFolderName = prompt("Enter the folder name:");
    if (newFolderName) {
      try {
        let fileExists = false;
        
        if (Object.keys(content).includes(newFolderName)) {
          fileExists = true;
        }

        if (!fileExists) {
          await virtualFS.writeDirectory(directory, newFolderName, Permission.USER);
          await fetchContent();
        } else {
          console.error("Folder already exists:", newFolderName);
        }
      } catch (error) {
        console.error("Error creating file:", error);
      }
    }
  };

  const handleBack = () => {
    const parts = directory.split("/").filter(Boolean); // Split and remove empty parts
    parts.pop(); // Remove the last directory
    const updatedPath = parts.join("/"); // Reconstruct the path
    setDirectory(updatedPath.startsWith("/") ? `/${updatedPath}` : updatedPath);
  };  

  const getContent = (): ReactNode => {
    const allItems = Object.keys(content).map((key) => content[key]);

    return (
      <div className="flex flex-col gap-1 w-full h-full px-5 py-2 overflow-y-auto">
        {allItems.length == 0 && <p>No items were found. At { directory }</p>}
        {allItems.map((file, index) => {
          const handleItemClick = () => {
            if (file.type === "directory") {
              const newPath = `${directory}/${Object.keys(content)[index]}/`;
              setDirectory(newPath);
            } else {              
              if (apps.some(app => app.actualName === file.name || app.name === file.name)) {
                addOpenedApp({
                  name: file.name,
                  minimized: false,
                  maximized: false,
                  path: directory,
                  type: file.fileType,
                  content: file.content,
                  svg: file?.content?.svg || "",
                });
                setOptionProperties((prev) => {return {...prev, reload: fetchContent }})
              } else {
                addOpenedApp({
                  name: "Notepad",
                  // @ts-expect-error Cause name is already taken dummy
                  displayName: file.name,
                  minimized: false,
                  maximized: false,
                  path: directory,
                  type: file.fileType,
                  content: file.content, // It HAS to be a string. Kinda annoying, but ok.
                  svg: getIcon(file.fileType as string),
                });
                setOptionProperties((prev) => {return {...prev, reload: fetchContent }})
              }
            }
          };

          const handleItemDragOver = (e: React.DragEvent) => {
            e.preventDefault();
          };

          const getMethods = (): ContextMenuItem[] => {
            if (file.type === "directory") return [];

            const mimeType = MIMETypes[file.fileType];

            return !mimeType?.opensWith ? [
              { name: file.name, action: () => {
                addOpenedApp({
                    name: file.name,
                    minimized: false,
                    maximized: false,
                    path: directory,
                    content: file.content,
                    type: file.fileType,
                });
            }, icon: faArrowUpRightFromSquare }
            ] : mimeType.opensWith.map(item => {
                return { name: item, action: () => {
                    addOpenedApp({
                        name: file.name,
                        minimized: false,
                        maximized: false,
                        path: directory,
                        content: file.content,
                        type: item,
                    });
                }, icon: faArrowUpRightFromSquare };
            })
          };

          const getFileOrFolderContext = (): ContextMenuItem[] => {
            return file.type === "directory" ? [
              { name: "Navigate", icon: faArrowUpFromBracket, action: () => {
                const newDirectory = `${directory}/${file.name}/`;
                setDirectory(newDirectory);
              }},
            ] : [
              { name: "Open", icon: faArrowUpRightFromSquare, action: () => {
                addOpenedApp({
                    name: file.name,
                    minimized: false,
                    maximized: false,
                    path: directory,
                    type: file.fileType,
                    content: file.content,
                    svg: getIcon(file.fileType as string),
                });
                setOptionProperties((prev) => {return {...prev, reload: fetchContent }})
            }},
            { 
                name: "Open With", 
                action() {}, 
                isDropdown: true, 
                children: [
                  ...getMethods(),
                  { name: "Notepad", icon: faClipboard, action: () => {
                    addOpenedApp({
                      name: "Notepad",
                      // @ts-expect-error Cause name is already taken dummy
                      displayName: file.name,
                      minimized: false,
                      maximized: false,
                      path: directory,
                      type: file.fileType,
                      content: file.content, // It HAS to be a string. Kinda annoying, but ok.
                      svg: getIcon(file.fileType as string),
                    });
                    setOptionProperties((prev) => {return {...prev, reload: fetchContent }})
                  }},
                ]
              },

              { name: "Copy", icon: faCopy, action: () => {
                setSelectedItems([file]);
                handleCopy();
              }},
              { name: "Paste", icon: faPaste, action: () => {
                setSelectedItems([file]);
                handlePaste();
              }},
              { name: "Cut", icon: faCut, action: () => {
                setSelectedItems([file]);
                handleCut();
              }},
              { name: "Delete", icon: faTrash, action: () => {
                setSelectedItems([file]);
                handleDelete();
              }},
            ]
          };

          return (
            <div
              className={`content-item ${selectedItems.includes(file) ? "active" : ""}`}
              key={index}
              draggable
              onContextMenu={(e) => showContextMenu(e, getFileOrFolderContext(), "#fileexplorer")}
              onDragStart={() => handleDragStart(file)}
              onDragOver={
                file.type === "directory" ? handleItemDragOver : undefined
              }
              onDrop={
                file.type === "directory"
                  ? () => handleDrop(file as NamedDirectory, Object.keys(content)[index])
                  : undefined
              }
              onClick={(e) => handleItemSelect(e, file, index)}
              onDoubleClick={handleItemClick}
            >
              <div className="flex items-center gap-2">
                <img className="icon" alt="folder" src={getIcon(file.type === "directory" ? file.type : file.fileType as string)} />
                {Object.keys(content)[index]}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const toggleFolder = (folderName: string) => {
      setOpenFolders(prevState => ({
      ...prevState,
      [folderName]: !prevState[folderName],
      }));
  };

  // Keep track of the paths in a state or variable (like a map)
  const pathMap: { [key: string]: string } = {};
  // Function to generate the full path from the current directory and the folder clicked
  const getFullPath = (folderName: string, parentPath: string) => {
      if (pathMap[folderName]) {
          // Return the stored full path if it exists in the map
          return pathMap[folderName];
      } else {
          // If not in the map, generate the path and store it
          const fullPath = `${parentPath}/${folderName}`;
          pathMap[folderName] = fullPath;
          return fullPath;
      }
  };

  const handleSidebarChange = (name: string, parentPath: string) => {
      const fullPath = getFullPath(name, parentPath);
      setDirectory(fullPath); // Update directory path with the full path
      fetchContent();
  };

  const getSidebarContent = (): React.JSX.Element[] | null => {
      const root = virtualFS.getRoot();
      if (!root) return null;

      return Object.keys(root.children).map((folderName, index) => (
          <React.Fragment key={index}>
              {root.children[folderName].type === "directory" ? (
                  <div className="my-1">
                      {/* Folder Header */}
                      <div className="flex flex-row items-center">
                          <div className={`file-list-item ${directory.includes(folderName) ? "file-list-item-active" : ""}`}>
                              {/* Folder Toggle Icon */}
                              <FontAwesomeIcon
                                  icon={openFolders[folderName] ? faChevronDown : faChevronRight}
                                  onClick={() => toggleFolder(folderName)}
                                  className="file-list-icon"
                              />
                              {/* Folder Name */}
                              <span
                                  onClick={() => handleSidebarChange(folderName, '')}  // Empty path for root
                                  className="w-full"
                              >
                                  {folderName}
                              </span>
                          </div>
                      </div>

                      {/* Render Folder Children */}
                      {openFolders[folderName] && renderFolderChildren(root.children[folderName], folderName)}
                  </div>
              ) : (
                  /* File Item */
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

  const renderFolderChildren = (folder: any, parent: string) => {
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
                                  icon={openFolders[childName] ? faChevronDown : faChevronRight}
                                  onClick={() => toggleFolder(childName)}
                                  className="file-list-icon"
                              />
                              <span
                                  className="w-full"
                                  onClick={() => handleSidebarChange(childName, parent)}  // Passing parent path
                              >
                                  {childName}
                              </span>
                          </div>
                      </div>
                      {openFolders[childName] && renderFolderChildren(folder.children[childName], `${parent}/${childName}`)}
                  </>
              ) : (
                  <div className="file-list-item file-list-item-hover px-2 p-1">{childName}</div>
              )}
          </div>
      ));
  };
    
  return (
    <div className="flex flex-col w-full h-full" id="fileexplorer">
        <div className="flex flex-col items-center justify-between gap-2 w-full py-2 px-5">
          <div className="file-explorer-bar w-full">
            <div className="w-full flex">
              <div className="grid grid-cols-7 gap-1">
                <button onClick={handleBack} className="file-button">
                  <FontAwesomeIcon icon={faBackward} />
                  Back
                </button>
                <button onClick={handleAddFile} className="file-button">
                  <FontAwesomeIcon icon={faFileCirclePlus} />
                  File
                </button>
                <button onClick={handleAddFolder} className="file-button">
                  <FontAwesomeIcon icon={faFolderPlus} />
                  Folder
                </button>
                <button onClick={handleCut} className={`file-button ${clipboard.items.length != 0 && clipboard.type === "cut" ? "file-button-active" : ""}`}>
                    <img className="icon" alt="cut" src={cut} />
                    Cut
                </button>
                <button onClick={handleCopy} className={`file-button ${clipboard.items.length != 0 && clipboard.type === "copy" ? "file-button-active" : ""}`}>
                    <img className="icon" alt="copy" src={copy} />
                    Copy
                </button>
                <button onClick={handlePaste} className="file-button">
                    <img className="icon" alt="paste" src={paste} />
                    Paste
                </button>
                <button onClick={handleDelete} className="file-button">
                    <img className="icon invert" alt="delete" src={garbage} />
                    Delete
                </button>
              </div>
            </div>
            <div>
              <button onClick={handleFileUpload} className="file-button !text-xs !p-0.5">
                <FontAwesomeIcon icon={faDownload} />
                Upload
              </button>
            </div>
          </div>
          <InputBar directory={directory} setDirectory={setDirectory} />
        </div>
        <div className="flex flex-row flex-grow overflow-auto">
          {/* Sidebar */}
          <div className="w-1/3 min-w-[33%] overflow-hidden">
            <div className="h-full overflow-y-auto px-1">{getSidebarContent()}</div>
          </div>

          {/* Main Content */}

        <div className="w-full h-full overflow-y-auto flex flex-col gap-2 px-2" id="file-content">{getContent()}</div>
        </div>
        {contextMenuVisible && (
            <ContextMenu menuItems={contextMenuItems} menuPosition={contextMenuPosition} hideMenu={hideContextMenu}  />
        )}
    </div>
  );
};

export default FileExplorer;
