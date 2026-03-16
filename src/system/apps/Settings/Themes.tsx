import { useCallback, useRef } from "react";
import { useUser } from "../../../context/user/user";
import { images, TRANSITIONS_IN_MILLISECONDS } from "../../../constants/constants";
import { ColorTheme } from "../../../context/user/userTypes";
import useGetThemes from "../../../hooks/useGetThemes";

const Themes = () => {
	const {
		currentUser,
		modifyUserProp,
		applyTheme: applyThemes,
		applyBackground,
	} = useUser();

	const themes = useGetThemes();

	const applyImage = useCallback(
		(index: number) => {
			if (!currentUser) return;

			const selectedImage = images[index];

			applyBackground(selectedImage, true);
		},
		[currentUser, applyBackground]
	);

	const applyTheme = useCallback(
		async (them: ColorTheme) => {
			if (!currentUser) return;

			applyThemes(them, true);
		},
		[currentUser, applyThemes]
	);

	const handleImageUpload = async (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const file = event.target.files?.[0];
		if (!file) return;

		const reader = new FileReader();

		reader.onload = () => {
			const dataUrl = reader.result as string;
			applyBackground(dataUrl, true);
		};

		reader.readAsDataURL(file);
	};

	// Ref for debounce
	const glassAlphaTimeout = useRef<NodeJS.Timeout | null>(null);

	const handleGlassAlphaChange = (value: number) => {
		if (!currentUser) return;

		// Clear previous timeout
		if (glassAlphaTimeout.current) clearTimeout(glassAlphaTimeout.current);

		// Set a new timeout to save after some inactivity
		glassAlphaTimeout.current = setTimeout(() => {
			modifyUserProp(currentUser.username, "uiStyle.globalGlassAlpha", value);
		}, TRANSITIONS_IN_MILLISECONDS.ON_DRAG_END);
	};

	return (
		<div className="p-5">
			{/* Theme selections */}
			<h2 className="font-semibold text-xl mb-2">Themes</h2>
			<div className="space-y-4 bg-surface rounded-md p-2 shadow">
				{/* Color Theme */}
				<div className="flex justify-between items-center">
					<div>
						<h4 className="text-lg font-semibold">Color Theme</h4>
						<p className="text-sm opacity-70">
							Choose a preset color style.
						</p>
					</div>

					<select
						className="ml-4"
						onChange={(e) => {
							const selected = themes.find(
								(t) => t.name === e.target.value
							);
							if (selected) applyTheme(selected);
						}}
					>
						{themes.map((theme) => (
							<option
								key={theme.name}
								value={theme.name}
								className="option-main"
							>
								{theme.name}
							</option>
						))}
					</select>
				</div>

				{/* Global Opacity */}
				<div className="flex justify-between items-center">
					<div>
						<h4 className="text-lg font-semibold">
							Global Opacity
						</h4>
						<p className="text-sm opacity-70">
							Controls transparency of UI elements.
						</p>
					</div>

					<input
						type="range"
						min={0}
						max={1}
						step={0.01}
						className="ml-4"
						defaultValue={currentUser?.uiStyle.globalGlassAlpha ?? 0.75}
						onChange={(e) => handleGlassAlphaChange(Number(e.target.value))}
					/>
				</div>
			</div>

			{/* Taskbar */}
			<h2 className="text-2xl font-bold my-2">Taskbar</h2>
			<div className="space-y-4 bg-surface rounded-md p-2 shadow">
				{/* Mode */}
				<div className="flex justify-between items-center">
					<div>
						<h4 className="text-lg font-semibold">Taskbar Style</h4>
						<p className="text-sm opacity-70">
							Choose between full-width or floating.
						</p>
					</div>

					<select
						className="ml-4"
						defaultValue={currentUser?.uiStyle.taskbar.mode}
						onChange={(e) =>
							currentUser &&
							modifyUserProp(
								currentUser.username,
								"uiStyle.taskbar.mode",
								e.target.value as "full" | "floating"
							)
						}
					>
						<option value="full">Full</option>
						<option value="floating">Floating</option>
					</select>
				</div>

				{/* Alignment */}
				<div className="flex justify-between items-center">
					<div>
						<h4 className="text-lg font-semibold">
							Taskbar Alignment
						</h4>
						<p className="text-sm opacity-70">
							Position of the icons.
						</p>
					</div>

					<select
						className="ml-4"
						defaultValue={currentUser?.uiStyle.taskbar.align}
						onChange={(e) =>
							currentUser &&
							modifyUserProp(
								currentUser.username,
								"uiStyle.taskbar.align",
								e.target.value as "start" | "center" | "end"
							)
						}
					>
						<option value="start">Start</option>
						<option value="center">Center</option>
						<option value="end">End</option>
					</select>
				</div>

				{/* Hover behavior */}
				<div className="flex justify-between items-center">
					<div>
						<h4 className="text-lg font-semibold">Visibility</h4>
						<p className="text-sm opacity-70">
							Choose when the taskbar is shown.
						</p>
					</div>

					<select
						className="ml-4"
						defaultValue={String(
							!currentUser?.uiStyle.taskbar.onHover
						)}
						onChange={(e) =>
							currentUser &&
							modifyUserProp(
								currentUser.username,
								"uiStyle.taskbar.onHover",
								e.target.value === "true"
							)
						}
					>
						<option value="false">Always seen</option>
						<option value="true">Show on hover</option>
					</select>
				</div>
			</div>

			{/* Topbar */}
			<h2 className="text-2xl font-bold my-2">Topbar</h2>
			<div className="space-y-4 bg-surface rounded-md p-2 shadow">
				{/* Visibility */}
				<div className="flex justify-between items-center">
					<div>
						<h4 className="text-lg font-semibold">
							Topbar Visibility
						</h4>
						<p className="text-sm opacity-70">
							Choose whether the topbar appears at all.
						</p>
					</div>

					<select
						className="ml-4"
						defaultValue={String(
							currentUser?.uiStyle.topbar.visible
						)}
						onChange={(e) =>
							currentUser &&
							modifyUserProp(
								currentUser.username,
								"uiStyle.topbar.visible",
								e.target.value === "true"
							)
						}
					>
						<option value="true">Show</option>
						<option value="false">Hide</option>
					</select>
				</div>

				{/* Hover mode */}
				<div className="flex justify-between items-center">
					<div>
						<h4 className="text-lg font-semibold">
							Visibility Mode
						</h4>
						<p className="text-sm opacity-70">
							Control whether it's always shown or only on hover.
						</p>
					</div>

					<select
						className="ml-4"
						defaultValue={String(
							!currentUser?.uiStyle.topbar.onHover
						)}
						onChange={(e) =>
							currentUser &&
							modifyUserProp(
								currentUser.username,
								"uiStyle.topbar.onHover",
								e.target.value === "true"
							)
						}
					>
						<option value="false">Always seen</option>
						<option value="true">Show on hover</option>
					</select>
				</div>
			</div>

			<div className="my-2 flex flex-row justify-between items-center">
				<h2 className="text-2xl font-bold my-2">Backgrounds</h2>
				<label htmlFor="file-upload" className="custom-file-upload">
					Upload
				</label>
				<input
					id="file-upload"
					type="file"
					title="Image Upload"
					accept="image/*"
					onChange={handleImageUpload}
				/>
			</div>

			<div className="grid grid-cols-2 gap-2 bg-surfaceAlt p-2 rounded-md">
				{images.map((image, index) => (
					<img
						src={image}
						alt="Default Image"
						loading="lazy"
						className="cursor-pointer transition-all duration-200 hover:brightness-75 hover:shadow-md shadow-sm h-full rounded"
						key={index}
						onClick={() => applyImage(index)}
					/>
				))}
			</div>
		</div>
	);
};

export default Themes;
