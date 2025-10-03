import React, {
	createContext,
	useContext,
	useReducer,
	useMemo,
	useEffect,
	ReactNode,
	useRef,
} from "react";
import { SystemProps } from "./types";
import { useUser } from "../user/user";
import { defaultSystemProps } from "../../constants/constants";
import { DotNotation, PathValue, setDeepValue } from "../../types/globals";

// ---- state & actions
type Menu = "Chatbot" | "SearchApps" | "MainMenu" | "None";

interface WindowState {
	openMenu: Menu;
	systemProps: SystemProps;
}

type Action =
	| { type: "SET_MENU"; payload: Menu }
	| { type: "REPLACE_SYSTEM_PROPS"; payload: SystemProps }
	| { type: "UPDATE_SYSTEM_PROPS"; payload: Partial<SystemProps> };

function reducer(state: WindowState, action: Action): WindowState {
	switch (action.type) {
		case "SET_MENU":
			return { ...state, openMenu: action.payload };

		case "REPLACE_SYSTEM_PROPS":
			return { ...state, systemProps: action.payload };

		case "UPDATE_SYSTEM_PROPS":
			return {
				...state,
				systemProps: { ...state.systemProps, ...action.payload },
			};

		default:
			return state;
	}
}

function deepEqual(obj1: any, obj2: any) {
	// Base case: strict equality for primitives or same object reference
	if (obj1 === obj2) {
		return true;
	}

	// Handle null or non-object types
	if (
		typeof obj1 !== "object" ||
		obj1 === null ||
		typeof obj2 !== "object" ||
		obj2 === null
	) {
		return false;
	}

	// Compare arrays
	if (Array.isArray(obj1) && Array.isArray(obj2)) {
		if (obj1.length !== obj2.length) {
			return false;
		}
		for (let i = 0; i < obj1.length; i++) {
			if (!deepEqual(obj1[i], obj2[i])) {
				return false;
			}
		}
		return true;
	}

	// Compare objects
	const keys1 = Object.keys(obj1);
	const keys2 = Object.keys(obj2);

	if (keys1.length !== keys2.length) {
		return false;
	}

	for (const key of keys1) {
		if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
			return false;
		}
	}

	return true;
}

// ---- context surface (helpers only)
type WindowContextShape = {
	menu: Menu;
	setMenu: (m: Menu) => void;
	systemProps: SystemProps;
	updateSystemProps: {
		(u: Partial<SystemProps>): void;
		<K extends DotNotation<SystemProps>>(
			key: K,
			value: PathValue<SystemProps, K>
		): void;
	};
};

const WindowContext = createContext<WindowContextShape | null>(null);

// ---- provider
const WindowProvider = ({ children }: { children: ReactNode }) => {
	const { currentUser, modifyUserProp } = useUser();
	const initial: WindowState = {
		openMenu: "None",
		systemProps: currentUser?.systemProps ?? defaultSystemProps,
	};

	const [state, dispatch] = useReducer(reducer, initial);

	// If the user’s settings arrive *after* mount, sync them in
	useEffect(() => {
		if (currentUser?.systemProps) {
			dispatch({
				type: "REPLACE_SYSTEM_PROPS",
				payload: currentUser.systemProps,
			});
		}
	}, [currentUser?.systemProps]);

	// Update user's stuffs
	const prevPropsRef = useRef(state.systemProps);
	const hasMounted = useRef(false);

	useEffect(() => {
		if (!currentUser) return;

		// Skip first run
		if (!hasMounted.current && currentUser) {
			hasMounted.current = true;
			prevPropsRef.current = state.systemProps;
			return;
		}

		if (!deepEqual(prevPropsRef.current, state.systemProps)) {
			modifyUserProp(
				currentUser.username,
				"systemProps",
				state.systemProps
			);
			prevPropsRef.current = state.systemProps;
		}
	}, [state.systemProps, currentUser]);

	// minimal API exposed to consumers
	const ctx = useMemo<WindowContextShape>(
		() => ({
			menu: state.openMenu,
			setMenu: (m) => dispatch({ type: "SET_MENU", payload: m }),
			systemProps: state.systemProps,
			updateSystemProps: ((keyOrObj: any, value?: any) => {
				if (typeof keyOrObj === "string") {
					// keyOrObj is narrowed to DotNotation<SystemProps>
					const updated = setDeepValue(
						state.systemProps,
						keyOrObj as DotNotation<SystemProps>,
						value
					);
					dispatch({
						type: "REPLACE_SYSTEM_PROPS",
						payload: updated,
					});
				} else {
					dispatch({
						type: "UPDATE_SYSTEM_PROPS",
						payload: keyOrObj,
					});
				}
			}) as WindowContextShape["updateSystemProps"],
		}),
		[state]
	);

	return (
		<WindowContext.Provider value={ctx}>{children}</WindowContext.Provider>
	);
};

// ---- hook
export const useWindow = () => {
	const ctx = useContext(WindowContext);
	if (!ctx) throw new Error("useWindow must be used within a WindowProvider");
	return ctx;
};

export default WindowProvider;
