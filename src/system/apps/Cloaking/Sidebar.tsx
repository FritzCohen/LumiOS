import { IconDefinition } from "@fortawesome/fontawesome-common-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Sidebar: React.FC<{
	menuItems: { id: number; label: string; icon: IconDefinition | string }[];
    menu: number;
    setMenu: (value: number) => void; 
}> = ({ menuItems, menu, setMenu }) => {
	return (
		<div className="controlpanel-sidebar">
			<h3 className="pt-2">Cloaking</h3>
			{menuItems.map((item) => (
				<div
					key={item.id}
					className={`controlpanel-sidebar-item relative cursor-pointer ${
						menu === item.id ? "active" : ""
					}`}
					onClick={() => setMenu(item.id)}
				>
					{item.icon && typeof item.icon === "string" ? (
						item.icon.trim().startsWith("<svg") ||
						item.icon.trim().startsWith("<img") ? (
							<div
								className="w-full h-full p-2 invert"
								dangerouslySetInnerHTML={{
									__html: item.icon,
								}}
							/>
						) : (
							<img
								src={item.icon}
								alt={item.label}
								className="w-8 h-8 p-1"
							/>
						)
					) : (
						<FontAwesomeIcon icon={item.icon as any} />
					)}
					{item.label}

					{menu === item.id && (
						<div className="absolute left-0 h-full w-1 bg-blue-500 rounded"></div>
					)}
				</div>
			))}
		</div>
	);
};

export default Sidebar;
