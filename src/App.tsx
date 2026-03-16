import { useEffect } from "react";
import Desktop from "./system/Desktop";
import { useUser } from "./context/user/user";
import API from "./system/api/API";
import Login from "./system/gui/components/Login/Login";
import AutoSave from "./system/api/AutoSave";
import Loading from "./system/gui/components/Login/Loading";
import SetupWizard from "./system/gui/components/FirstStart/SetupWizard";
import UpdateChecker from "./system/api/UpdateChecker";
import defaultTheme from "./constants/defaultTheme";
import Bios from "./system/gui/components/Bios/Bios";
import { useWindow } from "./context/window/WindowProvider";

function App() {
	const { loggedIn, currentUser, users, login, applyTheme, applyBackground, applyPanic } = useUser();
	const { showBios } = useWindow();

	/**
	 * Getting default theme stuff
	*/
	useEffect(() => {
		const loadExecutable = async () => {
			if (!currentUser && !loggedIn) {
				applyTheme(defaultTheme);

				return;
			};
			if (currentUser == null) return;

			applyTheme(currentUser.colorTheme);
			applyBackground(currentUser.backgroundImage);
			applyPanic(currentUser.panic);
		};

		loadExecutable();
	}, [currentUser, applyTheme, applyBackground, applyPanic, loggedIn]);

	// Autologin logic
	useEffect(() => {
		if (loggedIn) return;

		const autoLoginuser = users.find(user => user.autoLogin);

		if (autoLoginuser) {
			login(autoLoginuser.username, autoLoginuser.password);
		}
	}, [loggedIn, users, login]);

	// Clicking the key to go to a different website logic
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
		if (currentUser && currentUser.panic && event.key === currentUser.panic.key) {
			window.location.href = currentUser.panic.website;
		}
		};

		window.addEventListener('keydown', handleKeyDown);

		return () => {
		window.removeEventListener('keydown', handleKeyDown);
		};
	}, [currentUser]);

	return (
		<>
			{users.length == 0 ? <SetupWizard /> : loggedIn ? 
				<Desktop /> 
				: 
				<Login />
			}
			<Loading />
			<API />
			<AutoSave />
			<UpdateChecker />
			{showBios && <Bios />}
		</>
	);
}

export default App;
