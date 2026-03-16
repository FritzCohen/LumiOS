import { useState, useEffect } from "react";
import {
	ConsoleCommand,
	deserializeRun,
	serializeRun,
} from "../../../../constants/defaultCommands";
import { useFolderWatcher } from "../../../api/useFolderWatcher";
import { File } from "../../../api/types";

import CreateCommand from "./CreateCommand.tsx";
import ModifyCommand from "./ModifyCommand.tsx";
import virtualFS from "../../../api/virtualFS.ts";

const Commands = ({
	setLayoutBack,
}: {
	setLayoutBack: (fn?: () => void) => void;
}) => {
	const [current, setCurrent] = useState<0 | 1 | 2 | 3>(0);
	const [commands, setCommands] = useState<Record<string, ConsoleCommand>>({});
	const [selectedCommand, setSelectedCommand] =
		useState<ConsoleCommand | null>(null);

	// -------------------------
	// BACK BUTTON CONTROL
	// -------------------------
	useEffect(() => {
		if (current === 0) setLayoutBack(undefined);
		else setLayoutBack(() => () => setCurrent(0));
	}, [current, setLayoutBack]);

	// -------------------------
	// FETCH COMMANDS
	// -------------------------
	useFolderWatcher("System/Commands/", (entries) => {
		const files: ConsoleCommand[] = Object.values(entries)
			.filter(
				(entry): entry is File =>
					entry.type === "file" && entry.fileType === "command"
			)
			.map((file) => deserializeRun(file.content));

		const record: Record<string, ConsoleCommand> = {};
		for (const cmd of files) record[cmd.key] = cmd;

		setCommands(record);
	});

	const saveCommand = async (cmd: ConsoleCommand) => {
		// Persist to virtualFS
		await virtualFS.updateItem(
			"System/Commands/",
			cmd.key,
			"content",
			serializeRun(cmd),
		);
	};


	// -------------------------
	// ROUTING
	// -------------------------
	switch (current) {
		case 1:
			return (
				<div className="script-column">
					{Object.values(commands).map((cmd) => (
						<div
							key={cmd.key}
							onClick={() => {
								setSelectedCommand(cmd);
								setCurrent(3);
							}}
						>
							{cmd.key}
						</div>
					))}
				</div>
			);

		case 2:
			return <CreateCommand />;

		case 3:
			return selectedCommand ? (
				<ModifyCommand
					command={selectedCommand}
					onChange={saveCommand}
				/>
			) : (
				<div>No command selected</div>
			);

		default:
			return (
				<div className="script-column">
					<div onClick={() => setCurrent(1)}>Manage Commands</div>
					<div onClick={() => setCurrent(2)}>Create Command</div>
				</div>
			);
	}
};

export default Commands;