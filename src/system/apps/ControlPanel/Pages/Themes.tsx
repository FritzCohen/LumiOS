// Component was a modifed Commands.tsx component

import { useState, useEffect } from "react";

import virtualFS from "../../../api/virtualFS.ts";
import useGetThemes from "../../../../hooks/useGetThemes.ts";
import { ColorTheme } from "../../../../context/user/userTypes.ts";
import CreateTheme from "./CreateTheme.tsx";

const ControlThemes = ({
	setLayoutBack,
}: {
	setLayoutBack: (fn?: () => void) => void;
}) => {
	const [current, setCurrent] = useState<0 | 1 | 2 | 3>(0);
	const [selectedCommand, setSelectedCommand] =
		useState<ColorTheme | null>(null);

	// -------------------------
	// BACK BUTTON CONTROL
	// -------------------------
	useEffect(() => {
		if (current === 0) setLayoutBack(undefined);
		else setLayoutBack(() => () => setCurrent(0));
	}, [current, setLayoutBack]);

    const themes = useGetThemes();

	const saveTheme = async (theme: ColorTheme) => {
		await virtualFS.updateItem(
            "System/Themes/",
            theme.name,
            "content",
            theme,
        )
	};


	// -------------------------
	// ROUTING
	// -------------------------
	switch (current) {
		case 1:
			return (
				<div className="script-column">
					{Object.values(themes).map((cmd, index) => (
						<div
							key={index}
							onClick={() => {
								setSelectedCommand(cmd);
								setCurrent(3);
							}}
						>
							{cmd.name}
						</div>
					))}
				</div>
			);

		case 2:
			return <CreateTheme initialTheme={selectedCommand || undefined} />;

		case 3:
			return selectedCommand ? (
				<CreateTheme initialTheme={selectedCommand} />
			) : (
				<div>No command selected</div>
			);

		default:
			return (
				<div className="script-column">
					<div onClick={() => setCurrent(1)}>Manage Themes</div>
					<div onClick={() => setCurrent(2)}>Create Themes</div>
				</div>
			);
	}
};

export default ControlThemes;