import { useEffect, useState } from "react";
import { useKernal } from "../../../Providers/KernalProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpFromBracket, faArrowUpRightFromSquare, faChevronLeft, faChevronRight, faThumbTack, faTrash } from "@fortawesome/free-solid-svg-icons";
import { App } from "../../../utils/types";
import Button from "../../lib/Button";
import virtualFS from "../../../utils/VirtualFS";
import { useApplications } from "../../../Providers/ApplicationProvider";
import { useUser } from "../../../Providers/UserProvider";

const Apps = () => {
    const [selectedApp, setSelectedApp] = useState<App | null>(null);
    const [taskbarApps, setTaskbarApps] = useState<string[]>([]);
    const { addOpenedApp } = useKernal();
    const { addTaskbarApp, removeTaskbarApp, addDesktopApp, removeDesktopApp, desktopApps, deleteInstalledApp, installedApps: apps } = useApplications();
    const { currentUser } = useUser();

    useEffect(() => {
        const fetchApps = async () => {
            setTaskbarApps(Object.keys(await virtualFS.readdir(`Users/${currentUser?.username}/Taskbar/`)));
        };

        fetchApps();
    }, []);


    const openApp = () => {
        if (!selectedApp) return;

        addOpenedApp({
            name: selectedApp.actualName,
            svg: selectedApp.svg,
            minimized: false,
            maximized: false,
            path: `Users/${currentUser?.username}/Apps/`,
            type: "exe",
        });
    };

    const pin = async () => {
        if (!selectedApp) return;

        if (taskbarApps.includes(selectedApp.actualName)) {
            await removeTaskbarApp(selectedApp);
        } else {
            await addTaskbarApp(selectedApp);
        }
        const newTaskbarApps = Object.keys(await virtualFS.readdir(`Users/${currentUser?.username}/Taskbar/`));

        // setSelectedApp(null);
        setTaskbarApps(newTaskbarApps);
    }

    const shortcut = async () => {
        if (!selectedApp) return;        

        if (!desktopApps.some(value => value.actualName === selectedApp.actualName)) {
            await addDesktopApp(selectedApp);
        } else {
            await removeDesktopApp(selectedApp);
        }

        // setSelectedApp(null);
    }

    const deleteApp = async (): Promise<void> => {    
        if (selectedApp) {
            await deleteInstalledApp(selectedApp.actualName || selectedApp.name)
        }
            
        setSelectedApp(null);
    }

    return (
        <div className="flex flex-col gap-2 px-4 overflow-y-auto py-4">
            {/* Since its already flex-col, no need to repeat it */}
            {selectedApp ? 
            <>
                <div className="w-full flex justify-between items-center px-5">
                    <Button onClick={() => setSelectedApp(null)}>
                        <FontAwesomeIcon icon={faChevronLeft} /> Back
                    </Button>
                    <div className="flex flex-row gap-2 items-center justify-center">
                        {!selectedApp.svg ? undefined : typeof selectedApp.svg === "string" ? (
                                // Check if the string starts with "<svg" or "<img"
                                selectedApp.svg.trim().startsWith("<svg") || selectedApp.svg.trim().startsWith("<img") ? (
                                <div
                                    className="w-8 h-8 p-2 invert"
                                    dangerouslySetInnerHTML={{ __html: selectedApp.svg }}
                                />
                                ) : (
                                // Otherwise, treat it as a regular image URL
                                <img src={selectedApp.svg} alt={selectedApp.name} className="w-8 h-8 p-1 pointer-events-none" />
                                )
                            ) : (
                                // If it's not a string, assume it's a FontAwesome svg object
                                <FontAwesomeIcon icon={selectedApp.svg} />
                        )}
                        <h1>{ selectedApp.name }</h1>
                    </div>
                </div>
                <div className="flex-grow flex flex-col gap-2 my-5 h-full">
                    <p className="text-sm">{ selectedApp?.description }</p>
                    <Button onClick={openApp}><FontAwesomeIcon icon={faArrowUpFromBracket} className="pr-1" />Open</Button>
                    <Button onClick={pin}><FontAwesomeIcon icon={faThumbTack} className="pr-1" />{taskbarApps.includes(selectedApp.actualName) ? "Unpin" : "Pin"}</Button>
                    <Button onClick={shortcut}><FontAwesomeIcon icon={faArrowUpRightFromSquare} className="pr-1" />{desktopApps.some(value => value.actualName === selectedApp.actualName) ? "Unshortcut" : "Shortcut"}</Button>
                    <Button onClick={deleteApp}><FontAwesomeIcon icon={faTrash} className="pr-1" />Delete {selectedApp.name}</Button>
                </div>
            </>
            :
            <>
            {apps.map((app, index) => (
                <div 
                key={index}
                onClick={() => setSelectedApp(app)}
                className="flex flex-row justify-between items-center bg-primary rounded p-2 hover:bg-primary-light transition-colors duration-200 cursor-pointer"
                >
                    <div className="flex justify-center items-center gap-4">
                        {!app.svg ? undefined : typeof app.svg === "string" ? (
                            // Check if the string starts with "<svg" or "<img"
                            app.svg.trim().startsWith("<svg") || app.svg.trim().startsWith("<img") ? (
                            <div
                                className="w-8 h-8 p-2 invert"
                                dangerouslySetInnerHTML={{ __html: app.svg }}
                            />
                            ) : (
                            // Otherwise, treat it as a regular image URL
                            <img src={app.svg} alt={app.name} className="w-8 h-8 p-1 pointer-events-none" />
                            )
                        ) : (
                            // If it's not a string, assume it's a FontAwesome svg object
                            <FontAwesomeIcon icon={app.svg} />
                        )}
                        <h3 className="font-semibold">{ app.name }</h3>
                    </div>
                    <FontAwesomeIcon icon={faChevronRight} />
                </div>
            ))}
            </>
            }
        </div>
    );
}
 
export default Apps;