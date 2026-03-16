import { useEffect, useState } from "react";
import { OpenedApp } from "../../../../context/kernal/kernal";
import Popup from "./Popup";
import virtualFS from "../../../api/virtualFS";
import { CURRENT_VERSION } from "../../../../constants/constants";
import Button from "../../../lib/Button";
import { useKernel } from "../../../../hooks/useKernal";
import logger from "../../../../constants/logger";
import { updateHardware, updateSoftware } from "../../../../constants/updateMethods";

type UpdateState = {
	needsUpdate: boolean;
	label: string;
};

function compareVersions(local: number, server: number): UpdateState {
	const needsUpdate = local < server;
	return {
		needsUpdate,
		label: needsUpdate ? "out of date" : "up to date",
	};
}

const UpdatePopup: React.FC<{
	props: OpenedApp;
	onComplete?: Promise<void>;
}> = ({ props }) => {
	const { closeApp } = useKernel();

	const [userVersion, setUserVersion] = useState<number>(0);
	const [serverVersion, setServerVersion] = useState<number>(0);

	/* ----------------------------
     Fetch versions
  ----------------------------- */
	useEffect(() => {
		const getVersions = async () => {
			// USER VERSION
			try {
				const versionFile = await virtualFS.readfile("System/", "Version");
				const installed = Number((versionFile.content as any).version);
				setUserVersion(installed);
			} catch {
				setUserVersion(1);
			}

			try {
				// SERVER VERSION
				const response = await fetch(
					"https://raw.githubusercontent.com/LuminesenceProject/LumiOS/main/Info.json",
				);

				if (!response.ok) {
					throw new Error(`HTTP error! Status: ${response.status}`);
				}

				const data = await response.json();
				setServerVersion(Number(data[0].version));
			} catch (e) { logger.error(String(e)) }
		};

		getVersions();
	}, []);

	/* ----------------------------
     Update handlers
    ----------------------------- */
	const onUpdateSoftware = async () => {
		await updateSoftware();

		closeApp(props.id);
	};

	const software = compareVersions(userVersion, serverVersion);
	const file = compareVersions(CURRENT_VERSION, serverVersion);

	return (
		<Popup app={props} width={300} height={350} allowOverflow>
			<div className="p-2 h-full w-full">
				<div className="flex flex-col border border-border-subtle h-full w-full p-2 rounded-md">
					<h1 className="text-2xl font-semibold mb-3">Updates</h1>

					{/* Content */}
					<div className="flex flex-col gap-3 text-sm">
						{/* Software update */}
						{/* Software */}
						<div className="flex flex-col">
							<span
								className={`text-sm font-medium ${
									software.needsUpdate
										? "text-red-500"
										: "text-green-500"
								}`}
							>
								Current Software: v{userVersion}
							</span>
							<span className="text-xs opacity-60">
								Latest available: v{serverVersion}
							</span>
						</div>

						{/* File */}
						<div className="flex flex-col">
							<span
								className={`text-sm font-medium ${
									file.needsUpdate
										? "text-red-500"
										: "text-green-500"
								}`}
							>
								Current File: v{CURRENT_VERSION}
							</span>
							<span className="text-xs opacity-60">
								Latest available: v{serverVersion}
							</span>
						</div>
					</div>

					{/* Bottom actions */}
					<div className="mt-auto pt-3 border-t border-border-subtle flex flex-col gap-2 justify-end">
						{software.needsUpdate && (
							<Button onClick={onUpdateSoftware} full>
								Update Software
							</Button>
						)}

						{file.needsUpdate && (
							<Button onClick={updateHardware} full>
								Update File
							</Button>
						)}
					</div>
				</div>
			</div>
		</Popup>
	);
};

export default UpdatePopup;
