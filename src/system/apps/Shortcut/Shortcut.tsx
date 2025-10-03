import { useEffect, useRef } from "react";
import { useKernel } from "../../../hooks/useKernal";
import virtualFS from "../../api/virtualFS";
import getNeededApp from "../../../constants/betterGetNeededApp";
import normalizePath from "../../../constants/normalizePath";

export interface ShortcutProps {
	name: string;
	path: string;
}

const Shortcut: React.FC<ShortcutProps> = ({ name, path }) => {
	const { openApp, closeApp, openedApps } = useKernel();
	const ranRef = useRef(false);

	const handleOpen = async () => {
		let normalizedPath = normalizePath(path);
		let normalizedName = name;

		let fetchedFile = await virtualFS.readfile(
			normalizedPath,
			normalizedName
		);

		// Follow shortcuts until we get to a non-shortcut file
		while (fetchedFile.fileType === "shortcut") {
			normalizedPath = fetchedFile.content.path;
			normalizedName = fetchedFile.content.name;
			fetchedFile = await virtualFS.readfile(
				normalizedPath,
				normalizedName
			);
		}

		// Open the real app
		const exe = await getNeededApp({
			item: fetchedFile,
			path: normalizedPath,
			name: normalizedName,
		});
		openApp(exe);

		// Close this shortcut app
		const thisApp = openedApps.find(
			(app) => app.executable.config.name === name
		);
		if (thisApp) closeApp(thisApp.id);
	};

	useEffect(() => {
		if (!ranRef.current) {
			ranRef.current = true;
			handleOpen();
		}
	}, []);

	return <div>{name} shortcut</div>;
};

export default Shortcut;
