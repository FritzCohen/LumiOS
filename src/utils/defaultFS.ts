import { File, Directory, Permission } from "./types";
import bg from "../assets/background/image9.jpg";
import settingsIcon from "../assets/Icons/settings.png";
import terminalIcon from "../assets/Icons/terminal.png";
import discordIcon from "../assets/Icons/discord.png";
import filesystemIcon from "../assets/Icons/explorer.png";
import taskmanagerIcon from "../assets/Icons/taskmanager.png";
import notepadIcon from "../assets/Icons/notepad.png";
import webtoolsIcon from "../assets/Icons/web-tools.png";
import appstoreIcon from "../assets/Icons/app-store.png";
import applistIcon from "../assets/Icons/applist.png";
import browserIcon from "../assets/Icons/browser.png";
import getStartedIcon from "../assets/Icons/getstarted.png";
import codeIcon from "../assets/Icons/code.png";
import infoIcon from "../assets/Icons/info.png";
import controlPanelIcon from "../assets/Icons/controlpanel.png";
import xCodeIcon from "../assets/Icons/xcode-icon.png";

interface DefaultFS {
    root: Directory;
}

const test = `
function printHelloForNewWindowElements(mutationsList) {
    mutationsList.forEach(mutation => {
        // Check if nodes were added
        if (mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach(node => {
                // Ensure the added node is an element and has the 'window' class
                if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('window')) {
                    // console.log('hello'); // You can do whatever you want with this. 
                }
            });
        }
    });
}

// Create a MutationObserver to monitor the DOM
const observer = new MutationObserver(printHelloForNewWindowElements);

// Start observing the entire document for child node additions
observer.observe(document.body, {
    childList: true, // Observe direct children added/removed
    subtree: true,   // Include all descendants (not just immediate children)
});`;

/**
 * The default file system when initiating the OS
 * All default values, such as the current version are stored here
 * 
 * Also check out {@link File}, {@link Directory}, {@link Permission}
 * 
 * @source
 */
