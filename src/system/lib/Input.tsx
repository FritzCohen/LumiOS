import React, { InputHTMLAttributes, useRef, useImperativeHandle } from "react";
import "./lib.css";
import useContextMenu from "../gui/components/ContextMenu/useContextMenu";
import ContextMenu from "../gui/components/ContextMenu/ContextMenu";
import {
	faBackspace,
	faClone,
	faFont,
	faPaste,
	faRedo,
	faSearch,
	faUndo,
} from "@fortawesome/free-solid-svg-icons";
import { useUser } from "../../context/user/user";
import { useKernel } from "../../hooks/useKernal";
import virtualFS from "../api/virtualFS";
import { createError } from "../api/errors";
import { FileErrorType } from "../../types/globals";
import Browser from "../apps/Browser/Browser";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	checkbox?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className = "", ...rest }, ref) => {
		const innerRef = useRef<HTMLInputElement>(null);

		// Forward our internal ref to parent
		useImperativeHandle(ref, () => innerRef.current as HTMLInputElement);

		// User info
		const { openApp } = useKernel();
		const { currentUser, userDirectory } = useUser();

		const handleOpenInFuckassBrowser = async () => {
			if (!currentUser || !innerRef.current) return;

			const browserFile = await virtualFS.readfile(`${userDirectory}Apps`, "Browser");

			if (!browserFile) throw createError(FileErrorType.FileNotFound);
			if (browserFile.fileType !== "exe") throw createError(FileErrorType.InvalidFileType);

			const value = innerRef.current.value;
			
			openApp({
				...browserFile.content,
				mainComponent: (props) => <Browser defaultLink={value} {...props} />
			})
		};

		const {
			contextMenuVisible,
			contextMenuPosition,
			contextMenuItems,
			showContextMenu,
			hideContextMenu,
		} = useContextMenu();

		return (
			<>
				<div
					className="relative my-2 w-full"
					onContextMenu={(e) => {
						showContextMenu(
							e,
							[
								{
									name: "Undo",
									icon: faUndo,
									action: () => document.execCommand("undo"),
								},
								{
									name: "Redo",
									icon: faRedo,
									action: () => document.execCommand("redo"),
								},
								{
									name: "Paste",
									icon: faPaste,
									action: () => document.execCommand("paste"),
								},
								{
									name: "Select All",
									icon: faFont,
									action: () =>
										document.execCommand("selectAll"),
									gap: true,
								},
								{
									name: "Copy All",
									icon: faClone,
									action: () => {
										if (innerRef.current) {
											innerRef.current.select();
											document.execCommand("copy");
										}
									},
								},
								...(currentUser ? [
									{
										name: "Open in Browser",
										icon: faSearch,
										action: handleOpenInFuckassBrowser
									}
								] : []),
								{
									name: "Delete All",
									icon: faBackspace,
									action: () => {
										if (innerRef.current) {
											const input = innerRef.current;
											input.value = "";
										}
									},
								},
							],
							innerRef
						);
					}}
				>
					<input
						className={`input-like-select ${className}`}
						ref={innerRef}
						{...rest}
					/>
				</div>

				{contextMenuVisible && (
					<ContextMenu
						menuItems={contextMenuItems}
						menuPosition={contextMenuPosition}
						hideMenu={hideContextMenu}
					/>
				)}
			</>
		);
	}
);

export default Input;
