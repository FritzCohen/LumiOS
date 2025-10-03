import { useState } from "react";
import { App } from "../../../utils/types";
import { useKernal } from "../../../Providers/KernalProvider";
import useContextMenu from "../../../components/ContextMenu/useContextMenu";
import ContextMenu from "../../../components/ContextMenu/ContextMenu";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./InstalledApps.css";
import Input from "../../lib/Input";
import { useApplications } from "../../../Providers/ApplicationProvider";
import { useUser } from "../../../Providers/UserProvider";
import fileExplorerIcon from "../../../assets/Icons/explorer.png";
import { faFolderOpen } from "@fortawesome/free-solid-svg-icons";

const InstalledApps = () => {
    const { installedApps: apps } = useApplications();
    const [input, setInput] = useState<string>("");
    const { contextMenuPosition, contextMenuVisible, showContextMenu, hideContextMenu, contextMenuItems } = useContextMenu();
    const { addOpenedApp, setOptionProperties } = useKernal();
    const { currentUser } = useUser();

    const handleAppClick = async (app: App) => {     
        if (!currentUser) return;
           
        addOpenedApp({
            ...app,
            name: app.actualName,
            minimized: false,
            maximized: false,
            path: `/Users/${currentUser.username}/Apps/`,
            type: "exe",
        });
    }

    return (
        <div className="flex flex-col gap-2 relative w-full h-full" id="install">
            <div className="relative my-2 w-full px-5 p-2">
                <Input
                    type="text"
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Search Apps..."
                />
            </div>
            <div className="w-full h-full overflow-y-auto flex flex-col gap-2 px-2">
                {apps.filter(value => value.name.toLowerCase().includes(input.toLowerCase())).map((app, index) => (
                    <div key={index} onContextMenu={(e) => showContextMenu(e, [
                        { name: `Open ${app.name}`, action: () => { handleAppClick(app) } },
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
                    ], "#install")} 
                    onClick={() => handleAppClick(app)}
                    className="installed-app-item transition-colors duration-200">
                        {app?.svg ? (
                        typeof app.svg === "string" ? (
                            app.svg.trim().startsWith("<svg") || app.svg.trim().startsWith("<img") ? (
                            <div
                                className="w-12 h-12 p-2 invert"
                                dangerouslySetInnerHTML={{ __html: app.svg }}
                            />
                            ) : (
                            <img src={app.svg} alt={app.name} className="w-12 h-12 p-1" />
                            )
                        ) : (
                            <FontAwesomeIcon icon={app.svg} />
                        )
                        ) : (
                        <div>{app?.name}</div>
                        )}
                        {app.name}
                    </div>
                ))}
            </div>
            {contextMenuVisible && <ContextMenu menuPosition={contextMenuPosition} menuItems={contextMenuItems} hideMenu={hideContextMenu} />}
        </div>
    );
};

export default InstalledApps;