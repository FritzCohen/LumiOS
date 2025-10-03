// src/components/Console.tsx
import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle } from "@fortawesome/free-solid-svg-icons";
import { useKernel } from "../../../hooks/useKernal";
import { Directory, File } from "../../api/types";
import { Permission } from "../../../types/globals";
import virtualFS from "../../api/virtualFS";
import { useUser } from "../../../context/user/user";
import fileTypes, { FileType } from "../../api/FileTypes";

interface ConsoleProps {
    setCurrentMenu: (prev: number) => void;
}

const Console: React.FC<ConsoleProps> = ({ setCurrentMenu }) => {
    const { closeApp } = useKernel();
    const { userDirectory } = useUser();
    const [currentDir, setCurrentDir] = useState<string>(userDirectory);
    const [content, setContent] = useState<Record<string, File | Directory>>({});
    const [input, setInput] = useState<string>("");
    const [stack, setStack] = useState<Array<{ command: string; success: boolean; color: string }>>([{ command: "Type 'js' to switch to javascript.", success: true, color: "gray" }]);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [admin] = useState<Permission>(Permission.USER);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const contents = await virtualFS.readdir(currentDir);
                setContent(contents);
            } catch (error) {
                setStack((prevStack) => [...prevStack, { command: `Path does not exist. At '${currentDir}'`, success: true, color: "red" }]);
                setCurrentDir("");
                console.error(error);
            }
        };

        fetchItems();
    }, [currentDir]);

    useEffect(() => {
        scrollToBottom();
    }, [stack]);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
        }
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInput(event.target.value);
    };

    const handleEnterKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            handleConsoleInput(input);
            setInput("");
        }
    };

    const functions: { [key: string]: { name: string, description: string } } = {
        "dir": { name: "dir", description: "Shows the current directory." },
        "cls": { name: "cls", description: "Clears the console screen." },
        "cwd": { name: "cwd", description: "Logs the current directory." },
        "cd": { name: "cd", description: "Changes the current directory. Usage: cd <directory>" },
        "exit": { name: "exit", description: "Exit an app or the Terminal. Usage: exit <app?>" },
        "mv": { name: "mv", description: "Moves a file or directory to a new location. Usage: mv <source> <'destination'> <new name?>" },
        "rm": { name: "rm", description: "Remove a file or folder. Usage: rm <file or folder>" },
        "ls": { name: "ls", description: "Lists files and directories in the current directory." },
        "mkdir": { name: "mkdir", description: "Creates a new directory. Usage: mkdir <directory>" },
        "touch": { name: "touch", description: "Create a new file. Usage: touch <filename> <content?>" },
        "js": { name: "js", description: "Switches the console to JavaScript mode." },
        "open": { name: "open", description: "Opens the app or file named. Usage: open <app>" },
        "nano": { name: "nano", description: "Edit the contents of a file. Usage: nano <filename>" },
        "cat": { name: "cat", description: "View the contents of a file. Usage: cat <filename>" },
        "process": { name: "process", description: "View the current processes running." },
        
    };

    const handleTabKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const commandSuggestions = Object.keys(functions);
        const filesAndFolderNames = content ? Object.keys(content) : [];

        if (e.key === 'Tab') {
            e.preventDefault(); // Prevent the default tab behavior

            const currentInput = inputRef.current?.value || "";
            const [command, ...args] = currentInput.split(" ");
            const currentArgument = args.join(" ");

            if (args.length === 0) {
                // Autocomplete the command
                const matchingCommand = commandSuggestions.find(suggestion =>
                    suggestion.startsWith(command)
                );

                if (matchingCommand) {
                    setInput(matchingCommand + " ");
                }
            } else {
                // Autocomplete the argument
                const matchingArgument = filesAndFolderNames.find(suggestion =>
                    suggestion.startsWith(currentArgument)
                );

                if (matchingArgument) {
                    setInput(command + " " + matchingArgument);
                }
            }
        }
    };

    const handleConsoleInput = async (command: string) => {
        const parts = command.split(" ");
        
        const commands: { [key: string]: () => void } = {
            help: () => {
                Object.keys(functions).map((command: string) => {
                    const { name, description } = functions[command];
                    setStack((prevStack) => [...prevStack, { command: `${name}: ${description}`, success: true, color: "gray" }]);
                });
            },
            dir: () => {
                setStack([...stack, { command: currentDir === "" ? "Root/" : currentDir, success: true, color: "lightblue" }]);
            },
            cls: () => {
                console.clear();
                setStack([{ command: "Cleared!", success: true, color: "lightblue" }]);
            },
            cwd: () => {
                setStack((prevStack) => [...prevStack, { command: currentDir === "" ? "Root/" : currentDir, success: true, color: "gray" }]);
            },
            cd: async () => {
                const paths = command.substring(command.indexOf(" ") + 1);
                
                if (paths.includes("..")) {
                    if (currentDir === "") {
                        setStack((prevStack) => [...prevStack, { command: `System could not find path found at '${paths}'`, success: true, color: "red" }]);
                        return;
                    }
                    
                    const updatedDirectory = currentDir.endsWith("/") ? currentDir.slice(0, -1) : currentDir;
                    const parts = updatedDirectory.split("/");
                    const finalDirectory = parts.slice(0, -1).join("/");
                    
                    setCurrentDir(finalDirectory);
                } else {
                    const changedDir = paths;
                    
                    if (changedDir.startsWith("/")) {
                        setCurrentDir(changedDir);
                    } else {                        
                        setCurrentDir(currentDir + "/" + changedDir);
                    }
                }
                
                setStack((prevStack) => [...prevStack, { command: `Navigated to ${paths === "" ? "Root" : paths === ".." ? "Root/" : paths}`, success: true, color: "lightblue" }]);
            },
            exit: () => {
                const app = command.substring(command.indexOf(" ") + 1);
                // || !openedApps.some(process => process.name === app) does not work idk why
                if (app !== "exit") {
                    closeApp(app);
                    setStack([...stack, { command: `Successfully quit ${app}.`, success: true, color: "lightblue" }]);
                } else {
                    setStack([...stack, { command: "Exiting...", success: false, color: "red" }]);
                    setTimeout(() => {
                    }, 2000);
                }
            },
            mv: async () => {
                const parts = command.split(" ");
                const newFileName = parts[parts.length - 1];
                
                if (newFileName === undefined || newFileName === "") {
                    console.error("New file name not provided.");
                    setStack([...stack, { command: "New file name not provided.", success: false, color: "red" }]);
                    return;
                }
                
                const sourceFile = parts[1];
                const destinationDir = parts.slice(2, -1).join(" ");
                
                if (!sourceFile || !destinationDir) {
                    console.error("Source file or destination directory not provided.");
                    setStack([...stack, { command: "Destination or source file not provided.", success: true, color: "red" }]);
                    return;
                }
                
                try {
                    await virtualFS.mv(currentDir, destinationDir.replace(/['"]+/g, ''), sourceFile, newFileName, admin);
                    setStack([...stack, { command: `File ${sourceFile} was moved to '${destinationDir}'.`, success: true, color: "lightblue" }]);
                } catch (error) {
                    console.error("Error moving file:", error);
                    setStack([...stack, { command: `File ${sourceFile} not found at a path '${destinationDir}'`, success: true, color: "red" }]);
                }
            },
            rm: async () => {
                try {
                    const fileName = command.substring(command.indexOf(" ") + 1);
                    
                    if (content[fileName].permission) {
                        if (window.confirm("Are you sure you want to delete this?")) {
                            await virtualFS.deleteFile(currentDir, fileName);
                        }
                    } else {
                        await virtualFS.deleteFile(currentDir, fileName);
                    }
                    
                    setStack((prevStack) => [...prevStack, { command: `${fileName} has been successfully deleted at path ${currentDir}.`, success: true, color: "lightblue" }]);
                } catch (error) {
                    if (error instanceof Error) {
                        // Now we can safely access `error.message`
                        setStack((prevStack) => [...prevStack, { command: error.message, success: false, color: "red" }]);
                    } else {
                        // Fallback if `error` is not an instance of `Error`
                        setStack((prevStack) => [...prevStack, { command: "An unknown error occurred.", success: false, color: "red" }]);
                    }
                }
            },
            ls: () => {
                if (Object.keys(content).length == 0) {
                    setStack((prevStack) => [...prevStack, { command: `No items were found in current directory. At ${currentDir}`, success: true, color: "lightblue" }]);
                    return;
                }

                if (content) {
                    Object.keys(content).map((value) => {
                    const color = content[value].type === "directory" ? "blue" : "green";
                    setStack((prevStack) => [...prevStack, { command: value, success: true, color }]);
                    });
                } else {
                    setStack((prevStack) => [...prevStack, { command: `No items were found in current directory. At ${currentDir}`, success: true, color: "lightblue" }]);;
                }
            },
            mkdir: async () => {
                const name = command.substring(command.indexOf(" ") + 1);
                
                try {
                    await virtualFS.writeDirectory(currentDir, name, admin);
                    setStack([...stack, { command: `Directory ${name} created successfully. At ${currentDir}.`, success: true, color: "lightblue" }]);
                } catch (error) {
                    console.error(error);
                    setStack([...stack, { command: `Folder name not found. ${error}`, success: true, color: "red" }]);
                }
            },
            touch: async () => {
                let fileName = command.substring(command.indexOf(" ") + 1).split(" ")[0];
                let fileType = "txt";

                if (fileName.includes(".")) {
                    fileType = fileName.split(".")[1];
                    fileName = fileName.split(".")[0];
                }

                const content: string = command.substring(command.indexOf(" ") + 1).split(" ")[1];        
                        
                if (!(fileType in fileTypes)) {
                    setStack([...stack, { command: `File is of inccorect type ${fileType}`, success: true, color: "red" }]);
                    return;
                }

                await virtualFS.writeFile(currentDir, fileName, content, fileType as FileType);
                setStack([...stack, { command: `${fileName.charAt(0).toUpperCase() + fileName.slice(1)} successfully created. At ${currentDir}.`, success: true, color: "lightblue" }]);
            },
            js: () => {
                setCurrentMenu(1);
            },
            open: async () => {
                const itemName = command.substring(command.indexOf(" ") + 1);
                const file = content[itemName];

                if (!file) return setStack((prev) => [...prev, { command: `File ${itemName} could not be found. At ${currentDir}.`, success: false, color: "red" }]);
                
                setStack((prev) => [...prev, { command: `File ${itemName} opened successfully.`, success: true, color: "lightblue" }]);
            },
            nano: async () => {
                const itemName = command.substring(command.indexOf(" ") + 1);
                //const file = content[itemName];

                setStack((prev) => [...prev, { command: `File ${itemName} opened successfully.`, success: true, color: "lightblue" }]);
            },
            cat: async () => {
                const itemName = command.substring(command.indexOf(" ") + 1);
                const file = content[itemName];
                
                if (file.type === "file") {
                    setStack((prev) => [...prev, { command: `${JSON.stringify(file.content)}`, success: true, color: "white" }]);
                } else {
                    setStack((prev) => [...prev, { command: "Cannot cat a directory.", success: true, color: "red" }]);
                }
            }
        };

        if (commands[parts[0]]) {
            setStack([...stack, { command: `${command}`, success: true, color: "white" }]);
            commands[parts[0]]();
        } else {
            console.log("Command not found:", parts[0]);
            setStack([...stack, { command: `'${command}' is not a command. See 'help' for available commands.`, success: false, color: "red" }]);
        }
    };

    return (
        <div className="w-full h-full px-4 overflow-hidden overflow-y-auto whitespace-normal">
            <div className="mt-2">
                {stack.map((item, index) => (
                    <div key={index} className="flex items-center py-1 px-2 bg-black rounded-sm text-sm">
                        <FontAwesomeIcon icon={faCircle} style={{ color: item.success ? item.color : "red", marginRight: "8px", width: "10px", height: "10px" }} />
                        <span style={{ color: item.success ? item.color : "red" }}>{item.command}</span>
                    </div>
                ))}
            </div>
            <div className="flex flex-row gap-2 items-center mt-2">
                <div style={{ color: "#FF7A00" }}>{">"}</div>
                <div className="flex flex-row justify-between items-center w-full gap-2">
                    <h3>{currentDir === "" ? "Root/" : currentDir}</h3>
                    <input
                        type="text"
                        value={input}
                        ref={inputRef}
                        onChange={handleInputChange}
                        onKeyDown={handleTabKey} // Use onKeyDown to capture the Tab key
                        onKeyPress={handleEnterKeyPress}
                        placeholder="Enter command..."
                        className="w-full py-1 px-2 outline-none border-none border-b-2 focus:border-none"
                        style={{ background: "transparent", color: "white" }}
                    />
                </div>
            </div>
            <div style={{ float: "left", clear: "both", marginTop: "4px" }} ref={messagesEndRef} />
        </div>
    );
};

export default Console;