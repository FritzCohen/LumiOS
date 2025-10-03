import {
	faFile,
	faFileExport,
	faFolderOpen,
	faPlay,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, useState } from "react";
import virtualFS from "../../api/virtualFS";
import { useKernel } from "../../../hooks/useKernal";
import { File } from "../../api/types";
import { OpenedApp } from "../../../context/kernal/kernal";
import FileBrowser from "../../gui/components/Popups/FileBrowser";

interface NotepadProps {
	defaultPath?: string;
	defaultName?: string;
	file?: File;
	props: OpenedApp;
}

const Notepad: React.FC<NotepadProps> = ({
	defaultPath = "",
	defaultName: n = "",
	file: defaultFile,
	props,
}) => {
	const [name, setName] = useState(n);
	const [directory, setDirectory] = useState(defaultPath);
	const [content, setContent] = useState<any>(null);
	const [file, setFile] = useState<File | undefined>(defaultFile);

	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const { openApp, modifyProp } = useKernel();

	useEffect(() => {
		const loadFile = async () => {
			if (!file && name === "" && directory === "") return;

			if (!file || file.displayName || (file as any).id) {
				const file = await virtualFS.readfile(directory, name);
				setFile(file);

				let contentStr = "";

				switch (file.fileType) {
					case "txt":
					case "js":
					case "css":
					case "html":
					case "shortcut":
						contentStr = file.content as string;
						break;
					case "img":
						// If Uint8Array, convert to base64 string
						if (file.content instanceof Uint8Array) {
							contentStr = btoa(
								String.fromCharCode(...file.content)
							);
						} else {
							contentStr = file.content;
						}
						break;
					default:
						contentStr = JSON.stringify(file.content, null, 2); // pretty JSON for objects like `exe`, `theme`, `sys`
						break;
				}

				setContent(contentStr);

				return;
			}

			setContent(JSON.stringify(file.content));
		};

		loadFile();
	}, [file, directory, name]);

	useEffect(() => {
		if (!props?.id) return;

		const displayed =
			name.length != 0 ? name : props.executable.config.name;

		modifyProp(props.id, "executable", {
			...props.executable,
			config: {
				...props.executable.config,
				displayName: displayed,
			},
		});
	}, [name]);

	const handleOpenFile = async () => {
		openApp({
			config: {
				name: "Open File",
				displayName: "Open File",
				permissions: 0,
				icon: "",
			},
			mainComponent: (props) => (
				<FileBrowser
					{...props}
					typeFilter="file"
					fileTypeFilter=""
					direct={directory}
					allowFileCreation={true}
					allowFolderCreation={true}
					showNameInput={true}
					setDirect={setDirectory}
					onComplete={(value, _, name) => {
						setFile(value as File);
						setName(name);
					}}
				/>
			),
		});
	};

	const handleSave = async () => {
		if (!file) return;

		let fixedContent = content;

		try {
			fixedContent = JSON.parse(content);
		} catch {
			fixedContent = content;
		}

		await virtualFS.updateFile(
			directory,
			name,
			fixedContent,
			file.fileType
		);
	};

	const handleRun = async () => {};

	const handleExport = () => {
		const blob = new Blob([content], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = name || "file.txt";
		link.click();
		URL.revokeObjectURL(url);
	};

	return (
		<div className="flex flex-row text-text-base h-full">
			<div className="flex flex-col relative">
				<button
					className="transition-colors duration-200 hover:bg-secondary p-2 rounded"
					onClick={handleOpenFile}
				>
					<FontAwesomeIcon icon={faFolderOpen} />
				</button>
				<button
					className="transition-colors duration-200 hover:bg-secondary p-2 rounded"
					onClick={handleRun}
				>
					<FontAwesomeIcon icon={faPlay} />
				</button>
				<button
					className="transition-colors duration-200 hover:bg-secondary p-2 rounded"
					onClick={handleSave}
				>
					<FontAwesomeIcon icon={faFile} />
				</button>
				<input
					id="file-input"
					type="file"
					style={{ display: "none" }}
				/>
				<button
					className="transition-colors duration-200 hover:bg-secondary p-2 rounded"
					onClick={handleExport}
				>
					<FontAwesomeIcon icon={faFileExport} />
				</button>
			</div>
			<textarea
				ref={textareaRef}
				value={
					typeof content === "string"
						? content
						: content instanceof Uint8Array
						? Array.from(content)
								.map((b) => String.fromCharCode(b))
								.join("")
						: String(content)
				}
				onChange={(e) => setContent(e.target.value)}
				className="flex-grow h-full w-full p-2"
				style={{ background: "transparent", resize: "none" }}
			/>
		</div>
	);
};

export default Notepad;
