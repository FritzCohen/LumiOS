import { useEffect, useRef, useState } from "react";
import { useUser } from "../../../../context/user/user";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	defaultPanic,
	defaultSystemProps,
} from "../../../../constants/constants";
import { faUserCircle } from "@fortawesome/free-solid-svg-icons";
import defaultImage from "../../../../assets/background/image4.jpg";
import defaultIcon from "../../../../assets/no-bg-logo.png";
import "./login.css";
import { Permission } from "../../../../types/globals";
import { User } from "../../../../context/user/types";
import Input from "../../../lib/Input";
import Button from "../../../lib/Button";
import useApplyTheme from "../../../../hooks/useApplyTheme";
import { motion, AnimatePresence } from "framer-motion";
import useContextMenu from "../ContextMenu/useContextMenu";
import ContextMenu from "../ContextMenu/ContextMenu";

const Login = () => {
	const { users, login, createUser } = useUser();

	// Possible stages of the login flow
	type Stage = "splash" | "signup" | "selectUser" | "login";
	const [stage, setStage] = useState<Stage>("splash");
	const [time, setTime] = useState(new Date());
	const [selectedUser, setSelectedUser] = useState<string | null>(null);
	const [password, setPassword] = useState("");
	const applyTheme = useApplyTheme(
		users.find((user) => user.username === selectedUser) || null
	);
	const [background, setBackground] = useState<string>(defaultImage);
	
	// Context menu stuff
	const loginRef = useRef<HTMLDivElement>(null);

	const {
		contextMenuVisible,
		contextMenuPosition,
		contextMenuItems,
		showContextMenu,
		hideContextMenu,
	} = useContextMenu();

	// Update clock every second
	useEffect(() => {
		const interval = setInterval(() => setTime(new Date()), 1000);
		return () => clearInterval(interval);
	}, []);

	// Handle splash click: go to signup if no users, else user select
	const handleSplashClick = () => {
		if (users.length === 0) {
			setStage("signup");
		} else {
			setStage("selectUser");
		}
	};

	// Handle user select, go to login screen
	const handleUserClick = (username: string) => {
		setSelectedUser(username);
		setStage("login");

		const found = users.find((user) => user.username === username);
		if (found) {
			setBackground(found.backgroundImage);
			applyTheme.setBackgroundImage(found.backgroundImage, false);
		}
	};

	// Handle login submit
	const handleLogin = (e: React.FormEvent) => {
		e.preventDefault();
		if (selectedUser) {
			login(selectedUser, password); // your login logic depends on password only per your reducer
			setPassword("");
		}
	};

	// Handle signup submit - simple placeholder
	const handleSignup = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const form = e.currentTarget;
		const formData = new FormData(form);

		const username = formData.get("username")?.toString().trim() || "";
		const password = formData.get("password")?.toString().trim() || "";

		if (!username || !password) {
			alert("Please fill in both username and password.");
			return;
		}

		// Create a new user object, fill in required User fields as needed
		const newUser: User = {
			username,
			password,
			icon: defaultIcon,
			permission: Permission.ELEVATED,
			autoLogin: false,
			theme: {
				window: {
					primary: "",
					primaryLight: "",
					secondary: "",
					secondaryLight: "",
					textBase: "",
				},
				taskbar: [],
				topbar: [],
			},
			browserConfig: {
				proxyLinks: [],
				defaultLink: {
					title: "Home",
					link: "/home",
				},
				bookmarks: [],
			},
			backgroundImage: defaultImage,
			panic: defaultPanic,
			installedApps: [],
			systemProps: defaultSystemProps,
		};

		createUser(newUser);

		// Optionally go to user select or login screen
		setStage("selectUser");
	};

	return (
		<div className="w-screen h-screen flex items-center justify-center relative overflow-hidden desktop font-sans select-none" ref={loginRef} onContextMenu={
			(e) => showContextMenu(e, [
				{
					name: "Proceed",
					action: () => setStage("selectUser")
				}
			], loginRef)
		}>
			{/* SPLASH SCREEN */}
			<AnimatePresence mode="wait">
				<motion.div
					key={background} // triggers a new animation for each image
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.8 }}
					className="absolute inset-0 bg-cover bg-center z-0"
					style={{ backgroundImage: `url(${background})` }}
				/>
			</AnimatePresence>

			<div
				className={`absolute inset-0 items-center justify-center transition-opacity duration-700 flex flex-col gap-1 z-20 ${
					stage === "splash"
						? "opacity-100"
						: "opacity-0 pointer-events-none"
				}`}
				onClick={handleSplashClick}
			>
				<div className="text-[64px] font-semibold leading-none">
					{time.toLocaleTimeString("en-US", {
						hour: "numeric",
						minute: "numeric",
						hour12: true,
					})}
				</div>
				<div className="text-[20px] font-medium tracking-wide">
					{time.toLocaleDateString(undefined, {
						weekday: "long",
						month: "long",
						day: "numeric",
					})}
				</div>
				<p className="text-white text-xs opacity-60 cursor-pointer select-none">
					Click anywhere to continue
				</p>
			</div>

			{/* SIGNUP SCREEN */}
			<div
				className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-700 z-30 glass px-6 ${
					stage === "signup"
						? "opacity-100"
						: "opacity-0 pointer-events-none"
				}`}
			>
				<h2 className="text-white text-3xl mb-8 font-semibold">
					Create an Account
				</h2>
				<form
					onSubmit={handleSignup}
					className="flex flex-col w-full max-w-sm space-y-4"
				>
					<Input
						name="username"
						type="text"
						placeholder="Username"
						required
					/>
					<Input
						name="password"
						type="password"
						placeholder="Password"
						required
						autoComplete="off"
					/>
					<Button type="submit">Sign Up</Button>
					<Button onClick={() => setStage("splash")}>
						Back to user select
					</Button>
				</form>
			</div>

			{/* USER SELECTION SCREEN */}
			<div
				className={`absolute inset-0 flex flex-col justify-end pb-12 transition-opacity duration-500 z-30 glass ${
					stage === "selectUser"
						? "opacity-100"
						: "opacity-0 pointer-events-none"
				}`}
			>
				<div className="flex justify-center gap-4">
					{users.map((user) => (
						<button
							key={user.username}
							onClick={() => handleUserClick(user.username)}
							className="relative flex flex-col items-center cursor-pointer p-4 rounded-xl backdrop-blur-md user-item"
						>
							{/* Glass effect on user icon */}
							<div className="w-24 h-24 mb-3 rounded-full flex items-center justify-center text-4xl">
								{typeof user.icon === "string" ? (
									<img
										src={user.icon}
										alt="usericon"
										className="w-10 h-10"
									/>
								) : (
									<FontAwesomeIcon
										icon={faUserCircle as IconDefinition}
									/>
								)}
							</div>
							<span className="text-white font-semibold select-none">
								{user.username}
							</span>
						</button>
					))}
				</div>
				<button
					onClick={() => setStage("signup")}
					className="mt-8 text-sm text-[#aaa] hover:text-white underline self-center"
				>
					Create a new account
				</button>
			</div>

			{/* LOGIN SCREEN */}
			<div
				className={`absolute inset-0 flex flex-col items-center justify-center px-6 transition-opacity duration-500 z-30 glass ${
					stage === "login"
						? "opacity-100"
						: "opacity-0 pointer-events-none"
				}`}
				onContextMenu={(e) => 
				showContextMenu(e, [
						{
							name: "Go Back",
							action: () => setStage("selectUser")
						}
				], loginRef)
				}
			>
				<h2 className="text-white text-3xl mb-8 font-semibold">
					Welcome, {selectedUser}
				</h2>
				<form
					onSubmit={handleLogin}
					className="flex flex-col w-full max-w-sm space-y-4"
				>
					<Input
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						placeholder="Enter your password"
						required
						autoComplete="on"
						className="!py-2"
					/>
					<Button type="submit" className="p-4">
						Log In
					</Button>
					<button
						onClick={() => setStage("selectUser")}
						className="mt-4 text-sm text-[#888] hover:text-white underline"
					>
						Back to user select
					</button>
				</form>
			</div>
			{/* Context Menu */}
			{contextMenuVisible && (
				<ContextMenu
					menuItems={contextMenuItems}
					menuPosition={contextMenuPosition}
					hideMenu={hideContextMenu}
				/>
			)}
		</div>
	);
};

export default Login;
