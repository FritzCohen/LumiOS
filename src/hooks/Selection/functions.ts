export function createSelectionStyling(
  active: boolean,
  height = 0,
  width = 0,
  x = 0,
  y = 0
): React.CSSProperties {
  if (!active) return { display: "none" };
  return {
    position: "absolute",
    left: x,
    top: y,
    width,
    height,
    backgroundColor: "rgba(0, 123, 255, 0.2)",
    border: "1px dashed #007bff",
    pointerEvents: "none",
    zIndex: 9999,
  };
}

export function getRelativeCoords(
  e: MouseEvent | TouchEvent,
  container: HTMLElement
): { x: number; y: number } {
  const rect = container.getBoundingClientRect();
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
  const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
  return {
    x: clientX - rect.left + container.scrollLeft,
    y: clientY - rect.top + container.scrollTop,
  };
}