import React, { createContext, useContext, useState, useEffect } from "react";
import { App, Popup, Process, SystemProps } from "../utils/types";
import virtualFS from "../utils/VirtualFS";
import temp from "../assets/Icons/getstarted.png"
import folderIcon from "../assets/Icons/Settings/folder.png";
import { getIcon } from "../utils/Process";

interface optionalProperties {
  path: string
  menu: number
  // Props for apps ig
}

interface KernalContextType {
  openedApps: Process[];
  apps: App[];
  taskbarApps: App[],
  popups: Popup[];
  systemProps: SystemProps;
  desktopApps: App[];
  optionalProperties: optionalProperties
  setOptionProperties: (prev: React.SetStateAction<optionalProperties>) => void
  resetOptionalProperties: () => void
  updateSystemProp: (prop: SystemProps) => void;
  addOpenedApp: (process: Omit<Process, 'id'>) => void;
  removeOpenedApp: (id: string | number) => void;
  modifyProp: (id: string | number, prop: Partial<Process>) => void;
  addPopup: (popup: Omit<Popup, 'id'>) => void;
  removePopup: (id: string | number) => void;
  modifyPopupProp: (id: string | number, prop: Partial<Popup>) => void;
  addInstalledApp: (prev: App) => Promise<void>;
  deleteInstalledApp: (name: string) => Promise<void>;
  addTaskbarApp: (prev: App) => Promise<void>;
  removeTaskbarApp: (prev: App | string) => Promise<void>;
  getTaskbarApps: () => Promise<void>;
  addDesktopApp: (prev: App) => Promise<void>;
  removeDesktopApp: (prev: App) => Promise<void>;
  getDesktopApps: () => Promise<void>;
}

// Create context
const KernalContext = createContext<KernalContextType | undefined>(undefined);

