import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { App } from "../utils/types";
import { useUser } from "./UserProvider";
import virtualFS from "../utils/VirtualFS";
import { useKernal } from "./KernalProvider";
import temp from "../assets/Icons/getstarted.png";

interface AppContextType {
    installedApps: App[]
    addInstalledApp: (app: App) => Promise<void>
    deleteInstalledApp: (name: App | string) => Promise<void>
    getInstalledApps: () => Promise<App[]>
    
    taskbarApps: App[]
    addTaskbarApp: (app: App) => Promise<void>;
    removeTaskbarApp: (app: App | string) => Promise<void>;
    getTaskbarApps: () => Promise<App[]>;
    
    desktopApps: App[]
    addDesktopApp: (app: App) => Promise<void>
    removeDesktopApp: (app: App | string) => Promise<void>
    getDesktopApps: () => Promise<App[]>
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const ApplicationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
        const [installedApps, setInstalledApps] = useState<App[]>([]);
        const [taskbarApps, setTaskbarApps] = useState<App[]>([]);
        const [desktopApps, setDesktopApps] = useState<App[]>([]);
    
        const { addOpenedApp, openedApps, systemProps } = useKernal();
        const { currentUser } = useUser();
    
        // Memoized directory path
        const directory = useMemo(
            () => (currentUser ? `/Users/${currentUser.username}/` : ""),
            [currentUser]
        );
    
        /**
         * Generic function to fetch and process apps from a specific path.
         */
        const getApps = async (path: string): Promise<App[]> => {
            try {
                if (!currentUser) return [];
                const rawFiles = await virtualFS.readdir(path);
                return Object.keys(rawFiles).map((name) => {
                    const file = rawFiles[name];
                    if (file.type === "directory") {
                        return { ...file, actualName: name, fileType: "directory" };
                    }
                    if ('content' in file) {
                        if (typeof file.content === "object") {
                            return { ...file.content, actualName: name, path, fileType: file.fileType as string };
                        }

                        return { ...file, actualName: name, path, fileType: file.fileType as string };
                    }
                    return null;
                }).filter(Boolean) as App[];
            } catch (error) {
                console.error(`Error fetching apps from ${path}:`, error);
                return [];
            }
        };
    
        /**
         * Fetch all user apps (installed, taskbar, and desktop).
         */
        useEffect(() => {
            if (!currentUser) return;
    
            const fetchAllApps = async () => {
                try {
                    await virtualFS.initialize();
                    const [apps, taskbar, desktop] = await Promise.all([
                        getApps(`${directory}Apps/`),
                        getApps(`${directory}Taskbar/`),
                        getApps(`${directory}Desktop/`),
                    ]);
                    setInstalledApps(apps);
                    setTaskbarApps(taskbar);
                    setDesktopApps(desktop);                    
                } catch (error) {
                    console.error("Error initializing apps:", error);
                }
            };
    
            fetchAllApps();            
        }, [currentUser, directory]);
    
        /**
         * Open "GetStarted" app on first login.
         */
        useEffect(() => {
            if (!openedApps.some((app) => app.name === "GetStarted") && currentUser && systemProps.firstLogin && openedApps.length == 0) {
                addOpenedApp({
                    name: 'GetStarted',
                    minimized: false,
                    maximized: false,
                    path: `${directory}Apps/`,
                    svg: temp,
                    type: "exe",
                });
            }
        }, [systemProps.firstLogin, openedApps, currentUser, directory]);
    
        /**
         * Utility to write an app to a directory and update state.
         */
        const addApp = async (path: string, app: App, setState: React.Dispatch<React.SetStateAction<App[]>>) => {
            try {
                await virtualFS.writeFile(path, app.actualName, app, "exe");
                setState((prev) => [...prev, app]);
            } catch (error) {
                console.error(`Error adding app ${app.actualName} to ${path}:`, error);
            }
        };
    
        /**
         * Utility to remove an app from a directory and update state.
         */
        const removeApp = async (path: string, name: string, setState: React.Dispatch<React.SetStateAction<App[]>>) => {
            try {
                await virtualFS.deleteFile(path, name);
                setState((prev) => prev.filter((app) => app.actualName !== name));
            } catch (error) {
                console.error(`Error removing app ${name} from ${path}:`, error);
            }
        };
    
        // Memoize the context value to prevent unnecessary re-renders.
        const contextValue = useMemo(
            () => ({
                installedApps,
                addInstalledApp: (app: App) => addApp(`${directory}Apps/`, app, setInstalledApps),
                deleteInstalledApp: (name: App | string) => removeApp(`${directory}Apps/`, typeof name === "string" ? name : name.actualName, setInstalledApps),
                getInstalledApps: async () => { setInstalledApps(await getApps(`${directory}/Apps/`)); return await installedApps },
    
                taskbarApps,
                addTaskbarApp: (app: App) => addApp(`${directory}Taskbar/`, app, setTaskbarApps),
                removeTaskbarApp: (name: App | string) => removeApp(`${directory}Taskbar/`, typeof name === "string" ? name : name.actualName, setTaskbarApps),
                getTaskbarApps: async () => { setTaskbarApps(await getApps(`${directory}Taskbar/`)); return await taskbarApps },
                
    
                desktopApps,
                addDesktopApp: (app: App) => addApp(`${directory}Desktop/`, app, setDesktopApps),
                removeDesktopApp: (name: App | string) => removeApp(`${directory}Desktop/`, typeof name === "string" ? name : name.actualName, setDesktopApps),
                getDesktopApps: async () => { setDesktopApps(await getApps(`${directory}Desktop/`)); return await desktopApps },
            }),
            [installedApps, taskbarApps, desktopApps, directory]
        );
    
        return (
            <AppContext.Provider value={contextValue}>
                {children}
            </AppContext.Provider>
        );
    };
    


// Custom hook for using the App context
export const useApplications = () => {
    const context = useContext(AppContext);
    if (!context) {
      throw new Error("useApplications must be used within an ApplicationProvider");
    }
    return context;
};
