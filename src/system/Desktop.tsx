import React, { useState, useEffect, useRef } from 'react';
import Taskbar from '../components/Taskbar/Taskbar';
import AppTray from '../components/Taskbar/AppTray';
import Window from './lib/Window';
import ContextMenu from '../components/ContextMenu/ContextMenu';
import virtualFS from '../utils/VirtualFS';
import { useKernal } from '../Providers/KernalProvider';
import { App, Permission, Process } from '../utils/types';
import Topbar from '../components/Topbar/Topbar';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import components from './apps/Components';
import AppMenu from '../components/Taskbar/AppList/AppMenu';
import SearchApps from '../components/Taskbar/SearchApps';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DraggableData, Rnd } from 'react-rnd';
import Popup from './lib/Popup';
import { faArrowUpRightFromSquare, faFileCirclePlus, faFolderOpen, faFolderPlus, faListUl, faPaintBrush, faPlusCircle, faRefresh, faTerminal } from '@fortawesome/free-solid-svg-icons';
import FileInput from './lib/FileInput';
import installedAppsIcon from "../assets/Icons/applist.png";
import settingsIcon from "../assets/Icons/settings.png";
import terminalIcon from "../assets/Icons/terminal.png";
import useContextMenu from '../components/ContextMenu/useContextMenu';
import fileIcon from "../assets/Icons/explorer.png";
import { useApplications } from '../Providers/ApplicationProvider';
import { useUser } from '../Providers/UserProvider';
import Assistent from '../components/Assistence/Assistant';
import { generateXYGrid, getIcon } from '../utils/Process';
import { DraggableEvent } from 'react-draggable';
import EmbeddedHtml from './lib/EmbeddedHTML';

/**
 * 
 * @param setShowBootScreen Show or hide the bootscreen 
 * @returns React.ReactNode
 * 
 * @source
 */
