import { NamedDirectory, NamedFile } from "../FileExplorer/fileExplorerTypes";
import { CodeState } from "./codeTypes";
import Button from "../../lib/Button";
import SidebarItem from "./SidebarItem";
import virtualFS from "../../api/virtualFS";
import { useUser } from "../../../context/user/user";
import { useState } from "react";

const Sidebar: React.FC<{ code: CodeState }> = ({ code }) => {
	const {
		directory,
		selectedFile,
		setSelectedFile,
		openFolders,
		toggleFolder,
		handleAddFileOrFolder,
		openFiles,
		content,
		openFile,
	} = code;

	const { currentUser } = useUser();
	const [selectedType, setSelectedType] = useState<"file" | "directory">(
		"file"
	);

	const normalizeFolderPath = (path: string) =>
		path.endsWith("/") ? path : path + "/";

	const normalizeFilePath = (path: string) =>
		path.endsWith("/") ? path.slice(0, -1) : path;

	const handleFileSelect = (filePath: string, isFolder?: boolean) => {
		setSelectedFile(filePath);

		if (!openFiles.includes(filePath) && !isFolder) {
			openFile(filePath);
		}
	};

	const moveFile = async (
		fileName: string,
		fromPath: string,
		toPath: string
	) => {
		if (!currentUser) return;

		await virtualFS.updatedMV(
			fromPath,
			toPath,
			fileName,
			currentUser.permission
		);
	};

	const renderChildren = (
		children: Record<string, NamedDirectory | NamedFile> | undefined,
		parentPath: string
	) => {
		if (!children) return null;

		return Object.entries(children).map(([name, entry], i) => {
			// Build full path
			const fullPath =
				entry.type === "directory"
					? normalizeFolderPath(`${parentPath}${name}`)
					: normalizeFilePath(`${parentPath}${name}`);

			if (entry.type === "directory") {
				const isOpen = openFolders[fullPath] || false;

				return (
					<SidebarItem
						key={i}
						name={name}
						fullPath={fullPath}
						entry={entry}
						selectedFile={selectedFile}
						isOpen={isOpen}
						toggleFolder={toggleFolder}
						handleFileSelect={handleFileSelect}
						moveFile={moveFile}
						renderChildren={() =>
							renderChildren(content[fullPath], fullPath)
						}
					/>
				);
			}

			// File
			return (
				<SidebarItem
					key={i}
					name={name}
					fullPath={fullPath}
					entry={entry}
					selectedFile={selectedFile}
					isOpen={false}
					toggleFolder={() => {}}
					handleFileSelect={handleFileSelect}
					moveFile={moveFile}
					renderChildren={() => null}
				/>
			);
		});
	};

	return (
		<div className="w-64 h-full overflow-y-auto p-2 flex flex-col">
			<div className="text-sm font-semibold mb-2">Explorer</div>
			<div className="flex-grow space-y-1">
				{directory && content[directory]
					? renderChildren(content[directory], directory)
					: // No directory selected, show opened files individually
					  openFiles.map((filePath) => {
							const file =
								content[
									filePath.split("/").slice(0, -1).join("/") +
										"/"
								]?.[filePath.split("/").pop() || ""];

							return (
								<SidebarItem
									key={filePath}
									name={
										file?.name ||
										filePath.split("/").pop() ||
										""
									}
									fullPath={filePath}
									entry={
										file || {
											name:
												filePath.split("/").pop() || "",
											fullPath: filePath,
											type: "file",
										}
									}
									selectedFile={selectedFile}
									isOpen={false}
									toggleFolder={() => {}}
									handleFileSelect={handleFileSelect}
									moveFile={() => {}}
									renderChildren={() => null}
								/>
							);
					  })}
			</div>

			{/* Create new file/folder section */}
			<div className="mt-4">
				<select
					className="mb-2"
					value={selectedType}
					onChange={(e) =>
						setSelectedType(e.target.value as "file" | "directory")
					}
				>
					<option value="file">File</option>
					<option value="directory">Folder</option>
				</select>
				<Button onClick={() => handleAddFileOrFolder(selectedType)}>
					Create New {selectedType === "file" ? "File" : "Folder"}
				</Button>
			</div>
		</div>
	);
};

export default Sidebar;
