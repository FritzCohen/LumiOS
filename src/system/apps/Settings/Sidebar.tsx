import { FC, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Input from "../../lib/Input";
import { useUser } from "../../../context/user/user";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import desktopImg from "../../../assets/Icons/thispc.png";
import people from "../../../assets/Icons/people.png";
import security from "../../../assets/Icons/security.png";
import pen from "../../../assets/Icons/Personalisation.webp";
import appIcon from "../../../assets/Icons/Apps.webp";

interface SidebarProps {
	menu: number;
	setMenu: (id: number) => void;
}

const Sidebar: FC<SidebarProps> = ({ menu, setMenu }) => {
	const [input, setInput] = useState("");
	const { currentUser } = useUser();

	const menuItems: {
		id: number;
		label: string;
		icon: IconDefinition | string;
	}[] = [
		{ id: 0, label: "System", icon: desktopImg },
		{ id: 1, label: "Personalization", icon: pen },
		{ id: 2, label: "Apps", icon: appIcon },
		{ id: 3, label: "Accounts", icon: people },
		{ id: 4, label: "Privacy & Security", icon: security },
	];

	return (
		<div className="flex flex-col gap-2 m-2 h-full">
			{currentUser && (
				<div className="flex justify-between items-center h-fit max-h-16 border border-border-default rounded-md shadow-md bg-surface px-2 p-1 ">
					<img
						alt="UserProfile"
						src={
							typeof currentUser?.icon === "string"
								? currentUser.icon
								: ""
						}
						className="w-12 h-12"
					/>
					<div className="flex flex-col">
						<h3 className="font-semibold text-lg">
							{currentUser?.username}
						</h3>
						<p className="text-sm font-light">Local Account</p>
					</div>
				</div>
			)}
			<div className="sidebar bg-backgroundAlt rounded-md mb-4">
				<Input
					type="text"
					onChange={(e) => setInput(e.target.value)}
					className="input-main transition-all duration-300 ease-in-out focus:outline-none focus:border-accent"
					placeholder="Search Settings..."
				/>

				{menuItems
					.filter(
						(item) =>
							item.label
								.toLowerCase()
								.includes(input.toLowerCase()) || input === ""
					)
					.map((item) => (
						<div
							key={item.id}
							className={`sidebar-item relative cursor-pointer ${
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
		</div>
	);
};

export default Sidebar;