// Provider component
export const KernalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [openedApps, setOpenedApps] = useState<Process[]>([]);
  const [apps, setApps] = useState<App[]>([]);
  const [taskbarApps, setTaskbarApps] = useState<App[]>([]);
  const [desktopApps, setDesktopApps] = useState<App[]>([]);

  const [popups, setPopups] = useState<Popup[]>([
    // Default popup saying that this is a beta test or whatever
  ]);
  const [nextId, setNextId] = useState(1); // Initialize ID counter
  const [systemProps, setSystemProps] = useState<SystemProps>({
    taskbar: "floating",
    taskbarAlign: "center",
    firstLogin: false,
    showTopbar: true,
    gamesLink: "https://raw.githubusercontent.com/LuminesenceProject/lumi-games/main/Data.json",
    scrollbar: `::-webkit-scrollbar{height:1rem;width:.5rem}::-webkit-scrollbar:horizontal{height:.5rem;width:1rem}::-webkit-scrollbar-track{background-color:transparent;border-radius:9999px}::-webkit-scrollbar-thumb{--tw-border-opacity:1;background-color:hsla(0,0%,89%,.8);border-color:rgba(255,255,255,var(--tw-border-opacity));border-radius:9999px;border-width:1px}::-webkit-scrollbar-thumb:hover{--tw-bg-opacity:1;background-color:rgba(227,227,227,var(--tw-bg-opacity))}.dark ::-webkit-scrollbar-thumb{background-color:hsla(0,0%,100%,.1)}.dark ::-webkit-scrollbar-thumb:hover{background-color:hsla(0,0%,100%,.3)}@media (min-width:768px){.scrollbar-trigger ::-webkit-scrollbar-thumb{visibility:hidden}.scrollbar-trigger:hover ::-webkit-scrollbar-thumb{visibility:visible}}`,
    version: 12,
    onHoverTaskbar: false,
    onHoverTopbar: false,
  });
  const [optionalProperties, setOptionProperties] = useState<optionalProperties>({
    path: "",
    menu: 0,
  });

  useEffect(() => {
    const feetch = async () => {
      await getInstalledApps();
      await getTaskbarApps();
      await getSystemProps();
      await getDesktopApps();
    };

    feetch();
  }, []);

  const addOpenedApp = (process: Omit<Process, 'id'>) => {
    const newProcess = { ...process, id: nextId };
    setNextId(prevId => prevId + 1);
    setOpenedApps(prevApps => [...prevApps, newProcess]);
    ;
  };

  const removeOpenedApp = (id: string | number) => {
    setOpenedApps(prevApps =>
      prevApps.filter(process => (typeof id === "number" ? process.id !== id : process.name !== id))
    );
    ;
  };

  const modifyProp = (id: string | number, prop: Partial<Process>) => {
    setOpenedApps(prevApps =>
      prevApps.map(process => (typeof id === "number" ? process.id === id : process.name === id)
        ? { ...process, ...prop }
        : process
      )
    );
    ;
  };

  const addPopup = (popup: Omit<Popup, 'id'>) => {
    const newPopup = { ...popup, id: nextId };
    setNextId(prevId => prevId + 1);
    setPopups(prevPopups => [...prevPopups, newPopup]);
    ;
  };

  const removePopup = (id: string | number) => {
    setPopups(prevPopups =>
      prevPopups.filter(popup => (typeof id === "number" ? popup.id !== id : popup.name !== id))
    );
  };

  const modifyPopupProp = (id: string | number, prop: Partial<Popup>) => {
    setPopups(prevPopups =>
      prevPopups.map(popup => (typeof id === "number" ? popup.id === id : popup.name === id)
        ? { ...popup, ...prop }
        : popup
      )
    );
  };

  const getInstalledApps = async () => {
    await virtualFS.initialize();
    const apps = await virtualFS.readdir("Apps/");
    // @ts-ignore
    const returnedApps = Object.keys(apps).map(name => apps[name].content);
    
    const joinedArray = Object.keys(apps).map(name => {
      const app = apps[name];
      if ('content' in app) {
        return {
          actualName: name,
          ...app.content
        };
      } else {
        // Handle the case where `app` is a Directory (if necessary)
        return {
          actualName: name,
          content: null // Or provide some default/fallback value
        };
      }
    });    
    
    setApps(joinedArray);
  };

  const getTaskbarApps = async () => {
    await virtualFS.initialize();
    const apps = await virtualFS.readdir("System/Taskbar/");
    // @ts-ignore
    const returnedApps = Object.keys(apps).map(name => apps[name].content);
    
    const joinedArray = Object.keys(apps).map(name => {
      const app = apps[name];
      if ('content' in app) {
        if (!app.content.svg) {
          return {
            actualName: name,
            svg: getIcon(app.fileType),
            ...app.content,
          }
        }
        
        return {
          actualName: name,
          ...app.content
        };
      } else {
        // Handle the case where `app` is a Directory (if necessary)
        return {
          actualName: name,
          svg: folderIcon,
          content: null // Or provide some default/fallback value
        };
      }
    });

    setTaskbarApps(joinedArray);
  };

  const getDesktopApps = async () => { 
    await virtualFS.initialize();
    const apps = await virtualFS.readdir("Desktop/");
    
    const joinedArray = Object.keys(apps).map(name => {
      const app = apps[name];      

      if ('content' in app) {
        if (!app.content.svg) {
          return {
            actualName: name,
            svg: getIcon(app.fileType),
            ...app.content,
          }
        }

        return {
          actualName: name,
          ...app.content
        };
      } else {
        // Handle the case where `app` is a Directory (if necessary)
        //console.log(app);
        

        return {
          actualName: name,
          svg: folderIcon,
          content: null // Or provide some default/fallback value
        };
      }
    });

    setDesktopApps(joinedArray);
  };

  const addInstalledApp = async (app: App) => {
    await virtualFS.initialize();
    await virtualFS.deleteFile("Apps/", app.actualName);
    await virtualFS.writeFile("Apps/", app.actualName, app, "html");

    setApps((prev) => [...prev, app]);
  };

  const deleteInstalledApp = async (name: string) => {
    await virtualFS.initialize();
    await virtualFS.deleteFile("Apps/", name);
    
    setApps((prev) => prev.filter(app => app.actualName !== name));
  };

  const addTaskbarApp = async (app: App): Promise<void> => {
    await virtualFS.initialize();
    await virtualFS.deleteFile("System/Taskbar/", app.actualName);
    await virtualFS.writeFile("System/Taskbar/", app.actualName, {
      ...app
    }, "html");

    setTaskbarApps((prev) => [...prev, app]);
  };

  const removeTaskbarApp = async (app: App | string): Promise<void> => {
    await virtualFS.initialize();
    console.log(app, 'hey whats going');

    if (typeof app === "string") {
      await virtualFS.deleteFile("System/Taskbar/", app);
      console.log(app);
      
      setTaskbarApps((prev) => prev.filter(prevApp => prevApp.actualName !== app));
    } else {
      await virtualFS.deleteFile("System/Taskbar/", app.actualName);

      setTaskbarApps((prev) => prev.filter(prevApp => prevApp.actualName !== app.actualName));
    }
  };

  const getSystemProps = async () => {
    await virtualFS.initialize();
    const system = await virtualFS.readfile("System/Plugins/", "SystemProps");
    setSystemProps(await system.content);
    
    if (await system.content.firstLogin && !openedApps.some(app => app.name !== "GetStarted")) {
      if (openedApps.some(app => app.name === "GetStarted")) return;
      setOpenedApps((prev) => [...prev, 
        { name: 'GetStarted', id: 0, minimized: false, maximized: false, path: "/Apps", svg: temp, type: "exe" },
      ]);
    }

    const response = await fetch("https://raw.githubusercontent.com/LuminesenceProject/LumiOS/refs/heads/main/Info.json");
    const onlineJSON: Array<any> = await response.json();
    const onlineVersion = JSON.parse(onlineJSON[0].version);
    
    if ((await system.content.version) < onlineVersion && !popups.some(popup => popup.name === "System Update")) {
        addPopup({
            name: "System Update",
            description: `Current version of NAME is out-of-date. Current version: ${await system.content.version}, latest: ${onlineVersion}. Update to latest version?`,
            minimized: false,
            onAccept: async () => {
                
            },
        });
    }  
  };

  const updateSystemProp = async (propsToUpdate: SystemProps) => {
    await virtualFS.initialize();

    // Directly use propsToUpdate instead of waiting for systemProps to update
    setSystemProps(propsToUpdate);

    await virtualFS.initialize(); // If necessary, though this seems redundant

    console.log(systemProps, propsToUpdate); // `systemProps` may still show the old value, but `propsToUpdate` is the new value

    await virtualFS.deleteFile("System/Plugins/", "SystemProps");    
    await virtualFS.writeFile("System/Plugins/", "SystemProps", propsToUpdate, "sys"); // Use propsToUpdate here
  };

  const addDesktopApp = async (app: App): Promise<void> => {
    await virtualFS.initialize();
    await virtualFS.deleteFile("Desktop/", app.actualName);
    await virtualFS.writeFile("Desktop/", app.actualName, {
      ...app
    }, "html");

    setDesktopApps((prev) => [...prev, app]);
  };

  const removeDesktopApp = async (app: App): Promise<void> => {
    await virtualFS.initialize();
    await virtualFS.deleteFile("Desktop/", app.actualName);

    setDesktopApps((prev) => prev.filter(prevApp => prevApp.actualName !== app.actualName));
  };

  const resetOptionalProperties = () => {
    setOptionProperties({
      path: "",
      menu: 0,
    });
  };

  return (
    <KernalContext.Provider value={{
      openedApps,
      apps,
      taskbarApps,
      popups,
      systemProps,
      desktopApps,
      optionalProperties,
      setOptionProperties,
      resetOptionalProperties,
      addDesktopApp,
      removeDesktopApp,
      getDesktopApps,
      updateSystemProp,
      addOpenedApp,
      removeOpenedApp,
      modifyProp,
      addPopup,
      removePopup,
      modifyPopupProp,
      addInstalledApp,
      deleteInstalledApp,
      addTaskbarApp,
      removeTaskbarApp,
      getTaskbarApps,
    }}>
      {children}
    </KernalContext.Provider>
  );
};

// Custom hook for using Kernal context
export const useKernal = () => {
  const context = useContext(KernalContext);
  if (!context) {
    throw new Error("useKernal must be used within a KernalProvider");
  }
  return context;
};