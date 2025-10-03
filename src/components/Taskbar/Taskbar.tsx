import React, { ReactNode, useEffect, useState } from "react";
import { App, ContextMenuItem, Popup, Process } from "../../utils/types";
import logo from "../../assets/no-bg-logo.png";
import "./Taskbar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight, faArrowsLeftRight, faArrowUpRightFromSquare, faCaretDown, faCaretUp, faEye, faEyeSlash, faFolderOpen, faLock, faRefresh, faSearch, faThumbTack, faX } from "@fortawesome/free-solid-svg-icons";
import { useKernal } from "../../Providers/KernalProvider";
import ContextMenu from "../ContextMenu/ContextMenu";
import fileIcon from "../../assets/Icons/explorer.png";
import fileExplorerIcon from "../../assets/Icons/explorer.png";
import useContextMenu from "../ContextMenu/useContextMenu";
import { useApplications } from "../../Providers/ApplicationProvider";
import { useUser } from "../../Providers/UserProvider";

interface TaskbarProps {
    apps: Process[];
    activeItem: string | null;
    onItemClick: (item: string | null) => void;
}

export default function Taskbar(props: TaskbarProps): ReactNode {
    const [isAppTrayVisible, setAppTrayVisible] = useState<boolean>(false);
    const [isAppListVisible, setAppListVisible] = useState<boolean>(false);
    const [isAssistantVisible, setAssistantVisible] = useState<boolean>(false);
    const [taskbarMode, setTaskbarMode] = useState<"full" | "floating">("full");
    const { contextMenuPosition, contextMenuVisible, showContextMenu, hideContextMenu, contextMenuItems } = useContextMenu();
    const { openedApps, modifyProp, addOpenedApp, systemProps, updateSystemProp, popups, modifyPopupProp, setOptionProperties } = useKernal();
    const { taskbarApps, getTaskbarApps, addTaskbarApp, removeTaskbarApp } = useApplications();
    const { currentUser } = useUser();

    useEffect(() => {
        setTaskbarMode(systemProps.taskbar);        
    }, [systemProps]);

    const handleClick = (app: Process | App | undefined) => {
        if (!currentUser) return;
        
        if (app == undefined) return;

        if ('id' in app) {
            modifyProp(app.id, {
                minimized: !app.minimized,
            });            
        } else {
            if (app.fileContent == undefined && app.description == undefined) {
                setOptionProperties((prev) => {
                    return {
                        ...prev,
                        path: `/Users/${currentUser?.username}/Taskbar/`,
                    }
                })

                addOpenedApp({
                    name: "FileExplorer",
                    minimized: false,
                    maximized: false,
                    svg: fileExplorerIcon,
                    path: `/Users/${currentUser?.username}/Taskbar/`,
                    type: "exe",
                });
                
                return;
            }
            
            addOpenedApp({
                name: app.actualName,
                minimized: false,
                maximized: false,
                svg: app.svg,
                path: `/Users/${currentUser?.username}/Taskbar/`,
                type: "exe",
            });
        }
    };

    useEffect(() => {
        setAppListVisible(props.activeItem === 'AppList');
        setAppTrayVisible(props.activeItem === 'AppTray');
        setAssistantVisible(props.activeItem === 'Assistant');
    }, [props.activeItem]);

    const toggleVisibility = (item: string, event: React.MouseEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        const isVisible = item === 'AppTray' ? isAppTrayVisible : item === 'AppList' ? isAppListVisible : isAssistantVisible;
        props.onItemClick(isVisible ? null : item);
    
        switch (item) {
            case 'AppTray':
                setAppTrayVisible((prev) => !prev);
                break;
            case 'AppList':
                setAppListVisible((prev) => !prev);
                break;
            case 'Assistant':
                setAssistantVisible((prev) => !prev);
                break;
            default:
                break;
        }
    };
    
    const toggleAppTrayVisibility = (event: React.MouseEvent<HTMLDivElement>) => toggleVisibility('AppTray', event);
    const toggleAppListVisibility = (event: React.MouseEvent<HTMLDivElement>) => toggleVisibility('AppList', event);
    const toggleSearchAppsVisibility = (event: React.MouseEvent<HTMLDivElement>) => toggleVisibility('SearchApps', event);
    //const toggleAssistentVisibility = (event: React.MouseEvent<HTMLDivElement>) => toggleVisibility('Assistant', event);

    const handlePopup = (popup: Popup) => {
        modifyPopupProp(popup.id, {
            minimized: !popup.minimized,
        })
    };

    return (
        <div
            className={`taskbar ${systemProps.onHoverTaskbar ? `opacity-0 hover:opacity-100 ${props.activeItem != null && "!opacity-100"} transition-opacity duration-100` : ""}`}
            id="taskbar"
            style={{
                width: taskbarMode === 'full' ? '100%' : 'fit-content',
                minWidth: '49%',
                borderRadius: taskbarMode === 'full' ? '0px' : '10px',
                marginBottom: taskbarMode === 'full' ? '0px' : '16px',
            }}
            onContextMenu={(e) => showContextMenu(e, [
                { name: "Refresh", action: getTaskbarApps, icon: faRefresh },
                { name: `Set ${taskbarMode === "full" ? 'Floating' : 'Full'}`, action: () => {
                    updateSystemProp({
                        ...systemProps,
                        taskbar: taskbarMode === "full" ? "floating" : "full",
                    })
                } },
                { name: "Alignment", isDropdown: true, action: () => {}, children: [
                    { name: "Start", icon: faArrowLeft, action() {
                        updateSystemProp({
                            ...systemProps,
                            taskbarAlign: "start",
                        });
                    }},
                    { name: "Center", icon: faArrowsLeftRight, action() {
                        updateSystemProp({
                            ...systemProps,
                            taskbarAlign: "center",
                        });
                    }},
                    { name: "End", icon: faArrowRight, action() {
                        updateSystemProp({
                            ...systemProps,
                            taskbarAlign: "end",
                        });
                    }},
                ]},
                { name: `${systemProps.onHoverTaskbar ? "Always shown" : "Require hover"}`, icon: systemProps.onHoverTaskbar ? faEye : faEyeSlash, action() {
                    updateSystemProp({
                        ...systemProps,
                        onHoverTaskbar: !systemProps.onHoverTaskbar,
                    });
                }},
            ], "#taskbar", -100)}
        >
            <div className="glass flex w-full h-full rounded" style={{
                justifyContent: systemProps.taskbarAlign === 'start' ? "start" : systemProps.taskbarAlign === "center" ? "center" : "end",
            }}>
                <div onClick={toggleAppListVisibility} className="item app-list-container">
                    <img src={logo} alt="logo" />
                </div>
                <div onClick={toggleSearchAppsVisibility} className="item">
                    <FontAwesomeIcon icon={faSearch} />
                </div>
                {/*<div onClick={toggleAssistentVisibility} className="item ai-container" id="assist">
                    <FontAwesomeIcon icon={faCircleDot} />
                </div> */}
                {/* Render taskbar apps in the same order, regardless of opened state */}
                <div className={`${systemProps.taskbarAlign !== 'center' && systemProps.taskbarAlign !== "end" && 'flex-grow'} flex gap-2`}>
                    {[...taskbarApps, ...openedApps.filter(openApp => !taskbarApps.some(taskApp => taskApp.actualName === openApp.name))]
                    .map((app, index) => {
                        const appName = app.name;
                        // Type guard to check if app is of type App
                        function isApp(app: Process | App): app is App {
                            return (app as App).actualName !== undefined;
                        }

                        const appIsOpen = openedApps.some(openApp => 
                            openApp.name === appName || (isApp(app) && app.actualName === openApp.name)
                        );

                        const displayApp = appIsOpen 
                            ? openedApps.find(openApp => openApp.name === appName || (isApp(app) && app.actualName === openApp.name)) 
                            : app;

                        // Find any duplicates for the context menu
                        // const duplicates = openedApps //.filter((openApp) => openApp.name === appName);
                        const contextMenuItems: ContextMenuItem[] = openedApps.filter((openApp) => openApp.name === appName).map((duplicate) => {
                            return {
                                name: duplicate.name + ` (${duplicate.id})`,
                                icon: faX, // Custom icon for duplicate apps
                                action: () => handleClick(duplicate),
                            }
                        });

                        const pinned = taskbarApps.some(value => value.actualName === ('actualName' in app ? app.actualName : app.name));
                        
                        const defaultContextMenu: ContextMenuItem[] = [
                            { name: `${pinned ? 'Unpin' : 'Pin'}`, icon: faThumbTack, action: () => {                                
                                if (!pinned) {
                                    if ('actualName' in app) {
                                        addTaskbarApp({
                                            actualName: app.actualName,
                                            name: app.name,
                                            description: app.description,
                                            userInstalled: false,
                                            svg: app.svg,
                                            path: `/Users/${currentUser?.username}/Taskbar/`,
                                        })
                                    } else {
                                        addTaskbarApp({
                                            actualName: app.name,
                                            name: app.name,
                                            description: app.id.toString(),
                                            userInstalled: false,
                                            svg: app.svg,
                                            path: `/Users/${currentUser?.username}/Taskbar/`,
                                        });
                                    }
                                } else {
                                    if ('actualName' in app) {
                                        removeTaskbarApp(app.actualName);
                                    } else {
                                        removeTaskbarApp(app.name);                                    
                                    }
                                }
                            }},
                            { name: "Open File Location", icon: faFolderOpen, action: () => {
                                setOptionProperties((prev) => {
                                    return {
                                        ...prev,
                                        path: "/System/Taskbar/",
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
                            },
                            {
                                name: "Run as admininstrator",
                                icon: faLock,
                                action: () => {
                                    addOpenedApp({
                                        name: app.name,
                                        minimized: false,
                                        maximized: false,
                                        svg: app.svg,
                                        path: `/Users/${currentUser?.username}/Taskbar/`,
                                        type: "exe",
                                    });
                                },
                            }
                        ];
                        
                        return (
                        <div
                            key={index}
                            className={`item ${appIsOpen ? "item-active" : ''}`}
                            onClick={() => handleClick(displayApp)}
                            onContextMenu={(e) => showContextMenu(e, [...contextMenuItems, ...defaultContextMenu], "#taskbar", -150)}
                        >
                            {displayApp?.svg ? (
                            typeof displayApp.svg === "string" ? (
                                displayApp.svg.trim().startsWith("<svg") || displayApp.svg.trim().startsWith("<img") ? (
                                <div
                                    className="w-full h-full p-2 invert"
                                    dangerouslySetInnerHTML={{ __html: displayApp.svg }}
                                />
                                ) : (
                                <img src={displayApp.svg} alt={displayApp.name} className="w-full h-full p-1" />
                                )
                            ) : (
                                <FontAwesomeIcon icon={displayApp.svg} />
                            )
                            ) : (
                            <div>{displayApp?.name}</div>
                            )}
                        </div>
                        );
                    })}
                    {popups.map((popup, index) => (
                    <div
                        key={index}
                        className={`item item-active`}
                        onClick={() => handlePopup(popup)}
                    >
                        <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
                    </div>
                    ))}
                </div>
            </div>

            <div onClick={toggleAppTrayVisibility} className="floating-item glass !p-7 app-tray-container">
                <FontAwesomeIcon icon={isAppTrayVisible ? faCaretDown : faCaretUp} />
            </div>
            {contextMenuVisible && (
                <ContextMenu menuItems={contextMenuItems} menuPosition={contextMenuPosition} hideMenu={hideContextMenu} />
            )}
        </div>
    );
}