import React, {
	useReducer,
	useEffect,
	createContext,
	useContext,
	useRef,
	useCallback,
	useMemo,
} from "react";
import { User } from "./types";
import { ASYNC_USER_METHODS } from "../../constants/constants";
import {
	createUser as create_user,
	modifyUserProp as modify_prop,
} from "./functions";
import virtualFS from "../../system/api/virtualFS";
import { File } from "../../system/api/types";

type UserState = {
	users: User[];
	currentUser: User | null;
};

type UserAction =
	| { type: "CREATE_USER"; user: User }
	| { type: "LOGIN"; username: string, password: string }
	| { type: "LOGOUT" }
	| {
			type: "MODIFY_USER_PROP";
			username: string;
			prop: keyof User;
			value: any;
	  }
	| { type: "SET_USERS"; users: User[] };

const initialState: UserState = {
	users: [],
	currentUser: null,
};

function userReducer(state: UserState, action: UserAction): UserState {
	switch (action.type) {
		case "CREATE_USER":
			return {
				...state,
				users: [...state.users, action.user],
			};

		case "LOGIN": {
			const user =
				state.users.find((u) => 
					u.username === action.username && 
					u.password === action.password) || null;
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

		case "MODIFY_USER_PROP":
			return {
				...state,
				users: state.users.map((user) =>
					user.username === action.username
						? { ...user, [action.prop]: action.value }
						: user
				),
				currentUser:
					state.currentUser?.username === action.username
						? { ...state.currentUser, [action.prop]: action.value }
						: state.currentUser,
			};
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
	createUser: (user: User) => void;
	modifyUserProp: <K extends keyof User>(
		username: string,
		prop: K,
		value: User[K]
	) => void;
	loggedIn: boolean;
	login: (username: string, password: string) => void;
	logout: () => void;
	readonly users: readonly User[];
	readonly currentUser: User | null;
	readonly userDirectory: string;
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
					console.log("Created user:", created);
					await create_user(created);
				}
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
	}, []);

	const createUser = (user: User) =>
		dispatchWithLast({ type: "CREATE_USER", user });

	const modifyUserProp = <K extends keyof User>(
		username: string,
		prop: K,
		value: User[K]
	) =>
		dispatchWithLast({
			type: "MODIFY_USER_PROP",
			username,
			prop,
			value,
		});

	const login = (username: string, password: string) => dispatch({ 
		type: "LOGIN", 
		username, 
		password 
	});
	const logout = () => dispatch({ type: "LOGOUT" });
	
	const userDirectory = useMemo(() => {
		if (state.currentUser) {
			return `/Users/${state.currentUser.username}/`;
		} else {
			return "Documents/";
		}
	}, [state.currentUser]);

	return (
		<UserContext.Provider
			value={{
				loggedIn: state.currentUser != null,
				createUser,
				modifyUserProp,
				login,
				logout,
				users: state.users,
				currentUser: state.currentUser,
				userDirectory,
			}}
		>
			{children}
		</UserContext.Provider>
	);
};
