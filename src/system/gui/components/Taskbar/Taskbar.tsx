import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useWindow } from "../../../../context/window/WindowProvider";
import "./taskbar.css";
import {
	faArrowLeft,
	faArrowRight,
	faArrowsLeftRight,
	//faCircleDot,
	faEye,
	faEyeSlash,
	faPlusCircle,
	faRefresh,
	faSearch,
	faTrashCan,
	faUpRightFromSquare,
	faX,
} from "@fortawesome/free-solid-svg-icons";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import logo from "../../../../assets/no-bg-logo.png";
import { useCallback, useEffect, useRef, useState } from "react";
import { Directory, File } from "../../../api/types";
import { useFolderWatcher } from "../../../api/useFolderWatcher";
import { useKernel } from "../../../../hooks/useKernal";
import { generateDisplayedTaskbarItems } from "./functions";
import { TaskbarDesktopItem } from "../../../../types/globals";
import { OpenedApp } from "../../../../context/kernal/kernal";
import { useUser } from "../../../../context/user/user";
import useContextMenu from "../ContextMenu/useContextMenu";
import ContextMenu from "../ContextMenu/ContextMenu";
import virtualFS from "../../../api/virtualFS"; // <- assumed location
import FileExplorer from "../../../apps/FileExplorer/FileExplorer";
import Shortcut from "../../../apps/Shortcut/Shortcut";

