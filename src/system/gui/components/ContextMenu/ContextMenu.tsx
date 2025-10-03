import React, {
	useRef,
	useEffect,
	CSSProperties,
	useLayoutEffect,
} from "react";
import "./ContextMenu.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faChevronRight,
	faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { ContextMenuItem } from "./types";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import ReactDOM from "react-dom";

type ContextMenuProps = {
	menuPosition: { x: number; y: number };
	menuItems: ContextMenuItem[];
	hideMenu: () => void;
};

const ContextMenu: React.FC<ContextMenuProps> = ({
	menuPosition,
	menuItems,
	hideMenu,
}) => {
	const positionRef = useRef({ x: menuPosition.x, y: menuPosition.y });
	const contextMenuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				contextMenuRef.current &&
				!contextMenuRef.current.contains(event.target as Node)
			) {
				hideMenu();
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [hideMenu]);

	useLayoutEffect(() => {
		const menu = contextMenuRef.current;
		if (!menu) return;

		const { width } = menu.getBoundingClientRect();
		const { innerWidth, innerHeight } = window;

		let x = menuPosition.x;
		const y = menuPosition.y;

		const buffer = 100;
		const bottomThreshold = 100;

		if (x + width > innerWidth - buffer) {
			x = innerWidth - width - buffer;
		}
		if (x < 0) x = 0;

		const isNearBottom = y > innerHeight - bottomThreshold;

		if (isNearBottom) {
			// Position by bottom (distance from bottom edge)
			const bottom = innerHeight - y;
			menu.style.top = "auto";
			menu.style.bottom = `${bottom}px`;
		} else {
			// Normal top positioning
			menu.style.top = `${y}px`;
			menu.style.bottom = "auto";
		}

		menu.style.left = `${x}px`;

		positionRef.current = { x, y };
		
		menu.style.left = `${x}px`;

		const items = menu.querySelectorAll(".has-dropdown");
		items.forEach((item) => {
			const dropdown = item.querySelector(".dropdown") as HTMLElement;
			if (!dropdown) return;

			dropdown.classList.remove("flip-left");

			const itemRect = item.getBoundingClientRect();
			const dropdownRect = dropdown.getBoundingClientRect();

			const spaceRight = innerWidth - itemRect.right;
			// const spaceLeft = itemRect.left;

			// Check if parent dropdown is flipped left
			const parentDropdown = item.parentElement?.closest(".dropdown");
			const parentFlippedLeft =
				parentDropdown?.classList.contains("flip-left");

			if (parentFlippedLeft) {
				// Parent is flipped left, so child submenu opens to right if it fits
				if (spaceRight < dropdownRect.width + buffer) {
					// Not enough room on right, flip left (back)
					dropdown.classList.add("flip-left");
				}
				// Else default: no flip, open right
			} else {
				// Parent not flipped, normal logic:
				if (spaceRight < dropdownRect.width + buffer) {
					dropdown.classList.add("flip-left");
				}
			}
		});
	}, [menuPosition]);

	const handleItemClick = (item: ContextMenuItem) => {
		if ("action" in item && typeof item.action === "function") {
			item.action();
			hideMenu();
		}
	};

	const handleInfoClick = () => {
		window.open("https://github.com/LuminesenceProject/LumiOS");
		hideMenu();
	};

	const renderMenuItems = (items: ContextMenuItem[]) => {
		return items.map((item, index) => {
			const isDropdown =
				"children" in item && Array.isArray(item.children);

			return (
				<React.Fragment key={index}>
					<div
						className={`menu-item ${
							isDropdown ? "has-dropdown" : ""
						}`}
					>
						<div
							onClick={() => !isDropdown && handleItemClick(item)}
							className="menu-item-content"
						>
							{item.icon && (
								<FontAwesomeIcon
									className="menu-icon"
									icon={item.icon}
								/>
							)}
							{item.name}
							{isDropdown && (
								<FontAwesomeIcon
									className="menu-icon right-arrow"
									icon={faChevronRight as IconProp}
								/>
							)}
						</div>

						{isDropdown && item.children && (
							<div className="dropdown glass-heavy relative">
								{renderMenuItems(item.children)}
							</div>
						)}
					</div>

					{item.gap && (
						<hr
							className="my-1 bg-primary w-11/12 self-center"
							style={{ color: "grey" }}
						/>
					)}
				</React.Fragment>
			);
		});
	};

	const menuStyle: CSSProperties = {
		position: "fixed",
		color: "white",
	};

	return ReactDOM.createPortal(
		<div
			ref={contextMenuRef}
			style={menuStyle}
			className="context-menu glass-heavy"
			id="context-menu"
		>
			{renderMenuItems(menuItems)}
			<hr
				className="my-1 bg-primary w-11/12 self-center"
				style={{ color: "grey" }}
			/>
			<div className="menu-item" onClick={handleInfoClick}>
				<div>
					<FontAwesomeIcon
						className="menu-icon"
						icon={faInfoCircle as IconProp}
					/>
					About
				</div>
			</div>
		</div>,
		document.body // 👈 this is the key
	);
};

export default ContextMenu;
