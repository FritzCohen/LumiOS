import defaultFS from "../../system/api/defaultFS";
import { File } from "../../system/api/types";
import virtualFS from "../../system/api/virtualFS";
import { Permission } from "../../types/globals";
import { User } from "./userTypes";
import settingsIcon from "../../assets/Icons/settings.png";
import discordIcon from "../../assets/Icons/discord.png";
import appstoreIcon from "../../assets/Icons/app-store.png";
import browserIcon from "../../assets/Icons/browser.png";

export async function createUser(user: User) {
	const usernamePath = `Users/${user.username}/`;

	await virtualFS.writeFile("System/Users/", user.username, user, "sys");
	await virtualFS.writeDirectory(
		"Users/",
		user.username,
		Permission.ELEVATED
	);
	await virtualFS.writeDirectory(usernamePath, "Apps", Permission.ELEVATED);
	await virtualFS.writeDirectory(
		usernamePath,
		"AppStore",
		Permission.ELEVATED
	);
	await virtualFS.writeDirectory(
		`${usernamePath}AppStore/`,
		"Favorites",
		Permission.ELEVATED
	);
	await virtualFS.writeDirectory(
		`${usernamePath}AppStore/`,
		"Recents",
		Permission.ELEVATED
	);
	await virtualFS.writeDirectory(usernamePath, "Code", Permission.ELEVATED);
	await virtualFS.writeDirectory(
		`${usernamePath}Code/`,
		"Default",
		Permission.ELEVATED
	);
	await virtualFS.writeDirectory(
		usernamePath,
		"Browser",
		Permission.ELEVATED
	);
	await virtualFS.writeFile(
		`${usernamePath}Code/Default/`,
		"index.html",
		`<!DOCTYPE html>\n<html>\n<head>\n<link rel="stylesheet" href="./styles.css">\n</head>\n<body>\n<h1>Hello World</h1>\n<script src="./index.js"></script>\n</body>\n</html>`,
		"html"
	);
	await virtualFS.writeFile(
		`${usernamePath}Code/Default/`,
		"index.js",
		`console.log("Hello World");`,
		"js"
	);
	await virtualFS.writeFile(
		`${usernamePath}Code/Default/`,
		"styles.css",
		`body {\nbackground-color: #f0f0f0;\n }`,
		"css"
	);
	await virtualFS.writeDirectory(
		usernamePath,
		"Desktop",
		Permission.ELEVATED
	);
	await virtualFS.writeDirectory(
		usernamePath,
		"Taskbar",
		Permission.ELEVATED
	);
	await virtualFS.writeDirectory(
		usernamePath,
		"DownloadedGames",
		Permission.ELEVATED
	);
	await virtualFS.writeDirectory(
		usernamePath,
		"Scripts",
		Permission.SYSTEM
	)

	const desktopIcons = [
		{
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
		{
			config: {
				name: "Discord",
				displayName: "Discord",
				permissions: Permission.SYSTEM,
				description: "Messege your friends and talk to fellow users.",
				userInstalled: false,
				icon: discordIcon,
			},
		},
	];

	const taskbarIcons = [
		{
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
		{
			config: {
				name: "App Store",
				description: "Download from over 200+ games or plugins.",
				userInstalled: false,
				icon: appstoreIcon,
				displayName: "App Store",
				permissions: Permission.ELEVATED,
			},
		},
		{
			config: {
				name: "Browser",
				description: "Search the web unblocked.",
				userInstalled: false,
				icon: browserIcon,
				displayName: "Browser",
				permissions: Permission.ELEVATED,
			},
		},
	];

	await Promise.all([
		...desktopIcons.map((icon) =>
			virtualFS.writeFile(
				`${usernamePath}Desktop/`,
				icon.config.name,
				{ ...icon, userInstalled: false },
				"exe"
			)
		),
		...taskbarIcons.map((icon) =>
			virtualFS.writeFile(
				`${usernamePath}Taskbar/`,
				icon.config.name,
				{ ...icon, userInstalled: false },
				"exe"
			)
		),
		...Object.keys(
			defaultFS.root.children.Users.children.Default.children
		).map(async (appName) => {
			const app: File =
				defaultFS.root.children.Users.children.Default.children[
					appName
				];
			if (app && "content" in app) {
				await virtualFS.writeFile(
					`${usernamePath}Apps/`,
					appName,
					app.content,
					app.fileType
				);
			}
		}),
	]);
};

export async function deleteUser(user: User) {	
	await virtualFS.deleteItem("/Users/", user.username, user.permission);
	await virtualFS.deleteItem("/System/Users/", user.username, user.permission);
};

export async function modifyUserProp(previous: User, updated: User) {	
	await virtualFS.updateFile(
		"System/Users/",
		previous.username,
		updated,
		"exe",
		updated.username
	);
}

/**
 * Convert ANY hex/rgb/rgba color to rgba with a custom alpha.
 */
export function withAlpha(color: string, alpha: number): string {
	color = color.trim();

	// --- HEX HANDLING ---
	if (color.startsWith("#")) {
		let hex = color.slice(1);

		// #RGB -> #RRGGBB
		if (hex.length === 3) {
			hex = hex.split("").map((c) => c + c).join("");
		}

		// #RRGGBBAA -> ignore original alpha, use new one
		if (hex.length === 8) hex = hex.slice(0, 6);

		if (hex.length !== 6) {
			console.warn("Invalid hex color:", color);
			return color;
		}

		const r = parseInt(hex.slice(0, 2), 16);
		const g = parseInt(hex.slice(2, 4), 16);
		const b = parseInt(hex.slice(4, 6), 16);

		return `rgba(${r}, ${g}, ${b}, ${alpha})`;
	}

	// --- RGB / RGBA HANDLING ---
	const rgbMatch =
		color.match(/rgba?\(([^)]+)\)/)?.[1]
			.split(",")
			.map((v) => parseFloat(v.trim()));

	if (rgbMatch && rgbMatch.length >= 3) {
		const [r, g, b] = rgbMatch;
		return `rgba(${r}, ${g}, ${b}, ${alpha})`;
	}

	console.warn("Unknown color format:", color);
	return color;
}
