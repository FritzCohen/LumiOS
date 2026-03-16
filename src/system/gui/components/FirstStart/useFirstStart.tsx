import { useState } from "react";
import {
	DotNotation,
	PathValue,
	Permission,
	setDeepValue,
} from "../../../../types/globals";
import { defaultPanic } from "../../../../constants/constants";
import { images } from "../../../../constants/constants";
import defaultTheme from "../../../../constants/defaultTheme";
import { ColorTheme, PanicConfig, User } from "../../../../context/user/userTypes";
import defaultUser from "../../../../constants/defaultUser";

export interface FirstStartState {
	username: string;
	password: string;
	permission: Permission;
	autoLogin: boolean;
	theme: ColorTheme;
	backgroundImage: string;
	panic: PanicConfig;
}

const defaultUserData: User = {
	...defaultUser,
	username: "",
	password: "",
	permission: Permission.ELEVATED,
	autoLogin: false,
	colorTheme: defaultTheme,
	backgroundImage: images[0],
	panic: defaultPanic,
};

export const useFirstStart = (): useFirstStartProps => {
	const [userData, setUserData] = useState<User>(defaultUserData);
	const [themeIndex, setThemeIndex] = useState("");
	const [backgroundIndex, setBackgroundIndex] = useState(-1);

	function updateField<P extends DotNotation<User>>(
		path: P,
		value: PathValue<User, P>
	) {
		setUserData((prev) => setDeepValue(prev, path, value));
	}

	const reset = () => {
		setUserData(defaultUserData);
	};

	return {
		userData,
		updateField,
		reset,
		themeIndex,
		setThemeIndex,
		backgroundIndex,
		setBackgroundIndex,
		defaultUserData,
	};
};

export interface useFirstStartProps {
	userData: User;
	updateField: <P extends DotNotation<User>>(
		path: P,
		value: PathValue<User, P>
	) => void;
	reset: () => void;
	themeIndex: string;
	backgroundIndex: number;
	setThemeIndex: (prev: string) => void;
	setBackgroundIndex: (prev: number) => void;
	defaultUserData: User;
}
