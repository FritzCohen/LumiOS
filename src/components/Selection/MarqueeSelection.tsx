import React, { useState, useRef, useEffect } from "react";

interface MarqueeSelectionProps {
  children: React.ReactNode;
  onSelectionChange?: (selectedItems: HTMLElement[]) => void;
  canSelect: boolean;
}

/**
 * Basic marquee selection intended for Desktop.tsx component.
 * 
 * @component
 * @module UIComponents
 * 
 * @deprecated
 * @param children {@link React.ReactNode} 
 * @returns stuff
 */
const MarqueeSelection: React.FC<MarqueeSelectionProps> = ({ children, onSelectionChange, canSelect }) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [currentPoint, setCurrentPoint] = useState({ x: 0, y: 0 });
  const [selectedItems, setSelectedItems] = useState<HTMLElement[]>([]);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (canSelect) {
      setIsSelecting(true);
      setStartPoint({ x: e.clientX, y: e.clientY });
      setCurrentPoint({ x: e.clientX, y: e.clientY });
      setSelectedItems([]); // Reset selected items on new selection
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isSelecting && canSelect) {
      setCurrentPoint({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    if (marqueeRef.current && parentRef.current && canSelect) {
      const marqueeRect = marqueeRef.current.getBoundingClientRect();
      const children = Array.from(parentRef.current.children) as HTMLElement[];
      const newSelectedItems: HTMLElement[] = [];

      // Reset styles first
      children.forEach(child => {
        if (child !== marqueeRef.current) {
          child.style.backgroundColor = "transparent";
        }
      });

      for (const child of children) {
        if (child === marqueeRef.current) continue; // Skip the marquee div itself

        const childRect = child.getBoundingClientRect();

        if (
          marqueeRect.left < childRect.right &&
          marqueeRect.right > childRect.left &&
          marqueeRect.top < childRect.bottom &&
          marqueeRect.bottom > childRect.top
        ) {
          newSelectedItems.push(child);
          child.style.backgroundColor = "#d0eaff"; // Example selection style
        }
      }

      setSelectedItems(newSelectedItems);
      if (onSelectionChange) {
        onSelectionChange(newSelectedItems);
      }
    }

    setIsSelecting(false);
  };

  useEffect(() => {
    const handleMouseMoveWrapper = (e: MouseEvent) => handleMouseMove(e);
    const handleMouseUpWrapper = () => handleMouseUp();

    if (isSelecting) {
      document.addEventListener("mousemove", handleMouseMoveWrapper);
      document.addEventListener("mouseup", handleMouseUpWrapper);
    } else {
      document.removeEventListener("mousemove", handleMouseMoveWrapper);
      document.removeEventListener("mouseup", handleMouseUpWrapper);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMoveWrapper);
      document.removeEventListener("mouseup", handleMouseUpWrapper);
    };
  }, [isSelecting]);

  const calculateMarqueeStyles = () => {
    const x = Math.min(startPoint.x, currentPoint.x);
    const y = Math.min(startPoint.y, currentPoint.y);
    const width = Math.abs(currentPoint.x - startPoint.x);
    const height = Math.abs(currentPoint.y - startPoint.y);

    return {
      left: x - (parentRef.current?.offsetLeft || 0),
      top: y - (parentRef.current?.offsetTop || 0),
      width,
      height,
    };
  };

  return (
    <div
      ref={parentRef}
      onMouseDown={handleMouseDown}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        backgroundColor: "transparent", // Ensure parent div has no background affecting children
      }}
    >
      {isSelecting && canSelect && (
        <div
          ref={marqueeRef}
          style={{
            position: "absolute",
            border: "1px dashed #0078D7",
            backgroundColor: "rgba(0, 120, 215, 0.2)",
            pointerEvents: "none",
            ...calculateMarqueeStyles(),
          }}
        />
      )}
      {children}
    </div>
  );
};

export default MarqueeSelection;