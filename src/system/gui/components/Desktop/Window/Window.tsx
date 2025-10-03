import React, {
	CSSProperties,
	useEffect,
	useState,
	createElement,
	useRef,
	useCallback,
} from "react";
import { Rnd, type Rnd as RndInstance } from "react-rnd";
import { OpenedApp } from "../../../../../context/kernal/kernal";
import "../style.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faArrowUp,
	faExpand,
	faMinus,
	faTimes,
	faWindowMaximize,
	faWindowMinimize,
	faX,
} from "@fortawesome/free-solid-svg-icons";
import { useKernel } from "../../../../../hooks/useKernal";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { DraggableEvent } from "react-draggable";
import { components } from "../../../../apps/Components";
import useContextMenu from "../../ContextMenu/useContextMenu";
import ContextMenu from "../../ContextMenu/ContextMenu";
import RenderCompiled from "./RenderCustomApp";
import { useTopbar } from "../../../../../context/topbar/topbar";

interface WindowProps {
	app: OpenedApp;
}

type Side =
	| "topright"
	| "topleft"
	| "bottomright"
	| "bottomleft"
	| "top"
	| "left"
	| "right"
	| null;

const SNAP_THRESHOLD = 15;

const MemoizedWindowContent = React.memo(({ app }: { app: OpenedApp }) => {
	const Component = components[app.executable.config.name];

	const { mainComponent } = app.executable;

	// 🧠 If it's a string, assume it's compiled code
	if (typeof mainComponent === "string") {
		return <RenderCompiled code={mainComponent} />;
	}

	// 🔍 If it's a real React component, render it
	if (
		typeof mainComponent === "function" &&
		mainComponent(app) !== undefined
	) {
		return createElement(mainComponent, { props: app });
	}

	// 🧩 Otherwise, fallback to config-based component
	if (Component) {
		return <Component props={app} />;
	}

	console.log(Component, app.executable.config);

	// 🛑 Nothing found
	return <div>None found.</div>;
});

/** Semi-transparent overlay that shows where the window will snap */
const SnapHint = ({ side }: { side: Side }) => {
	if (side == null) return null;

	const base: React.CSSProperties = {
		position: "fixed",
		background: "rgba(255,255,255,0.1)",
		zIndex: 9_999,
		pointerEvents: "none",
	};

	const styles: Record<Exclude<Side, null>, React.CSSProperties> = {
		// halves
		left: { ...base, left: 0, top: 0, width: "50vw", height: "100vh" },
		right: { ...base, right: 0, top: 0, width: "50vw", height: "100vh" },
		top: { ...base, left: 0, top: 0, width: "100vw", height: "100vh" }, // maximise preview

		// quarters
		topleft: { ...base, left: 0, top: 0, width: "50vw", height: "50vh" },
		topright: { ...base, right: 0, top: 0, width: "50vw", height: "50vh" },
		bottomleft: {
			...base,
			left: 0,
			bottom: 0,
			width: "50vw",
			height: "50vh",
		},
		bottomright: {
			...base,
			right: 0,
			bottom: 0,
			width: "50vw",
			height: "50vh",
		},
	};

	return <div style={styles[side]} />;
};

