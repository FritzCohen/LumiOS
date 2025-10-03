import { useState } from "react";
import {
	DotNotation,
	PanicConfig,
	PathValue,
	Permission,
	setDeepValue,
} from "../../../../types/globals";
import { UserTheme } from "../../../../context/user/types";
import { defaultPanic } from "../../../../constants/constants";
import { images } from "../../../../constants/constants";

export interface FirstStartState {
	username: string;
	password: string;
	permission: Permission;
	autoLogin: boolean;
	theme: UserTheme;
	backgroundImage: string;
	panic: PanicConfig;
}

const defaultUserData = {
	username: "",
	password: "",
	permission: Permission.ELEVATED,
	autoLogin: false,
	theme: {
		window: {
			primary: "#212529",
			primaryLight: "#464f58",
			secondary: "#343A40",
			secondaryLight: "#737f8c",
			textBase: "white",
		},
		taskbar: [],
		topbar: [],
	},
	backgroundImage: images[0],
	panic: defaultPanic,
};

export const useFirstStart = (): useFirstStartProps => {
	const [userData, setUserData] = useState<FirstStartState>(defaultUserData);
	const [themeIndex, setThemeIndex] = useState("");
	const [backgroundIndex, setBackgroundIndex] = useState(-1);

	function updateField<P extends DotNotation<FirstStartState>>(
		path: P,
		value: PathValue<FirstStartState, P>
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
	userData: FirstStartState;
	updateField: <P extends DotNotation<FirstStartState>>(
		path: P,
		value: PathValue<FirstStartState, P>
	) => void;
	reset: () => void;
	themeIndex: string;
	backgroundIndex: number;
	setThemeIndex: (prev: string) => void;
	setBackgroundIndex: (prev: number) => void;
	defaultUserData: FirstStartState;
}
