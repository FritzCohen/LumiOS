import { useEffect, useRef, useState } from "react";
import { useKernal } from "../../Providers/KernalProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useApplications } from "../../Providers/ApplicationProvider";
import { App } from "../../utils/types";
import useContextMenu from "../ContextMenu/useContextMenu";
import ContextMenu from "../ContextMenu/ContextMenu";
import fileExplorerIcon from "../../assets/Icons/explorer.png";
import { faFolderOpen } from "@fortawesome/free-solid-svg-icons";

interface AppMenuProps {
    onItemClick: (item: string | null) => void;
}

const SearchApps: React.FC<AppMenuProps> = ({ onItemClick }) => {
    const { installedApps } = useApplications();
    const [bottom, setBottom] = useState(0);
    const trayRef = useRef<HTMLDivElement>(null);
    const [input, setInput] = useState<string>("");
    const [groupedApps, setGroupedApps] = useState<Record<string, App[]>>({});
    const { systemProps, addOpenedApp, setOptionProperties } = useKernal();
    const { contextMenuPosition, contextMenuVisible, showContextMenu, hideContextMenu, contextMenuItems } = useContextMenu();

    useEffect(() => {
        getBottom();
        
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    });

    useEffect(() => {
        const fixedApps = Object.values(installedApps).reduce((acc: Record<string, App[]>, app: App) => {
            
            let firstLetter = app.name.charAt(0).toUpperCase();

            if (!firstLetter.match(/[a-z]/i)) {
                firstLetter = "#";
            }
            
            if (!acc[firstLetter]) {
              acc[firstLetter] = [];
            }

            acc[firstLetter].push(app);

            return acc;
          }, {});

          setGroupedApps(fixedApps);
    }, [installedApps]);

    const handleClickOutside = (event: MouseEvent) => {
        const elementToIgnore = document.querySelector('.app-list-container');
        if (trayRef.current && !trayRef.current.contains(event.target as Node) && !elementToIgnore?.contains(event.target as Node)) {
            onItemClick(null); // Hide AppList
        }
    };

    const getBottom = (): void => {
        const container = document.querySelector('.app-list-container');
        const bottom = container!.getBoundingClientRect();
        setBottom(bottom?.bottom - bottom.top + bottom?.height || 0);
    };

    const handleItemClick = (app: App) => {     
        if (!app) return;

        addOpenedApp({
            name: app.actualName,
            minimized: false,
            maximized: false,
            svg: app.svg,
            path: app.path,
            type: 'exe',
        });

        onItemClick(null);
    };
    
    return (
        <div
        id="search-apps"
        className={`app-list search-apps glass w-full h-full flex flex-col ${systemProps.taskbar === 'floating' ? 'self-center' : ''} ${systemProps.taskbarAlign === "start" ? "left-0" : systemProps.taskbarAlign === "end" ? "right-0" : ""}`}
        ref={trayRef}
        style={{ bottom: `${bottom}px`, height: `${window.innerHeight / 2}px`, overflow: 'hidden' }} // Keep overflow hidden to manage layout
        >
        {/* Search Bar */}
        <div className="flex w-full justify-between items-center py-1 px-5 shadow-md sticky top-0 bg-primary z-10">
            <div className="relative my-2 w-full px-5">
            <input
                type="text"
                onChange={(e) => setInput(e.target.value)}
                className="input-main transition-all duration-300 ease-in-out focus:outline-none focus:border-accent"
                placeholder="Search Apps..."
            />
            </div>
        </div>
        {/* Search Results Container */}
        <div className="flex flex-col flex-grow w-full overflow-y-auto p-2" id="search-area">
            {Object.keys(groupedApps).sort().filter(name => {
            return input === "" || input.slice(0, 1).toLowerCase().includes(name.toLowerCase());
            }).map((letter) => (
            <div key={letter} className="flex flex-col gap-1 w-full">
                <div className="row-item">
                <h2 className="font-semibold">{letter}</h2>
                </div>
                <div className="flex flex-col gap-1">
                {groupedApps[letter].filter(app => {
                    return input === "" || app.name.toLowerCase().includes(input.toLowerCase());
                }).map((app, index) => (
                    <div
                    key={index}
                    className="row-item"
                    onClick={() => handleItemClick(app)}
                    onContextMenu={(e) => showContextMenu(e, [
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
                    ], "#search-apps", document.getElementById("search-apps")?.scrollTop || 0)}
                    >
                    {/* App Icon */}
                    <div className="w-10 h-10 mr-4">
                        {app.svg ? (
                        typeof app.svg === "string" ? (
                            app.svg.trim().startsWith("<svg") || app.svg.trim().startsWith("<img") ? (
                            <div className="w-full h-full p-2 invert" dangerouslySetInnerHTML={{ __html: app.svg }} />
                            ) : (
                            <img src={app.svg} alt={app.name} className="w-full h-full p-1" />
                            )
                        ) : (
                            <FontAwesomeIcon icon={app.svg} />
                        )
                        ) : <div></div>}
                    </div>
                    {/* App Details */}
                    <div>
                        <h3 className="text-md font-medium">{app.name}</h3>
                    </div>
                    </div>
                ))}
                </div>
            </div>
            ))}
        </div>

        {/* Context Menu */}
        {contextMenuVisible && <ContextMenu menuItems={contextMenuItems} menuPosition={contextMenuPosition} hideMenu={hideContextMenu} />}
        </div>
    );
}
 
export default SearchApps;