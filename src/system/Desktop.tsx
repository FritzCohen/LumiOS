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

const Desktop = () => {
	const { openedApps } = useKernel();
	const { menu } = useWindow();

	useEffect(() => {
        const audio = new Audio(startup);
        audio.play().catch(err => {
            console.error("Failed to play startup sound:", err);
        });
    }, []);

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
