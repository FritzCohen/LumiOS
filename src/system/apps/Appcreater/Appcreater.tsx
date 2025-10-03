import React, { useState } from "react";
import { useUser } from "../../../context/user/user";
import FileUploader from "./FileUploader";
import { installApp } from "./appInstaller";
import AppCreatorForm from "./AppcreatorForm";

const AppCreator = () => {
	const { userDirectory } = useUser();

	const [name, setName] = useState("");
	const [message, setMessage] = useState("");
	const [pinned, setPinned] = useState(false);
	const [shortcut, setShortcut] = useState(false);
	const [uploadAsApp, setUploadAsApp] = useState(false);
	const [description, setDescription] = useState("");
	const [icon, setIcon] = useState<File | null>(null);

	const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files || files.length === 0) return;
		if (!name.trim()) {
			setMessage("You must type a name first.");
			return;
		}

		try {
			const msg = await installApp(files, {
				name,
				description,
				icon,
				userDirectory,
				uploadAsApp,
				shortcut,
				pinned,
			});
			setMessage(msg);
		} catch (err) {
			console.error(err);
			setMessage("Error installing app");
		}
	};

	return (
		<div className="text-text-base p-6 rounded-md shadow overflow-scroll h-full w-full">
			<h3 className="font-bold text-2xl mb-4">App Creator</h3>

			<AppCreatorForm
				name={name}
				description={description}
				pinned={pinned}
				shortcut={shortcut}
				uploadAsApp={uploadAsApp}
				icon={icon}
				setName={setName}
				setDescription={setDescription}
				setPinned={setPinned}
				setShortcut={setShortcut}
				setIcon={setIcon}
				setUploadAsApp={setUploadAsApp}
			/>

			<FileUploader onUpload={handleUpload} />
			<p className="text-sm mt-2">{message}</p>
		</div>
	);
};

export default AppCreator;
