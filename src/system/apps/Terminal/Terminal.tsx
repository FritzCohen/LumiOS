import { useState } from "react";
import Console from "./Console";
import JavascriptConsole from "./JavascriptConsole";
import { ConsoleCommand, deserializeRun } from "../../../constants/defaultCommands";
import { useFolderWatcher } from "../../api/useFolderWatcher";
import { File } from "../../api/types";

const Terminal = () => {
    const [currentMenu, setCurrentMenu] = useState<number>(0);
    const [commands, setCommands] = useState<Record<string, ConsoleCommand>>({});

    // Get valid stored commands
    useFolderWatcher("System/Commands/", (entries) => {
        const files: ConsoleCommand[] = Object.values(entries)
            .filter(
                (entry): entry is File =>
                    entry.type === "file" && entry.fileType === "command"
            )
            .map((file) => deserializeRun(file.content));

        // Convert array to Record<string, ConsoleCommand> using command name as key
        const commandRecord: Record<string, ConsoleCommand> = {};
        for (const cmd of files) {
            commandRecord[cmd.key] = cmd;
        }

        setCommands(commandRecord);
    });

    const getCurrentMenu = () => {
        switch (currentMenu) {
            case 0: {
                return <Console setCurrentMenu={setCurrentMenu} commands={commands} />;
            }
            case 1: {
                return <JavascriptConsole setCurrentMenu={setCurrentMenu} />;
            }
        };
    }

    return getCurrentMenu();
}
 
export default Terminal;