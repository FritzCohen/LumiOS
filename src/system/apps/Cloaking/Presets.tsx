import { useUser } from "../../../context/user/user";
import { Shortcut } from "../../../types/globals";

const Presets: React.FC<{ cloaks: Shortcut[] }> = ({ cloaks }) => {
	const { currentUser, applyPanic } = useUser();

	const handlePreset = (cloak: Shortcut) => {
		if (!currentUser) return;

		applyPanic(
			{
				...currentUser.panic,
				title: cloak.name,
				favicon: cloak.path,
			},
			true,
		);
	};

	return (
		<div className="flex flex-col gap-2">
			<h2 className="font-semibold text-xl">Presets</h2>
			<div className="p-4 rounded-lg shadow bg-surfaceAlt grid grid-cols-3 gap-2">
				{cloaks.map((cloak, index) => (
					<div
						key={index}
						className="bg-surface rounded-md shadow flex flex-col items-center justify-center gap-2 p-3 aspect-[3/4] transition-all duration-200 cursor-pointer hover:shadow-lg hover:backdrop-brightness-50"
						onClick={() => handlePreset(cloak)}
					>
						<img
							src={cloak.path}
							alt={`${cloak.name} icon`}
							className="panic-svg-wrapper"
						/>
						<label className="text-sm text-center truncate w-full">
							{cloak.name}
						</label>
					</div>
				))}
			</div>
		</div>
	);
};

export default Presets;
