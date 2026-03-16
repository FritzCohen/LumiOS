import React, {
	useReducer,
	useEffect,
	createContext,
	useContext,
	useRef,
	useCallback,
	useMemo,
} from "react";
import { ColorTheme, PanicConfig, User } from "./userTypes";
import { ASYNC_USER_METHODS } from "../../constants/constants";
import {
	createUser as create_user,
	deleteUser as delete_user,
	modifyUserProp as modify_prop,
	withAlpha,
} from "./functions";
import virtualFS from "../../system/api/virtualFS";
import { File } from "../../system/api/types";
import { DotNotation, PathValue } from "../../types/globals";

type UserState = {
	users: User[];
	currentUser: User | null;
};

type UserAction =
	| { type: "CREATE_USER"; user: User }
	| { type: "DELETE_USER"; user: User }
	| { type: "LOGIN"; username: string; password: string }
	| { type: "LOGOUT" }
	| {
			type: "MODIFY_USER_PROP";
			username: string;
			prop: DotNotation<User>;
			value: any;
	  }
	| { type: "SET_USERS"; users: User[] };

const initialState: UserState = {
	users: [],
	currentUser: null,
};

// Sets the deep value for an object, example: uiStyle.taskbar.mode = "full" or idk
function setDeep(obj: any, path: string, value: any) {
	const keys = path.split(".");
	const last = keys.pop()!;
	let curr = obj;

	for (const k of keys) {
		if (curr[k] == null || typeof curr[k] !== "object") {
			curr[k] = {}; // ensure path exists
		}
		curr = curr[k];
	}

	curr[last] = value;
	return obj;
}

function userReducer(state: UserState, action: UserAction): UserState {
	switch (action.type) {
		case "CREATE_USER":
			return {
				...state,
				users: [...state.users, action.user],
			};
		
		case "DELETE_USER": {
			// Filter out the "Deleted" user
			const newUsers = state.users.filter(
				(u) =>
					u.username !== action.user.username
			);
			// Then see if it overlaps with the current user
			const current = newUsers.some(u => u.username === state.currentUser?.username);

			return {
				...state,
				currentUser: current ? state.currentUser : null,
				users: newUsers
			}
		}

		case "LOGIN": {
			const user =
				state.users.find(
					(u) =>
						u.username === action.username &&
						u.password === action.password
				) || null;
			return {
				...state,
				currentUser: user,
			};
		}

		case "LOGOUT":
			return {
				...state,
				currentUser: null,
			};

		case "MODIFY_USER_PROP": {
			const newUsers = state.users.map((user) => {
				if (user.username !== action.username) return user;

				const updated = structuredClone(user); // keep immutability
				setDeep(updated, action.prop, action.value);
				return updated;
			});

			let newCurrent = state.currentUser;
			if (state.currentUser?.username === action.username) {
				newCurrent = structuredClone(state.currentUser);
				setDeep(newCurrent, action.prop, action.value);
			}

			return {
				...state,
				users: newUsers,
				currentUser: newCurrent,
			};
		}

		case "SET_USERS":
			return {
				...state,
				users: action.users,
			};
		default:
			return state;
	}
}

interface UserContextValue {
	// User settings
	createUser: (user: User) => void;
	deleteUser: (user: User) => void;
	modifyUserProp: <P extends DotNotation<User>>(
		username: string,
		prop: P,
		value: PathValue<User, P>
	) => void;
	loggedIn: boolean;
	login: (username: string, password: string) => void;
	logout: () => void;
	readonly users: readonly User[];
	readonly currentUser: User | null;
	readonly userDirectory: string;
	// Themes
	applyTheme: (theme: ColorTheme, save?: boolean) => void;
	applyBackground: (image: string, save?: boolean) => void;
	applyPanic: (panic: PanicConfig, save?: boolean) => void;
}

export const UserContext = createContext<UserContextValue | undefined>(
	undefined
);

