import { useWindow } from "../context/window/WindowProvider";
import { useKernel } from "../hooks/useKernal";
import DesktopItems from "./gui/components/Desktop/DesktopItems";
import Window from "./gui/components/Desktop/Window/Window";
import Chatbot from "./gui/components/Menus/Chatbot";
import MainMenu from "./gui/components/Menus/MainMenu";
import SearchApps from "./gui/components/Menus/SearchApps";
import Taskbar from "./gui/components/Taskbar/Taskbar";
import startup from "../assets/Sounds/startup.wav";
import { useEffect } from "react";
import Topbar from "./gui/components/Topbar/Topbar";
import logger from "../constants/logger";
import FirstStartPopup from "./gui/components/Popups/FirstStartPopup";
import { useUser } from "../context/user/user";

const Desktop = () => {
	const { openedApps, openApp } = useKernel();
	const { currentUser } = useUser();
	const { menu } = useWindow();

	useEffect(() => {
        const audio = new Audio(startup);
        audio.play().catch(err => {
            logger.error("Failed to play startup sound: " + String(err));
        });
    }, []);

	useEffect(() => {
		if (!currentUser) return;

		if (currentUser.systemProps.system.firstLogin && !openedApps.some(val => val.executable.config.displayName === "Welcome!")) {
			openApp({
				config: {
					name: "First Start",
					displayName: "Welcome!",
					permissions: 0,
					icon: "",
				},
				mainComponent: (props) => <FirstStartPopup {...props} />
			});
		}
	}, [currentUser?.systemProps.system.firstLogin]);

	return (
		<div className="desktop">
			{/* Image background blur */}
			<div className="desktop-bg-blur"></div>

			{/* Topbar */}
			{/* Default icons/items for the topbar are inside here */}
			<Topbar />

			{/* Opened apps */}
			{openedApps.map((app) => (
				<Window app={app} key={app.id} />
			))}

			{/* Desktop items */}
			<DesktopItems />

			{/* Menus */}
			{menu === "SearchApps" && <SearchApps />}
			{menu === "Chatbot" && <Chatbot />}
			{menu === "MainMenu" && <MainMenu />}

			<Taskbar />
		</div>
	);
};

export default Desktop;
