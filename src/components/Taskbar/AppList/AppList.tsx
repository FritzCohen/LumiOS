import React, { useState, useEffect } from 'react';
import '../AppTray.css';
import { useKernal } from '../../../Providers/KernalProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '../../../system/lib/Button';
import { faArrowRight, faArrowRightFromBracket, faFolderOpen, faPowerOff } from '@fortawesome/free-solid-svg-icons';
import { useUser } from '../../../Providers/UserProvider';
import useContextMenu from '../../ContextMenu/useContextMenu';
import ContextMenu from '../../ContextMenu/ContextMenu';
import { useApplications } from '../../../Providers/ApplicationProvider';
import { App } from '../../../utils/types';
import fileExplorerIcon from "../../../assets/Icons/explorer.png";

interface AppTrayProps {
    onItemClick: (item: string | null) => void;
    setCurrentMenu: (prev: number) => void;
}

const AppList: React.FC<AppTrayProps> = ({ onItemClick }) => {
    const [fadeIn, setFadeIn] = useState(true);
    const [input, setInput] = useState<string>("");
    const { addOpenedApp, setOptionProperties } = useKernal();
    const { contextMenuPosition, contextMenuVisible, showContextMenu, hideContextMenu, contextMenuItems } = useContextMenu();
    const { currentUser } = useUser();
    const { installedApps } = useApplications();

    useEffect(() => {
        // Only trigger the fade-in once when the component mounts
        const timer = setTimeout(() => {
            setFadeIn(false);
        }, 1000); // Fade in duration can be set here
    
        return () => clearTimeout(timer);
    }, []);

    const handleItemClick = (app: App) => {        
        if (!app) return;

        addOpenedApp({
            ...app,
            minimized: false,
            maximized: false,
            type: 'exe',
        });

        onItemClick(null);
    };

    return (
        <div className={`flex flex-col w-full h-full applist`}>
            <div className="flex w-full justify-between items-center px-5 py-2">
                <h1 className="text-xl font-bold">Pinned Apps</h1>
                <Button onClick={() => onItemClick("SearchApps")}>All Apps <FontAwesomeIcon icon={faArrowRight} /></Button>
            </div>
            <div className={`relative my-2 w-full px-5`}>
                <input
                    type="text"
                    onChange={(e) => setInput(e.target.value)}
                    className="input-main transition-all duration-300 ease-in-out focus:outline-none focus:border-accent"
                    placeholder="Search Apps..."
                />
            </div>
            <div className={`flex-grow app-grid px-2 ${fadeIn ? "fade-in" : ""}`}>
                {installedApps
                .filter(app => input === "" || app.actualName.toLowerCase().includes(input.toLowerCase()))
                .slice(0, input === "" ? 12 : undefined).map((app, index) => {
                    const appContent = app;

                    return (
                        <div key={index} className="item large" onClick={() => handleItemClick(appContent)} onContextMenu={(e) => 
                            showContextMenu(e, [
                                { name: `Open ${app.name}`, action: () => { handleItemClick(app) } },
                                { name: "Open file location", action: () => { 
                                    setOptionProperties((prev) => {
                                        return {
                                            ...prev,
                                            path: app.path,
                                        }
                                    });

                                    addOpenedApp({
                                        name: "FileExplorer",
                                        minimized: false,
                                        maximized: false,
                                        path: app.path,
                                        svg: fileExplorerIcon,
                                        type: "exe",
                                    });
                                }, icon: faFolderOpen }
                            ], ".applist")
                        }>
                            {appContent?.svg ? (
                                typeof appContent?.svg === "string" ? (
                                    appContent?.svg.trim().startsWith("<svg") || appContent?.svg.trim().startsWith("<img") ? (
                                        <div
                                            className="w-full h-full p-2 invert"
                                            dangerouslySetInnerHTML={{ __html: appContent?.svg }}
                                        />
                                    ) : (
                                        <img src={appContent?.svg} alt={appContent?.actualName} className="w-full h-full p-2" />
                                    )
                                ) : (
                                    <FontAwesomeIcon icon={appContent?.svg} />
                                )
                            ) : (
                                <div>{appContent?.name}</div>
                            )}
                        </div>
                    );
                })}
            </div>
            <div className="mt-auto dark-highlight shadow-inner">
            {currentUser && <div className="flex justify-between items-center">
                    <img alt="UserProfile" src={typeof currentUser?.svg === "string" ? currentUser.svg : ""} className="w-12 h-12 item" />
                    <div className="item group">
                        <div className="absolute z-50 -translate-y-full bg-primary p-2 rounded scale-0 transition-transform duration-200 group-hover:scale-100">
                            <FontAwesomeIcon icon={faArrowRightFromBracket} />
                        </div>
                        <FontAwesomeIcon icon={faPowerOff} className="group-hover:scale-100" />
                    </div>
                </div>}
            </div>
            {contextMenuVisible && (
                <ContextMenu menuItems={contextMenuItems} menuPosition={contextMenuPosition} hideMenu={hideContextMenu} />
            )}
        </div>
    );
};

export default AppList;