export const useUser = () => {
	const context = useContext(UserContext);
	if (!context) {
		throw new Error("useUser must be used within a UserProvider");
	}
	return context;
};

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
	const [state, dispatch] = useReducer(userReducer, initialState);
	const lastAction = useRef<UserAction | null>(null);

	// Helper that always remembers the last action
	const dispatchWithLast = (action: UserAction) => {
		lastAction.current = action;
		dispatch(action);
		previousUsers.current = state.users; // <-- track current state before it changes
	};
	const previousUsers = useRef<User[]>([]); // store previous state

	useEffect(() => {
		const action = lastAction.current;
		if (!action || !ASYNC_USER_METHODS.includes(action.type)) return;

		const saveHandlers: Partial<
			Record<UserAction["type"], () => Promise<void>>
		> = {
			MODIFY_USER_PROP: async () => {
				const { username, prop, value } = action as Extract<
					UserAction,
					{ type: "MODIFY_USER_PROP" }
				>;

				const previous = previousUsers.current.find(
					(u) => u.username === username
				);
				const updated = state.users.find((u) =>
					prop === "username"
						? u[prop] === value
						: u.username === username
				);

				if (!previous || !updated) return;

				await modify_prop(previous, updated);
			},

			CREATE_USER: async () => {
				const { user } = action as Extract<
					UserAction,
					{ type: "CREATE_USER" }
				>;
				const created = state.users.find(
					(u) => u.username === user.username
				);
				if (created) {
					await create_user(created);
				}
			},

			DELETE_USER: async () => {
				const { user } = action as Extract<
					UserAction,
					{ type: "DELETE_USER" }
				>;

				await delete_user(user);
			},
		};

		const save = async () => {
			try {
				const handler = saveHandlers[action.type];
				if (handler) await handler();
			} catch (err) {
				console.error("Failed to update user in virtualFS:", err);
			}
		};

		save();
	}, [state.users]);

	const fetchUsers = useCallback(async () => {
		try {
			await virtualFS.initialize();
			const users = await virtualFS.readdir("System/Users/");
			const usersContent = Object.keys(users)
				.map((name) => (users[name] as File).content as User)
				.filter(Boolean); // Filters out any undefined or null entries

			dispatch({ type: "SET_USERS", users: usersContent });
		} catch (error) {
			console.error("Error fetching users:", error);
		}
	}, []);

	useEffect(() => {
		const loadUsers = async () => {
			try {
				await fetchUsers();
			} catch (error) {
				console.error("Failed to load users from virtualFS:", error);
			}
		};

		loadUsers();
	}, [fetchUsers]);

	// -------------------------------------------------------------
	// User logic
	// -------------------------------------------------------------
	const createUser = (user: User) =>
		dispatchWithLast({ type: "CREATE_USER", user });

	const deleteUser = (user: User) =>
		dispatchWithLast({ type: "DELETE_USER", user });

	const modifyUserProp = <P extends DotNotation<User>>(
		username: string,
		prop: P,
		value: PathValue<User, P>
	) => {
		dispatchWithLast({
			type: "MODIFY_USER_PROP",
			username,
			prop,
			value,
		});
	};

	const login = (username: string, password: string) =>
		dispatch({
			type: "LOGIN",
			username,
			password,
		});

	const logout = () => dispatch({ type: "LOGOUT" });

	const userDirectory = useMemo(() => {
		if (state.currentUser) {
			return `/Users/${state.currentUser.username}/`;
		} else {
			return "Documents/";
		}
	}, [state.currentUser]);

	// -------------------------------------------------------------
	// Themes logic
	// Moved away from its own little "useApplyTheme" hook
	// -------------------------------------------------------------

	// i like kebab
	const toKebab = (s: string) =>
		s
			.replace(/([a-z0-9])([A-Z])/g, "$1-$2")
			.replace(/[_\s]+/g, "-")
			.toLowerCase();

	// Only these will get --xxx-glass vars
	const glassableKeys = [
		"background",
		"backgroundAlt",
		"surface",
		"surfaceAlt",
	] as const;

	/**
	 * Apply a theme to the system
	 *
	 * @param theme Theme object
	 * @param save Save changes to the system (causes delay)
	 */
	const applyTheme = (theme: ColorTheme, save?: boolean) => {
		const walk = (obj: any, rootKey = "", prefix = "") => {
			if (typeof obj !== "object" || obj == null) return;

			Object.entries(obj).forEach(([k, v]) => {
				const kebab = toKebab(k);

				const nextPrefix =
					rootKey === "colors"
						? ""
						: prefix
						? `${prefix}-${kebab}`
						: `${toKebab(rootKey)}-${kebab}`;

				if (typeof v === "string") {
					// Solid variable
					const varName = `--${nextPrefix || kebab}`;
					document.documentElement.style.setProperty(varName, v);

					// If this key should have a glass version
					if (
						rootKey === "colors" &&
						glassableKeys.includes(k as any)
					) {
						const glassVar = `--${kebab}-glass`;
						const normVar = `--${kebab}`;

						// Idk if both should be set, or not???
						document.documentElement.style.setProperty(
							normVar,
							withAlpha(
								v,
								state.currentUser?.uiStyle.globalGlassAlpha ||
									0.75
							)
						);

						document.documentElement.style.setProperty(
							glassVar,
							withAlpha(
								v,
								state.currentUser?.uiStyle.globalGlassAlpha ||
									0.75
							)
						);
					}
				} else if (typeof v === "object" && v != null) {
					if (!rootKey) walk(v, k, "");
					else walk(v, rootKey, prefix || toKebab(rootKey));
				}
			});
		};

		walk(theme);

		if (save && state.currentUser) {
			modifyUserProp(state.currentUser.username, "colorTheme", theme);
		}
	};

	/**
	 * Apply the desktop background image
	 *
	 * @param image Background image
	 * @param save Save changes to the system (causes delay)
	 */
	const applyBackground = (image: string, save?: boolean) => {
		document.documentElement.style.setProperty(
			"--background-image",
			`url(${image})`
		);

		if (save && state.currentUser) {
			modifyUserProp(
				state.currentUser.username,
				"backgroundImage",
				image
			);
		}
	};

	/**
	 * Apply panic settings to the window
	 *
	 * @param panic Panic config
	 * @param save Save changes to the system (causes delay)
	 */
	const applyPanic = (panic: PanicConfig, save?: boolean) => {
		if (!panic) return;

		window.document.title = panic.title;

		let link = document.querySelector(
			"link[rel~='icon']"
		) as HTMLLinkElement | null;

		if (!link) {
			link = document.createElement("link");
			link.rel = "icon";
			document.head.appendChild(link);
		}

		if (link) {
			link.href = panic.favicon;
		}

		if (save && state.currentUser) {
			modifyUserProp(state.currentUser.username, "panic", panic);
		}
	};

	return (
		<UserContext.Provider
			value={{
				loggedIn: state.currentUser != null,
				createUser,
				deleteUser,
				modifyUserProp,
				login,
				logout,
				users: state.users,
				currentUser: state.currentUser,
				userDirectory,
				applyTheme,
				applyBackground,
				applyPanic,
			}}
		>
			{children}
		</UserContext.Provider>
	);
};
