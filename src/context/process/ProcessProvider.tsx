/**
 * DONT USE THIS
 * 
 * USERS SHOULD HAVE THERE OWN APPS N' SHIT
 * 
 * delete
 * 
 * @useless
 * 
 * @todo delete
*/

import { createContext, useEffect, useMemo, useReducer } from "react";
import { Executable } from "../../types/globals";
import virtualFS from "../../system/api/virtualFS";

interface ExecutableState {
  installed: Executable[];
}

interface ExecutableContextType {
  installedExecutables: Executable[];
  addInstalledExecutable: (path: string, executable: Executable | string) => Promise<void>;
  deleteInstalledExecutable: (name: string | Executable) => Promise<void>;
  getInstalledExecutables: () => Promise<Executable[]>;

  /*taskbarExecutables: Executable[];
  addTaskbarExecutable: (path: string, executable: Executable | string) => Promise<void>;
  removeTaskbarExecutable: (name: string | Executable) => Promise<void>;
  getTaskbarExecutables: () => Promise<Executable[]>;

  desktopExecutables: Executable[];
  addDesktopExecutable: (path: string, executable: Executable | string) => Promise<void>;
  removeDesktopExecutable: (name: string | Executable) => Promise<void>;
  getDesktopExecutables: () => Promise<Executable[]>;*/
}

type Action =
  | { type: "SET_INSTALLED"; payload: Executable[] }
  | { type: "ADD_INSTALLED"; payload: Executable }
  | { type: "REMOVE_INSTALLED"; payload: string }
  | { type: "SET_TASKBAR"; payload: Executable[] }
  | { type: "ADD_TASKBAR"; payload: Executable }
  | { type: "REMOVE_TASKBAR"; payload: string }
  | { type: "SET_DESKTOP"; payload: Executable[] }
  | { type: "ADD_DESKTOP"; payload: Executable }
  | { type: "REMOVE_DESKTOP"; payload: string };

const initialState: ExecutableState = {
  installed: [],
};

function reducer(state: ExecutableState, action: Action): ExecutableState {
  switch (action.type) {
    case "SET_INSTALLED":
      return { ...state, installed: action.payload };
    case "ADD_INSTALLED":
      return { ...state, installed: [...state.installed, action.payload] };
    case "REMOVE_INSTALLED":
      return {
        ...state,
        installed: state.installed.filter((e) => e.config.name !== action.payload),
      };
    /*case "SET_TASKBAR":
      return { ...state, taskbar: action.payload };
    case "ADD_TASKBAR":
      return { ...state, taskbar: [...state.taskbar, action.payload] };
    case "REMOVE_TASKBAR":
      return {
        ...state,
        taskbar: state.taskbar.filter((e) => e.config.name !== action.payload),
      };
    case "SET_DESKTOP":
      return { ...state, desktop: action.payload };
    case "ADD_DESKTOP":
      return { ...state, desktop: [...state.desktop, action.payload] };
    case "REMOVE_DESKTOP":
      return {
        ...state,
        desktop: state.desktop.filter((e) => e.config.name !== action.payload),
      };*/
    default:
      return state;
  }
}

const ExecutableContext = createContext<ExecutableContextType | undefined>(undefined);

