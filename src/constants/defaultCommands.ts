import { Permission } from "../types/globals";
import { VALID_CONTEXT } from "./constants";

export type ContextKey = (typeof VALID_CONTEXT)[number];

export interface ConsoleCommand {
    key: string;
    description: string;
    usage?: string;
    context?: ContextKey[];
    args?: { name: string; required: boolean }[];
    minPerm: Permission;
    run: (ctx: TerminalContext, namedArgs: Record<string, any>) => Promise<void> | void;
}

export interface TerminalContext {
    currentDir: string;
    content: any;
    admin: Permission;
    permission: Permission;

    commands: Record<string, ConsoleCommand>;

    setStack: (func: (prev: any[]) => any[]) => void;
    setCurrentMenu: (prev: number) => void;
    setCurrentDir: (dir: string) => void;
    closeApp: (name: string) => void;
    getAdminRequest: () => Promise<boolean>;

    virtualFS: any;
    fileTypes: any;
}

/**
 * Takes the original command and turns it into something the code can understand
 * 
 * Done to remove bloat from commands, just makes things easier.
 * 
 * @param raw Raw command that user types
 * @returns Parsed command with valid arguments
 */
export const parseArgs = (cmdDef: ConsoleCommand, rawArgs: string[]) => {
    if (!cmdDef.args || cmdDef.args.length === 0) return {};

    const parsed: Record<string, string | null> = {};

    cmdDef.args.forEach((argDef, i) => {
        parsed[argDef.name] = rawArgs[i] ?? null;
    });

    return parsed;
};

// CONVERSION / REVERSION OF THE FUNCTION -> STRING | STRING -> FUNCTION
// INDEXED DB CANT STORE FUNCTIONS SO THATS WHY ITS DONE

/**
 * Serializes the "run" part of a command.
 * 
 * @param cmd Command
 * @returns Serialized command
 */
export const serializeRun = (cmd: ConsoleCommand) => {
    return {
        ...cmd,
        run: cmd.run.toString()
    };
};

/**
 * Deserializes the "run" part of a command.
 * 
 * @param stored Serialized command
 * @returns Command
 */
export const deserializeRun = (stored: any): ConsoleCommand => {
    return {
        ...stored,
        run: new Function("args", "ctx", `return (${stored.run})(args, ctx);`)
    };
};


