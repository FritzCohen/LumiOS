// src/components/Console.tsx
import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle } from "@fortawesome/free-solid-svg-icons";
import { useKernel } from "../../../hooks/useKernal";
import { Directory, File } from "../../api/types";
import { Permission } from "../../../types/globals";
import virtualFS from "../../api/virtualFS";
import { useUser } from "../../../context/user/user";
import fileTypes from "../../api/FileTypes";
import { ConsoleCommand, parseArgs } from "../../../constants/defaultCommands";
import VerifyUserPopup from "../../gui/components/Popups/VerifyUserPopup";

interface ConsoleProps {
    commands: Record<string, ConsoleCommand>;
    setCurrentMenu: (prev: number) => void;
}

const Console: React.FC<ConsoleProps> = ({ commands, setCurrentMenu }) => {
    const { openApp, closeApp } = useKernel();
    const { userDirectory } = useUser();

    const [currentDir, setCurrentDir] = useState<string>(userDirectory);
    const [content, setContent] = useState<Record<string, File | Directory>>({});
    const [input, setInput] = useState<string>("");

    const [stack, setStack] = useState([
        { command: "Type 'js' to switch to javascript.", success: true, color: "gray" }
    ]);

    const { currentUser } = useUser();
    const [admin, setAdmin] = useState(currentUser?.permission || Permission.USER);

    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    // -------------------------------------------------------------
    // Load directory contents
    // -------------------------------------------------------------
    useEffect(() => {
        const fetchItems = async () => {
            try {
                const contents = await virtualFS.readdir(currentDir);
                setContent(contents);
            } catch {
                setStack(prev => [
                    ...prev,
                    { command: `Path does not exist. At '${currentDir}'`, success: false, color: "red" }
                ]);
                setCurrentDir("");
            }
        };

        fetchItems();
    }, [currentDir]);

    // Auto-scroll
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [stack]);

    // -------------------------------------------------------------
    // Input handlers
    // -------------------------------------------------------------
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInput(event.target.value);
    };

    const handleEnterKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            handleConsoleInput(input.trim());
            setInput("");
        }
    };

    // -------------------------------------------------------------
    // Verfiy user
    // -------------------------------------------------------------
    const verifyUser = async (action: string): Promise<boolean> => {
        return await openApp({
            config: {
                name: "Verify User",
                displayName: "Verify User",
                permissions: 0,
                icon: "",
            },
            mainComponent: (props) =>
                <VerifyUserPopup props={props} intent={`Verify ${action}`} {...props} />
        }) as Promise<boolean>;
    };

    // -------------------------------------------------------------
    // Tab autocomplete
    // -------------------------------------------------------------
    const handleTabKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const commandSuggestions = Object.keys(commands);
        const filesAndFolderNames = content ? Object.keys(content) : [];

        if (e.key !== 'Tab') return;

        e.preventDefault();
        const current = inputRef.current?.value || "";
        const [cmd, ...rest] = current.split(" ");
        const currentArg = rest.join(" ");

        if (rest.length === 0) {
            const match = commandSuggestions.find(s => s.startsWith(cmd));
            if (match) setInput(match + " ");
        } else {
            const match = filesAndFolderNames.find(s => s.startsWith(currentArg));
            if (match) setInput(cmd + " " + match);
        }
    };

    // -------------------------------------------------------------
    // Execute command
    // -------------------------------------------------------------
    const handleConsoleInput = async (raw: string, elevated: boolean = false) => {
        if (!raw) return;

        setStack(prev => [...prev, { command: raw, success: true, color: "white" }]);

        const parts = raw.split(" ");
        const cmdKey = parts[0];
        const rawArgs = parts.slice(1);

        const cmd = commands[cmdKey];

        // Command not found
        if (!cmd) {
            setStack(prev => [
                ...prev,
                { command: `'${cmdKey}' is not recognized.`, success: false, color: "red" }
            ]);
            return;
        }

        // Permission failure
        if (!elevated && admin > cmd.minPerm) {
            const verifiedPerms = await verifyUser(`Run ${cmdKey}`);

            // Rerun with permissions
            if (verifiedPerms) {
                setAdmin(Permission.ELEVATED);
                await handleConsoleInput(raw, true);
                return;
            }
            
            setStack(prev => [
                ...prev,
                { command: `Insufficient permission.`, success: false, color: "red" }
            ]);
            return;
        }

        // Pre-parsed args
        const parsedArgs = parseArgs(cmd, rawArgs);

        // Execution context passed into the command
        const ctx = {
            currentDir,
            content,
            admin,
            permission: currentUser?.permission || Permission.USER,
            getAdminRequest: async () => false,
            setStack,
            setCurrentDir,
            closeApp,
            virtualFS,
            fileTypes,
            commands,
            setCurrentMenu,
        };

        try {
            await cmd.run(ctx, parsedArgs);
        } catch {
            setStack(prev => [
                ...prev,
                { command: `Command error.`, success: false, color: "red" }
            ]);
        }
    };

    // -------------------------------------------------------------
    // RENDER
    // -------------------------------------------------------------
    return (
        <div className="w-full h-full px-4 overflow-hidden overflow-y-auto pb-4">
            <div className="mt-2">
                {stack.map((item, index) => (
                    <div key={index} className="flex items-center py-1 px-2 bg-black text-sm">
                        <FontAwesomeIcon
                            icon={faCircle}
                            style={{
                                color: item.success ? item.color : "red",
                                marginRight: "8px",
                                width: "10px",
                                height: "10px"
                            }}
                        />
                        <span style={{ color: item.success ? item.color : "red" }}>
                            {item.command}
                        </span>
                    </div>
                ))}
            </div>

            <div className="flex flex-row gap-2 items-center mt-2">
                <div style={{ color: "#FF7A00" }}>{">"}</div>

                <div className="flex items-center w-full gap-2">
                    <h3>{currentDir === "" ? "Root/" : currentDir}</h3>

                    <input
                        type="text"
                        value={input}
                        ref={inputRef}
                        onChange={handleInputChange}
                        onKeyDown={handleTabKey}
                        onKeyPress={handleEnterKeyPress}
                        placeholder="Enter command..."
                        style={{ background: "none" }}
                        className="w-full py-1 px-2 outline-none bg-transparent text-white"
                    />
                </div>
            </div>

            <div ref={messagesEndRef} />
        </div>
    );
};

export default Console;
