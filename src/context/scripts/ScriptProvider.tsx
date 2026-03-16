import { createContext, ReactNode, useContext, useEffect, useReducer } from "react";
import virtualFS from "../../system/api/virtualFS";
import { useUser } from "../user/user";
import { FileErrorType, Permission } from "../../types/globals";
import { createError } from "../../system/api/errors";

export interface Script {
	name: string; // unique identifier
	value: string;
    permission: Permission;
}

type ScriptState = {
	scripts: Script[];
};

type ScriptAction =
	| { type: "ADD_SCRIPT"; script: Script }
	| { type: "REMOVE_SCRIPT"; name: string }
	| { type: "EXECUTE_SCRIPT"; name: string }
	| { type: "SET_SCRIPTS"; scripts: Script[] }
	| {
			type: "MODIFY_SCRIPT";
			name: string;
			prop: keyof Script;
			value: Script[keyof Script];
	  };

const initialState: ScriptState = {
	scripts: [],
};

function scriptReducer(state: ScriptState, action: ScriptAction): ScriptState {
	switch (action.type) {
		case "ADD_SCRIPT": {
			// prevent duplicates by name
			if (state.scripts.some((s) => s.name === action.script.name)) {
				return state;
			}
			return {
				...state,
				scripts: [...state.scripts, action.script],
			};
		}

		case "REMOVE_SCRIPT": {
			return {
				...state,
				scripts: state.scripts.filter(
					(script) => script.name !== action.name
				),
			};
		}

		case "EXECUTE_SCRIPT": {
			try {
				const script = state.scripts.find(s => s.name === action.name);				

				if (!script) throw createError(FileErrorType.FileNotFound);

				eval(script.value);
			} catch (e) {
				console.error(e);
			}
			
			return state;
		}

		case "SET_SCRIPTS": {
			return {
				...state,
				scripts: action.scripts,
			};
		}

		case "MODIFY_SCRIPT": {
			return {
				...state,
				scripts: state.scripts.map((script) =>
					script.name === action.name
						? { ...script, [action.prop]: action.value }
						: script
				),
			};
		}

		default:
			return state;
	}
}

interface ScriptContextValue {
	scripts: readonly Script[];
	addScript: (script: Script) => Promise<void>;
	removeScript: (name: string) => Promise<void>;
	executeScript: (name: string) => void;
	modifyScript: (
		name: string,
		prop: keyof Script,
		value: Script[keyof Script]
	) => Promise<void>;
}

export const ScriptContext = createContext<ScriptContextValue | undefined>(
	undefined
);

export const useScripts = () => {
	const context = useContext(ScriptContext);
	if (!context) {
		throw new Error("useUser must be used within a UserProvider");
	}
	return context;
};

export const ScriptProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [state, dispatch] = useReducer(scriptReducer, initialState);

	const { userDirectory, currentUser } = useUser();

	// Fetch and load initial scripts
	useEffect(() => {
		const loadScripts = async () => {
			if (!currentUser) return;

			const files = await virtualFS.readdir(`${userDirectory}Scripts/`);			

			// Check for invalid files
            const scripts: Script[] = Object.entries(files)
            .map(([, value]) => {
                if (value.type === "directory" || value.fileType !== "sys") return null;
                if (!value.content?.name || !value.content?.value) return null;

                return {
                    name: value.content.name,
                    value: value.content.value,
                } as Script;
            })
            .filter((s): s is Script => s !== null);

			// Set all the scripts
            dispatch({ type: "SET_SCRIPTS", scripts });

			// Then execute them
			scripts.forEach((script) => {
				dispatch({ type: "EXECUTE_SCRIPT", name: script.name });
			});
		};

		loadScripts();
	}, [userDirectory, currentUser]);

	const addScript = async (script: Script) => {
		await virtualFS.writeFile(
			`${userDirectory}/Scripts/`,
			script.name,
			{
				name: script.name,
				value: script.value,
				permission: script.permission	
			},
			"sys"
		);
		dispatch({
			type: "ADD_SCRIPT",
			script,
		});
	};

	const removeScript = async (name: string) => {
		dispatch({
			type: "REMOVE_SCRIPT",
			name,
		});

		await virtualFS.deleteFile(`${userDirectory}/Scripts/`, name);
	};

	const executeScript = (name: string) =>
		dispatch({ type: "EXECUTE_SCRIPT", name });

	const modifyScript = async (
		name: string,
		prop: keyof Script,
		value: Script[keyof Script]
	) => {
		// get the current script from state
		const script = state.scripts.find((s) => s.name === name);
		if (!script) return;

		// build an updated copy
		const updatedScript = { ...script, [prop]: value };

		// persist it to VirtualFS
		await virtualFS.updateFile(
			`${userDirectory}Scripts/`,
			name,
			updatedScript,
			"sys"
		);

		// update context state
		dispatch({ type: "MODIFY_SCRIPT", name, prop, value });
	};

	return (
		<ScriptContext.Provider
			value={{
				scripts: state.scripts,
				addScript,
				removeScript,
				executeScript,
				modifyScript,
			}}
		>
			{children}
		</ScriptContext.Provider>
	);
};