import { IconDefinition } from "@fortawesome/fontawesome-common-types";
import { faPuzzlePiece, faRefresh, faSliders } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import CloakConfig from "./CloakConfig";
import Sidebar from "./Sidebar";
import Presets from "./Presets";
import { useFolderWatcher } from "../../api/useFolderWatcher";
import { Shortcut } from "../../../types/globals";
import { File } from "../../api/types";
import "./cloaking.css";
import Autorotate from "./AutoRotate";

const Cloaking = () => {
	const [menu, setMenu] = useState(0);
	const [cloaks, setCloaks] = useState<Shortcut[]>([]);

	useFolderWatcher("System/DefaultCloaks/", (entries) => {
		const files: Shortcut[] = Object.values(entries)
			.filter(
				(entry): entry is File =>
					entry.type === "file" && entry.fileType === "shortcut"
			)
			.map((file) => file.content as Shortcut);

		setCloaks(files);
	});

	const menuItems: {
		id: number;
		label: string;
		icon: IconDefinition | string;
	}[] = [
		{ id: 0, label: "Config", icon: faPuzzlePiece },
		{ id: 1, label: "Presets", icon: faSliders },
		// { id: 2, label: "Auto Rotate", icon: faRefresh },
	];

	const getContent = (): React.ReactNode => {
		switch (menu) {
			case 0:
				return <CloakConfig />;
			case 1:
				return <Presets cloaks={cloaks} />;
			case 2:
				return <Autorotate />;

			default:
				<>How did we get here?</>;
		}
	};

	return (
		<div className="flex flex-row h-full w-full overflow-hidden">
			{/* Sidebar */}
			<Sidebar menu={menu} setMenu={setMenu} menuItems={menuItems} />
			{/* Content */}
			<div className="flex flex-col gap-2 p-2 flex-1 flex-grow overflow-auto">
				{getContent()}
			</div>
		</div>
	);
};

export default Cloaking;
