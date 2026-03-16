import React from "react";
import Input from "../../lib/Input";

type Props = {
	name: string;
	description: string;
	pinned: boolean;
	shortcut: boolean;
	uploadAsApp: boolean;
	icon: File | null;
	setName: (v: string) => void;
	setDescription: (v: string) => void;
	setPinned: (v: boolean) => void;
	setShortcut: (v: boolean) => void;
	setUploadAsApp: (v: boolean) => void;
	setIcon: (f: File | null) => void;
};

const AppCreatorForm: React.FC<Props> = ({
	name,
	description,
	pinned,
	shortcut,
	uploadAsApp,
	icon,
	setName,
	setDescription,
	setPinned,
	setShortcut,
	setUploadAsApp,
	setIcon,
}) => {
	return (
		<div className="space-y-4 py-2 w-full">
			{/* Name Input */}
			<div className="p-4 rounded-lg shadow-sm bg-surfaceAlt">
				<div className="flex flex-col">
					<label className="font-semibold mb-1">Name</label>
					<Input
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="Enter app or game name"
						className="input-like-select"
					/>
				</div>

				{/* Description */}
				<div className="flex flex-col">
					<label className="font-semibold mb-1">Description</label>
					<textarea
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						className="input-like-select resize-none h-20"
					/>
				</div>
			</div>

			{/* Icon Upload */}
			<div>
				<label
					htmlFor="icon-upload"
					className="ripple-button inline-block cursor-pointer"
				>
					{icon ? icon.name : "Choose Icon"}
				</label>
				<input
					id="icon-upload"
					type="file"
					accept=".svg,.png,.jpg,.jpeg"
					onChange={(e) => setIcon(e.target.files?.[0] || null)}
					className="hidden"
				/>
			</div>

			{/* Checkboxes */}
			<div className="flex flex-wrap gap-4 mt-2 w-full p-4 rounded-lg shadow-sm bg-surface">
				{/* Taskbar */}
				<div className="flex items-center gap-4 w-full">
					<div className="flex-1 min-w-0">
						<h4 className="text-lg font-semibold">
							Pin to taskbar
						</h4>
						<p className="text-sm opacity-70">
							Add the shortcut to the taskbar after installing.
						</p>
					</div>

					<select
						value={pinned ? "enable" : "disable"}
						onChange={(e) => setPinned(e.target.value === "enable")}
						className="input-like-select !w-fit shrink-0"
					>
						<option value="enable">Enabled</option>
						<option value="disable">Disabled</option>
					</select>
				</div>

				{/* Desktop shortcut */}
				<div className="flex items-center gap-4 w-full">
					<div className="flex-1 min-w-0">
						<h4 className="text-lg font-semibold">
							Desktop Shortcut
						</h4>
						<p className="text-sm opacity-70">
							Add the shortcut to the desktop after installing.
						</p>
					</div>

					<select
						value={shortcut ? "enable" : "disable"}
						onChange={(e) =>
							setShortcut(e.target.value === "enable")
						}
						className="input-like-select !w-fit shrink-0"
					>
						<option value="enable">Enabled</option>
						<option value="disable">Disabled</option>
					</select>
				</div>

				{/* As app */}
				<div className="flex items-center gap-4 w-full">
					<div className="flex-1 min-w-0">
						<h4 className="text-lg font-semibold">Upload as App</h4>
						<p className="text-sm opacity-70">
							Uploads the file/folder as an app. Enabled by
							default.
						</p>
					</div>

					<select
						value={uploadAsApp ? "enable" : "disable"}
						onChange={(e) =>
							setUploadAsApp(e.target.value === "enable")
						}
						className="input-like-select !w-fit shrink-0"
					>
						<option value="enable">Enabled</option>
						<option value="disable">Disabled</option>
					</select>
				</div>
			</div>
		</div>
	);
};

export default AppCreatorForm;
