import { useEffect } from "react";
import virtualFS from "./virtualFS";
import { Directory } from "./types";

/**
 * Automatically saves the OS data every 3 minutes, and upon closing.
 *
 * Data is stored in 3 saves, each moving down in date.
 *
 * @returns null
 */
export default function AutoSave() {
	useEffect(() => {
		const performSave = async () => {
			try {
				// Deep clone the root so we can modify safely
				const rawData = virtualFS.getRoot();
				const data = structuredClone(rawData);

				// Remove autosave folder from the cloned data
				if ((data.children?.System as Directory)?.children?.AutoSaves) {
					delete (data.children.System as Directory).children.AutoSaves;
				}

				// Shift old saves with safe fallbacks
				try {
					const save2 = await virtualFS.readfile(
						"System/AutoSaves/",
						"save2"
					);
					if (save2?.content) {
						await virtualFS.deleteFile("System/AutoSaves/", "save3");
						await virtualFS.writeFile(
							"System/AutoSaves/",
							"save3",
							save2.content,
							"txt"
						);
					}
				} catch { /* */ }

				try {
					const save1 = await virtualFS.readfile(
						"System/AutoSaves/",
						"save1"
					);
					if (save1?.content) {
						await virtualFS.deleteFile("System/AutoSaves/", "save2");
						await virtualFS.writeFile(
							"System/AutoSaves/",
							"save2",
							save1.content,
							"txt"
						);
					}
				} catch { /* */ }

				// Save current (cleaned) data to slot 1
				await virtualFS.deleteFile("System/AutoSaves/", "save1");
				await virtualFS.writeFile(
					"System/AutoSaves/",
					"save1",
					JSON.stringify(data),
					"txt"
				);
			} catch (err) {
				console.error("Autosave failed:", err);
			}
		};

		const interval = setInterval(performSave, 3 * 60 * 1000); // Save every 3 minutes
		window.addEventListener("beforeunload", performSave);

		return () => {
			clearInterval(interval);
			window.removeEventListener("beforeunload", performSave);
		};
	}, []);

	return null;
}
