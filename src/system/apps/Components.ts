import AppCreator from './Appcreater/Appcreater';
import AppsList from './Apps List/AppsList';
import Appstore from './Appstore/Appstore';
import SWFPlayer from './Appstore/Menus/SWFPlayer';
import Browser from './Browser/Browser';
import Code from './Code/Code';
import ControlPanel from './ControlPanel/ControlPanel';
import Devtools from './Devtools/Devtools';
import Discord from './Discord/Discord';
import FileExplorer from './FileExplorer/FileExplorer';
import HTMLViewer from './HTMLViewer/HTMLViewer';
import Notepad from './Notepad/Notepad';
import Settings from './Settings/Settings';
import Shortcut from './Shortcut/Shortcut';
import TaskManager from './TaskManager/Taskmanager';
import Terminal from './Terminal/Terminal';

export type ComponentType = React.FC<any> | React.ComponentClass<any, any>;

export const components: { [key: string]: ComponentType } = {
  "Shortcuts": Shortcut,
  "Settings": Settings,
  "FileExplorer": FileExplorer,
  "File Explorer": FileExplorer,
  "Notepad": Notepad,
  "Browser": Browser,
  "Visual Code": Code,
  "Code": Code,
  "Appstore": Appstore,
  "App Store": Appstore,
  "AppStore": Appstore,
  "AppCreator": AppCreator,
  "App Creator": AppCreator,
  "SWFPlayer": SWFPlayer,
  "HTMLViewer": HTMLViewer,
  "HTML Viewer": HTMLViewer,
  "Web Tools": Devtools,
  "Webtools": Devtools,
  "Terminal": Terminal,
  "Apps List": AppsList,
  "AppsList": AppsList,
  "ControlPanel": ControlPanel,
  "Control Panel": ControlPanel,
  "Discord": Discord,
  "TaskManager": TaskManager,
  "Task Manager": TaskManager,
};