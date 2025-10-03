import { useState, useCallback } from "react";
import { ContextMenuItem } from "./types";

interface ContextMenuPosition {
	x: number;
	y: number;
}

interface UseContextMenuReturn {
	contextMenuVisible: boolean;
	contextMenuPosition: ContextMenuPosition;
	contextMenuItems: ContextMenuItem[];
	showContextMenu: (
		event: React.MouseEvent,
		items: ContextMenuItem[],
		ref: React.RefObject<HTMLElement>,
		adjustY?: number
	) => void;
	hideContextMenu: () => void;
}

const useContextMenu = (): UseContextMenuReturn => {
	const [contextMenuVisible, setContextMenuVisible] = useState(false);
	const [contextMenuPosition, setContextMenuPosition] =
		useState<ContextMenuPosition>({ x: 0, y: 0 });
	const [contextMenuItems, setContextMenuItems] = useState<ContextMenuItem[]>(
		[]
	);

	const showContextMenu = useCallback(
		(
			event: React.MouseEvent,
			items: ContextMenuItem[],
			_ref?: React.RefObject<HTMLElement>, // no need to use it here
			_adjustY: number = 0
		) => {
			event.preventDefault();			

			setContextMenuPosition({
				x: event.clientX,
				y: event.clientY - _adjustY
			});

			setContextMenuItems(items);
			setContextMenuVisible(true);

			event.stopPropagation();
		},
		[]
	);


	const hideContextMenu = useCallback(() => {
		setContextMenuVisible(false);
		setContextMenuItems([]);
	}, []);

	return {
		contextMenuVisible,
		contextMenuPosition,
		contextMenuItems,
		showContextMenu,
		hideContextMenu,
	};
};

export default useContextMenu;