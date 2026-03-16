import { User } from "../context/user/userTypes";
import defaultIcon from "../assets/no-bg-logo.png";
import { Permission } from "../types/globals";
import defaultTheme from "./defaultTheme";
import { defaultPanic, defaultSystemProps, defaultUIStyle } from "./constants";
import defaultImage from "../assets/background/bg1.avif";

const defaultUser: User = {
	username: "",
	password : "",
	icon: defaultIcon,
	permission: Permission.ELEVATED,
	autoLogin: false,
	colorTheme: defaultTheme,
    uiStyle: defaultUIStyle,
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
	systemProps: defaultSystemProps,
};

export default defaultUser;