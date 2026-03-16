import { useEffect } from "react";
import { useWindow } from "../../context/window/WindowProvider";
import { useKernel } from "../../hooks/useKernal";
import updateIcon from "../../assets/Icons/ControlPanel/updates.webp";
import logger from "../../constants/logger";
import UpdatePopup from "../gui/components/Popups/UpdatePopup";
import virtualFS from "./virtualFS";
import { useFolderWatcher } from "./useFolderWatcher";
import { createError } from "./errors";
import { FileErrorType } from "../../types/globals";
import { CURRENT_VERSION } from "../../constants/constants";

/**
 * Checks for updates and provides a user notification for any
 *
 * @returns null
 */
const UpdateChecker = () => {
	const { openApp, openedApps } = useKernel();
	const { systemProps, updateSystemProps } = useWindow();

	useFolderWatcher("System/", (entries) => {
		const file = entries["Version"];

		if (!file) throw createError(FileErrorType.FileNotFound);
		if (file.type === "directory") throw createError(FileErrorType.InvalidFileType);

		checkForUpdate();
	});

	// Update logic
	const handleUpdate = async () => {
		try {
			const response = await fetch(
				"https://raw.githubusercontent.com/LuminesenceProject/LumiOS/main/Info.json"
			);

			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}

			const data = await response.json();
			const newVersion = data[0].version;

			// Update version in system props
			updateSystemProps("system.version", newVersion);

			const versionFile = await virtualFS.readfile("System/", "Version");
			// @ts-expect-error FUK
			await virtualFS.updateItem("System/", "Version", "content", { ...(versionFile.content as any), version: newVersion }, "sys" );

			// Fetch the new build
			const buildResponse = await fetch(
				"https://raw.githubusercontent.com/FritzCohen/LumiOS/refs/heads/main/index.html"
			);

			if (!buildResponse.ok) {
				throw new Error(
					`Build fetch error! Status: ${buildResponse.status}`
				);
			}

			const newHtml = await buildResponse.text();

			// Download to user's computer
			const blob = new Blob([newHtml], { type: "text/html" });
			const url = URL.createObjectURL(blob);

			const link = document.createElement("a");
			link.href = url;
			link.download = `LumiOS.v${newVersion}.html`; // filename
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);

			URL.revokeObjectURL(url);
			
			logger.success("Installed the latest version successfully.");
		} catch (err) {
			console.error("Update failed:", err);
		}
	};

	// Checks if an update is needed
	const checkForUpdate = async () => {
		if (openedApps.some((app) => app.executable.config.name === "Update")) {
			return; // don’t open another popup
		}

		try {
			const response = await fetch(
				"https://raw.githubusercontent.com/LuminesenceProject/LumiOS/main/Info.json"
			);

			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}

			const data = await response.json();

			const versionFile = await virtualFS.readfile("System/", "Version");	

			const installedSystemVersion = Number((versionFile.content as any).version);
			const latestSystemVersion = Number(data[0].version);

			// Check if current version is outdated
			// const needsUpdate = installedSystemVersion < latestSystemVersion;

			// Example: check if version is within 1 step of latest (secure)
			const secured =
				installedSystemVersion >= latestSystemVersion - 1 &&
				installedSystemVersion <= latestSystemVersion + 1 &&
				CURRENT_VERSION >= latestSystemVersion -1 &&
				CURRENT_VERSION <= latestSystemVersion + 1;			

			if (secured) return;

			openApp({
				config: {
					name: "Update",
					displayName: "Update",
					icon: updateIcon,
					permissions: 0,
				},
				mainComponent: (props) => (
					<UpdatePopup
						{...props}
						onComplete={handleUpdate}
					/>
				),
			});
		} catch (err) {
			console.error("Update check failed:", err);
			// Screw people who try to bypass it thru deleting the file, open it anyway
			openApp({
				config: {
					name: "Update",
					displayName: "Update",
					icon: updateIcon,
					permissions: 0,
				},
				mainComponent: (props) => (
					<UpdatePopup
						{...props}
						onComplete={handleUpdate}
					/>
				),
			});
		}
	};

	useEffect(() => {
		let ran = false;

		if (!ran) {
			checkForUpdate();
			ran = true;
		}
	}, [systemProps.system.version]);

	return null;
};

export default UpdateChecker;
