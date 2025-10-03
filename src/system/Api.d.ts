import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { App, File, Directory, Panic, Permission, Popup, Process, SystemProps, Theme, User } from "../utils/types";
import virtualFS from "../utils/VirtualFS";

export {};

interface OptionalProperties {
  path: string;
  menu: number;
  reload?: () => Promise<void>
}

interface KernalProps {
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

interface FileCheck {
    name: string
    path: string
    file: File
}

interface SecureBot {
    checkFiles: () => Promise<boolean>;
    checkFile: (data: { name: string; path: string; file: File }, strict?: boolean) => Promise<boolean>;
    getFlaggedFiles: () => FileCheck[];
}

interface Script {
    name: string;
    description: string;
    permission: Permission;
    app: string;
    script: string;
}

interface ScriptContextType {
    scripts: Script[];
    addScript: (script: Script) => Promise<void>;
    removeScript: (id: number | string) => Promise<void>;
    modifyScript: (originalName: string, script: Script) => Promise<void>;
    setScripts: (prev: Script[]) => void;
    fetchScripts: () => Promise<Script[]>;
}

interface ThemeInterface {
    setTheme: (theme: Theme, update: boolean, currentUser?: User | null, modifyUserProp?: (prop: Partial<User>, id: number | string) => Promise<void>) => Promise<void>;
    setBackground: (image: string, update: boolean, currentUser?: User | null, modifyUserProp?: (prop: Partial<User>, id: number | string) => Promise<void>) => Promise<void>;
    setTaskbar: (type: 'full' | 'floating') => void;
    setPanic: (panic: Panic) => void;
}

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

interface TopbarItem {
  name: string;
  icon?: IconDefinition;
  id?: string | number;
  action?: (() => Promise<void>) | (() => void);
  dropdownItems?: Omit<TopbarItem[], 'id'>;
}

// Define the context value type
interface TopbarContextType {
  array: TopbarItem[];
  addToTopbar: (item: Omit<TopbarItem, 'id'>) => void;
  modifyTopbarProp: (id: string | number, prop: Partial<TopbarItem>) => void;
  addPropToTopbar: (id: string | number, key: keyof TopbarItem, value: any) => void;
  removeFromTopbar: (id: string | number) => void;
}

interface UserContextType {
    users: User[]
    loggedIn: boolean
    currentUser: User | null
    createUser: (user: User) => Promise<void>
    setCurrentUser: (prev: User) => void
    setLoggedIn: (prev: boolean) => void
    fetchUsers: () => Promise<void>
    modifyUserProp: (prev: Partial<User>, id: number | string) => Promise<void>
}

declare global {
  interface Window {
    lumi: {
      os: {
        name: string;
        version: string;
        security: SecureBot;
        kernal: KernalProps;
      };
      scripts: ScriptContextType;
      user: ThemeInterface & AppContextType & TopbarContextType & UserContextType;
      virtualFS: typeof virtualFS
      defaults: {
        defaultFS: { root: Directory };
        MIMETypes: Record<string, string>;
        requestPermissions: (
          item: File | Directory,
          onAccept: () => Promise<void>,
          onReject: () => Promise<void>
        ) => Promise<boolean>;
        requestUserFileInput: (
          onAccept: (file: File) => Promise<void>,
          onReject: () => Promise<void>,
          defaultPath?: string
        ) => Promise<File | null>;
      }
    };
  }
}