import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import genericIcon from "../assets/Icons/Settings/generic.ico";
import configIcon from "../assets/Icons/Settings/configuration.ico";
import txtIcon from "../assets/Icons/Settings/text.ico";
import scriptIcon from "../assets/Icons/Settings/script.png";
import exeIcon from "../assets/Icons/Settings/executable.ico";

// Define the interface for each data entry
export interface Data {
  type: string;
  description: string;
  opensWith: string[];
  icon: IconDefinition | string;
}

// Define the data object where each key corresponds to a file type
export const MIMETypes: { [key: string]: Data } = {
    js: {
        type: "js",
        description: "JavaScript file",
        opensWith: ["Editor", "ScriptRunner"],
        icon: scriptIcon,
    },
    theme: {
        type: "theme",
        description: "Theme file",
        opensWith: ["ScriptRunner"],
        icon: scriptIcon,
    },
    sys: {
        type: "sys",
        description: "System configuration file",
        opensWith: ["ConfigEditor", "SystemManager"],
        icon: configIcon,
    },
    exe: {
        type: "exe",
        description: "Executable application or game",
        opensWith: ["Exe"],
        icon: exeIcon,
    },
    txt: {
        type: "txt",
        description: "Text document",
        opensWith: ["TextEditor", "Notepad"],
        icon: txtIcon,
    },
    default: {
        type: "unknown",
        description: "Unknown file type",
        opensWith: ["DefaultApp"],
        icon: genericIcon,
    },
};