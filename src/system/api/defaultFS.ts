import { Directory } from "./types";
import { Permission } from "../../types/globals";
import settingsIcon from "../../assets/Icons/settings.png";
import terminalIcon from "../../assets/Icons/terminal.png";
import discordIcon from "../../assets/Icons/discord.png";
import filesystemIcon from "../../assets/Icons/explorer.png";
import notepadIcon from "../../assets/Icons/notepad.png";
import webtoolsIcon from "../../assets/Icons/web-tools.png";
import appstoreIcon from "../../assets/Icons/app-store.png";
import applistIcon from "../../assets/Icons/applist.png";
import browserIcon from "../../assets/Icons/browser.png";
import getStartedIcon from "../../assets/Icons/getstarted.png";
import codeIcon from "../../assets/Icons/code.png";
import controlPanelIcon from "../../assets/Icons/controlpanel.png";
import xCodeIcon from "../../assets/Icons/xcode-icon.png";
import taskManagerIcon from "../../assets/Icons/taskmanager.png";
import { CURRENT_VERSION } from "../../constants/constants";

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

/*
REMOVED APPS


moved to the appstore
Pluginstore: {
	type: "file",
	fileType: "exe",
	content: {
		config: {
			name: "Plugin Store",
			displayName: "Plugin Store",
			permissions: Permission.SYSTEM,
			description:
				"Download or activate unique content from outside LumiOS.",
			userInstalled: false,
			icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M96 0C78.3 0 64 14.3 64 32v96h64V32c0-17.7-14.3-32-32-32zM288 0c-17.7 0-32 14.3-32 32v96h64V32c0-17.7-14.3-32-32-32zM32 160c-17.7 0-32 14.3-32 32s14.3 32 32 32v32c0 77.4 55 142 128 156.8v67.2c0 17.7 14.3 32 32 32s32-14.3 32-32v-67.2C297 398 352 333.4 352 256v-32c17.7 0 32-14.3 32-32s-14.3-32-32-32H32z"/></svg>`,
		},
	},
	date: new Date(),
	permission: Permission.ELEVATED,
	deleteable: true,
},

REMOVED CAUSE I DONT CARE
Info: {
	type: "file",
	fileType: "exe",
	content: {
		config: {
			name: "Info",
			displayName: "Info",
			permissions: Permission.SYSTEM,
			description:
				"Find out about new features, games, and commands.",
			userInstalled: false,
			icon: infoIcon,
		},
	},
	date: new Date(),
	permission: Permission.ELEVATED,
	deleteable: true,
},
*/

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
			Documents: {
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
								content:
									"Naw actually this is crazy. 00101111 01110011 01100101 01100011 01110010 01100101 01110100",
								date: new Date(),
								permission: Permission.USER,
								deleteable: true,
							},
						},
					},
				},
			},
			Users: {
				type: "directory",
				date: new Date(),
				permission: Permission.SYSTEM,
				deleteable: false,
				children: {
					Default: {
						type: "directory",
						date: new Date(),
						permission: Permission.SYSTEM,
						deleteable: false,
						children: {
							Settings: {
								type: "file",
								fileType: "exe",
								content: {
									config: {
										name: "Settings",
										displayName: "Settings",
										permissions: Permission.SYSTEM,
										description:
											"Change or customize the settings for all of LumiOS.",
										userInstalled: false,
										icon: settingsIcon,
									},
								},
								date: new Date(),
								permission: Permission.ELEVATED,
								deleteable: true,
							},
							AppStore: {
								type: "file",
								fileType: "exe",
								content: {
									config: {
										name: "App Store",
										displayName: "App Store",
										permissions: Permission.SYSTEM,
										description:
											"Download from over 200+ games or plugins.",
										userInstalled: false,
										icon: appstoreIcon,
									},
								},
								date: new Date(),
								permission: Permission.ELEVATED,
								deleteable: true,
							},
							Browser: {
								type: "file",
								fileType: "exe",
								content: {
									config: {
										name: "Browser",
										displayName: "Browser",
										permissions: Permission.SYSTEM,
										description:
											"Search the web unblocked.",
										userInstalled: false,
										icon: browserIcon,
									},
								},
								date: new Date(),
								permission: Permission.ELEVATED,
								deleteable: true,
							},
							InstalledApps: {
								type: "file",
								fileType: "exe",
								content: {
									config: {
										name: "Apps List",
										displayName: "Apps List",
										permissions: Permission.SYSTEM,
										description:
											"Displays a list of every app for LumiOS.",
										userInstalled: false,
										icon: applistIcon,
									},
								},
								date: new Date(),
								permission: Permission.ELEVATED,
								deleteable: true,
							},
							Notepad: {
								type: "file",
								fileType: "exe",
								content: {
									config: {
										name: "Notepad",
										displayName: "Notepad",
										permissions: Permission.SYSTEM,
										description:
											"Edit files or write text.",
										userInstalled: false,
										icon: notepadIcon,
									},
								},
								date: new Date(),
								permission: Permission.ELEVATED,
								deleteable: true,
							},
							Discord: {
								type: "file",
								fileType: "exe",
								content: {
									config: {
										name: "Discord",
										displayName: "Discord",
										permissions: Permission.SYSTEM,
										description:
											"Messege your friends and talk to fellow users.",
										userInstalled: false,
										icon: discordIcon,
									},
								},
								date: new Date(),
								permission: Permission.ELEVATED,
								deleteable: true,
							},
							Terminal: {
								type: "file",
								fileType: "exe",
								content: {
									config: {
										name: "Terminal",
										displayName: "Terminal",
										permissions: Permission.SYSTEM,
										description:
											"Run commands in javascript or directly modify the file system.",
										userInstalled: false,
										icon: terminalIcon,
									},
								},
								date: new Date(),
								permission: Permission.ELEVATED,
								deleteable: true,
							},
							FileExplorer: {
								type: "file",
								fileType: "exe",
								content: {
									config: {
										name: "File Explorer",
										displayName: "File Explorer",
										permissions: Permission.SYSTEM,
										description:
											"Add or directly modify the filesystem.",
										userInstalled: false,
										icon: filesystemIcon,
									},
								},
								date: new Date(),
								permission: Permission.ELEVATED,
								deleteable: true,
							},
							Webtools: {
								type: "file",
								fileType: "exe",
								content: {
									config: {
										name: "Web Tools",
										displayName: "Web Tools",
										permissions: Permission.SYSTEM,
										description:
											"Access this and other webpage tools using eruda.",
										userInstalled: false,
										icon: webtoolsIcon,
									},
								},
								date: new Date(),
								permission: Permission.ELEVATED,
								deleteable: true,
							},
							Code: {
								type: "file",
								fileType: "exe",
								content: {
									config: {
										name: "Visual Code",
										displayName: "Visual Code",
										permissions: Permission.SYSTEM,
										description:
											"Run scripts and html and css straight from ",
										userInstalled: false,
										icon: codeIcon,
									},
								},
								date: new Date(),
								permission: Permission.ELEVATED,
								deleteable: true,
							},
							ControlPanel: {
								type: "file",
								fileType: "exe",
								content: {
									config: {
										name: "Control Panel",
										displayName: "Control Panel",
										permissions: Permission.SYSTEM,
										description:
											"Run and edit outside scripts that are not supported.",
										userInstalled: false,
										icon: controlPanelIcon,
									},
								},
								date: new Date(),
								permission: Permission.ELEVATED,
								deleteable: true,
							},
							GetStarted: {
								type: "file",
								fileType: "exe",
								content: {
									config: {
										name: "Get Started",
										displayName: "Get Started",
										permissions: Permission.SYSTEM,
										description:
											"Introduction to and tutorial of Lumi OS!",
										userInstalled: false,
										icon: getStartedIcon,
									},
								},
								date: new Date(),
								permission: Permission.ELEVATED,
								deleteable: true,
							},
							AppCreator: {
								type: "file",
								fileType: "exe",
								content: {
									config: {
										name: "App Creator",
										displayName: "App Creator",
										permissions: Permission.SYSTEM,
										description:
											"Add or create your own custom app.",
										userInstalled: false,
										icon: xCodeIcon,
									},
								},
								date: new Date(),
								permission: Permission.ELEVATED,
								deleteable: true,
							},
							TaskManager: {
								type: "file",
								fileType: "exe",
								content: {
									config: {
										name: "Task Manager",
										displayName: "Task Manager",
										permissions: Permission.SYSTEM,
										description:
											"Access apps and functions.",
										userInstalled: false,
										icon: taskManagerIcon,
									},
								},
								date: new Date(),
								permission: Permission.ELEVATED,
								deleteable: true,
							},
						},
					},
				},
			},
			System: {
				type: "directory",
				date: new Date(),
				permission: Permission.SYSTEM,
				deleteable: false,
				children: {
					Themes: {
						type: "directory",
						date: new Date(),
						permission: Permission.ELEVATED,
						deleteable: true,
						children: {
							blueTheme: {
								type: "file",
								fileType: "theme",
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
								fileType: "theme",
								date: new Date(),
								permission: Permission.ELEVATED,
								deleteable: true,
								content: {
									primary: "rgba(30, 40, 60, 0.85)",
									primaryLight: "rgba(50, 70, 100, 0.6)",
									secondary: "#5fc9f3",
									secondaryLight: "#8ad4ff",
									textBase: "white",
								},
							},
							pinkTheme: {
								type: "file",
								fileType: "theme",
								date: new Date(),
								permission: Permission.ELEVATED,
								deleteable: true,
								content: {
									primary: "rgba(90, 20, 40, 0.85)",
									primaryLight: "rgba(120, 50, 70, 0.6)",
									secondary: "#f48fb1",
									secondaryLight: "#f9a3c2",
									textBase: "white",
								},
							},
							purpleTheme: {
								type: "file",
								fileType: "theme",
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
								fileType: "theme",
								date: new Date(),
								permission: Permission.ELEVATED,
								deleteable: true,
								content: {
									primary: "rgba(30, 30, 30, 0.85)",
									primaryLight: "rgba(50, 50, 50, 0.6)",
									secondary: "#495464",
									secondaryLight: "#BBBFCA",
									textBase: "white",
								},
							},
							blackTheme: {
								type: "file",
								fileType: "theme",
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
								fileType: "theme",
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
						},
					},
					Code: {
						type: "directory",
						date: new Date(),
						permission: Permission.ELEVATED,
						deleteable: true,
						children: {
							Default: {
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
									},
								},
							},
						},
					},
					Users: {
						type: "directory",
						date: new Date(),
						permission: Permission.ELEVATED,
						deleteable: true,
						children: {},
					},
					Plugins: {
						type: "directory",
						date: new Date(),
						permission: Permission.ELEVATED,
						deleteable: true,
						children: {
							Startup: {
								type: "file",
								fileType: "js",
								content: "// startup scripts will run here",
								date: new Date(),
								permission: Permission.ELEVATED,
								deleteable: true,
							},
						},
					},
					Taskbar: {
						type: "directory",
						date: new Date(),
						permission: Permission.ELEVATED,
						deleteable: true,
						children: {
							Settings: {
								type: "file",
								fileType: "exe",
								content: {
									config: {
										name: "Settings",
										description:
											"Change or customize the settings for all of LumiOS.",
										userInstalled: false,
										icon: settingsIcon,
										displayName: "Settings",
										permissions: Permission.ELEVATED,
									},
								},
								date: new Date(),
								permission: Permission.ELEVATED,
								deleteable: true,
							},
							AppStore: {
								type: "file",
								fileType: "exe",
								content: {
									config: {
										name: "App Store",
										description:
											"Download from over 200+ games or plugins.",
										userInstalled: false,
										icon: appstoreIcon,
										displayName: "App Store",
										permissions: Permission.ELEVATED,
									},
								},
								date: new Date(),
								permission: Permission.ELEVATED,
								deleteable: true,
							},
							Browser: {
								type: "file",
								fileType: "exe",
								content: {
									config: {
										name: "Browser",
										description:
											"Search the web unblocked.",
										userInstalled: false,
										icon: browserIcon,
										displayName: "Browser",
										permissions: Permission.ELEVATED,
									},
								},
								date: new Date(),
								permission: Permission.ELEVATED,
								deleteable: true,
							},
						},
					},
					Browser: {
						type: "directory",
						date: new Date(),
						permission: Permission.ELEVATED,
						deleteable: true,
						children: {
							Links: {
								type: "directory",
								date: new Date(),
								permission: Permission.ELEVATED,
								deleteable: true,
								children: {},
							},
							Active: {
								type: "file",
								fileType: "sys",
								date: new Date(),
								permission: Permission.ELEVATED,
								deleteable: true,
								content: {},
							},
						},
					},
					AppStore: {
						type: "directory",
						date: new Date(),
						permission: Permission.ELEVATED,
						deleteable: true,
						children: {
							Favorites: {
								type: "directory",
								date: new Date(),
								permission: Permission.ELEVATED,
								deleteable: true,
								children: {},
							},
							Recents: {
								type: "directory",
								date: new Date(),
								permission: Permission.ELEVATED,
								deleteable: true,
								children: {},
							},
						},
					},
					Updates: {
						// Very important, tracks any updates, use the Update type for file content
						type: "directory",
						date: new Date(),
						permission: Permission.ELEVATED,
						deleteable: true,
						children: {},
					},
					Scripts: {
						// Scripts that manage shit, will implement changes later
						type: "directory",
						date: new Date(),
						permission: Permission.ELEVATED,
						deleteable: true,
						children: {
							ExampleScript: {
								type: "file",
								date: new Date(),
								permission: Permission.USER,
								deleteable: true,
								fileType: "sys",
								content: {
									name: "ExampleScript",
									description:
										"An example script, does not modify or change anything.",
									permission: Permission.USER,
									app: "System",
									script: test,
								},
							},
						},
					},
					Version: {
						type: "file",
						fileType: "sys",
						content: {
							name: "Lumi OS",
							image: "https://avatars.githubusercontent.com/u/101959214?v=4",
							version: CURRENT_VERSION,
							secure: true,
						},
						date: new Date(),
						permission: Permission.ELEVATED,
						deleteable: true,
					},
					AutoSaves: {
						// Stores saved OS data from the user.
						type: "directory",
						date: new Date(),
						permission: Permission.ELEVATED,
						deleteable: true,
						children: {},
					},
				},
			},
			Trash: {
				type: "directory",
				date: new Date(),
				permission: Permission.SYSTEM,
				deleteable: false,
				children: {},
			},
		},
	},
};

export default defaultFS;