export const ExecutableProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const currentUser = { username: "Default" };

  const directory = useMemo(() => (currentUser ? `/Users/Default/` : ""), [currentUser]);

  const getExecutables = async (path: string): Promise<Executable[]> => {
    try {
      if (!currentUser) return [];
      const rawFiles = await virtualFS.readdir(path);
      const executables: Executable[] = [];

      if (!rawFiles || typeof rawFiles !== "object") return [];

      for (const item of Object.values(rawFiles)) {
        if (item.type === "file") {
          if (typeof item.content === "string") {
            try {
              const shortcutPath = item.content;
              const lastSlash = shortcutPath.lastIndexOf("/");
              const shortcutDir = shortcutPath.slice(0, lastSlash);
              const shortcutName = shortcutPath.slice(lastSlash + 1);

              const shortcutTarget = await virtualFS.readfile(shortcutDir, shortcutName);

              if (
                shortcutTarget?.type === "file" &&
                shortcutTarget.fileType === "exe" &&
                typeof shortcutTarget.content === "object"
              ) {
                executables.push(shortcutTarget.content as Executable);
              }
            } catch (e) {
              console.warn(`Invalid shortcut at ${item.content}:`, e);
            }
          } else if (typeof item.content === "object") {
            const executable = item.content as Executable;
            if (executable?.config?.name) {
              executables.push(executable);
            }
          }
        }
      }

      return executables;
    } catch (error) {
      console.error(`Error fetching Executables from ${path}:`, error);
      return [];
    }
  };

  useEffect(() => {
    if (!currentUser) return;

    const fetchAllExecutables = async () => {
      try {
        await virtualFS.initialize();
        const [installed, taskbar, desktop] = await Promise.all([
          getExecutables(`${directory}/`),
          getExecutables(`${directory}/`),
          getExecutables(`${directory}/`),
        ]);

        dispatch({ type: "SET_INSTALLED", payload: installed });
        dispatch({ type: "SET_TASKBAR", payload: taskbar });
        dispatch({ type: "SET_DESKTOP", payload: desktop });
      } catch (error) {
        console.error("Error initializing Executables:", error);
      }
    };

    fetchAllExecutables();
  }, [currentUser, directory]);

  const addExecutable = async (
    path: string,
    executableOrName: Executable | string,
    type: "INSTALLED" | "TASKBAR" | "DESKTOP"
  ) => {
    try {
      let executable: Executable;

      if (typeof executableOrName === "string") {
        const file = await virtualFS.readfile(path, executableOrName);
        if (!file || typeof file.content !== "object") {
          throw new Error(`File ${executableOrName} at ${path} is not a valid Executable`);
        }
        executable = file.content as Executable;
      } else {
        executable = executableOrName;
        await virtualFS.writeFile(path, executable.config.name, executable, "exe");
      }
      console.log(executable, path);
      
      dispatch({ type: `ADD_${type}`, payload: executable });
    } catch (error) {
      console.error(
        `Error adding Executable ${
          typeof executableOrName === "string" ? executableOrName : executableOrName.config.name
        } to ${path}:`,
        error
      );
    }
  };

  const removeExecutable = async (
    path: string,
    name: string,
    type: "INSTALLED" | "TASKBAR" | "DESKTOP"
  ) => {
    try {
      await virtualFS.deleteFile(path, name);
      dispatch({ type: `REMOVE_${type}`, payload: name });
    } catch (error) {
      console.error(`Error removing Executable ${name} from ${path}:`, error);
    }
  };

  const contextValue: ExecutableContextType = useMemo(
    () => ({
      installedExecutables: state.installed,
      addInstalledExecutable: (path, executable) =>
        addExecutable(path, executable, "INSTALLED"),
      deleteInstalledExecutable: (name) =>
        removeExecutable(`${directory}/`, typeof name === "string" ? name : name.config.name, "INSTALLED"),
      getInstalledExecutables: async () => {
        const executables = await getExecutables(`${directory}/`);
        dispatch({ type: "SET_INSTALLED", payload: executables });
        return executables;
      },

      /*taskbarExecutables: state.taskbar,
      addTaskbarExecutable: (path, executable) =>
        addExecutable(path, executable, "TASKBAR"),
      removeTaskbarExecutable: (name) =>
        removeExecutable(`${directory}/`, typeof name === "string" ? name : name.config.name, "TASKBAR"),
      getTaskbarExecutables: async () => {
        const executables = await getExecutables(`${directory}/`);
        dispatch({ type: "SET_TASKBAR", payload: executables });
        return executables;
      },

      desktopExecutables: state.desktop,
      addDesktopExecutable: (path, executable) =>
        addExecutable(path, executable, "DESKTOP"),
      removeDesktopExecutable: (name) =>
        removeExecutable(`${directory}/`, typeof name === "string" ? name : name.config.name, "DESKTOP"),
      getDesktopExecutables: async () => {
        const executables = await getExecutables(`${directory}/`);
        dispatch({ type: "SET_DESKTOP", payload: executables });
        return executables;
      },*/
    }),
    [state, directory]
  );

  return (
    <ExecutableContext.Provider value={contextValue}>
      {children}
    </ExecutableContext.Provider>
  );
};