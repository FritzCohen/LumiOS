import { useState } from "react";
import { useFirstStartProps } from "../useFirstStart";
import { useFolderWatcher } from "../../../../api/useFolderWatcher";
import { File } from "../../../../api/types";
import { ColorTheme } from "../../../../../context/user/userTypes";
import { useUser } from "../../../../../context/user/user";

const Themes: React.FC<{ userPrefab: useFirstStartProps }> = ({
	userPrefab,
}) => {
	const [themes, setThemes] = useState<ColorTheme[]>([]);
	const { applyTheme } = useUser();

	useFolderWatcher("System/Themes/", (entries) => {
		const themes = Object.values(entries)
			.filter(
			(entry): entry is File =>
				entry.type === "file" && entry.fileType === "theme"
			)
			.map((file) => file.content as ColorTheme);

		setThemes(themes);
	});

	const handleThemeClick = async (theme: ColorTheme) => {
		userPrefab.setThemeIndex(theme.name);
		userPrefab.updateField("colorTheme", theme);

		applyTheme(theme);
	};

	return (
		<div>
			<div className="flex flex-wrap gap-4 mb-5 px-4">
				{themes.map((theme) => {
					const isActive = userPrefab.themeIndex === theme.name;

					return (
						<div
							key={theme.name}
							onClick={() => handleThemeClick(theme)}
							className={`cursor-pointer rounded-lg shadow-lg transform transition-all duration-200 ${
								userPrefab.themeIndex !== ""
									? isActive
										? "shadow-xl brightness-105"
										: "brightness-75"
									: ""
							}`}
						>
							{/* Theme preview card */}
							<div
								className="flex flex-col w-24 h-32 rounded-lg overflow-hidden"
								style={{
									backgroundColor: theme.colors.background,
								}}
							>
								{/* Primary color bar */}
								<div
									className="h-1/3 w-full"
									style={{
										backgroundColor: theme.colors.surface,
									}}
								/>
								{/* Secondary color bar */}
								<div
									className="h-1/3 w-full"
									style={{
										backgroundColor:
											theme.colors.accent,
									}}
								/>
								{/* Text preview */}
								<div
									className="h-1/3 w-full flex items-center justify-center text-sm font-semibold"
									style={{ color: theme.text.primary }}
								>
									{theme.name}
								</div>
							</div>
						</div>
					);
				})}
			</div>

			<p className="text-gray-600">
				You'll be able to change these settings later.
			</p>
		</div>
	);
};

export default Themes;