const Taskbar = () => {
	const [taskbarItems, setTaskbarItems] = useState<
		Record<string, File | Directory>
	>({});
	const { openApp, closeApp, openedApps, bringToFront, modifyProp } =
		useKernel();
	const { setMenu, systemProps, updateSystemProps } = useWindow();
	const { userDirectory } = useUser();
	const {
		contextMenuPosition,
		contextMenuVisible,
		showContextMenu,
		hideContextMenu,
		contextMenuItems,
	} = useContextMenu();

	const taskbarRef = useRef<HTMLDivElement | null>(null);
	const previousItemsRef = useRef<Record<string, File | Directory>>({});
	const [tempName, setTempName] = useState("");
	const [renamingId, setRenamingId] = useState<string | null>(null);

	const smartSetDesktopItems = useCallback(
		(newItems: Record<string, File | Directory>) => {
			const old = previousItemsRef.current;

			const oldKeys = Object.keys(old);
			const newKeys = Object.keys(newItems);

			const orderChanged = oldKeys.length !== newKeys.length ||
				oldKeys.some((key, i) => key !== newKeys[i]);

			const valueChanged = Object.entries(old).some(
				([k, v]) => newItems[k] !== v
			);

			if (orderChanged || valueChanged) {
				previousItemsRef.current = { ...newItems };
				setTaskbarItems({ ...newItems });
			}
		},
		[]
	);

	useFolderWatcher(`${userDirectory}/Taskbar/`, smartSetDesktopItems);

	const [displayedTaskbarItems, setDisplayedTaskbarItems] = useState<
		TaskbarDesktopItem[]
	>([]);
	const exeRegistryRef = useRef<
		Map<
			string,
			{ icon: any; id: string; displayName: string; permission: number }
		>
	>(new Map());

	useEffect(() => {
		const result = generateDisplayedTaskbarItems(
			openedApps,
			taskbarItems,
			exeRegistryRef
		);
		setDisplayedTaskbarItems(result);
	}, [openedApps, taskbarItems]);

	const handleItemClick = (item: TaskbarDesktopItem) => {
		const app: OpenedApp | undefined = openedApps.find(
			(app) => app.id === item.id || app.executable.config.name === item.title
		);

		if (app) {
			modifyProp(app.id, "minimized", !app.minimized);
			bringToFront(app.id);
			return;
		}

		const config = {
			name: item.title,
			displayName: item.displayName || item.title,
			icon: item.icon,
			permissions: item.permission ?? 0,
		}		

		if (item.type === "exe") {
			openApp({
				config: config,
				mainComponent: () => undefined,
			});
		} else if (item.type === "shortcut") {
			openApp({
				config: config,
				mainComponent: () => <Shortcut name={item.title} path={`${userDirectory}/Taskbar/`} />
			})
		} else if (item.type === "directory") {
			openApp({
				config: config,
				mainComponent: (props: any) => <FileExplorer 
					defaultPath={`${userDirectory}/Taskbar/${item.title}`} 
					{...props}
				/>
			})
		} else {
			openApp({
				config: config,
				mainComponent: () => <div></div>,
			});
		}
	};

	const handleRename = async (
		item: TaskbarDesktopItem,
		oldName: string,
		newName: string
	) => {
		await virtualFS.rename(`${userDirectory}/Taskbar/`, oldName, newName);
		const reg = exeRegistryRef.current.get(oldName);
		if (reg) {
			exeRegistryRef.current.delete(oldName);
			exeRegistryRef.current.set(newName, {
				...reg,
				displayName: newName,
			});
		}
		setRenamingId(null);
	};

	const startRenaming = (item: TaskbarDesktopItem) => {
		setRenamingId(item.title);
		setTempName(item.displayName || item.title);
	};

	const finishRenaming = (item: TaskbarDesktopItem, commit: boolean) => {
		if (commit && tempName.trim()) {
			const oldName = item.displayName || item.title;
			handleRename(item, oldName, tempName.trim());
		} else {
			setRenamingId(null);
		}
	};

	const getTextSizeClass = (text: string) => {
		if (text.length <= 10) return "text-sm";
		if (text.length <= 20) return "text-xs";
		if (text.length <= 30) return "text-[10px]";
		return "text-[9px]";
	};

	const handleDelete = async (item: TaskbarDesktopItem) => {
		if (taskbarItems[item.title || item.displayName]) {
			await virtualFS.deleteFile(
				`${userDirectory}/Taskbar/`,
				item.title || item.displayName
			);
		} else {
			const app = openedApps.find(app => app.executable.config.name === item.title);

			if (!app) return;

			const content = app?.executable;

			// @ts-expect-error Since it has to be wiped cause indexedDB doesn't take functions
			content.mainComponent = undefined;
			content.config.onCompleteHandler = undefined;			
			
			await virtualFS.writeFile(
				`${userDirectory}/Taskbar/`,
				item.title || item.displayName,
				content,
				"exe",
			)
		}
	};

	const handleMove = async (item: TaskbarDesktopItem, direction: 'up' | 'down') => {	
		if (!taskbarItems[item.title]) return;	
		await virtualFS.moveUpOrDown(`${userDirectory}/Taskbar/`, item.title, direction);
	};

	return (
		<div
			className="taskbar pointer-events-none"
			style={{
				width: "100%",
				minWidth: systemProps.taskbar.mode === "full" ? "49%" : "unset",
				borderRadius:
					systemProps.taskbar.mode === "full" ? "0px" : "10px",
				marginBottom:
					systemProps.taskbar.mode === "full" ? "0px" : "16px",
				display: "flex",
				justifyContent:
					systemProps.taskbar.mode === "full"
						? "flex-start"
						: "center",
			}}
		>
			<div
				className={`glass flex h-full rounded pointer-events-auto
					${!systemProps.taskbar.onHover
							? "opacity-0 hover:opacity-100 transition-opacity duration-100 group"
							: ""}
					`}
				ref={taskbarRef}
				style={{
					width:
						systemProps.taskbar.mode === "full"
							? "100%"
							: "fit-content",
					minWidth: "49%",
					justifyContent:
						systemProps.taskbar.align === "start"
							? "flex-start"
							: systemProps.taskbar.align === "center"
							? "center"
							: "flex-end",
				}}
				onContextMenu={(e) =>
					showContextMenu(
						e,
						[
							{
								name: "Refresh",
								action: () => smartSetDesktopItems,
								icon: faRefresh,
							},
							{
								name: `Set ${
									systemProps.taskbar.mode === "full" ? "Floating" : "Full"
								}`,
								action: () => {
									updateSystemProps({
										taskbar: {
											...systemProps.taskbar,
											mode: systemProps.taskbar.mode === "full" ? 
												"floating" : "full"
										}
									});
								},
							},
							{
								name: "Alignment",
								children: [
									{
										name: "Start",
										icon: faArrowLeft,
										action() {
											updateSystemProps({
												taskbar: {
													...systemProps.taskbar,
													align: "start"
												}
											});
										},
									},
									{
										name: "Center",
										icon: faArrowsLeftRight,
										action() {
											updateSystemProps({
												taskbar: {
													...systemProps.taskbar,
													align: "center"
												}
											});
										},
									},
									{
										name: "End",
										icon: faArrowRight,
										action() {
											updateSystemProps({
												taskbar: {
													...systemProps.taskbar,
													align: "end"
												}
											});
										},
									},
								],
							},
							{
								name: `${
									!systemProps.taskbar.onHover
										? "Always shown"
										: "Require hover"
								}`,
								icon: !systemProps.taskbar.onHover
									? faEye
									: faEyeSlash,
								action() {
									updateSystemProps({
										taskbar: {
											...systemProps.taskbar,
											onHover: systemProps.taskbar.onHover ? false : true
										}
									});
								},
							},
						],
						taskbarRef
					)
				}
			>
				<div
					onClick={() => setMenu("MainMenu")}
					className="taskbar-item app-list-container"
				>
					<img src={logo} alt="logo" />
				</div>
				{/*<div
					onClick={() => setMenu("Chatbot")}
					className="taskbar-item"
				>
					<FontAwesomeIcon icon={faCircleDot} />
				</div>*/}
				<div
					onClick={() => setMenu("SearchApps")}
					className="taskbar-item"
				>
					<FontAwesomeIcon icon={faSearch as IconProp} />
				</div>
				{displayedTaskbarItems.map((item, index) => {
					const isRenaming = renamingId === item.title;
					const app = openedApps.find(
						(app) => app.executable.config.name === item.title
					);

					return (
						<div
							key={index}
							className={`taskbar-item text-[10px] ${
								item.open ? "underline border" : ""
							}`}
							onClick={() => handleItemClick(item)}
							onContextMenu={(e) =>
								showContextMenu(
									e,
									[
										{
											name: `${
												app
													? app.minimized
														? "Maximize"
														: "Minimize"
													: `Open`
											}`,
											icon: faUpRightFromSquare,
											action: () => handleItemClick(item),
										},
										{ name: "Move", children: [
											{ name: "Left", icon: faArrowLeft, action: () => handleMove(item, "up") },
											{ name: "Right", icon: faArrowRight, action: () => handleMove(item, "down") },
										]},
										{
											name: "Close",
											icon: faX,
											gap: true,
											action: () => {
												if (app) {
													closeApp(app.id);
												}
											},
										},
										{
											name: `${taskbarItems[item.title || item.displayName] ? `
												Remove
											` : `Add`}`,
											icon: taskbarItems[item.title || item.displayName] ?
											 faTrashCan : faPlusCircle,
											action: () => handleDelete(item),
										},
									],
									taskbarRef
								)
							}
						>
							<img src={item.icon} alt="" />
							{isRenaming ? (
								<input
									className={`rename-input text-center w-full max-w-[100%] bg-transparent border border-blue-500 px-1 py-0.5 outline-none ${getTextSizeClass(
										tempName
									)}`}
									style={{ color: "black" }}
									autoFocus
									value={tempName}
									onChange={(e) =>
										setTempName(e.target.value)
									}
									onBlur={() => finishRenaming(item, false)}
									onKeyDown={(e) => {
										if (e.key === "Enter")
											finishRenaming(item, true);
										else if (e.key === "Escape")
											finishRenaming(item, false);
									}}
									onClick={(e) => e.stopPropagation()}
								/>
							) : (
								<p
									className="w-fit h-fit"
									onDoubleClick={(e) => {
										e.stopPropagation();
										startRenaming(item);
									}}
								>
									{/*item.displayName || item.title*/}
								</p>
							)}
						</div>
					);
				})}
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

export default Taskbar;
