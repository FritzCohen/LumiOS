import React, { useState, useEffect } from "react";
import { CodeState } from "./codeTypes";
import Button from "../../lib/Button";
import virtualFS from "../../api/virtualFS";
import { FileType } from "../../api/FileTypes";
import Result from "./Tabs/Result";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faArrowRight,
	faFileCirclePlus,
	faFileUpload,
	faFolderOpen,
} from "@fortawesome/free-solid-svg-icons";
import { useKernel } from "../../../hooks/useKernal";
import FileBrowser from "../../gui/components/Popups/FileBrowser";
import { useUser } from "../../../context/user/user";

const Content: React.FC<{ code: CodeState }> = ({ code }) => {
	const {
		directory,
		selectedFile,
		openFilesMap,
		menu,
		openFile,
		setDirectory,
		setOpenFilesMap,
	} = code ?? {};

	const file = selectedFile ? openFilesMap[selectedFile] : null;

	const [editedContent, setEditedContent] = useState<string>("");
	const [fileType, setFileType] = useState<FileType | null>(null);
	const { openApp } = useKernel();
	const { userDirectory } = useUser();

	// Sync editor content with selected file
	useEffect(() => {
		if (!file) return;
		setEditedContent((prev) => {
			return prev === "" || prev !== file.content
				? (file.content as string)
				: prev;
		});
		setFileType(file.fileType);
	}, [file]);

	const handleSave = async () => {
		if (!selectedFile || !fileType) return;

		const parts = selectedFile.split("/");
		const fileName = parts.pop()!;
		const dirPath = "/" + parts.filter(Boolean).join("/") + "/"; // always ensure trailing slash

		await virtualFS.updateFile(dirPath, fileName, editedContent, fileType);

		setOpenFilesMap((prev: any) => {
			const oldFile = prev[selectedFile!];
			if (!oldFile) return prev;
			return {
				...prev,
				[selectedFile!]: {
					...oldFile,
					content: editedContent,
				},
			};
		});
	};

	const handleOpenFile = async (name: string, allowCreation: boolean) => {
		const dir =
			directory?.includes("null") || directory?.includes("undefined")
				? userDirectory
				: directory;

		openApp({
			config: {
				name: name,
				displayName: name,
				permissions: 0,
				icon: "",
			},
			mainComponent: (props) => (
				<FileBrowser
					{...props}
					typeFilter="file"
					fileTypeFilter=""
					direct={dir || ""}
					allowFileCreation={allowCreation}
					allowFolderCreation={allowCreation}
					showNameInput={allowCreation}
					setDirect={() => {}} // can implement if needed
					onComplete={(value, path, name) => {
						// value here is the file object, path is directory path, name is filename
						if (!path || !name) return;

						// Construct full path to file
						const fullFilePath = `${path}/${name}`;

						// Open file in editor
						openFile(fullFilePath);

						// Optionally setSelectedFile(fullFilePath); but openFile usually does that
					}}
				/>
			),
		});
	};
	const handleOpenFolder = async () => {
		openApp({
			config: {
				name: "Open Folder",
				displayName: "Open Folder",
				permissions: 0,
				icon: "",
			},
			mainComponent: (props) => (
				<FileBrowser
					{...props}
					typeFilter="directory"
					fileTypeFilter=""
					direct=""
					allowFolderCreation={true}
					showConfirm={true}
					setDirect={() => {}}
					onComplete={(_, path, name) => {
						setDirectory(`${path}/${name}/`);
					}}
				/>
			),
		});
	};

	if (menu === 2 && file) {
		return (
			<div className="p-4 w-full h-full bg-white text-black flex flex-col">
				<div className="mb-2">
					<Button onClick={handleSave}>Save</Button>
				</div>
				<textarea
					value={editedContent}
					onChange={(e) => setEditedContent(e.target.value)}
					className="flex-grow w-full h-full p-2 resize-none"
				/>
			</div>
		);
	}

	switch (menu) {
		case 1:
			return <div className="p-4 text-gray-700">File</div>;
		case 3:
			return <Result code={code} />;
		default:
			return (
				<div className="flex flex-col gap-4 p-4 text-black">
					<h1 className="text-xl">Get Started</h1>
					<h3 className="text-gray-500">Editing not evolved</h3>
					<div className="flex flex-col gap-1">
						<h6 className="font-light text-lg">
							Start <FontAwesomeIcon icon={faArrowRight} />
						</h6>
						<p
							className="cursor-pointer text-blue-400 hover:underline"
							onClick={() => handleOpenFile("New File", true)}
						>
							New file <FontAwesomeIcon icon={faFileCirclePlus} />
						</p>
						<p
							className="cursor-pointer text-blue-400 hover:underline"
							onClick={() => handleOpenFile("Open File", false)}
						>
							Open file <FontAwesomeIcon icon={faFileUpload} />
						</p>
						<p
							className="cursor-pointer text-blue-400 hover:underline"
							onClick={handleOpenFolder}
						>
							Open folder <FontAwesomeIcon icon={faFolderOpen} />
						</p>
					</div>
				</div>
			);
	}
};

export default Content;
