import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Executable } from "../../../../types/globals";
import "./Menus.css";
import { useWindow } from "../../../../context/window/WindowProvider";
import { useKernel } from "../../../../hooks/useKernal";
import useGetApps from "../../../../hooks/useGetApps";
import { useFloatingMenuPosition } from "./useFloatingMenuPosition";
import { useOutsideClick } from "../../../../hooks/useOutsideClick";
import { faFolderOpen, faX } from "@fortawesome/free-solid-svg-icons";
import useContextMenu from "../ContextMenu/useContextMenu";
import ContextMenu from "../ContextMenu/ContextMenu";
import FileExplorer from "../../../apps/FileExplorer/FileExplorer";
import { useUser } from "../../../../context/user/user";
import fileIcon from "../../../../assets/Icons/explorer.png";
import Input from "../../../lib/Input";

const SearchApps: React.FC = () => {
	const trayRef = useRef<HTMLDivElement>(null);
	const [input, setInput] = useState<string>("");
	const [groupedApps, setGroupedApps] = useState<
		Record<string, Executable[]>
	>({});
	const { openApp } = useKernel();
	const { setMenu } = useWindow();
	const { currentUser, userDirectory } = useUser();
	const installedApps = useGetApps();
	const { bottom, positionStyle } = useFloatingMenuPosition(trayRef, () => setMenu("None"));

	const {
		contextMenuVisible,
		contextMenuPosition,
		contextMenuItems,
		showContextMenu,
		hideContextMenu,
	} = useContextMenu();


	useEffect(() => {
		const fixedApps = Object.values(installedApps).reduce(
			(acc: Record<string, Executable[]>, app: Executable) => {
				let firstLetter = app.config.name.charAt(0).toUpperCase();

				if (!firstLetter.match(/[a-z]/i)) {
					firstLetter = "#";
				}

				if (!acc[firstLetter]) {
					acc[firstLetter] = [];
				}

				acc[firstLetter].push(app);

				return acc;
			},
			{}
		);

		setGroupedApps(fixedApps);
	}, [installedApps]);

	const handleItemClick = (app: Executable) => {
		if (!app) return;

		setMenu("None");
		
		openApp(app)
	};

	useOutsideClick([trayRef, "context-menu"], ({ clickedRefIndex }) => {
		if (clickedRefIndex == 0 || clickedRefIndex == 1) return;
	
		setMenu("None");
	});

	const handleOpenExplorer = () => {
		openApp({
			config: {
				name: "FileExplorer",
				displayName: "File Explorer",
				icon: fileIcon,
				permissions: currentUser?.permission || 0
			},
			mainComponent: (props) => <FileExplorer defaultPath={`${userDirectory}/Apps/`} {...props} />
		});
	};

	return (
		<div
			id="search-apps"
			ref={trayRef}
			className="app-list search-apps glass h-full flex flex-col"
			style={{
				...positionStyle,
				bottom: `${bottom}px`,
				height: `${window.innerHeight / 2}px`,
				overflow: "hidden",
			}}
			onContextMenu={(e) => showContextMenu(e, [
				{
					name: "Close Menu",
					icon: faX,
					action: () => setMenu("None")
				}
			], trayRef)}
		>
			{/* Search Bar */}
			<div className="flex w-full justify-between items-center py-1 px-5 shadow-md sticky top-0 bg-primary z-10">
				<div className="relative my-2 w-full px-5">
					<Input
						type="text"
						onChange={(e) => setInput(e.target.value)}
						placeholder="Search Apps..."
					/>
				</div>
			</div>
			{/* Search Results Container */}
			<div
				className="flex flex-col flex-grow w-full overflow-y-auto p-2"
				id="search-area"
			>
				{Object.keys(groupedApps)
					.sort()
					.filter((name) => {
						return (
							input === "" ||
							input
								.slice(0, 1)
								.toLowerCase()
								.includes(name.toLowerCase())
						);
					})
					.map((letter) => (
						<div
							key={letter}
							className="flex flex-col gap-1 w-full"
						>
							<div className="menu-item">
								<h2 className="font-semibold">{letter}</h2>
							</div>
							<div className="flex flex-col gap-1">
								{groupedApps[letter]
									.filter((app) => {
										return (
											input === "" ||
											app.config.name
												.toLowerCase()
												.includes(input.toLowerCase())
										);
									})
									.map((app, index) => (
										<div
											key={index}
											className="menu-item"
											onClick={() => handleItemClick(app)}
											onContextMenu={(e) => 
												showContextMenu(
													e,
													[
														{
															name: `Open ${app.config.name}`,
															action: () =>
																handleItemClick(app),
														},
														{
															name: "Open file location",
															icon: faFolderOpen,
															action: handleOpenExplorer,
														},
													],
													trayRef
												)
											}
										>
											{/* App Icon */}
											<div className="w-10 h-10 mr-4">
												{app.config.icon ? (
													typeof app.config.icon ===
													"string" ? (
														app.config.icon
															.trim()
															.startsWith(
																"<svg"
															) ||
														app.config.icon
															.trim()
															.startsWith(
																"<img"
															) ? (
															<div
																className="w-full h-full p-2 invert"
																dangerouslySetInnerHTML={{
																	__html: app
																		.config
																		.icon,
																}}
															/>
														) : (
															<img
																src={
																	app.config
																		.icon
																}
																alt={
																	app.config
																		.name
																}
																className="w-full h-full p-1"
															/>
														)
													) : (
														<FontAwesomeIcon
															icon={
																app.config.icon
															}
														/>
													)
												) : (
													<div></div>
												)}
											</div>
											{/* App Details */}
											<div>
												<h3 className="text-md font-medium">
													{app.config.name}
												</h3>
											</div>
										</div>
									))}
							</div>
						</div>
					))}
			</div>

			{/* Context Menu */}
			{contextMenuVisible && (
				<ContextMenu
					menuItems={contextMenuItems}
					menuPosition={contextMenuPosition}
					hideMenu={hideContextMenu}
				/>
			)}
		</div>
	);
};

export default SearchApps;
