// Don't use this outside of here
// Its just for these components :)

import { useEffect, useLayoutEffect, useState, useCallback, CSSProperties } from "react";
import { useWindow } from "../../../../context/window/WindowProvider";

/**
 * 
 * @param mainMenuRef Ref of the main menu
 * @param onOutsideClick Logic for when clicking outside the component
 * @returns bottom, styles
 */
export function useFloatingMenuPosition(
	mainMenuRef: React.RefObject<HTMLElement>,
	onOutsideClick: () => void
) {
	const [bottom, setBottom] = useState(0);
	const [left, setLeft] = useState(0);
    const { systemProps } = useWindow();

	const handleClickOutside = useCallback(
		(event: MouseEvent) => {
			const elementToIgnore = document.querySelector(".app-list-container");
			if (
				mainMenuRef.current &&
				!mainMenuRef.current.contains(event.target as Node) &&
				!elementToIgnore?.contains(event.target as Node)
			) {
				onOutsideClick();
			}
		},
		[mainMenuRef, onOutsideClick]
	);

	const getBottom = useCallback(() => {
		const container = document.querySelector(".app-list-container");
		if (container) {
			const rect = container.getBoundingClientRect();
			setBottom(rect.bottom - rect.top + rect.height);
		}
	}, []);

	useLayoutEffect(() => {
		if (
			mainMenuRef.current &&
			(systemProps.taskbar.mode === "floating" ||
				systemProps.taskbar.align === "center")
		) {
			const width = mainMenuRef.current.offsetWidth;
			setLeft((window.innerWidth - width) / 2);
		}
	}, [systemProps.taskbar.mode, systemProps.taskbar.align]);

	useEffect(() => {
		getBottom();
	}, [getBottom, handleClickOutside]);

	const positionStyle: CSSProperties =
		systemProps.taskbar.mode === "floating" ||
		systemProps.taskbar.align === "center"
			? { left: `${left}px`, position: "absolute" }
			: systemProps.taskbar.align === "start"
			? { left: 0, position: "absolute" }
			: { right: 0, position: "absolute" };

	return { bottom, positionStyle };
}