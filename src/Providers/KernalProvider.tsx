import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Popup, Process, SystemProps } from "../utils/types";
import virtualFS from "../utils/VirtualFS";
import Update from "../system/lib/Update";

interface OptionalProperties {
  path: string;
  menu: number;
  reload?: () => Promise<void>
}

interface KernalContextType {
  openedApps: Process[];
  popups: Popup[];
  systemProps: SystemProps;
  optionalProperties: OptionalProperties;
  setOptionProperties: React.Dispatch<React.SetStateAction<OptionalProperties>>;
  resetOptionalProperties: () => void;
  updateSystemProp: (prop: SystemProps) => void;
  addOpenedApp: (process: Omit<Process, "id">) => void;
  removeOpenedApp: (id: string | number) => void;
  modifyProp: (id: string | number, prop: Partial<Process>) => void;
  addPopup: (popup: Omit<Popup, "id">) => void;
  removePopup: (id: string | number) => void;
  modifyPopupProp: (id: string | number, prop: Partial<Popup>) => void;
  fetchSystemProps: () => Promise<void>;
}

// Create context
const KernalContext = createContext<KernalContextType | undefined>(undefined);

// Provider component
export const KernalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [openedApps, setOpenedApps] = useState<Process[]>([]);
  const [popups, setPopups] = useState<Popup[]>([]);
  const [nextId, setNextId] = useState(1);
  const [systemProps, setSystemProps] = useState<SystemProps>({
    taskbar: "floating",
    taskbarAlign: "center",
    firstLogin: false,
    showTopbar: true,
    gamesLink: "https://raw.githubusercontent.com/LuminesenceProject/lumi-games/main/Data.json",
    scrollbar: `::-webkit-scrollbar{height:1rem;width:.5rem}::-webkit-scrollbar-thumb{background-color:hsla(0,0%,89%,.8);border-radius:9999px;border-width:1px}`,
    version: 12,
    onHoverTaskbar: false,
    onHoverTopbar: false,
    runSecureBot: false,
    enableWindowBackground: false,
    windowStyle: "",
    topbarStyle: "",
    devMode: false,
  });
  const [optionalProperties, setOptionProperties] = useState<OptionalProperties>({ path: "", menu: 0 });

  const fetchSystemProps = useCallback(async () => {
    try {
      await virtualFS.initialize();
      const system = await virtualFS.readfile("System/Plugins/", "SystemProps");
      if (await system.content) setSystemProps(await system.content);
      
      if (await system.content.devMode) {
        // Bind it so people can't see the source of it. 
        // It wouldn't *really* work since people can just open the file and control+f to find it
        // FIX THIS     
      }

      const response = await fetch("https://raw.githubusercontent.com/LuminesenceProject/LumiOS/refs/heads/main/Info.json");
      const onlineJSON = await response.json();
      const onlineVersion = Number(onlineJSON?.[0]?.version);

      if (system.content?.version < onlineVersion && !popups.some(popup => popup.name === "System Update")) {
        addPopup({
          name: "System Update",
          description: `Update available: Current version ${system.content.version}, latest ${onlineVersion}.`,
          minimized: false,
          children: (
            <Update
              description={`Current version of LumiOS is out-of-date. Current: ${system.content.version}, latest: ${onlineVersion}.`}
            />
          ),
          onAccept: async () => {}
        });
      }
    } catch (error) {
      console.error("Error fetching system properties:", error);
    }
  }, [popups]);

  useEffect(() => {
    if (virtualFS.getInteracted()) fetchSystemProps();
  }, [fetchSystemProps]);

  const generateId = () => {
    setNextId(prevId => prevId + 1);    
    return nextId;
  };

  const addOpenedApp = (process: Omit<Process, "id">) => {
    setOpenedApps(prev => [...prev, { ...process, id: generateId() }]);
  };

  const removeOpenedApp = (id: string | number) => {
    setOpenedApps(prev => prev.filter(app => (typeof id === "number" ? app.id !== id : app.name !== id)));
  };

  const modifyProp = (id: string | number, prop: Partial<Process>) => {
    setOpenedApps(prev =>
      prev.map(app => 
        (typeof id === "number" ? app.id === id : app.name === id) 
          ? { ...app, ...prop } 
          : app
      )
    );
  };  

  const addPopup = (popup: Omit<Popup, "id">) => {
    setPopups(prev => [...prev, { ...popup, id: generateId() }]);
  };

  const removePopup = (id: string | number) => {
    setPopups(prev => prev.filter(popup => (typeof id === "number" ? popup.id !== id : popup.name !== id)));
  };

  const modifyPopupProp = (id: string | number, prop: Partial<Popup>) => {
    setPopups(prev =>
      prev.filter(popup => (typeof id === "number" ? popup.id === id : popup.name === id ? { ...popup, ...prop } : popup))
    );
  };

  const updateSystemProp = async (propsToUpdate: SystemProps) => {
    await virtualFS.initialize();
    setSystemProps(propsToUpdate);
    await virtualFS.writeFile("System/Plugins/", "SystemProps", propsToUpdate, "sys");
  };

  const resetOptionalProperties = () => setOptionProperties({ path: "", menu: 0 });

  return (
    <KernalContext.Provider
      value={{
        openedApps,
        popups,
        systemProps,
        optionalProperties,
        setOptionProperties,
        resetOptionalProperties,
        updateSystemProp,
        addOpenedApp,
        removeOpenedApp,
        modifyProp,
        addPopup,
        removePopup,
        modifyPopupProp,
        fetchSystemProps,
      }}
    >
      {children}
    </KernalContext.Provider>
  );
};

// Custom hook for using Kernal context
export const useKernal = () => {
  const context = useContext(KernalContext);
  if (!context) throw new Error("useKernal must be used within a KernalProvider");
  return context;
};