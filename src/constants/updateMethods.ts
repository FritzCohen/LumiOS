// handles each of the 3 update methods.

import defaultFS from "../system/api/defaultFS";
import virtualFS from "../system/api/virtualFS";
import deepMerge from "./deepMerge";

export const updateHardware = async () => {
	const response = await fetch(
		"https://raw.githubusercontent.com/LuminesenceProject/LumiOS/main/Info.json",
	);

	if (!response.ok) {
		throw new Error(`HTTP error! Status: ${response.status}`);
	}

	const data = await response.json();
	const newVersion = data[0].version;

	// Fetch the new build
	const buildResponse = await fetch(
		"https://raw.githubusercontent.com/FritzCohen/LumiOS/refs/heads/main/index.html",
	);

	if (!buildResponse.ok) {
		throw new Error(`Build fetch error! Status: ${buildResponse.status}`);
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
};

export const updateSoftware = async () => {
	const originalFS = virtualFS.getRoot();

	const newFileSystem = deepMerge(originalFS, defaultFS.root);

	await virtualFS.setRoot(newFileSystem);
};

export async function updateHardwareInPlace() {
	// 1. Force user to select a file
	const [handle] = await (window as any).showOpenFilePicker({
		types: [
			{
				description: "LumiOS HTML Build",
				accept: { "text/html": [".html"] },
			},
		],
		multiple: false,
	});

	const file = await handle.getFile();

	// 2. HARD rejection rules
	if (!file.name.endsWith(".html")) {
		throw new Error("Selected file is not an HTML file.");
	}

	if (!file.name.toLowerCase().includes("lumios")) {
		throw new Error("This is not a LumiOS file.");
	}

	const existingContent = await file.text();
	if (!existingContent.includes("<!-- LUMIOS BUILD -->")) {
		throw new Error("Invalid LumiOS build signature.");
	}

	// 3. Fetch version info
	const infoRes = await fetch(
		"https://raw.githubusercontent.com/LuminesenceProject/LumiOS/main/Info.json",
	);
	if (!infoRes.ok) {
		throw new Error(`Version fetch failed: ${infoRes.status}`);
	}

	const info = await infoRes.json();
	const newVersion = info[0].version;

	// 4. Fetch updated build
	const buildRes = await fetch(
		"https://raw.githubusercontent.com/FritzCohen/LumiOS/refs/heads/main/index.html",
	);
	if (!buildRes.ok) {
		throw new Error(`Build fetch failed: ${buildRes.status}`);
	}

	let newHtml = await buildRes.text();

	// 5. Stamp version (optional but recommended)
	newHtml = newHtml.replace(
		"<!-- LUMIOS BUILD -->",
		`<!-- LUMIOS BUILD v${newVersion} -->`,
	);

	// 6. Write directly to the selected file
	const writable = await handle.createWritable();
	await writable.write(newHtml);
	await writable.close();
}
