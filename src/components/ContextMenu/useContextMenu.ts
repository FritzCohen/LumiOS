import { useState, useCallback } from 'react';
import { ContextMenuItem } from '../../utils/types';

interface ContextMenuPosition {
    x: number;
    y: number;
}

interface UseContextMenuReturn {
    contextMenuVisible: boolean
    contextMenuPosition: ContextMenuPosition
    contextMenuItems: ContextMenuItem[]
    showContextMenu: (event: React.MouseEvent<HTMLDivElement>, items: ContextMenuItem[], element?: string, adjustY?: number) => void
    hideContextMenu: () => void
}

const useContextMenu = (): UseContextMenuReturn => {
    const [contextMenuVisible, setContextMenuVisible] = useState(false);
    const [contextMenuPosition, setContextMenuPosition] = useState<ContextMenuPosition>({ x: 0, y: 0 });
    const [contextMenuItems, setContextMenuItems] = useState<ContextMenuItem[]>([]);

    const getElement = (element: string): HTMLElement | null => {
        if (element.startsWith("#")) {
            return document.getElementById(element.slice(1)); // Remove the '#' for ID lookup
        } else if (element.startsWith(".")) {
            return document.querySelector(element); // Use the class selector directly
        } else {
            return null;
        }
    };    

    const showContextMenu = useCallback((event: React.MouseEvent<HTMLDivElement>, items: ContextMenuItem[], element?: string, adjustY?: number) => {
        event.preventDefault();

        if (element) {
            const x = event.clientX;
            const y = event.clientY;
        
            // Get the bounding client rect of the parent component
            const rect = getElement(element);
            const bounds = rect?.getBoundingClientRect();
        
            if (bounds) {
                // Calculate the relative position within the bounding rectangle
                const relativeX = x - bounds.left;
                const relativeY = y - bounds.top + (adjustY ?? 0);
        
                // Update the state variable with the adjusted menu position
                setContextMenuPosition({ x: relativeX, y: relativeY });
            }
        } else {
            setContextMenuPosition({ x: event.clientX, y: event.clientY });
        }

        setContextMenuVisible(true);
        setContextMenuItems(items);

        event.stopPropagation();
    }, []);

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
