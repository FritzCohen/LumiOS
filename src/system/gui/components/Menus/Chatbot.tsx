import {
	useEffect,
	useRef,
} from "react";
import { useWindow } from "../../../../context/window/WindowProvider";
import { useChatbot } from "./useChatbot";
import Input from "../../../lib/Input";
import Button from "../../../lib/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { useKernel } from "../../../../hooks/useKernal";
import useGetApps from "../../../../hooks/useGetApps";
import virtualFS from "../../../api/virtualFS";
import { useUser } from "../../../../context/user/user";
import { useFloatingMenuPosition } from "./useFloatingMenuPosition";
import { useOutsideClick } from "../../../../hooks/useOutsideClick";

const Chatbot = () => {
	const trayRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const messagesContainerRef = useRef<HTMLDivElement | null>(null);

	const { setMenu } = useWindow();
	const { openApp } = useKernel();
	const { currentUser } = useUser();
	const apps = useGetApps();
	const { bottom, positionStyle } = useFloatingMenuPosition(trayRef, () => setMenu("None"));

	useOutsideClick([trayRef], ({ clickedRefIndex }) => {
		if (clickedRefIndex == 0) return;

		setMenu("None");
	})

	const handleOpen = (appName: string, args: any) => {
		const app = apps.find(
			(app) =>
				app.config.name.toLowerCase() === appName ||
				app.config.displayName.toLowerCase() === appName
		);

		if (app) {
			openApp({
				...app,
				config: {
					...app.config,
					defaultPath: args ? args.path : "",
				},
			});

			setMenu("None");
		}
	};

	// HANDLERS FOR EVERY THINGIE
	const intentHandlers: Record<string, (args: any) => void> = {
		delete_file: async (args) =>
			await virtualFS.deleteFile(args.path, args.name),
		write_file: async (args) =>
			await virtualFS.writeFile(args.path, args.name, "", "txt"),
		write_directory: async (args) =>
			await virtualFS.writeDirectory(
				args.path,
				args.name,
				currentUser?.permission || 0
			),
		open_browser: (args) => handleOpen("browser", args),
		open_fileexplorer: (args) => handleOpen("file explorer", args),
		open_code: (args) => handleOpen("Visual Code", args),
	};

	const { messages, processCommand } = useChatbot(async (intent, args) => {
		console.log("⚡ Intent confirmed:", intent, args);
		intentHandlers[intent]?.(args);
	});


	useEffect(() => {
	if (messagesContainerRef.current) {
		messagesContainerRef.current.scrollTo({
		top: messagesContainerRef.current.scrollHeight,
		behavior: 'smooth',
		});
	}
	}, [messages]);

	const handleSubmit = (e: React.FormEvent, val?: string) => {
		e.preventDefault();
		const value = val || inputRef.current?.value.trim();

		if (value === "help") processCommand("Hello!");

		if (value) {
			processCommand(value);
			inputRef.current!.value = "";
		}
	};

	return (
		<div
			id="search-apps"
			ref={trayRef}
			className="app-list search-apps glass flex flex-col"
			style={{
				...positionStyle,
				bottom: `${bottom}px`,
				height: `${window.innerHeight / 2}px`,
				overflow: "hidden",
			}}
		>
			<div className="flex flex-col overflow-y-auto px-2 h-full w-full py-2 overflow-hidden" ref={messagesContainerRef}>
				{[...messages].reverse().map((msg, idx) => (
					<div
						key={idx}
						className="mb-3 flex flex-col gap-2 w-full"
						style={{
							wordWrap: "break-word",
							overflowWrap: "break-word",
							whiteSpace: "pre-wrap",
						}}
					>
						{/* User message (slide in from far right) */}
						{msg.user && (
							<div
								className="flex justify-end"
								style={{
									transform: "translateX(150px)",
									opacity: 0,
									transition:
										"opacity 300ms ease, transform 300ms ease",
								}}
								ref={(el) => {
									if (el) {
										setTimeout(() => {
											el.style.opacity = "1";
											el.style.transform =
												"translateX(0)";
										}, 10);
									}
								}}
							>
								<div className="bg-secondary rounded px-3 py-2 max-w-[60%] break-words">
									{msg.user}
								</div>
							</div>
						)}

						{/* Bot message (slide in from far left with delay) */}
						{msg.bot && (
							<div
								className="flex justify-start"
								style={{
									transform: "translateX(-400px)",
									opacity: 0,
									transition:
										"opacity 300ms ease 300ms, transform 300ms ease 1000ms",
								}}
								ref={(el) => {
									if (el) {
										setTimeout(() => {
											el.style.opacity = "1";
											el.style.transform =
												"translateX(0)";
										}, 10);
									}
								}}
							>
								<div className="bg-[#212121] rounded px-3 py-2 max-w-[60%] break-words">
									{msg.bot}
								</div>
							</div>
						)}
						{/* Intent + confidence + args */}
						<div className="text-xs">
							{msg.intent}{" "}
							{msg.confidence
								? (msg.confidence * 100).toFixed(2)
								: 0}
							%
							{msg?.args &&
								Object.keys(msg.args).map((key) => (
									<div key={key}>
										{key}: {msg.args && msg.args[key]}
									</div>
								))}
						</div>
					</div>
				))}
			</div>
			{messages.length == 0 && (
				<div className="text-center flex items-center flex-col">
					<h3 className="font-bold text-xl my-2">Assistant</h3>
					<p className="pb-3">Type "help" to get started!</p>
					<Button
						className="flex flex-row gap-2 my-1"
						onClick={(e) => {
							handleSubmit(e, "Hello!");
						}}
					>
						<FontAwesomeIcon icon={faPaperPlane} /> Hello!
					</Button>
					<Button
						className="flex flex-row gap-2 my-1"
						onClick={(e) => {
							handleSubmit(e, "What's in the new update?");
						}}
					>
						<FontAwesomeIcon icon={faPaperPlane} /> What's in the
						new update?
					</Button>
					<Button
						className="flex flex-row gap-2 my-1"
						onClick={(e) => {
							handleSubmit(e, "Tell me about settings.");
						}}
					>
						<FontAwesomeIcon icon={faPaperPlane} /> Tell me about
						settings.
					</Button>
					<hr
						style={{ color: "gray" }}
						className="w-11/12 text-center mx-auto my-2"
					/>
				</div>
			)}
			<form
				onSubmit={handleSubmit}
				className="border-t p-2 flex items-center"
				name="chatbot"
				id="chatbot"
			>
				<Input
					ref={inputRef}
					type="text"
					placeholder="Ask something..."
					className="flex-1 outline-none px-2"
				/>
				<button
					type="submit"
					className="ml-2 px-3 py-1 rounded hover:bg-blue-600"
				>
					Send
				</button>
			</form>
		</div>
	);
};

export default Chatbot;
