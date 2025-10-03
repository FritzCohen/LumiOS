import { useEffect, useState, useCallback } from "react";
import { Theme } from "../../../types/globals";
import { useWindow } from "../../../context/window/WindowProvider";
import { useUser } from "../../../context/user/user";
import virtualFS from "../../api/virtualFS";
import { File } from "../../api/types";
import { images } from "../../../constants/constants";
import useApplyTheme from "../../../hooks/useApplyTheme";

const Themes = () => {
	const [themes, setThemes] = useState<{ value: Theme; name: string }[]>([]);
	const { systemProps, updateSystemProps } = useWindow();
	const { currentUser, modifyUserProp } = useUser();
	const { setFullTheme, setBackgroundImage } = useApplyTheme(currentUser);

	// Load themes once
	useEffect(() => {
		let isMounted = true;

		const getThemes = async () => {
			try {
				const storedThemes = await virtualFS.readdir("System/Themes");
				const themeData = Object.keys(storedThemes).map((name) => ({
					name,
					value: (storedThemes[name] as File).content as Theme,
				}));
				if (isMounted) setThemes(themeData);
			} catch (error) {
				console.error("Error loading themes:", error);
			}
		};

		getThemes();
		return () => {
			isMounted = false;
		};
	}, []);

	const applyImage = useCallback(
		(index: number) => {
			const selectedImage = images[index];

            setBackgroundImage(selectedImage, true);
		},
		[currentUser, modifyUserProp]
	);

	const applyTheme = useCallback(
		async (them: Theme) => {
            if (!currentUser) return;

			setFullTheme({
                ...currentUser.theme,
                window: them,
            }, true);
		},
		[currentUser]
	);

	const handleImageUpload = async (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const file = event.target.files?.[0];

		if (file) {
			const reader = new FileReader();
			reader.onload = async (e: ProgressEvent<FileReader>) => {
				if (e.target?.result && currentUser) {
					const image = e.target.result as string;

                    setBackgroundImage(image, true);
				}
			};
			reader.readAsDataURL(file);
		}
	};

	return (
		<div className="p-5">
			<h2 className="text-2xl font-bold my-2">Themes</h2>
			<select
				onChange={(e) => {
					const selected = themes.find(
						(t) => t.name === e.target.value
					);
					if (selected) {
						applyTheme(selected.value);
					}
				}}
			>
				{themes.map((theme) => (
					<option
						value={theme.name}
						key={theme.name}
						className="option-main"
					>
						{theme.name.charAt(0).toUpperCase() +
							theme.name.slice(1).replace("Theme", "")}
					</option>
				))}
			</select>

			<h2 className="text-2xl font-bold my-2">Taskbar</h2>
			<div className="flex flex-col gap-1 w-fit">
				<select
					defaultValue={systemProps.taskbar.mode}
					onChange={(e) =>
						updateSystemProps(
							"taskbar.mode",
							e.target.value as "full" | "floating"
						)
					}
				>
					<option value="full">Full</option>
					<option value="floating">Floating</option>
				</select>
				<select
					defaultValue={systemProps.taskbar.align}
					onChange={(e) =>
						updateSystemProps(
							"taskbar.align",
							e.target.value as "start" | "center" | "end"
						)
					}
				>
					<option value="start">Start</option>
					<option value="center">Center</option>
					<option value="end">End</option>
				</select>
				<select
					defaultValue={String(!systemProps.taskbar.onHover)}
					onChange={(e) =>
						updateSystemProps(
							"taskbar.onHover",
							Boolean(e.target.value)
						)
					}
				>
					<option value="false">Always seen</option>
					<option value="true">Show on hover</option>
				</select>
			</div>
			<h2 className="text-2xl font-bold my-2">Topbar</h2>
			<div className="flex flex-col gap-1 w-fit">
				<select
					defaultValue={String(systemProps.topbar.visible)}
					onChange={(e) =>
						updateSystemProps(
							"topbar.visible",
							Boolean(e.target.value)
						)
					}
				>
					<option value="true">Show</option>
					<option value="false">Hide</option>
				</select>
				<select
					defaultValue={String(!systemProps.topbar.onHover)}
					onChange={(e) =>
						updateSystemProps(
							"topbar.onHover",
							Boolean(e.target.value)
						)
					}
				>
					<option value="false">Always seen</option>
					<option value="true">Show on hover</option>
				</select>
			</div>
			<h2 className="text-2xl font-bold my-2">Background for Windows</h2>
			<div className="flex flex-col gap-1 w-fit">
				<select
					defaultValue={String(
						systemProps.appearance.enableWindowBackground
					)}
					onChange={(e) =>
						updateSystemProps(
							"appearance.enableWindowBackground",
							Boolean(e.target.value)
						)
					}
				>
					<option value="true">Enabled</option>
					<option value="false">Disabled</option>
				</select>
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

			<div className="grid grid-cols-2 gap-2">
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
