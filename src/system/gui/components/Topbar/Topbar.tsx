import React, { useState, useEffect, useRef, useMemo } from "react";
import { useTopbar } from "../../../../context/topbar/topbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { useKernel } from "../../../../hooks/useKernal";
import { motion, AnimatePresence, Variants } from "framer-motion";
import logo from "../../../../assets/no-bg-logo.png";
import "./topbar.css";
import {
	faArrowUp,
	faExpand,
	faEye,
	faEyeSlash,
	faTimes,
	faWindowMaximize,
} from "@fortawesome/free-solid-svg-icons";
import { useUser } from "../../../../context/user/user";
import { OpenedApp } from "../../../../context/kernal/kernal";
import useContextMenu from "../ContextMenu/useContextMenu";
import ContextMenu from "../ContextMenu/ContextMenu";
import { useWindow } from "../../../../context/window/WindowProvider";

const Topbar: React.FC = () => {
	const { openedApps, closeApp, bringToFront, modifyProp } = useKernel();
	const { logout } = useUser();
	const { systemProps, updateSystemProps } = useWindow();
	const { menus, addMenu, removeMenu } = useTopbar();

	const topbarRef = useRef(null);

	// Context menu
	const {
		contextMenuPosition,
		contextMenuVisible,
		showContextMenu,
		hideContextMenu,
		contextMenuItems,
	} = useContextMenu();

	const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
	const dropdownRefs = useRef<Array<HTMLDivElement | null>>([]);

	const handleMenuClick = (index: number) => {
		setOpenMenuIndex((prev) => (prev === index ? null : index));
	};

	const handleClickOutside = (event: MouseEvent) => {
		if (
			!dropdownRefs.current.some((ref) =>
				ref?.contains(event.target as Node)
			)
		) {
			setOpenMenuIndex(null);
		}
	};

	useEffect(() => {
		document.addEventListener("mousedown", handleClickOutside);
		return () =>
			document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	// FULLSCREENED
	const [isFullscreen, setIsFullscreen] = useState(false);

	// Default menus for the OS
	useEffect(() => {
		const enterFullscreen = () => {
			if (!document.fullscreenElement) {
				document.documentElement.requestFullscreen();
			}
		};

		const exitFullscreen = () => {
			if (document.fullscreenElement) {
				document.exitFullscreen();
			}
		};

		const toggleFullscreen = () => {
			if (document.fullscreenElement) {
				exitFullscreen();
			} else {
				enterFullscreen();
			}
		};

		const handleFullscreenChange = () => {
			setIsFullscreen(!!document.fullscreenElement);
		};

		document.addEventListener("fullscreenchange", handleFullscreenChange);

		addMenu({
			id: "system",
			title: "System",
			icon: logo,
			items: [
				{
					label: "About",
					onClick: () =>
						(window.location.href =
							"https://github.com/FritzCohen/LumiOS"),
				},
				{
					label: "Restart",
					onClick: () => window.location.reload(),
				},
				{
					label: "Logout",
					onClick: logout,
				},
			],
		});

		addMenu({
			id: "window",
			title: "Window",
			items: [
				{
					label: isFullscreen
						? "Exit Fullscreen"
						: "Enter Fullscreen",
					onClick: toggleFullscreen,
				},
			],
		});

		return () => {
			removeMenu("system");
			removeMenu("window");
			document.removeEventListener(
				"fullscreenchange",
				handleFullscreenChange
			);
		};
	}, [addMenu, removeMenu, logout, isFullscreen]); // <-- added isFullscreen

	// Create a stable array of just app IDs for comparison
	const openedAppIds = useMemo(
		() => openedApps.map((app) => app.id),
		[openedApps]
	);

	const handleAppUpdate = (
		app: OpenedApp,
		execute: "maximize" | "minimize"
	) => {
		if (execute === "maximize") {
			modifyProp(app.id, "maximized", !app.maximized);
		} else {
			modifyProp(app.id, "minimized", !app.minimized);
		}
	};

	useEffect(() => {
		// Remove menus that were added by openedApps but no longer exist
		menus
			.filter((menu) => menu.fromApp)
			.forEach((menu) => {
				if (!openedAppIds.includes(menu.id)) {
					removeMenu(menu.id);
				}
			});

		// Add menus for newly opened apps
		openedApps.forEach((app) => {
			if (!menus.find((menu) => menu.id === app.id)) {
				addMenu({
					id: app.id,
					title: app.executable.config.displayName,
					icon:
						typeof app.executable.config.icon === "string"
							? app.executable.config.icon
							: "",
					items: [
						{
							label: `${
								app.maximized ? "Exit Fullscreen" : "Fullscreen"
							}`,
							icon: <FontAwesomeIcon icon={faExpand} />,
							onClick: () => handleAppUpdate(app, "maximize"),
						},
						{
							label: "Minimize",
							icon: <FontAwesomeIcon icon={faWindowMaximize} />,
							onClick: () => handleAppUpdate(app, "minimize"),
						},
						{
							label: "Bring to Front",
							icon: <FontAwesomeIcon icon={faArrowUp} />,
							onClick: () => bringToFront(app.id),
						},
						{
							label: "Close",
							icon: <FontAwesomeIcon icon={faTimes} />,
							onClick: () => closeApp(app.id),
						},
					],
					fromApp: true,
				});
			}
		});
	}, [addMenu, removeMenu, openedAppIds, menus]);

	const getTime = () => {
		const use24hrs = false;
		const now = new Date();
		const options: Intl.DateTimeFormatOptions = {
			weekday: "short",
			month: "short",
			day: "numeric",
			hour: "numeric",
			minute: "numeric",
			hour12: !use24hrs,
		};
		return now.toLocaleString("en-US", options);
	};

	const renderIcon = (icon: any) => {
		if (!icon) return null;

		// string case: inline svg or image url
		if (typeof icon === "string") {
			if (icon.includes("<svg")) {
				return (
					<span
						className="topbar-icon"
						dangerouslySetInnerHTML={{ __html: icon }}
					/>
				);
			}
			return <img className="topbar-icon" src={icon} alt="" />;
		}

		// FontAwesome definition (array or object with iconName/prefix)
		if (
			Array.isArray(icon) ||
			(typeof icon === "object" && (icon.iconName || icon.prefix))
		) {
			return (
				<FontAwesomeIcon
					className="topbar-icon"
					icon={icon as IconProp}
				/>
			);
		}

		// already a React element
		if (React.isValidElement(icon)) {
			return icon;
		}

		// fallback
		return null;
	};

	const dropdownVariants: Variants = {
		initial: { opacity: 0, y: -8 },
		animate: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.2,
				ease: "easeInOut",
				staggerChildren: 0.05,
			},
		},
		exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
	};

	const glassVariants: Variants = {
		initial: { opacity: 0.001 }, // tiny opacity to avoid flash
		animate: {
			opacity: 1,
			transition: { duration: 0.2, ease: "easeInOut" },
		},
		exit: { opacity: 0, transition: { duration: 0.15 } },
	};

	const itemVariants: Variants = {
		initial: { opacity: 0, y: -4 },
		animate: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.15, ease: "easeOut" },
		},
		exit: { opacity: 0, y: -4, transition: { duration: 0.1 } },
	};

	return (
		<div
			id="topbar"
			ref={topbarRef}
			// Ok so this is for the users configurated settings
			className={`flex items-center gap-2 relative 
				${!systemProps.topbar.visible ? "pointer-events-none invisible" : ""}
				${
					!systemProps.topbar.onHover
						? "opacity-0 hover:opacity-100 transition-opacity duration-100 group"
						: ""
				}
			`}
			onContextMenu={(e) =>
				showContextMenu(
					e,
					[
						{
							name: systemProps.topbar.visible ? "Hide" : "Show",
							icon: systemProps.topbar.visible
								? faEyeSlash
								: faEye,
							action: () =>
								updateSystemProps(
									"topbar.visible",
									!systemProps.topbar.visible
								),
						},
						{
							name: systemProps.topbar.onHover
								? "Show on mouseover"
								: "Show always",
							action: () =>
								updateSystemProps(
									"topbar.onHover",
									!systemProps.topbar.onHover
								),
						},
					],
					topbarRef
				)
			}
		>
			{menus.map((menu, index) => {
				const key = menu.id ?? `menu-${index}`;
				const isOpen = openMenuIndex === index;

				return (
					<div key={key} className="relative">
						<button
							className="px-4 py-1 rounded transition-colors relative z-10"
							onClick={() => handleMenuClick(index)}
							aria-expanded={isOpen}
						>
							{menu.icon ? (
								renderIcon(menu.icon)
							) : (
								<>{menu.title}</>
							)}
						</button>

						<AnimatePresence>
							{isOpen && (
								<motion.div
									ref={(el) =>
										(dropdownRefs.current[index] = el)
									}
									variants={dropdownVariants}
									initial="initial"
									animate="animate"
									exit="exit"
									className="absolute top-full mt-2 rounded shadow-lg overflow-hidden"
									style={{ zIndex: 60 }}
								>
									{/* Glass layer */}
									<motion.div
										className="dropdown-glass absolute inset-0 z-0"
										variants={glassVariants}
										initial="initial"
										animate="animate"
										exit="exit"
									/>

									{/* Dropdown items */}
									{(menu.items ?? []).map((item, idx) => (
										<motion.div
											key={`${key}-item-${idx}`}
											variants={itemVariants}
											className="relative z-10"
										>
											<div
												className="dropdown-item"
												onClick={() => {
													item.onClick?.();
													setOpenMenuIndex(null);
												}}
											>
												{item.icon
													? renderIcon(item.icon)
													: null}
												<span>{item.label}</span>
											</div>
											{item.gap && <hr />}
										</motion.div>
									))}
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				);
			})}

			{/* Clock */}
			<div className="px-4 py-1 rounded flex-grow text-right font-bold relative z-10">
				{getTime().replace(",", "")}
			</div>

			{contextMenuVisible && (
				<ContextMenu
					menuPosition={contextMenuPosition}
					menuItems={contextMenuItems}
					hideMenu={hideContextMenu}
				/>
			)}
		</div>
	);
};

export default Topbar;
