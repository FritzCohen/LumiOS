import { useEffect, useState } from "react";
import Button from "../../lib/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfinity } from "@fortawesome/free-solid-svg-icons";
import virtualFS from "../../api/virtualFS";
import { useWindow } from "../../../context/window/WindowProvider";
import logo from "../../../assets/no-bg-logo.png";
import { updateHardware, updateHardwareInPlace, updateSoftware } from "../../../constants/updateMethods";
import { OS_NAME } from "../../../constants/constants";

const System = () => {
	const { systemProps } = useWindow();

	const [indexedDBUsage, setIndexedDBUsage] = useState<string | null>(null);
	const [maxUsage, setMaxUsage] = useState<string | null>(null);
	const [secure, setSecure] = useState<boolean>(false);

	useEffect(() => {
		const fetchLink = async () => {
			try {
				const response = await fetch(
					"https://raw.githubusercontent.com/LuminesenceProject/LumiOS/main/Info.json"
				);

				if (!response.ok) {
					throw new Error(`HTTP error! Status: ${response.status}`);
				}

				const data = await response.json();

				const secured: boolean =
					Number(data[0].version) >= 0 - 1 &&
					Number(data[0].version) <= 0 + 1;

				setSecure(secured);
			} catch (error) {
				console.error("Error fetching data:", error);
			}
		};

		fetchLink();

		const getUsage = async () => {
			const storageMethod = virtualFS.getMethod();
			let usage: number = 0;
			let quota: number = 0;

			// Helper function to format bytes with appropriate units (KB, MB, or GB)
			const formatBytes = (bytes: number | undefined | null) => {
				if (!bytes) return "0 bytes";

				const units = ["bytes", "KB", "MB", "GB"];
				let value = bytes;
				let unitIndex = 0;

				while (value >= 1000 && unitIndex < units.length - 1) {
					value /= 1000;
					unitIndex++;
				}

				return `${parseFloat(value.toPrecision(2))} ${
					units[unitIndex]
				}`;
			};

			// Handle different storage methods
			if (storageMethod === "fileStorage") {
				// Extract data for file storage from an element with ID "virtualFS"
				const fileDataElement = document.getElementById("virtualFS");

				if (fileDataElement && fileDataElement.textContent) {
					try {
						// Parse the JSON content stored in the text of the element
						const parsedData = JSON.parse(
							fileDataElement.textContent
						);
						usage = parsedData.usage || 0;
						quota = parsedData.quota || 0;
					} catch (error) {
						console.error(
							"Error parsing JSON from virtualFS:",
							error
						);
					}
				}
			} else if (storageMethod === "indexedDB") {
				const storageEstimate = await navigator.storage.estimate();
				usage = storageEstimate.usage || 0;
				quota = storageEstimate.quota || 0;
			} else if (storageMethod === "localStorage") {
				usage = new Blob(Object.values(localStorage)).size;
				quota = 5 * 1024 * 1024; // Approximate quota for localStorage (5MB)
			} else if (storageMethod === "OPFS") {
				// OPFS storage estimate (requires OPFS API support)
				const storageEstimate = await navigator.storage.estimate();
				usage = storageEstimate.usage || 0;
				quota = storageEstimate.quota || 0;
			}

			// Format usage and quota
			const mbUsage = formatBytes(usage);
			const maxUsage = formatBytes(quota);

			// Update the UI or state with the results
			setIndexedDBUsage(mbUsage);
			setMaxUsage(maxUsage);
		};

		getUsage();
	}, [systemProps.system.version]);

	const browserName = () => {
		const userAgent = navigator.userAgent;
		if (userAgent.indexOf("Firefox") !== -1) return "Firefox";
		if (userAgent.indexOf("Chrome") !== -1) return "Chrome";
		if (userAgent.indexOf("Safari") !== -1) return "Safari";
		if (userAgent.indexOf("MSIE") !== -1) return "Internet Explorer";
		return "Unknown";
	};

	const osInfo = () => {
		const userAgent = navigator.userAgent;
		let osType = "Unknown";
		let osVersion = "Unknown";

		if (userAgent.indexOf("Mac") !== -1) {
			osType = "Mac OS";
			const match = /Mac OS X (\d+[._]\d+[._]\d+)/.exec(userAgent);
			if (match) {
				osVersion = match[1].replace(/_/g, ".");
			}
		} else if (userAgent.indexOf("Windows") !== -1) {
			osType = "Windows";
			const match = /Windows NT (\d+[._]\d+)/.exec(userAgent);
			if (match) {
				osVersion = match[1].replace(/_/g, ".");
			}
		} else if (userAgent.indexOf("Linux") !== -1) {
			osType = "Linux";
			const match = /Linux/.exec(userAgent);
			if (match) {
				osVersion = "Unknown"; // It's difficult to determine the version of Linux from user agent
			}
		}

		return {
			type: osType,
			version: osVersion,
		};
	};

	const handleReset = async () => {
		if (
			window.confirm(
				"Are you sure you want to reset? \nAll stored data will be gone, forever."
			)
		) {
			await virtualFS.deleteFileSystem().then(() => {
				window.location.reload();
			});
		}
	};

	return (
		<div className="flex flex-col gap-2 p-5 overflow-y-auto w-full h-full text-text-primary">
			{/* System Section */}
			<h2 className="font-semibold text-xl">System</h2>
			<div className="p-4 rounded-lg shadow bg-surfaceAlt">
				<div className="flex flex-row justify-between items-center mb-2">
					<h4 className="font-semibold text-md">
						{OS_NAME} v{systemProps.system.version}
					</h4>
					<img src={logo} alt="logo" className="w-10 h-10" />
				</div>
				<div className="flex flex-row justify-between items-center mt-2">
					<span className="text-text-secondary">Update Hardware</span>
					<Button
						className="bg-accent text-white hover:bg-accentAlt transition-colors"
						onClick={updateHardware}
					>
						Update
					</Button>
				</div>
				<div className="flex flex-row justify-between items-center mt-2">
					<span className="text-text-secondary">Update Software</span>
					<Button
						className="bg-accent text-white hover:bg-accentAlt transition-colors"
						onClick={updateSoftware}
					>
						Update
					</Button>
				</div>
			</div>

			{/* Device Section */}
			<h2 className="font-semibold text-xl mt-4">Your Device</h2>
			<div className="p-4  rounded-lg shadow-sm bg-surface">
				<div className="flex flex-col gap-3">
					<div className="flex justify-between items-center">
						<strong className="text-text-primary">
							Operating System:
						</strong>
						<div className="flex flex-row gap-1 text-text-secondary">
							{Object.values(osInfo()).map((value, index) => (
								<span key={index}>{value}</span>
							))}
						</div>
					</div>
					<div className="flex justify-between items-center">
						<strong>Web Browser:</strong>{" "}
						<span className="text-text-secondary">
							{browserName()}
						</span>
					</div>
					<div className="flex justify-between items-center">
						<strong>Device Type:</strong>{" "}
						<span className="text-text-secondary">
							{navigator.platform}
						</span>
					</div>
					<div className="flex justify-between items-center">
						<strong>Web Protocol:</strong>{" "}
						<span className="text-text-secondary">
							{window.location.protocol}
						</span>
					</div>
					<div className="flex justify-between items-center">
						<strong>Web Host:</strong>{" "}
						<span className="text-text-secondary">
							{window.location.host}
						</span>
					</div>
				</div>
			</div>

			{/* LumiOS Information */}
			<h2 className="font-semibold text-xl mt-4">{OS_NAME} Information</h2>
			<div className="p-4 rounded-lg shadow-sm bg-surface">
				<div className="flex flex-col gap-3">
					<div className="flex justify-between items-center">
						<strong>Storage Used:</strong>
						<div className="flex items-center gap-1 text-text-secondary">
							{indexedDBUsage !== null
								? `${indexedDBUsage}/${
										maxUsage != null ? maxUsage : ""
								  }`
								: "Loading..."}
							{maxUsage == null && (
								<FontAwesomeIcon icon={faInfinity} />
							)}
						</div>
					</div>
					<div className="flex justify-between items-center">
						<strong>Current Version:</strong>{" "}
						<span className="text-text-secondary">
							{systemProps.system.version}
						</span>
					</div>
					<div className="flex justify-between items-center">
						<strong>Supported Version:</strong>{" "}
						<span
							className={`font-semibold ${
								secure ? "text-success" : "text-danger"
							}`}
						>
							{secure ? "Yes" : "No"}
						</span>
					</div>
				</div>
			</div>

			{/* Action Buttons */}
			<div className="p-4  rounded-lg shadow-sm flex justify-between items-center bg-surfaceAlt">
				Update (This file)
				<Button
					className="bg-accent text-white hover:bg-accentAlt transition-colors"
					onClick={updateHardwareInPlace}
				>
					Update File
				</Button>
			</div>

			<div className="p-4  rounded-lg shadow-sm flex justify-between items-center bg-surfaceAlt">
				Reset
				<Button
					className="bg-danger text-white hover:bg-danger/80 transition-colors"
					onClick={handleReset}
				>
					Confirm
				</Button>
			</div>
		</div>
	);
};

export default System;
