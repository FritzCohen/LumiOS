import { useState } from "react";
import { OpenedApp } from "../../../../context/kernal/kernal";
import { useKernel } from "../../../../hooks/useKernal";
import { FileContentMap } from "../../../api/types";
import Popup from "./Popup";
import { Executable } from "../../../../types/globals";
import { getIconForFile } from "../../../../constants/constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { components } from "../../../apps/Components";
import Button from "../../../lib/Button";
import useGetApps from "../../../../hooks/useGetApps";
import FileBrowser from "./FileBrowser";

interface OpenWithProps {
	props: OpenedApp;
	fileType: keyof FileContentMap;
	itemToPass: any;
	path?: string
	fileName?: string
}

const OpenWithPopup: React.FC<OpenWithProps> = ({ props, itemToPass, path, fileName }) => {
	const apps = useGetApps();
	const { openApp, closeApp } = useKernel();
	const [selectedApp, setSelectedApp] = useState<Omit<Executable, "mainComponent"> | null>(null);
	const [customExecutable, setCustomExecutable] = useState<Omit<Executable, "mainComponent"> | null>(null);

	const handleSeeMore = () => {
		openApp({
			config: {
				name: "Open File",
				displayName: "Open File",
				permissions: 0,
				icon: "",
			},
			mainComponent: (popupProps) => (
				<FileBrowser
					{...popupProps}
					typeFilter="file"
					fileTypeFilter=""
					direct={""}
					setDirect={() => {}}
					onComplete={(value) => {
						if (value.type !== "file") return;
						
						if (
							typeof value.content === "object" &&
							value.content !== null &&
							"config" in value.content
						) {
							setCustomExecutable(value.content as Omit<Executable, "mainComponent">);
							setSelectedApp(null); // clear previous selection
						} else {
							console.error("Invalid executable content", value.content);
						}
					}}
				/>
			),
		});
	};

	const handleConfirm = () => {
		const toRun = selectedApp ?? customExecutable;
        
		if (!toRun) return;

		const Component = components[toRun.config.name || toRun.config.displayName];
		if (!Component) {
			console.error("Component not found for:", toRun.config.name);
			return;
		}

		openApp({
			...toRun,
			mainComponent: () => <Component props={itemToPass} file={itemToPass} defaultPath={path} defaultName={fileName} />,
		});
		closeApp(props.id);
	};

	const handleCancel = () => {
		closeApp(props.id);
	};

	return (
		<Popup app={props} width={250} height={400} frozenBackground>
			<div className="flex flex-col h-full w-full py-2">
				<div className="flex-grow overflow-auto space-y-2 px-2">
					{apps.map((app, index) => {
						const isSelected = selectedApp?.config.name === app.config.name;
						const iconOrImage = app.config.icon || getIconForFile("exe");

						return (
							<div
								key={index}
								className={`w-full flex gap-2 items-center p-2 file-popup-item cursor-pointer rounded ${
									isSelected ? "active" : ""
								}`}
								onClick={() => {
									setSelectedApp(app);
									setCustomExecutable(null); // clear custom selection
								}}
							>
								{typeof iconOrImage === "string" ? (
									<img src={iconOrImage} alt={`${app.config.name} icon`} className="icon w-4 h-4" />
								) : (
									<FontAwesomeIcon icon={iconOrImage} className="icon w-4 h-4" />
								)}
								{app.config.name}
							</div>
						);
					})}
					{customExecutable && (
						<div
							className={`w-full flex gap-2 items-center p-2 file-popup-item cursor-pointer rounded ${
								selectedApp === null ? "active" : ""
							}`}
							onClick={() => {
								setSelectedApp(null);
							}}
						>
							{typeof customExecutable.config.icon === "string" ? (
								<img
									src={customExecutable.config.icon}
									alt={`${customExecutable.config.name} icon`}
									className="icon w-4 h-4"
								/>
							) : (
								<FontAwesomeIcon icon={customExecutable.config.icon} className="icon w-4 h-4" />
							)}
							{customExecutable.config.name}
						</div>
					)}
					<div
						className="w-full flex justify-center items-center p-2 text-blue-500 hover:underline cursor-pointer"
						onClick={handleSeeMore}
					>
						See more...
					</div>
				</div>
				<div className="mt-auto pt-2 flex flex-row justify-between items-center">
					<Button onClick={handleConfirm} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">
						Confirm
					</Button>
					<Button onClick={handleCancel} className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500">
						Cancel
					</Button>
				</div>
			</div>
		</Popup>
	);
};

export default OpenWithPopup;