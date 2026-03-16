import { useRef, useState } from "react";
import Input from "../../../lib/Input";
import { ColorTheme } from "../../../../context/user/userTypes";
import ColorPickerInput from "../../../lib/ColorPicker";
import Button from "../../../lib/Button";

const CreateTheme: React.FC<{ initialTheme?: ColorTheme }> = ({ initialTheme }) => {
	const anchorRef = useRef(null);

	const [theme, setTheme] = useState<ColorTheme>(initialTheme || {
		name: "",
		colors: {
			background: "",
			backgroundAlt: "",
			surface: "",
			surfaceAlt: "",
			accent: "",
			accentAlt: "",
			danger: "",
			success: "",
		},
		text: {
			primary: "",
			secondary: "",
			disabled: "",
		},
		border: {
			default: "",
			subtle: "",
		},
	});

    const handleSave = async () => {
        
    };

	return (
		<div className="flex flex-col gap-4 pb-4">
			{/* DESCRIPTIONS */}
			<div className="p-4 rounded-lg shadow bg-surfaceAlt">
				<label className="font-semibold text-2xl">Name</label>
				<Input
					value={theme.name}
					onChange={(e) =>
						setTheme({ ...theme, name: e.target.value })
					}
				/>
			</div>

			{/* Colors */}
			<div className="p-4 rounded-lg shadow bg-surfaceAlt">
				<label className="font-semibold text-2xl">Color</label>

				<div className="flex flex-col w-full gap-2">
					{Object.entries(theme.colors).map(([key, value]) => (
						<div
							key={key}
							className="grid grid-cols-[140px_1fr] items-center gap-3 w-full bg-surface p-2 rounded-md shadow"
						>
							<label className="text-sm capitalize">{key}</label>

							<ColorPickerInput
								value={value}
								ref={anchorRef}
								onChange={(newColor) =>
									setTheme((prev) => ({
										...prev,
										colors: {
											...prev.colors,
											[key]: newColor,
										},
									}))
								}
								className="w-full"
							/>
						</div>
					))}
				</div>
			</div>
            {/* Text */}
            <div className="p-4 rounded-lg shadow bg-surfaceAlt">
				<label className="font-semibold text-2xl">Text</label>

				<div className="flex flex-col w-full gap-2">
					{Object.entries(theme.text).map(([key, value]) => (
						<div
							key={key}
							className="grid grid-cols-[140px_1fr] items-center gap-3 w-full bg-surface p-2 rounded-md shadow"
						>
							<label className="text-sm capitalize">{key}</label>

							<ColorPickerInput
								value={value}
								ref={anchorRef}
								onChange={(newTextColor) =>
									setTheme((prev) => ({
										...prev,
										text: {
											...prev.text,
											[key]: newTextColor,
										},
									}))
								}
								className="w-full"
							/>
						</div>
					))}
				</div>
			</div>
            {/* Border */}
            <div className="p-4 rounded-lg shadow bg-surfaceAlt">
				<label className="font-semibold text-2xl pb-5">Border</label>

				<div className="flex flex-col w-full gap-2">
					{Object.entries(theme.border).map(([key, value]) => (
						<div
							key={key}
							className="grid grid-cols-[140px_1fr] items-center gap-3 w-full bg-surface p-2 rounded-md shadow"
						>
							<label className="text-sm capitalize">{key}</label>

							<ColorPickerInput
								value={value}
								ref={anchorRef}
								onChange={(newBorder) =>
									setTheme((prev) => ({
										...prev,
										border: {
											...prev.border,
											[key]: newBorder,
										},
									}))
								}
								className="w-full"
							/>
						</div>
					))}
				</div>
			</div>

            <Button onClick={handleSave}>Submit Theme</Button>
		</div>
	);
};

export default CreateTheme;