export const defaultCommandRegistry: Record<string, ConsoleCommand> = {

    // ----------------------------
    // GENERAL
    // ----------------------------
    help: {
        key: "help",
        description: "List all available commands.",
        minPerm: Permission.NONE,
        context: ["commands", "fds"],
        run: async ({ commands, setStack }) => {
            Object.values(commands).forEach(cmd => {
                setStack(prev => [
                    ...prev,
                    { command: `${cmd.key}: ${cmd.description}`, success: true, color: "gray" }
                ]);
            });
        }
    },

    dir: {
        key: "dir",
        description: "Shows the current directory.",
        minPerm: Permission.NONE,
        run: ({ setStack, currentDir }) => {
            setStack(prev => [
                ...prev,
                { command: currentDir || "Root/", success: true, color: "lightblue" }
            ]);
        }
    },

    cls: {
        key: "cls",
        description: "Clears the console.",
        minPerm: Permission.NONE,
        run: ({ setStack }) => {
            console.clear();
            setStack(() => [{ command: "Cleared!", success: true, color: "lightblue" }]);
        }
    },

    cwd: {
        key: "cwd",
        description: "Logs the current directory.",
        minPerm: Permission.NONE,
        run: ({ setStack, currentDir }) => {
            setStack(prev => [
                ...prev,
                { command: currentDir || "Root/", success: true, color: "gray" }
            ]);
        }
    },

    // ----------------------------
    // DIRECTORY HANDLING
    // ----------------------------
    cd: {
        key: "cd",
        description: "Changes the current directory.",
        usage: "cd <directory>",
        args: [{ name: "directory", required: true }],
        minPerm: Permission.USER,
        run: ({ currentDir, setCurrentDir, setStack }, { directory }) => {
            const dir = directory;

            if (!dir) {
                setStack(prev => [...prev, { command: "No directory provided.", success: false, color: "red" }]);
                return;
            }

            if (dir.includes("..")) {
                if (!currentDir) {
                    setStack(prev => [...prev, { command: `Cannot go above root.`, success: false, color: "red" }]);
                    return;
                }

                const slice = currentDir.endsWith("/") ? currentDir.slice(0, -1) : currentDir;
                const parts = slice.split("/");
                parts.pop();
                setCurrentDir(parts.join("/"));
            } else {
                if (dir.startsWith("/")) setCurrentDir(dir);
                else setCurrentDir(currentDir ? `${currentDir}/${dir}` : dir);
            }

            setStack(prev => [
                ...prev,
                { command: `Navigated to ${dir || "Root"}`, success: true, color: "lightblue" }
            ]);
        }
    },
    ls: {
        key: "ls",
        description: "Lists files and directories.",
        minPerm: Permission.USER,
        run: ({ content, currentDir, setStack }) => {
            if (!content || Object.keys(content).length === 0) {
                setStack(prev => [...prev, {
                    command: `No items found at ${currentDir}`,
                    success: true,
                    color: "lightblue"
                }]);
                return;
            }

            Object.keys(content).forEach(key => {
                const color = content[key].type === "directory" ? "blue" : "green";
                setStack(prev => [...prev, { command: key, success: true, color }]);
            });
        }
    },
    mkdir: {
        key: "mkdir",
        description: "Creates a new directory.",
        usage: "mkdir <name>",
        args: [{ name: "name", required: true }],
        minPerm: Permission.ELEVATED,
        run: async ({ currentDir, setStack, virtualFS, admin }, { name }) => {
            try {
                await virtualFS.writeDirectory(currentDir, name, admin);
                setStack(prev => [...prev, {
                    command: `Directory '${name}' created. At ${currentDir}`,
                    success: true,
                    color: "lightblue"
                }]);
            } catch (err) {
                setStack(prev => [...prev, { command: `Failed to create folder: ${err}`, success: false, color: "red" }]);
            }
        }
    },

    // ----------------------------
    // FILE OPERATIONS
    // ----------------------------
    rm: {
        key: "rm",
        description: "Remove a file or folder.",
        usage: "rm <name>",
        args: [{ name: "name", required: true }],
        minPerm: Permission.ELEVATED,
        run: async ({ currentDir, content, setStack, virtualFS }, { name }) => {
            try {
                if (content[name]?.permission) {
                    if (!window.confirm("Are you sure you want to delete this?")) return;
                }

                await virtualFS.deleteFile(currentDir, name);

                setStack(prev => [...prev, {
                    command: `${name} deleted from ${currentDir}`,
                    success: true,
                    color: "lightblue"
                }]);
            } catch (err: any) {
                setStack(prev => [...prev, {
                    command: err?.message || "Unknown error.",
                    success: false,
                    color: "red"
                }]);
            }
        }
    },

    mv: {
        key: "mv",
        description: "Move or rename a file.",
        usage: "mv <source> <destination> <new name?>",
        args: [
            { name: "oldDirectory", required: true },
            { name: "newDirectory", required: true },
            { name: "name", required: false }
        ],
        minPerm: Permission.ELEVATED,
        run: async ({ currentDir, setStack, virtualFS, admin }, { oldDirectory, newDirectory, name }) => {
            const newName = name;
            const source = oldDirectory;
            const destination = newDirectory;

            try {
                await virtualFS.mv(currentDir, destination, source, newName, admin);
                setStack(prev => [...prev, {
                    command: `Moved ${source} to ${destination} as ${newName}.`,
                    success: true,
                    color: "lightblue"
                }]);
            } catch {
                setStack(prev => [...prev, {
                    command: `Could not move ${source} to ${destination}`,
                    success: false,
                    color: "red"
                }]);
            }
        }
    },

    touch: {
        key: "touch",
        description: "Create a new file.",
        usage: "touch <file name> <content?>",
        args: [{ name: "name", required: true }, { name: "content", required: false }],
        minPerm: Permission.USER,
        run: async ({ currentDir, setStack, virtualFS, fileTypes }, { name, content }) => {
            let filename = name;
            let type = "txt";

            if (filename.includes(".")) {
                const [name, ext] = filename.split(".");
                filename = name;
                type = ext;
            }

            if (!(type in fileTypes)) {
                setStack(prev => [...prev, {
                    command: `Invalid file type ${type}`,
                    success: false,
                    color: "red"
                }]);
                return;
            }


            await virtualFS.writeFile(currentDir, filename, content, type);

            setStack(prev => [...prev, {
                command: `${filename} created at ${currentDir}`,
                success: true,
                color: "lightblue"
            }]);
        }
    },
    cat: {
        key: "cat",
        description: "View file contents.",
        usage: "cat <filename>",
        args: [{ name: "name", required: true }],
        minPerm: Permission.ELEVATED,
        run: ({ content, setStack }, { name }) => {
            const file = content[name];

            if (!file || file.type !== "file") {
                setStack(prev => [...prev, {
                    command: "Cannot cat a directory.",
                    success: false,
                    color: "red"
                }]);
                return;
            }

            setStack(prev => [...prev, {
                command: JSON.stringify(file.content),
                success: true,
                color: "white"
            }]);
        }
    },
    nano: {
        key: "nano",
        description: "Open file in editor.",
        usage: "nano <filename>",
        args: [{ name: "name", required: true }],
        minPerm: Permission.ELEVATED,
        run: ({ setStack }, args) => {
            const name = args.join(" ");
            setStack(prev => [...prev, {
                command: `File ${name} opened in nano.`,
                success: true,
                color: "lightblue"
            }]);
        }
    },

    // ----------------------------
    // PROCESS / APP
    // ----------------------------
    open: {
        key: "open",
        description: "Open a file or app.",
        usage: "open <name>",
        args: [{ name: "name", required: true }],
        minPerm: Permission.USER,
        run: ({ content, currentDir, setStack }, args) => {
            const name = args.join(" ");
            const item = content[name];

            if (!item) {
                setStack(prev => [...prev, {
                    command: `File ${name} not found in ${currentDir}.`,
                    success: false,
                    color: "red"
                }]);
                return;
            }

            setStack(prev => [...prev, {
                command: `Opened ${name}.`,
                success: true,
                color: "lightblue"
            }]);
        }
    },
    process: {
        key: "process",
        description: "Show running processes.",
        args: [],
        minPerm: Permission.ELEVATED,
        run: ({ setStack }) => {
            setStack(prev => [...prev, {
                command: "Processes: (not implemented)",
                success: true,
                color: "yellow"
            }]);
        }
    },
    exit: {
        key: "exit",
        description: "Exit an app or the terminal.",
        usage: "exit <app?>",
        args: [{ name: "name", required: false }],
        minPerm: Permission.ELEVATED,
        run: ({ closeApp, setStack }, { name }) => {
            const app = name;

            if (!app || app === "exit") {
                setStack(prev => [...prev, { command: "Exiting...", success: false, color: "red" }]);
                return;
            }

            closeApp(app);
            setStack(prev => [...prev, {
                command: `Closed ${app}.`,
                success: true,
                color: "lightblue"
            }]);
        }
    },

    // ----------------------------
    // MODE CHANGES
    // ----------------------------
    js: {
        key: "js",
        description: "Switch to JavaScript mode.",
        args: [],
        minPerm: Permission.NONE,
        run: ({ setCurrentMenu, setStack }) => {
            setStack(prev => [...prev, {
                command: "JS mode activated.",
                success: true,
                color: "yellow"
            }]);

            setCurrentMenu(1);
        }
    }
};