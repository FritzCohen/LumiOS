import { User, UserTheme } from "../context/user/types";
import { useUser } from "../context/user/user";
import { PanicConfig } from "../types/globals";

const useApplyTheme = (user: User | null) => {
	const { modifyUserProp } = useUser();

	return {
		setFullTheme: (newTheme: UserTheme, save?: boolean) => {
			Object.entries(newTheme.window).forEach(([key, value]) => {
				if (typeof value === "string") {
					document.documentElement.style.setProperty(`--${key}`, value);
				}
			});

			newTheme.topbar.forEach(({ property, value }) => {
				document.documentElement.style.setProperty(property, value);
			});

			newTheme.taskbar.forEach(({ property, value }) => {
				document.documentElement.style.setProperty(property, value);
			});
			
			if (save && user) {
				modifyUserProp(user.username, "theme", newTheme);
			}
		},
		setBackgroundImage: (image: string, save?: boolean) => {
			document.documentElement.style.setProperty("--background-image", `url(${image})`);

			if (save && user) {
				modifyUserProp(user.username, "backgroundImage", image);
			}
		},
		setPanic: (panic: PanicConfig) => {
			if (!panic) return;

			window.document.title = panic.title;

			let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;

			if (!link) {
				link = document.createElement('link');
				link.rel = 'icon';
				document.head.appendChild(link);
			}
			
			if (link) {
				link.href = panic.favicon;
			}
		}
	};
};

export default useApplyTheme;