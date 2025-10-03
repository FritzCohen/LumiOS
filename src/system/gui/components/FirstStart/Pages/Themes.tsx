import { useEffect, useState } from "react";
import { Theme } from "../../../../../types/globals";
import virtualFS from "../../../../api/virtualFS";
import { useFirstStartProps } from "../useFirstStart";

type ModifiedTheme = { name: string; value: Theme };

const Themes: React.FC<{ userPrefab: useFirstStartProps }> = ({
	userPrefab,
}) => {
	const [themes, setThemes] = useState<ModifiedTheme[]>([]);

	useEffect(() => {
		const getThemes = async () => {
			const storedThemes = await virtualFS.readdir("System/Themes/");

			const combinedValues: ModifiedTheme[] = Object.keys(storedThemes)
				.map((name) => {
					const item = storedThemes[name];
					if (item.type === "directory") return null;
					return { name, value: item.content as Theme };
				})
				.filter((t): t is ModifiedTheme => t !== null);

			setThemes(combinedValues);
		};

		getThemes();
	}, []);

	const handleThemeClick = async (theme: ModifiedTheme) => {
		userPrefab.setThemeIndex(theme.name);
		userPrefab.updateField("theme.window", theme.value);
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
									backgroundColor: theme.value.secondary,
								}}
							>
								{/* Primary color bar */}
								<div
									className="h-1/3 w-full"
									style={{
										backgroundColor: theme.value.primary,
									}}
								/>
								{/* Secondary color bar */}
								<div
									className="h-1/3 w-full"
									style={{
										backgroundColor:
											theme.value.secondaryLight,
									}}
								/>
								{/* Text preview */}
								<div
									className="h-1/3 w-full flex items-center justify-center text-sm font-semibold"
									style={{ color: theme.value.textBase }}
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
