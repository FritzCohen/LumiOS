import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { Directory, File, FileContentMap } from "../system/api/types";
import folderIcon from "../assets/Icons/Settings/folder.png";
import generic from "../assets/Icons/Settings/generic.ico";
import config from "../assets/Icons/Settings/configuration.ico";
import txtIcon from "../assets/Icons/Settings/text.ico";
import scriptIcon from "../assets/Icons/Settings/script.png";
import shortcutIcon from "../assets/Icons/shortcut.png";
import { PanicConfig } from "../types/globals";
import { SystemProps } from "../context/window/types";
import logo from "../assets/no-bg-logo.png";

// CURRENT VERSION
/**
 * Current version of the OS
 * 
 * Update every time a new version comes out
*/
export const CURRENT_VERSION = 14;

export const ONE_TIME_PASSIVE_EVENT = {
	once: true,
	passive: true,
} as AddEventListenerOptions;

// Minimum distance to move an element before triggering a drag
export const MOVE_THRESHOLD = 5;

export const TRANSITIONS_IN_MILLISECONDS = {
	DOUBLE_CLICK: 300, // Time to wait before considering a second click as a double click
	DRAG_START: 100, // Time to wait before starting a drag operation
	DRAG_END: 100, // Time to wait before ending a drag operation
	DRAG_CANCEL: 100, // Time to wait before canceling a drag operation
};

/** Async user methods, take time to execute */
export const ASYNC_USER_METHODS: string[] = ["CREATE_USER", "MODIFY_USER_PROP"];

// For icon stuffs
export function getIconForFile(item: File | Directory): string;
export function getIconForFile(
	fileType: keyof FileContentMap
): string | IconProp;

export function getIconForFile(
	arg: File | Directory | string
): string {
	if (typeof arg === "string") {
		// Called with just fileType
		switch (arg) {
			case "txt":
				return txtIcon;
			case "js":
				return scriptIcon;
			case "sys":
				return config;
			case "css":
			case "html":
			case "theme":
			case "img":
			case "shortcut":
				return generic;
			case "exe":
				return generic; // No icon config without a file
			default:
				return generic;
		}
	} else {
		// Called with a File or Directory
		if (arg.type === "directory") return folderIcon;

		const fileType = arg.fileType;

		switch (fileType) {
			case "txt":
				return txtIcon;
			case "js":
				return scriptIcon;
			case "sys":
				return config;
			case "shortcut":
				return shortcutIcon;
			case "css":
			case "html":
			case "theme":
			case "img":
				return generic;
			case "exe":
				return arg.content?.config?.icon as string ?? generic;
			default:
				return generic;
		}
	}
}

export const defaultSystemProps: SystemProps = {
	taskbar: { mode: "floating", align: "center", onHover: true },
	topbar: { visible: true, onHover: true, style: "default" },
	appearance: {
		scrollbar: "thin",
		windowStyle: "default",
		enableWindowBackground: true,
	},
	system: {
		firstLogin: true,
		runSecureBot: true,
		gamesLink:
			"https://raw.githubusercontent.com/LuminesenceProject/lumi-games/main/Data.json",
		version: CURRENT_VERSION,
		devMode: false,
	},
};

export const defaultBrowserConfig: BrowserConfig = {
	proxyLinks: [],
	bookmarks: [],
	defaultLink: { title: "Home", link: "/home"},
}

export const defaultPanic: PanicConfig = {
	key: "\\",
	website: "https://google.com",
	title: "Lumi OS",
	favicon: logo,
};

import image1 from "../assets/background/bg1.avif";
import image2 from "../assets/background/image1.jpeg";
import image3 from "../assets/background/image2.jpg";
import image4 from "../assets/background/image3.jpg";
import image5 from "../assets/background/image4.jpg";
import image6 from "../assets/background/image9.jpg";
import image8 from "../assets/background/image8.jpg";
import image10 from "../assets/background/image10.jpg";
import { BrowserConfig } from "../context/user/types";

export const images = [image1, image2, image3, image4, image5, image6, image8, image10];

export const cloaks = [
	{
		title: "Google",
		website: "https://google.com",
		favicon: "https://google.com/favicon.ico"
	},
	{
		title: "Canvas",
		website: "https://www.instructure.com/canvas/login",
		favicon: "https://du11hjcvx0uqb.cloudfront.net/dist/images/favicon-e10d657a73.ico",
	},
	{
		title: "Desmos | Graphing Calculator",
		website: "https://www.desmos.com/",
		favicon: "https://www.desmos.com/assets/img/apps/graphing/favicon.ico",
	},
	{
		title: "My Drive - Google Drive",
		website: "https://drive.google.com/drive/my-drive",
		favicon: "https://ssl.gstatic.com/docs/doclist/images/drive_2022q3_32dp.png",
	},
	{
		title: "Classroom",
		website: "https://classroom.google.com/?pli=1",
		favicon: "https://ssl.gstatic.com/classroom/ic_product_classroom_144.png",
	},
	{
		title: "New Tab",
		website: "chrome://new-tab-page",
		favicon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABRklEQVR42mKgOqjq75ds7510YNL0uV9nAGqniqwKYiCIHIIjcAK22BGQLRdgBWvc3fnWk/FJhrkPO1xPgGvqPfLfJMHhT1yqurvS48bPaJhjD2efgidnVwa2yv59xecvEvi0UWCXq9t0ItfP2MMZ7nwIpkA8F1n8uLxZHM6yrBH7FIl2gFXDHYsErkn2hyKLHtcKrFntk58uVQJ+kSdQnmjhID4cwLLa8+K0BXsfNWCqBOsFdo2Yldv43DBrkxd30cjnNyYBhK0SQGkI9pG4Mu40D5b374DRCAyhHqXVfTmOwivivMkJxBz5wnHCtBfGgNFC+ChWKWRf3hsQIlyEoIv4IYEo5wkgtBLRekY9DE4Uin4Keae6hydGnljPmE8kRcCine6827AMsJ1IuW9ibnlQpXLBCR/WC875m2BP+VSu3c/0m+8V08OBngc0pxcAAAAASUVORK5CYII=",
	},
	{
		title: "Google Docs",
		website: "https://docs.google.com/document/u/0/",
		favicon: "https://ssl.gstatic.com/docs/documents/images/kix-favicon-2023q4.ico",
	},
	{
		title: "Edpuzzle",
		website: "https://edpuzzle.com/",
		favicon: "https://edpuzzle.imgix.net/favicons/favicon-32.png",
	},
	{
		title: "Dashboard | Khan Academy",
		website: "https://www.khanacademy.org/",
		favicon: "https://cdn.kastatic.org/images/favicon.ico?logo",
	},
	{
		title: "Latest | Quizlet",
		website: "https://quizlet.com/",
		favicon: "https://assets.quizlet.com/a/j/dist/app/i/logo/2021/q-twilight.e27821d9baad165.png",
	},
];

/**
 * Compares two objects for deep equality
*/

export function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;

  if (typeof obj1 !== "object" || obj1 === null ||
      typeof obj2 !== "object" || obj2 === null) {
    return false;
  }

  // Handle arrays
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (obj1.length !== obj2.length) return false;
    for (let i = 0; i < obj1.length; i++) {
      if (!deepEqual(obj1[i], obj2[i])) return false;
    }
    return true;
  }

  // If one is array and the other isn't
  if (Array.isArray(obj1) || Array.isArray(obj2)) return false;

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
}