export const defaultFS: DefaultFS = {
    root: {
      type: "directory",
      date: new Date(),
      permission: Permission.SYSTEM,
      deleteable: false,
      children: {
        "Documents": {
            type: "directory",
            date: new Date(),
            deleteable: false,
            permission: Permission.SYSTEM,
            children: {
                "Test.txt": {
                type: "file",
                displayName: "",
                fileType: "txt",
                content: "hello world",
                date: new Date(),
                deleteable: true,
                permission: Permission.USER,
                },
                "High School Photos": {
                type: "directory",
                permission: Permission.USER,
                deleteable: true,
                date: new Date(),
                children: {
                    "Did you really expect this?": {
                        type: "file",
                        fileType: "txt",
                        content: "Naw actually this is crazy. 00101111 01110011 01100101 01100011 01110010 01100101 01110100",
                        date: new Date(),
                        permission: Permission.USER,
                        deleteable: true,
                    }
                },
                },
            },
        },
        "Users": {
          type: "directory",
          date: new Date(),
          permission: Permission.SYSTEM,
          deleteable: false,
          children: {
            "Default": {
              type: "directory",
              date: new Date(),
              permission: Permission.SYSTEM,
              deleteable: false,
              children: {
                "Settings": {
                  type: "file",
                  fileType: "app",
                  content: {
                    name: "Settings",
                    description: "Change or customize the settings for all of LumiOS.",
                    userInstalled: false,
                    svg: settingsIcon,
                  },
                  date: new Date(),
                  permission: Permission.ELEVATED,
                  deleteable: true,
                },
                "AppStore": {
                  type: "file",
                  fileType: "app",
                  content: {
                    name: "App Store",
                    description: "Download from over 200+ games or plugins.",
                    userInstalled: false,
                    svg: appstoreIcon,
                  },
                  date: new Date(),
                  permission: Permission.ELEVATED,
                  deleteable: true,
                },
                "Browser": {
                  type: "file",
                  fileType: "app",
                  content: {
                    name: "Browser",
                    description: "Search the web unblocked.",
                    userInstalled: false,
                    svg: browserIcon,
                  },
                  date: new Date(),
                  permission: Permission.ELEVATED,
                  deleteable: true,
                },
                "InstalledApps": {
                  type: "file",
                  fileType: "app",
                  content: {
                    name: "Apps List",
                    description: "Displays a list of every app for LumiOS.",
                    userInstalled: false,
                    svg: applistIcon,
                  },
                  date: new Date(),
                  permission: Permission.ELEVATED,
                  deleteable: true,
                },
                "Notepad": {
                  type: "file",
                  fileType: "app",
                  content: {
                    name: "Notepad",
                    description: "Edit files or write text.",
                    userInstalled: false,
                    svg: notepadIcon,
                  },
                  date: new Date(),
                  permission: Permission.ELEVATED,
                  deleteable: true,
                },
                "Discord": {
                  type: "file",
                  fileType: "app",
                  content: {
                    name: "Discord",
                    description: "Messege your friends and talk to fellow users.",
                    userInstalled: false,
                    svg: discordIcon,
                  },
                  date: new Date(),
                  permission: Permission.ELEVATED,
                  deleteable: true,
                },
                "Terminal": {
                  type: "file",
                  fileType: "app",
                  content: {
                    name: "Terminal",
                    description: "Run commands in javascript or directly modify the file system.",
                    userInstalled: false,
                    svg: terminalIcon,
                  },
                  date: new Date(),
                  permission: Permission.ELEVATED,
                  deleteable: true,
                },
                "FileExplorer": {
                  type: "file",
                  fileType: "app",
                  content: {
                    name: "File Explorer",
                    description: "Add or directly modify the filesystem.",
                    userInstalled: false,
                    svg: filesystemIcon,
                  },
                  date: new Date(),
                  permission: Permission.ELEVATED,
                  deleteable: true,
                },
                "Webtools": {
                  type: "file",
                  fileType: "app",
                  content: {
                    name: "Web Tools",
                    description: "Access this and other webpage tools using eruda.",
                    userInstalled: false,
                    svg: webtoolsIcon,
                  },
                  date: new Date(),
                  permission: Permission.ELEVATED,
                  deleteable: true,
                },
                "Code": {
                  type: "file",
                  fileType: "app",
                  content: {
                    name: "Visual Code",
                    description: "Run scripts and html and css straight from ",
                    userInstalled: false,
                    svg: codeIcon,
                  },
                  date: new Date(),
                  permission: Permission.ELEVATED,
                  deleteable: true,
                },
                "ControlPanel": {
                  type: "file",
                  fileType: "app",
                  content: {
                    name: "Control Panel",
                    description: "Run and edit outside scripts that are not supported.",
                    userInstalled: false,
                    svg: controlPanelIcon,
                  },
                  date: new Date(),
                  permission: Permission.ELEVATED,
                  deleteable: true,
                },
                "GetStarted": {
                  type: "file",
                  fileType: "app",
                  content: {
                    name: "Get Started",
                    description: "Introduction to and tutorial of Lumi OS!",
                    userInstalled: false,
                    svg: getStartedIcon,
                  },
                  date: new Date(),
                  permission: Permission.ELEVATED,
                  deleteable: true,
                },
                "AppCreator": {
                  type: "file",
                  fileType: "app",
                  content: {
                    name: "App Creator",
                    description: "Add or create your own custom app.",
                    userInstalled: false,
                    svg: xCodeIcon,
                  },
                  date: new Date(),
                  permission: Permission.ELEVATED,
                  deleteable: true,
                },
                "Pluginstore": {
                  type: "file",
                  fileType: "app",
                  content: {
                    name: "Plugin Store",
                    description: "Download or activate unique content from outside LumiOS.",
                    userInstalled: false,
                    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M96 0C78.3 0 64 14.3 64 32l0 96 64 0 0-96c0-17.7-14.3-32-32-32zM288 0c-17.7 0-32 14.3-32 32l0 96 64 0 0-96c0-17.7-14.3-32-32-32zM32 160c-17.7 0-32 14.3-32 32s14.3 32 32 32l0 32c0 77.4 55 142 128 156.8l0 67.2c0 17.7 14.3 32 32 32s32-14.3 32-32l0-67.2C297 398 352 333.4 352 256l0-32c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 160z"/></svg>`
                  },
                  date: new Date(),
                  permission: Permission.ELEVATED,
                  deleteable: true,
                },
                "TaskManager": {
                  type: "file",
                  fileType: "app",
                  content: {
                    name: "Task Manager",
                    description: "Access apps and functions.",
                    userInstalled: false,
                    svg: taskmanagerIcon,
                  },
                  date: new Date(),
                  permission: Permission.ELEVATED,
                  deleteable: true,
                },
                "Info": {
                  type: "file",
                  fileType: "app",
                  content: {
                    name: "Info",
                    description: "Find out abount new features, games, and commands.",
                    userInstalled: false,
                    svg: infoIcon,
                  },
                  date: new Date(),
                  permission: Permission.ELEVATED,
                  deleteable: true,
                },
              }
            },
          },
        },
        "System": {
          type: "directory",
          date: new Date(),
          permission: Permission.SYSTEM,
          deleteable: false,
          children: {
            "Themes": {
              type: "directory",
              date: new Date(),
              permission: Permission.ELEVATED,
              deleteable: true,
              children: {
                blueTheme: {
                  type: "file",
                  fileType: "js",
                  date: new Date(),
                  permission: Permission.ELEVATED,
                  deleteable: true,
                  content: {
                    primary: "#212529",
                    primaryLight: "#464f58",
                    secondary: "#2e79ba",
                    secondaryLight: "#5fc9f3",
                    textBase: "white",
                  },
                },
                lightBlueTheme: {
                  type: "file",
                  fileType: "js",
                  date: new Date(),
                  permission: Permission.ELEVATED,
                  deleteable: true,
                  content: {
                    primary: "#D2DAFF",
                    primaryLight: "#AAC4FF",
                    secondary: "#B1B2FF",
                    secondaryLight: "#AAC4FF",
                    textBase: "black",
                  },
                },
                pinkTheme: {
                  type: "file",
                  fileType: "js",
                  date: new Date(),
                  permission: Permission.ELEVATED,
                  deleteable: true,
                  content: {
                    primary: "#F9F5F6",
                    primaryLight: "#F8E8EE",
                    secondary: "#FDCEDF",
                    secondaryLight: "#F2BED1",
                    textBase: "black",
                  },
                },
                purpleTheme: {
                  type: "file",
                  fileType: "js",
                  date: new Date(),
                  permission: Permission.ELEVATED,
                  deleteable: true,
                  content: {
                    primary: "#927fbf",
                    primaryLight: "#c4bbf0",
                    secondary: "#363b4e",
                    secondaryLight: "#4f3b78",
                    textBase: "white",
                  },
                },
                whiteTheme: {
                  type: "file",
                  fileType: "js",
                  date: new Date(),
                  permission: Permission.ELEVATED,
                  deleteable: true,
                  content: {
                    primary: "#E8E8E8",
                    primaryLight: "#F4F4F2",
                    secondary: "#495464",
                    secondaryLight: "#BBBFCA",
                    textBase: "black",
                  },
                },
                blackTheme: {
                  type: "file",
                  fileType: "js",
                  date: new Date(),
                  permission: Permission.ELEVATED,
                  deleteable: true,
                  content: {
                    primary: "#212529",
                    primaryLight: "#464f58",
                    secondary: "#343A40",
                    secondaryLight: "#737f8c",
                    textBase: "white",
                  },
                },
                greenTheme: {
                  type: "file",
                  fileType: "js",
                  date: new Date(),
                  permission: Permission.ELEVATED,
                  deleteable: true,
                  content: {
                    primary: "#212529",
                    primaryLight: "#464f58",
                    secondary: "#00ad7c",
                    secondaryLight: "#52d681",
                    textBase: "white",
                  },
                },
              }
            },
            "Code": {
              type: "directory",
              date: new Date(),
              permission: Permission.ELEVATED,
              deleteable: true,
              children: {
                "Default": {
                  type: "directory",
                  date: new Date(),
                  permission: Permission.ELEVATED,
                  deleteable: true,
                  children: {
                    "index.html": {
                      type: "file",
                      fileType: "html",
                      content: `<!DOCTYPE html>\n<html>\n<head>\n<link rel="stylesheet" href="./styles.css">\n</head>\n<body>\n<h1>Hello World</h1>\n<script src="./index.js"></script>\n</body>\n</html>`,
                      date: new Date(),
                      permission: Permission.ELEVATED,
                      deleteable: true,
                    },
                    "index.js": {
                      type: "file",
                      fileType: "js",
                      content: `console.log("Hello World");`,
                      date: new Date(),
                      permission: Permission.ELEVATED,
                      deleteable: true,
                    },
                    "styles.css": {
                      type: "file",
                      fileType: "css",
                      content: `body { \n   background-color: #f0f0f0;\n }`,
                      date: new Date(),
                      permission: Permission.ELEVATED,
                      deleteable: true,
                    }
                  },
                },
              },
            },
            "Users": {
              type: "directory",
              date: new Date(),
              permission: Permission.ELEVATED,
              deleteable: true,
              children: {
  
              }
            },
            "Plugins": {
              type: "directory",
              date: new Date(),
              permission: Permission.ELEVATED,
              deleteable: true,
              children: {
                "Startup": {
                  type: "file",
                  fileType: "js",
                  content: "// startup scripts will run here",
                  date: new Date(),
                  permission: Permission.ELEVATED,
                  deleteable: true,
                },
                "Positions": {
                  type: "directory",
                  children: {

                  },
                  date: new Date(),
                  permission: Permission.ELEVATED,
                  deleteable: true,
                },
                "SystemProps": {
                  type: "file",
                  fileType: "js",
                  content: {
                    taskbar: "floating",
                    taskbarAlign: "center",
                    firstLogin: true,
                    showTopbar: true,
                    gamesLink: "https://raw.githubusercontent.com/LuminesenceProject/lumi-games/main/Data.json", // Change this to whatever, but this is my main link
                    scrollbar: `::-webkit-scrollbar{height:1rem;width:.5rem}::-webkit-scrollbar:horizontal{height:.5rem;width:1rem}::-webkit-scrollbar-track{background-color:transparent;border-radius:9999px}::-webkit-scrollbar-thumb{--tw-border-opacity:1;background-color:hsla(0,0%,89%,.8);border-color:rgba(255,255,255,var(--tw-border-opacity));border-radius:9999px;border-width:1px}::-webkit-scrollbar-thumb:hover{--tw-bg-opacity:1;background-color:rgba(227,227,227,var(--tw-bg-opacity))}.dark ::-webkit-scrollbar-thumb{background-color:hsla(0,0%,100%,.1)}.dark ::-webkit-scrollbar-thumb:hover{background-color:hsla(0,0%,100%,.3)}@media (min-width:768px){.scrollbar-trigger ::-webkit-scrollbar-thumb{visibility:hidden}.scrollbar-trigger:hover ::-webkit-scrollbar-thumb{visibility:visible}}`,
                    version: 12.5,
                    onHoverTaskbar: false,
                    onHoverTopbar: false,
                    runSecureBot: false,
                    enableWindowBackground: false,
                    devMode: false,
                  },
                  date: new Date(),
                  permission: Permission.ELEVATED,
                  deleteable: true,
                },
              },
            },
            "Taskbar": {
              type: "directory",
              date: new Date(),
              permission: Permission.ELEVATED,
              deleteable: true,
              children: {
                "Settings": {
                  type: "file",
                  fileType: "app",
                  content: {
                    name: "Settings",
                    description: "Change or customize the settings for all of LumiOS.",
                    userInstalled: false,
                    svg: settingsIcon,
                  },
                  date: new Date(),
                  permission: Permission.ELEVATED,
                  deleteable: true,
                },
                "AppStore": {
                  type: "file",
                  fileType: "app",
                  content: {
                    name: "App Store",
                    description: "Download from over 200+ games or plugins.",
                    userInstalled: false,
                    svg: appstoreIcon,
                  },
                  date: new Date(),
                  permission: Permission.ELEVATED,
                  deleteable: true,
                },
                "Browser": {
                  type: "file",
                  fileType: "app",
                  content: {
                    name: "Browser",
                    description: "Search the web unblocked.",
                    userInstalled: false,
                    svg: browserIcon,
                  },
                  date: new Date(),
                  permission: Permission.ELEVATED,
                  deleteable: true,
                },
              }
            },
            "Browser": {
              type: "directory",
              date: new Date(),
              permission: Permission.ELEVATED,
              deleteable: true,
              children: {
                "Links": {
                  type: "directory",
                  date: new Date(),
                  permission: Permission.ELEVATED,
                  deleteable: true,
                  children: {

                  }
                },
                "Active": {
                  type: "file",
                  fileType: "sys",
                  date: new Date(),
                  permission: Permission.ELEVATED,
                  deleteable: true,
                  content: "",
                }
              }
            },
            "AppStore": {
              type: "directory",
              date: new Date(),
              permission: Permission.ELEVATED,
              deleteable: true,
              children: {
                "Favorites": {
                  type: "directory",
                  date: new Date(),
                  permission: Permission.ELEVATED,
                  deleteable: true,
                  children: {
                    
                  },
                },
                "Recents": {
                  type: "directory",
                  date: new Date(),
                  permission: Permission.ELEVATED,
                  deleteable: true,
                  children: {

                  },
                },
              },
            },
            "Updates": { // Very important, tracks any updates, use the Update type for file content
              type: "directory",
              date: new Date(),
              permission: Permission.ELEVATED,
              deleteable: true,
              children: {

              }
            },
            "Scripts": { // Scripts that manage shit, will implement changes later
              type: "directory",
              date: new Date(),
              permission: Permission.ELEVATED,
              deleteable: true,
              children: {
                "ExampleScript": {
                  type: "file",
                  date: new Date(),
                  permission: Permission.USER,
                  deleteable: true,
                  fileType: "sys",
                  content: {
                    name: "ExampleScript",
                    description: "An example script, does not modify or change anything.",
                    permission: Permission.USER,
                    app: "System",
                    script: test,
                  },
                }
              }
            },
            "Version": {
              type: "file",
              fileType: "sys",
              content: {
                name: "Lumi OS",
                image: "https://avatars.githubusercontent.com/u/101959214?v=4",
                version: "12.5",
                secure: true,
              },
              date: new Date(),
              permission: Permission.ELEVATED,
              deleteable: true,
            },
            "Autologin": {
              type: "file",
              fileType: "sys",
              content: true,
              date: new Date(),
              permission: Permission.ELEVATED,
              deleteable: true,
            },
            "BackgroundImage": {
              type: "file",
              fileType: "sys",
              content: bg,
              date: new Date(),
              permission: Permission.ELEVATED,
              deleteable: true,
            },
            "Theme": {
              type: "file",
              fileType: "sys",
              content: {
                primary: "#212529",
                primaryLight: "#464f58",
                secondary: "#343A40",
                secondaryLight: "#737f8c",
                textBase: "white",
              },
              date: new Date(),
              permission: Permission.ELEVATED,
              deleteable: true,
            },
            "FirstStart": {
              type: "file",
              fileType: "sys",
              content: "true",
              date: new Date(),
              permission: Permission.ELEVATED,
              deleteable: true,
            },
            "ViewSystemFiles": {
              type: "file",
              fileType: "sys",
              content: "false",
              date: new Date(),
              permission: Permission.ELEVATED,
              deleteable: true,
            },
            "Panic": {
              type: "file",
              fileType: "sys",
              content: {
                key: "\\",
                website: "https://google.com",
                title: "Lumi OS v12",
                favicon: "https://avatars.githubusercontent.com/u/101959214?v=4",
              },
              date: new Date(),
              permission: Permission.ELEVATED,
              deleteable: true,
            }
          }
        },
        "Trash": {
          type: "directory",
          date: new Date(),
          permission: Permission.SYSTEM,
          deleteable: false,
          children: {
            
          }
        }
      }
    }
};

export default defaultFS;