const Window: React.FC<WindowProps> = ({ app }) => {
	const [windowStyle] = useState<Partial<CSSProperties>>({});
	const [dimensions, setDimensions] = useState({
		width: app.width,
		height: app.height,
		x: app.x ?? 100,
		y: app.y ?? 100,
	});
	const [prevDimensions, setPrevDimensions] = useState(dimensions);
	const [snapHintSide, setSnapHintSide] = useState<Side>(null);
	const [currentSnap, setCurrentSnap] = useState<Side>(null);
	const rndRef = useRef<RndInstance | null>(null); // <- hold the ref
	const windowRef = useRef(null); // FOR CONTEXT MENU
	const isManuallyChanging = useRef(false);

	const { closeApp, bringToFront, modifyProp } = useKernel();
	const {
		contextMenuPosition,
		contextMenuVisible,
		showContextMenu,
		hideContextMenu,
		contextMenuItems,
	} = useContextMenu();

	const handleMinimize = useCallback(
		() => modifyProp(app.id, "minimized", !app.minimized),
		[app.id, app.minimized, modifyProp]
	);
	const handleMaximize = useCallback(() => {
		if (app.maximized) {
			isManuallyChanging.current = true;
			setDimensions(prevDimensions);
		} else {
			isManuallyChanging.current = true;
			setPrevDimensions(dimensions);
			setDimensions({
				x: 0,
				y: 0,
				width: window.innerWidth,
				height: window.innerHeight,
			});
		}
		modifyProp(app.id, "maximized", !app.maximized);
	}, [app.id, app.maximized, dimensions, modifyProp, prevDimensions]);

	const handleClose = useCallback(() => closeApp(app.id), [app.id, closeApp]);
	const handleClick = useCallback(
		() => bringToFront(app.id),
		[app.id, bringToFront]
	);

	// LOGIC FOR TOPBAR
	const { addMenu, removeMenu } = useTopbar();

	useEffect(() => {
		const menu = {
			id: app.id,
			title: app.executable.config.displayName,
			icon:
				typeof app.executable.config.icon === "string"
					? app.executable.config.icon
					: undefined,
			items: [
				{
					label: app.maximized ? "Exit Fullscreen" : "Fullscreen",
					icon: <FontAwesomeIcon icon={faExpand} />,
					onClick: handleMaximize,
				},
				{
					label: app.minimized ? "Maximize" : "Minimize",
					icon: <FontAwesomeIcon icon={app.minimized ? faWindowMaximize : faWindowMinimize} />,
					onClick: handleMinimize,
				},
				{
					label: "Bring to Front",
					icon: <FontAwesomeIcon icon={faArrowUp} />,
					onClick: handleClick,
				},
				{
					label: "Close",
					icon: <FontAwesomeIcon icon={faTimes} />,
					onClick: handleClose,
				},
			],
			fromApp: true,
		};

		// Add/update on mount
		addMenu(menu);

		// Remove on unmount
		return () => {
			removeMenu(app.id);
		};
	}, [app]);

	const getStyles = async () => {};

	useEffect(() => {
		getStyles();
	}, []);

	useEffect(() => {
		if (isManuallyChanging.current) {
			isManuallyChanging.current = false;
			return;
		}

		const appX = app.x ?? 100;
		const appY = app.y ?? 100;

		if (
			dimensions.x !== appX ||
			dimensions.y !== appY ||
			dimensions.width !== app.width ||
			dimensions.height !== app.height
		) {
			setDimensions({
				x: appX,
				y: appY,
				width: app.width,
				height: app.height,
			});
		}
	}, [app.x, app.y, app.width, app.height]);

	const restoreFromSnap = (event: DraggableEvent) => {
		event.preventDefault();

		const mouseEvent = event as MouseEvent;

		// Set maximized to false
		modifyProp(app.id, "maximized", false);
		setCurrentSnap(null);

		// Restore size via React state
		isManuallyChanging.current = true;
		setDimensions(prevDimensions);

		// Delay move to allow RND to apply new size
		requestAnimationFrame(() => {
			if (rndRef.current) {
				const targetWidth = prevDimensions.width;
				const targetHeight = prevDimensions.height;

				const mouseX = mouseEvent.clientX;
				const mouseY = mouseEvent.clientY;

				const newX = mouseX - targetWidth / 2;
				const newY = mouseY - 20; // Adjust for title bar height if needed

				rndRef.current.updatePosition({ x: newX, y: newY });

				// Update local dimensions state
				isManuallyChanging.current = true;
				setDimensions({
					width: targetWidth,
					height: targetHeight,
					x: newX,
					y: newY,
				});
			}
		});
	};

	const snapTo = (side: Side) => {
		setPrevDimensions(dimensions);
		setCurrentSnap(side);

		const halfW = window.innerWidth / 2;
		const halfH = window.innerHeight / 2;

		isManuallyChanging.current = true;
		if (side === "topleft") {
			setDimensions({ x: 0, y: 0, width: halfW, height: halfH });
			modifyProp(app.id, "maximized", false);
		} else if (side === "topright") {
			setDimensions({ x: halfW, y: 0, width: halfW, height: halfH });
			modifyProp(app.id, "maximized", false);
		} else if (side === "bottomleft") {
			setDimensions({ x: 0, y: halfH, width: halfW, height: halfH });
			modifyProp(app.id, "maximized", false);
		} else if (side === "bottomright") {
			setDimensions({ x: halfW, y: halfH, width: halfW, height: halfH });
			modifyProp(app.id, "maximized", false);
		} else if (side === "left") {
			setDimensions({
				x: 0,
				y: 0,
				width: halfW,
				height: window.innerHeight,
			});
			modifyProp(app.id, "maximized", false);
		} else if (side === "right") {
			setDimensions({
				x: halfW,
				y: 0,
				width: halfW,
				height: window.innerHeight,
			});
			modifyProp(app.id, "maximized", false);
		} else if (side === "top") {
			// Full-screen snap
			setDimensions({
				x: 0,
				y: 0,
				width: window.innerWidth,
				height: window.innerHeight,
			});
			modifyProp(app.id, "maximized", true);
		}
	};

	const isFrozen = app.freezeBackground;

	const style: React.CSSProperties = {
		boxSizing: "border-box",
		position: app.maximized || isFrozen ? "fixed" : "absolute",
		top: app.maximized || isFrozen ? 0 : undefined,
		left: app.maximized || isFrozen ? 0 : undefined,
		display: isFrozen ? "flex" : undefined,
		justifyContent: isFrozen ? "center" : undefined,
		alignItems: isFrozen ? "center" : undefined,
		width: app.maximized ? "100vw" : dimensions.width,
		height: app.maximized ? "100vh" : dimensions.height,
		pointerEvents: app.minimized ? "none" : "auto",
		transform: app.minimized ? "scale(0)" : "scale(1)",
		transition: app.minimized || app.maximized ? "ease 100ms" : "",
		opacity: app.minimized ? 0 : 1,
		zIndex: app.zIndex,
		...windowStyle,
	};

	if (app.minimized) return null;

	return (
		<>
			{/* 🔹 Background Dimming Layer */}
			{isFrozen && (
				<div
					style={{
						position: "fixed",
						top: 0,
						left: 0,
						width: "100vw",
						height: "100vh",
						backgroundColor: "rgba(0, 0, 0, 0.5)",
						zIndex: app.zIndex - 1,
					}}
				/>
			)}

			{snapHintSide && <SnapHint side={snapHintSide} />}

			<Rnd
				ref={rndRef}
				size={{
					width: dimensions.width,
					height: dimensions.height,
				}}
				position={
					isFrozen
						? {
								x: (window.innerWidth - dimensions.width) / 2,
								y: (window.innerHeight - dimensions.height) / 2,
						  }
						: {
								x: dimensions.x,
								y: dimensions.y,
						  }
				}
				disableDragging={app.maximized || isFrozen}
				enableResizing={!app.maximized && !isFrozen}
				onDragStop={(_, d) => {
					if (isFrozen) return;

					setSnapHintSide(null);

					const dragWidth = app.maximized
						? window.innerWidth
						: dimensions.width;
					const dragHeight = app.maximized
						? window.innerHeight
						: dimensions.height;

					const nearLeft = d.x <= SNAP_THRESHOLD;
					const nearRight =
						d.x + dragWidth >= window.innerWidth - SNAP_THRESHOLD;
					const nearTop = d.y <= SNAP_THRESHOLD;
					const nearBottom =
						d.y + dragHeight >= window.innerHeight - SNAP_THRESHOLD;

					let snapped = false;

					if (nearTop && nearLeft && currentSnap !== "topleft") {
						snapTo("topleft");
						snapped = true;
					} else if (
						nearTop &&
						nearRight &&
						currentSnap !== "topright"
					) {
						snapTo("topright");
						snapped = true;
					} else if (
						nearBottom &&
						nearLeft &&
						currentSnap !== "bottomleft"
					) {
						snapTo("bottomleft");
						snapped = true;
					} else if (
						nearBottom &&
						nearRight &&
						currentSnap !== "bottomright"
					) {
						snapTo("bottomright");
						snapped = true;
					} else if (nearTop && currentSnap !== "top") {
						snapTo("top");
						snapped = true;
					} else if (nearLeft && currentSnap !== "left") {
						snapTo("left");
						snapped = true;
					} else if (nearRight && currentSnap !== "right") {
						snapTo("right");
						snapped = true;
					}

					if (!snapped) {
						isManuallyChanging.current = true;
						setDimensions((prev) => ({
							...prev,
							x: d.x,
							y: d.y,
						}));
					}
				}}
				onDragStart={(e) => {
					if ((currentSnap || app.maximized) && !isFrozen)
						restoreFromSnap(e);
				}}
				onDrag={(_, d) => {
					if (isFrozen) return;

					const dragWidth = app.maximized
						? window.innerWidth
						: dimensions.width;
					const dragHeight = app.maximized
						? window.innerHeight
						: dimensions.height;

					const nearLeft = d.x <= SNAP_THRESHOLD;
					const nearRight =
						d.x + dragWidth >= window.innerWidth - SNAP_THRESHOLD;
					const nearTop = d.y <= SNAP_THRESHOLD;
					const nearBottom =
						d.y + dragHeight >= window.innerHeight - SNAP_THRESHOLD;

					if (!currentSnap) {
						if (nearTop && nearLeft) setSnapHintSide("topleft");
						else if (nearTop && nearRight)
							setSnapHintSide("topright");
						else if (nearBottom && nearLeft)
							setSnapHintSide("bottomleft");
						else if (nearBottom && nearRight)
							setSnapHintSide("bottomright");
						else if (nearTop) setSnapHintSide("top");
						else if (nearLeft) setSnapHintSide("left");
						else if (nearRight) setSnapHintSide("right");
						else setSnapHintSide(null);
					}
				}}
				onResizeStop={(_, __, ref, __delta, position) => {
					isManuallyChanging.current = true;
					setDimensions({
						width: ref.offsetWidth,
						height: ref.offsetHeight,
						...position,
					});
				}}
				minWidth={app.width}
				minHeight={app.height}
				style={style}
				dragHandleClassName="drag-handle"
				className="glass z-30"
			>
				<div
					className="flex flex-col h-full w-full z-50"
					ref={windowRef}
					onContextMenu={(e) =>
						showContextMenu(
							e,
							[
								{
									name: "Minimize",
									icon: faMinus,
									action: handleMinimize,
								},
								{
									name: "Maximize",
									icon: faWindowMaximize,
									action: handleMaximize,
								},
								{
									name: "Close",
									icon: faX,
									action: handleClose,
								},
								{
									name: "Snap to",
									children: [
										{
											name: "Top",
											children: [
												{
													name: "Top",
													action: () => snapTo("top"),
												},
												{
													name: "Top left",
													action: () =>
														snapTo("topleft"),
												},
												{
													name: "Top right",
													action: () =>
														snapTo("topright"),
												},
											],
										},
										{
											name: "Bottom",
											children: [
												{
													name: "Bottom left",
													action: () =>
														snapTo("bottomleft"),
												},
												{
													name: "Bottom right",
													action: () =>
														snapTo("bottomright"),
												},
											],
										},
									],
								},
							],
							windowRef
						)
					}
					onClick={handleClick}
				>
					<div
						className="flex flex-row items-center justify-between rounded-t-sm drag-handle cursor-move topbar drag-handle"
						onDoubleClick={handleMaximize}
						style={windowStyle}
					>
						<div className="pl-2">
							{typeof app.executable.config.icon === "string" ? (
								<img
									src={app.executable.config.icon}
									alt={`icon`}
									className="icon"
								/>
							) : (
								<FontAwesomeIcon
									icon={app.executable.config.icon}
									className="icon"
								/>
							)}
						</div>
						<h1 className="flex-grow font-semibold px-2">
							{app.executable.config.displayName}
						</h1>
						<div className="h-full flex">
							{!app.disableMinimize && (
								<button
									className="transition-all duration-100 active:scale-95 w-12 h-8 hover:bg-primary-light"
									onClick={handleMinimize}
								>
									<FontAwesomeIcon
										icon={faMinus as IconProp}
									/>
								</button>
							)}
							<button
								className="transition-all duration-100 active:scale-95 w-12 h-8 hover:bg-primary-light"
								onClick={handleMaximize}
							>
								<FontAwesomeIcon
									icon={faWindowMaximize as IconProp}
								/>
							</button>
							{!app.disableClose && (
								<button
									className="transition-all duration-100 active:scale-95 w-12 h-8 hover:bg-[#ff0000]"
									onClick={handleClose}
								>
									<FontAwesomeIcon icon={faX as IconProp} />
								</button>
							)}
						</div>
					</div>
					<div className="flex-grow overflow-hidden h-full w-full">
						<MemoizedWindowContent app={app} />
					</div>
				</div>
			</Rnd>
			{contextMenuVisible && (
				<ContextMenu
					menuPosition={contextMenuPosition}
					menuItems={contextMenuItems}
					hideMenu={hideContextMenu}
				/>
			)}
		</>
	);
};

export default Window;