const Desktop: React.FC<{ setShowBootScreen: (prev: boolean) => void }> = ({ setShowBootScreen }) => {
    const [activeItem, setActiveItem] = useState<string | null>(null);
    const [apps, setApps] = useState<(Process & { Component?: React.FC; svg: string | IconDefinition })[]>([]);
    const [activeWindow, setActiveWindow] = useState<number | null>(null);
    const [positions, setPositions] = useState<{ [key: string]: { x: number; y: number } }>({});
    const { contextMenuPosition, contextMenuVisible, showContextMenu, hideContextMenu, contextMenuItems } = useContextMenu();
    const { openedApps, popups, addOpenedApp, setOptionProperties, addPopup, removePopup, fetchSystemProps } = useKernal();
    const { installedApps, desktopApps, getDesktopApps, removeDesktopApp } = useApplications();
    const { currentUser } = useUser();

    useEffect(() => {
        fetchSystemProps();
    }, []);

    useEffect(() => {
        const last = openedApps[openedApps.length - 1];
        if (last) setActiveWindow(last.id);
    }, [openedApps]);      

    const loadedAppsRef = useRef<Record<string, any>>({});

    // Function to fetch component data
    const fetchFileContent = async (app: any) => {
      if (!app.path) return app; // Skip if no path

      try {
        const file = await virtualFS.readfile(app.path, app.actualName ?? app.name);        
        
        const content = components[app.actualName ?? app.name] || (await file.content.fileContent ?? await file.content);        
        const svg = await file.content.svg;

        return { ...app, svg, Component: content };
      } catch (error) {
        console.warn(`Failed to load file for ${app.path}:`, error, app);
        return app;
      }
    };
    
    // Preload installed apps on mount
    useEffect(() => {
      const loadInstalledApps = async () => {
        const updatedInstalledApps = await Promise.all(installedApps.map(fetchFileContent));        
    
        updatedInstalledApps.forEach((app) => {
          loadedAppsRef.current[app.name] = app;
        });
      };
    
      loadInstalledApps();      
    }, []);

    useEffect(() => {
        handlePositions();
    }, [desktopApps]);
    
    // Sync opened apps with apps state
    useEffect(() => {
      const loadOpenedApps = async () => {
        if (!openedApps.length) {
          setApps([]); // If no apps are open, clear the state
          return;
        }
    
        const updatedApps = await Promise.all(
          openedApps.map(async (app) => {
            const cachedApp = loadedAppsRef.current[app.name];
    
            // If app exists in cache and hasn't changed, return it
            if (cachedApp) {
              return { ...cachedApp, ...app }; // Preserve new properties (e.g., minimized, maximized)
            }
    
            // Otherwise, fetch new data and update cache
            const fetchedApp = await fetchFileContent(app);
            loadedAppsRef.current[app.name] = fetchedApp;
            return fetchedApp;
          })
        );
    
        // **Remove apps that are no longer in `openedApps`**
        setApps(() =>
          updatedApps.filter((updatedApp) => openedApps.some((o) => o.name === updatedApp.name))
        );
      };
    
      loadOpenedApps();
    }, [openedApps]);

    useEffect(() => {
        apps.forEach(app => {
          if (app.permission && currentUser && app.permission >= currentUser.permission) {
            addPopup({
              name: `Open ${app.name} as admin`,
              onAccept: async () => {},
              children: (<div>sigma boy</div>),
              minimized: false,
              description: "",
            });
          }
        });
    }, [apps, currentUser]);      

    const handlePositions = async () => {
        const grid = generateXYGrid(desktopApps.map(app => app.actualName || app.name));
        const files = await virtualFS.readdir("System/Plugins/Positions/");
        const positions: { [key: string]: { x: number; y: number } } = {};
      
        desktopApps.forEach(app => {
            const file = files[app.actualName || app.name];

            if (file && file.type === "directory") return;

            // If position is already saved, use it; otherwise, calculate grid position
            if (file && file.content && typeof file.content.x === "number" && typeof file.content.y === "number") {
                positions[app.actualName || app.name] = {
                    x: file.content.x,
                    y: file.content.y
                };
            } else {
                // Default to grid position if not saved
                positions[app.actualName || app.name] = grid[app.actualName || app.name];
            }
        });
      
        setPositions(positions);
      };      
    
    const handleDragStop = (event: DraggableEvent, data: DraggableData, name: string) => {
        event.preventDefault();

        savePositions(name, data);
    };

    const savePositions = async (name: string, data: DraggableData) => {
        const { x, y } = data;
        
        await virtualFS.updateFile("System/Plugins/Positions/", name, {
            x,
            y,
        }, "sys");
    };

    const handleItemClick = async (key: App) => {        
        const fixedAppName = installedApps.some((app) => app.actualName === key.actualName) ? key.actualName : "FileExplorer";        
        // const file = desktopApps.find(app => app.actualName === key.actualName);
        
        if (Object.keys(key).length == 2) {
            // Type is a file since it only has props svg and actualName
            const file = await virtualFS.readfile("Desktop/", key.actualName);
            const content = await file?.content;

            setOptionProperties((prev) => {
                return {
                    ...prev,
                    path: `/Users/${currentUser?.username}/Desktop/`,
                }
            });

            addOpenedApp({
                name: "Notepad",
                svg: key.svg,
                minimized: false,
                maximized: false,
                content: content,
                path: `/Users/${currentUser?.username}/Apps/`,
                type: "exe",
            });

            return;
        }
        
        // Check for case its a folder/file ig
        if (fixedAppName === "FileExplorer") {
            setOptionProperties((prev) => {
                return {
                    ...prev,
                    path: key.actualName !== "FileExplorer" ? `/Users/${currentUser?.username}/Desktop/${key.actualName}` : `/Users/${currentUser?.username}/Desktop/`,
                }
            })
        }

        addOpenedApp({
            name: fixedAppName,
            svg: key.svg,
            minimized: false,
            maximized: false,
            path: `/Users/${currentUser?.username}/Apps/`,
            type: "exe",
        });
    };

    const handleAddItem = (type: "file" | "directory", defaultName: string) => {
        addPopup({
            name: defaultName,
            description: `Create a new ${type}.`,
            minimized: false,
            onAccept: getDesktopApps,
            children: <FileInput type={type} name={defaultName} closePopup={() => {getDesktopApps(); removePopup(defaultName)}} />
        });
    };
    
    const handleOpenApp = (name: string, icon: string, extraOptions: Partial<any> = {}) => {
        addOpenedApp({
            name,
            svg: icon,
            minimized: false,
            maximized: false,
            path: `/Users/${currentUser?.username}/Apps/`,
            type: "exe",
            ...extraOptions, // Allows optional overrides (e.g., path for Terminal)
        });
    };
    
    const handleAddFolder = () => handleAddItem("directory", "Folder Name");
    
    const handleAddFile = () => handleAddItem("file", "File Name");
    
    const handleOpenApplist = () => {
        handleOpenApp("InstalledApps", installedAppsIcon);
    };
    
    const handleOpenSettings = () => {
        setOptionProperties((prev) => ({ ...prev, menu: 1 }));
        handleOpenApp("Settings", settingsIcon);
    };
    
    const handleOpenTerminal = () => {
        setOptionProperties((prev) => ({ ...prev, path: `/Users/${currentUser?.username}/Desktop/` }));
        handleOpenApp("Terminal", terminalIcon, { path: `/Users/${currentUser?.username}/Apps/` });
    };
    
    return (
        <div
            className="desktop"
            onContextMenu={(e) => showContextMenu(e, [
                    { name: 'Refresh', icon: faRefresh, action: async () => { getDesktopApps(); handlePositions(); }, gap: true },
                    { name: 'Apps', icon: faListUl, action: handleOpenApplist },
                    { name: 'Personalize', icon: faPaintBrush, action: handleOpenSettings },
                    { name: 'Open Terminal', icon: faTerminal, action: handleOpenTerminal },
                    { name: 'Add', action: () => {}, icon: faPlusCircle, isDropdown: true, children: [
                        { name: 'New Folder', icon: faFolderPlus, action: handleAddFolder },
                        { name: 'New File', icon: faFileCirclePlus, action: handleAddFile },
                    ]}
                ], ".desktop")
            }
        >
            {/* Topbar */}
            <Topbar />
            {/* Render the windows */}
            {apps.map((app, index) => {
                const Component: React.FC<{ setShowBootScreen: (prev: boolean) => void, permission: Permission | undefined, app: any }> | null = app.Component || loadedAppsRef.current[app.name] || null;           
                
                return (
                    <Window key={app.id || index} activeWindow={activeWindow} setActiveWindow={setActiveWindow} app={app}>
                        {Component != undefined && typeof Component !== "object" ? (
                            Component && typeof Component !== "string" ? 
                                <Component setShowBootScreen={setShowBootScreen} permission={app.permission} app={app} /> 
                                : 
                                <EmbeddedHtml html={Component} />
                            ) : <></>
                        }
                        {/* Check for special app cases. May be rendered on top */}
                    </Window>
                );
            })}

            {/* 
            Map all the popups. 
            They are independant of the windows, mostly because the logic for mapping apps would need more if statements
            But honestly it doesn't really matter
            */}
            {popups.map((popup, index) => (
                <Popup key={index} popup={popup} />
            ))}

            {/* Render AppTray and AppList based on Taskbar state */}
            {activeItem === 'AppTray' && <AppTray visible={activeItem === 'AppTray'} onItemClick={setActiveItem} />}
            {activeItem === 'AppList' && <AppMenu visible={activeItem === 'AppList'} onItemClick={setActiveItem} />}
            {activeItem === 'SearchApps' && <SearchApps onItemClick={setActiveItem} />}
            {activeItem === '' && <Assistent onItemClick={setActiveItem} />}
            <div className='desktop-apps'>
                {desktopApps.map((key: App, index) => {
                    // @ts-expect-error sigma
                    const type: "directory" | "file" | undefined = key.type;
                    //const defaultPosition = defaultPositions[key.actualName || key.name];                    
                    
                    return (
                        <Rnd
                        className="!w-fit"
                        position={positions[key.actualName] || { x: 0, y: index * 20 }}
                        enableResizing={false}
                        bounds="parent"
                        key={index}
                        onDragStop={(event, data) => {
                            setPositions((prev) => ({
                            ...prev,
                            [key.actualName]: { x: data.x, y: data.y },
                            }));
                            handleDragStop(event, data, key.actualName);
                        }}
                        >                            
                        <div
                            data-key={key}
                            
                            onContextMenu={(e) => showContextMenu(e, [
                                { name: `Unshortcut`, icon: faArrowUpRightFromSquare, action: () => {
                                    removeDesktopApp(key);
                                }},
                                { name: "Open File Location", icon: faFolderOpen, action: () => {
                                    setOptionProperties((prev) => {
                                        return {
                                            ...prev,
                                            path: `/Users/${currentUser?.username}/Desktop/`,
                                        }
                                    });
    
                                    addOpenedApp({
                                        name: "FileExplorer",
                                        type: "app",
                                        path: `/Users/${currentUser?.username}/Apps/`,
                                        svg: fileIcon,
                                        minimized: false,
                                        maximized: false,
                                    })}
                                }
                            ], ".desktop")}
                            className={`desktop-item`}
                            onDoubleClick={() => handleItemClick(key)}
                            >
                            {(key?.svg && type == undefined && key.description) && (
                                typeof key.svg === "string" ? (
                                key.svg.trim().startsWith("<svg") || key.svg.trim().startsWith("<img") ? (
                                    <div
                                    className="svg-wrapper"
                                    dangerouslySetInnerHTML={{ __html: key.svg }}
                                    />
                                ) : (
                                    <img src={key.svg} alt={key.name} className="svg-wrapper" />
                                )
                                ) : (
                                <FontAwesomeIcon icon={key.svg} className="svg-wrapper" />
                                )
                            )}
                            {(type || Object.keys(key).length == 3) && (
                                <img 
                                    src={getIcon((key as any)?.fileType || "")}
                                    className="svg-wrapper"
                                    alt="icon" 
                                />
                            )}
                            <p className="text-xs font-bold">  {key.actualName}  </p>
                            </div>
                        </Rnd>
                    );
                })}
            </div>
            <Taskbar apps={apps} activeItem={activeItem} onItemClick={setActiveItem} />
            {/* Render ContextMenu */}
            {contextMenuVisible && <ContextMenu menuItems={contextMenuItems} menuPosition={contextMenuPosition} hideMenu={hideContextMenu} />}
        </div>
    );
};

export default Desktop;