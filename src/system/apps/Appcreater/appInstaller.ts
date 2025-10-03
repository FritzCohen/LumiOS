import JSZip from "jszip";
import virtualFS from "../../api/virtualFS";
import { arrayBufferToBase64, fileToDataUrl } from "./fileUtils";
import { FileType } from "../../api/FileTypes";

type InstallOptions = {
	name: string;
	description: string;
	icon: File | null;
	userDirectory: string;
	uploadAsApp: boolean;
	pinned: boolean;
	shortcut: boolean;
};

export async function installApp(files: FileList, opts: InstallOptions) {
	const { name, description, icon, userDirectory, uploadAsApp } = opts;
	const basePath = `${userDirectory}/DownloadedGames/${name}`;

	if (files.length > 1) {
		// FOLDER UPLOAD
		await ensureDir(userDirectory, name);
		await handleFolder(files, basePath);
		if (uploadAsApp) await processIndexFile(basePath, files, opts);
		return `Folder installed to DownloadedGames/${name}!`;
	}

	const file = files[0];

	if (file.name.endsWith(".zip")) {
		// ZIP UPLOAD
		await ensureDir(userDirectory, name);
		await handleZip(file, basePath);
		if (uploadAsApp) await processIndexFile(basePath, files, opts);
		return `ZIP unpacked to DownloadedGames/${name}!`;
	}

	// SINGLE FILE APP
	await handleSingle(file, { name, description, icon, userDirectory });
	return `Single file App "${name}" installed to /Apps/!`;
}

// ---------------- HELPERS ----------------

async function ensureDir(userDirectory: string, name: string) {
	if (!(await virtualFS.exists(`${userDirectory}/DownloadedGames/`, name))) {
		await virtualFS.writeDirectory(
			`${userDirectory}/DownloadedGames/`,
			name,
			1
		);
	}
}

async function handleFolder(files: FileList, basePath: string) {
	await Promise.all(
		Array.from(files).map(async (file) => {
			const relPath = file.webkitRelativePath || file.name;
			const ext = relPath.split(".").pop() || "";

			if (["js", "css", "html", "json", "txt"].includes(ext)) {
				const content = await file.text();
				await virtualFS.writeFile(
					`${basePath}/`,
					relPath,
					content,
					ext as FileType
				);
			} else {
				const buffer = await file.arrayBuffer();
				const base64 = arrayBufferToBase64(buffer);
				await virtualFS.writeFile(
					`${basePath}/`,
					relPath,
					base64,
					ext as FileType
				);
			}
		})
	);
}

async function handleZip(file: File, basePath: string) {
	const zip = await JSZip.loadAsync(file);
	await Promise.all(
		Object.keys(zip.files).map(async (filename) => {
			const entry = zip.files[filename];
			if (entry.dir) return;

			const ext = filename.split(".").pop() || "";

			if (["js", "css", "html", "json", "txt"].includes(ext)) {
				const content = await entry.async("string");
				await virtualFS.writeFile(
					`${basePath}/`,
					filename,
					content,
					ext as FileType
				);
			} else {
				const buffer = await entry.async("arraybuffer");
				const base64 = arrayBufferToBase64(buffer);
				await virtualFS.writeFile(
					`${basePath}/`,
					filename,
					base64,
					ext as FileType
				);
			}
		})
	);
}

async function handleSingle(
	file: File,
	opts: {
		name: string;
		description: string;
		icon: File | null;
		userDirectory: string;
	}
) {
	const { name, description, icon, userDirectory } = opts;

	return new Promise<void>((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = async () => {
			try {
				const appData = {
					name,
					description,
					userInstalled: true,
					svg: icon ? await fileToDataUrl(icon) : "",
					fileContent: reader.result,
				};

				await virtualFS.writeFile(
					`${userDirectory}/Apps/`,
					`${name}.exe`,
					JSON.stringify(appData),
					"exe"
				);

				resolve();
			} catch (err) {
				reject(err);
			}
		};
		reader.onerror = reject;
		reader.readAsText(file);
	});
}

// process the shortcut/pinned options as a shortcut
export async function processIndexFile(
  basePath: string,
  files: FileList,
  opts: InstallOptions
) {
  const { name: appName, pinned, shortcut, uploadAsApp, userDirectory } = opts;

  // find index.html and capture its relative path
  let indexFile: File | null = null;
  let indexRelPath = "";
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const rel = f.webkitRelativePath || f.name;
    if (rel.endsWith("index.html")) {
      indexFile = f;
      indexRelPath = rel;
      break;
    }
  }

  if (!indexFile) {
    console.log("No index.html found in", basePath);
    return;
  }

  try {
    // logs for debugging
    console.log("Found index.html");
    console.log(" - filename:", indexFile.name);       // "index.html"
    console.log(" - relativePath:", indexRelPath);     // "example-path/index.html"
    console.log(" - basePath:", basePath);             // "/Users/f/.../DownloadedGames/vark"

    // read and log index content (truncated)
    const indexContent = await indexFile.text();
    console.log(" - content (first 500 chars):", indexContent.slice(0, 500));

    // IMPORTANT: payload must be an object:
    //   name => include the folder prefix (indexRelPath)
    //   path => only the base folder (basePath)
    const shortcutPayload = {
      name: indexRelPath, // includes "example-path/index.html"
      path: basePath,     // NOT including the filename
    };

    const shortcutFileName = `${appName}.shortcut`; // e.g. "vark.shortcut"

    if (uploadAsApp) {
      await virtualFS.writeFile(
        `${userDirectory}/Apps/`,
        shortcutFileName,
        shortcutPayload,
        "shortcut"
      );
      console.log("Wrote app shortcut to Apps/", shortcutFileName);
    }

    if (pinned) {
      await virtualFS.writeFile(
        `${userDirectory}/Taskbar/`,
        shortcutFileName,
        shortcutPayload,
        "shortcut"
      );
      console.log("Wrote shortcut to Taskbar/", shortcutFileName);
    }

    if (shortcut) {
      await virtualFS.writeFile(
        `${userDirectory}/Desktop/`,
        shortcutFileName,
        shortcutPayload,
        "shortcut"
      );
      console.log("Wrote shortcut to Desktop/", shortcutFileName);
    }
  } catch (err) {
    console.error("Error processing index.html:", err);
  }
}
