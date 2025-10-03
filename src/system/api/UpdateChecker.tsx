import { useEffect } from "react";
import { useWindow } from "../../context/window/WindowProvider";
import { useKernel } from "../../hooks/useKernal";
import TextPopup from "../gui/components/Popups/TextPopup";
import updateIcon from "../../assets/Icons/ControlPanel/updates.webp";
import logger from "../../constants/logger";

/**
 * Checks for updates and provides a user notification for any
 *
 * @returns null
 */
const UpdateChecker = () => {
	const { openApp, openedApps } = useKernel();
	const { systemProps, updateSystemProps } = useWindow();

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

			const installedSystemVersion = Number(systemProps.system.version);
			const latestSystemVersion = Number(data[0].version);

			// Check if current version is outdated
			// const needsUpdate = installedSystemVersion < latestSystemVersion;

			// Example: check if version is within 1 step of latest (secure)
			const secured =
				installedSystemVersion >= latestSystemVersion - 1 &&
				installedSystemVersion <= latestSystemVersion + 1;

			if (secured) return;

			openApp({
				config: {
					name: "Update",
					displayName: "Notification",
					icon: updateIcon,
					permissions: 0,
				},
				mainComponent: (props) => (
					<TextPopup
						{...props}
						freezeBackground={true}
						text="You are currently using an outdated version of LumiOS. Please click the button below to update."
						onComplete={handleUpdate}
					/>
				),
			});
		} catch (err) {
			console.error("Update check failed:", err);
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
