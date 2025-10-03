import AppCreator from "./AppCreator/AppCreator";
import Appstore from "./Appstore/Appstore";
import Browser from "./Browser/Browser";
import Code from "./Code/Code";
import ControlPanel from "./ControlPanel/ControlPanel";
import Discord from "./Discord/Discord";
import FileExplorer from "./FileExplorer/FileExplorer";
import GetStarted from "./GetStarted/Getstarted";
import InstalledApps from "./InstalledApps/InstalledApps";
import Settings from "./Settings/Settings";
import Taskmanager from "./Taskmanager/Taskmanager";
import Terminal from "./Terminal/Terminal";
import Webtools from "./Webtools/Webtools";
import Info from "./Info/Info";
import Pluginstore from "./Pluginstore/Pluginstore";
import Notepad from "./Notepad/Notepad";

// Define the types for your components
type ComponentType = React.FC<any> | React.ComponentClass<any, any>;

// Every app is from here
export const components: { [key: string]: ComponentType } = {
    "Settings": Settings,
    "AppStore": Appstore,
    "GetStarted": GetStarted,
    "Browser": Browser,
    "FileExplorer": FileExplorer,
    "Discord": Discord,
    "AppCreator": AppCreator,
    "Terminal": Terminal,
    "Webtools": Webtools,
    "InstalledApps": InstalledApps,
    "Code": Code,
    "ControlPanel": ControlPanel,
    "TaskManager": Taskmanager,
    "Info": Info,
    "Pluginstore": Pluginstore,
    "Notepad": Notepad,
};

export default components;