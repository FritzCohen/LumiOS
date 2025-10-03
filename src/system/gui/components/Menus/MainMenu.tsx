import { useState, useRef, useLayoutEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faArrowRight,
	faFolderOpen,
	faLock,
	faPowerOff,
	faRefresh,
	faX,
} from "@fortawesome/free-solid-svg-icons";

import { useUser } from "../../../../context/user/user";
import { useWindow } from "../../../../context/window/WindowProvider";
import { useKernel } from "../../../../hooks/useKernal";
import useGetApps from "../../../../hooks/useGetApps";
import useContextMenu from "../ContextMenu/useContextMenu";
import { useFloatingMenuPosition } from "./useFloatingMenuPosition";

import ContextMenu from "../ContextMenu/ContextMenu";
import Button from "../../../lib/Button";

import { Executable } from "../../../../types/globals";
import "./Menus.css";
import { useOutsideClick } from "../../../../hooks/useOutsideClick";
import Input from "../../../lib/Input";
import FileExplorer from "../../../apps/FileExplorer/FileExplorer";
import fileIcon from "../../../../assets/Icons/explorer.png";

const MainMenu = () => {
	const [input, setInput] = useState("");
	const [menuOpen, setMenuOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);
	const mainMenuRef = useRef<HTMLDivElement>(null);
	const powerMenuRef = useRef<HTMLDivElement>(null);
	const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});

	const { currentUser, userDirectory, logout } = useUser();
	const { setMenu } = useWindow();
	const { openApp } = useKernel();
	const installedApps = useGetApps();

	const {
		contextMenuVisible,
		contextMenuPosition,
		contextMenuItems,
		showContextMenu,
		hideContextMenu,
	} = useContextMenu();

	const { bottom, positionStyle } = useFloatingMenuPosition(
		mainMenuRef,
		() => {
			setMenu("None");
			setMenuOpen(false);
		}
	);

	useOutsideClick([mainMenuRef, powerMenuRef, "context-menu"], ({ clickedRefIndex }) => {				
		if (clickedRefIndex == 1 || clickedRefIndex == 2) return;
		if (clickedRefIndex == 0) {
			setMenuOpen(false);
		} else {
			setMenuOpen(false);
			setMenu("None");
		}
	});

	useLayoutEffect(() => {
		if (menuOpen && menuRef.current && powerMenuRef.current) {
			const anchorRect = menuRef.current.getBoundingClientRect();
			const menuRect = powerMenuRef.current.getBoundingClientRect();

			// If height is zero, skip (menu probably not fully rendered)
			if (menuRect.height === 0) return;

			let top = anchorRect.top - menuRect.height - 10; // 10px margin above
			let left = anchorRect.left + anchorRect.width - menuRect.width; // right align

			left = Math.max(left, 10);

			if (top < 10) {
				top = anchorRect.bottom + 10; // fallback below anchor
			}

			setMenuStyle({
				position: "fixed",
				top: `${top}px`,
				left: `${left}px`,
				zIndex: 70,
			});
		}
	}, [menuOpen]);

	const handleItemClick = (app: Executable) => {
		openApp(app);
		setMenu("None");
	};

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

	const renderIcon = (icon: any, name: string) => {
		if (typeof icon === "string") {
			const trimmed = icon.trim();
			if (trimmed.startsWith("<svg") || trimmed.startsWith("<img")) {
				return (
					<div
						className="w-full h-full p-2 invert"
						dangerouslySetInnerHTML={{ __html: trimmed }}
					/>
				);
			}
			return <img src={icon} alt={name} className="w-full h-full p-2" />;
		}
		return <FontAwesomeIcon icon={icon} />;
	};

	const filteredApps = installedApps.filter((app) =>
		input === ""
			? true
			: app.config.name.toLowerCase().includes(input.toLowerCase())
	);

	return (
		<>
			<div
				id="search-apps"
				ref={mainMenuRef}
				className="app-list search-apps glass h-full flex flex-col content"
				style={{
					...positionStyle,
					bottom: `${bottom}px`,
					height: `${window.innerHeight / 2}px`,
				}}
				onContextMenu={(e) => showContextMenu(e, [
					{
						name: "Close Menu",
						icon: faX,
						action: () => setMenu("None")
					}
				], mainMenuRef)}
			>
				{/* Header */}
				<div className="flex w-full justify-between items-center px-5 py-2">
					<h1 className="text-xl font-bold">Quick Access</h1>
					<Button onClick={() => setMenu("SearchApps")}>
						All Apps <FontAwesomeIcon icon={faArrowRight} />
					</Button>
				</div>

				{/* Search Input */}
				<div className="relative my-2 w-full px-5">
					<Input
						type="text"
						value={input}
						onChange={(e) => setInput(e.target.value)}
						placeholder="Search Apps..."
					/>
				</div>

				{/* App Grid */}
				<div className="flex-grow app-grid px-2">
					{filteredApps
						.slice(0, input === "" ? 12 : undefined)
						.map((app, index) => (
							<div
								key={index}
								className="menu-item large"
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
										mainMenuRef
									)
								}
							>
								{app.config.icon ? (
									renderIcon(app.config.icon, app.config.name)
								) : (
									<div>{app.config.name}</div>
								)}
							</div>
						))}
				</div>

				{/* Footer */}
				<div className="mt-auto dark-highlight shadow-inner">
					{currentUser && (
						<div className="flex justify-between items-center px-4">
							{/* User Info */}
							<div className="flex gap-4 w-fit h-full items-center">
								<img
									alt="UserProfile"
									src={
										typeof currentUser.icon === "string"
											? currentUser.icon
											: ""
									}
									className="w-12 h-12 item"
								/>
								{currentUser.username}
							</div>

							{/* Power Button and Menu */}
							<div className="relative item" ref={menuRef}>
								<FontAwesomeIcon
									icon={faPowerOff}
									onClick={() => setMenuOpen((prev) => !prev)}
									className="cursor-pointer hover:scale-110 transition-transform"
								/>
							</div>
						</div>
					)}
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
			{menuOpen && (
				<div
					ref={powerMenuRef}
					className="power-menu glass-heavy flex flex-col gap-1"
					style={menuStyle}
				>
					<Button className="flex justify-between items-center w-full gap-5 cursor-pointer" onClick={() => {
						logout();
					}}>
						Logout
						<FontAwesomeIcon icon={faLock} />
					</Button>
					<Button className="flex justify-between items-center w-full gap-5 cursor-pointer" onClick={() => {
						window.location.reload();
					}}>
						Restart
						<FontAwesomeIcon icon={faRefresh} />
					</Button>
				</div>
			)}
		</>
	);
};

export default MainMenu;