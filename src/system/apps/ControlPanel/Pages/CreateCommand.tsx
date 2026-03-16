import { useState, useRef, useEffect, useCallback } from "react";
import { ConsoleCommand } from "../../../../constants/defaultCommands";
import Input from "../../../lib/Input";
import Button from "../../../lib/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark, faWarning } from "@fortawesome/free-solid-svg-icons";
import virtualFS from "../../../api/virtualFS";
import { Permission } from "../../../../types/globals";
import { useUser } from "../../../../context/user/user";
import useVerification from "../../../../hooks/useVerification";

const VALID_CONTEXT = [
	"currentDir",
	"content",
	"admin",
	"permission",
	"commands",
	"setStack",
	"setCurrentMenu",
	"setCurrentDir",
	"closeApp",
	"getAdminRequest",
	"virtualFS",
	"fileTypes",
];

const FUNCTION_HEADER = `function anonymous(args, ctx) {
  return (({ {{CTX}} }, args) => {
    // ----------------------------------
    // Write command logic here
    // args: { {{ARGS}} }
    //
    // Example call: {{EXAMPLE}}
    // ----------------------------------
`;

const FUNCTION_FOOTER = `
  })(args, ctx);
}`;

const CreateCommand = () => {
	// -------------------------------------------------
	// COMMAND STATE
	// -------------------------------------------------
	const [command, setCommand] = useState<ConsoleCommand>({
		key: "",
		description: "",
		args: [],
		minPerm: Permission.NONE,
		run: () => {},
	});

	// -------------------------------------------------
	// ARG BUILDER
	// -------------------------------------------------
	const [argName, setArgName] = useState("");
	const [argRequired, setArgRequired] = useState(false);

	// -------------------------------------------------
	// CONTEXT DRAG / DROP
	// -------------------------------------------------
	const [availableCtx, setAvailableCtx] = useState([...VALID_CONTEXT]);
	const [usedCtx, setUsedCtx] = useState<string[]>([]);
	const [dragItem, setDragItem] = useState<string | null>(null);

	// -------------------------------------------------
	// USER-EDITABLE FUNCTION BODY ONLY
	// -------------------------------------------------
	const [body, setBody] = useState("");

	// -------------------------------------------------
	// TEXTAREA AUTO-RESIZE
	// -------------------------------------------------
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const autoResize = () => {
		const el = textareaRef.current;
		if (!el) return;
		el.style.height = "0px";
		el.style.height = el.scrollHeight + "px";
	};

	useEffect(autoResize, [body]);

	// -------------------------------------------------
	// HELPERS
	// -------------------------------------------------
	const addArg = () => {
		if (!argName.trim()) return;

		setCommand((prev) => ({
			...prev,
			args: [
				...(prev.args || []),
				{ name: argName, required: argRequired },
			],
		}));

		setArgName("");
		setArgRequired(false);
	};

    const removeArg = (index: number) => {
        setCommand((prev) => ({
            ...prev,
            args: (prev.args || []).filter((_, i) => i !== index),
        }));
    };


	const moveCtx = (
		item: string,
		from: string[],
		toSetter: React.Dispatch<React.SetStateAction<string[]>>,
		fromSetter: React.Dispatch<React.SetStateAction<string[]>>
	) => {
		if (!from.includes(item)) return;

		toSetter((p) => [...p, item]);
		fromSetter((p) => p.filter((x) => x !== item));
		setDragItem(null);
	};

    const canCreate = (): boolean => {
        return command.key.length != 0;
    }

	// -------------------------------------------------
	// SAVE HANDLER
	// -------------------------------------------------
    const handleCreate = async () => {
        if (!canCreate()) return;

        const finalFunction =
            FUNCTION_HEADER.replace("{{CTX}}", usedCtx.join(", "))
            .replace("{{ARGS}}", (command.args || []).map((a) => a.name).join(", ")) +
            body +
            FUNCTION_FOOTER;

        const jsonCommand = {
            key: command.key,
            description: command.description,
            usage: command.usage,
            args: command.args, // optional array of { name, required }
            minPerm: command.minPerm,
            run: finalFunction, // as a string
        };

        console.log("CREATE JSON:", JSON.stringify(jsonCommand, null, 2));
        await virtualFS.writeFile("System/Commands/", command.key, jsonCommand, "command");
    };

    // ARGUMENT ORDERING CHECKER
    const hasOrderingIssue = useCallback(() => {
        let seenOptional = false;

        return (command.args || []).some((arg) => {
            if (!arg.required) {
            seenOptional = true;
            return false;
            }
            return seenOptional;
        });
    }, [command.args]);

   
	// -------------------------------------------------
	// VERIFICATION OF PERMS
	// -------------------------------------------------
    const { currentUser } = useUser();

    const { verifyUser, requiresVerification } = useVerification(currentUser);

    const handlePermissionChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newPerm = parseInt(e.target.value) as Permission;
        
        if (requiresVerification(Permission.ELEVATED)) {
            const verified = await verifyUser();

            if (!verified) {
                // alert("Verification failed. Permission not changed.");
                return;
            }
        }

        setCommand((prev) => ({
            ...prev,
            minPerm: newPerm,
        }))
    };

	// -------------------------------------------------
	// RENDER
	// -------------------------------------------------
	return (
		<div className="flex flex-col gap-4">
            {/* DESCRIPTIONS */}
            <div className="p-4 rounded-lg shadow bg-surfaceAlt">
            	<label>Command Name</label>
                <Input
                    value={command.key}
                    onChange={(e) =>
                        setCommand({ ...command, key: e.target.value })
                    }
                />

                <label>Description</label>
                <Input
                    value={command.description}
                    onChange={(e) =>
                        setCommand({ ...command, description: e.target.value })
                    }
                />
            </div>

			{/* ARGUMENTS */}
            <div className="p-4 rounded-lg shadow bg-surface space-y-4">
                <div className="flex items-center justify-between gap-4">
                    <label>Add Argument</label>
                    <label className="flex items-center gap-1">
                        <input
                            type="checkbox"
                            checked={argRequired}
                            onChange={(e) => setArgRequired(e.target.checked)}
                        />
                        Required
                    </label>
                </div>

                <Input
                    placeholder="argument name"
                    value={argName}
                    onChange={(e) => setArgName(e.target.value)}
                />

                <Button onClick={addArg} full>Add Argument</Button>
                
                <div><label>Arguments</label></div>
                <div className="flex flex-col gap-2">
                    {(command.args || []).map((arg, i) => (
                        <div key={i} className="flex gap-3 border p-2 items-center">
                            <span className="font-mono">{arg.name}</span>
                            <span className="opacity-70">
                                {arg.required ? "(required)" : "(optional)"}
                            </span>
                            <div className="flex-grow text-right cursor-pointer" onClick={() => removeArg(i)}>
                                <FontAwesomeIcon icon={faCircleXmark} />
                            </div>
                        </div>
                    ))}

                    {command.args?.length == 0 && (
                        <p className="clean-p">No arguments.</p>
                    )}

                    {hasOrderingIssue() && (
                        <div style={{ color: "red" }} className="text-sm border border-yellow-400/40 bg-yellow-400/10 p-2 rounded">
                            <FontAwesomeIcon icon={faWarning} /> Optional argument precedes required one.
                        </div>
                    )}
                </div>
            </div>

			{/* CONTEXT */}
            <div className="p-4 rounded-lg shadow bg-surface space-y-4">
                <div><label>Available Context</label></div>
                <div
                    className="flex gap-2 flex-wrap border p-2"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() =>
                        dragItem &&
                        moveCtx(dragItem, usedCtx, setAvailableCtx, setUsedCtx)
                    }
                >
                    {availableCtx.map((ctx) => (
                        <div
                            key={ctx}
                            draggable
                            onDragStart={() => setDragItem(ctx)}
                            className="p-2 border cursor-move"
                        >
                            {ctx}
                        </div>
                    ))}
                </div>

                <div><label>Used Context</label></div>
                <div
                    className="flex gap-2 flex-wrap border p-2"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() =>
                        dragItem &&
                        moveCtx(dragItem, availableCtx, setUsedCtx, setAvailableCtx)
                    }
                >
                    {usedCtx.map((ctx) => (
                        <div
                            key={ctx}
                            draggable
                            onDragStart={() => setDragItem(ctx)}
                            className="p-2 border cursor-move"
                        >
                            {ctx}
                        </div>
                    ))}
                    {usedCtx.length == 0 && (
                        <div
                            className="p-2 border cursor-move clean-p"
                        >
                            No context items are used
                        </div>
                    )}
                </div>
            </div>

            <div className="p-4 rounded-lg shadow bg-surfaceAlt flex justify-between items-center">
                <span className="font-semibold">Minimum Permissions:</span>
                <select
                    value={command.minPerm}
                    onChange={handlePermissionChange}
                >
                    {Object.keys(Permission)
                        .filter((key) => isNaN(Number(key))) // keep only string keys
                        .map((key) => (
                            <option
                                key={key}
                                value={
                                    Permission[key as keyof typeof Permission]
                                }
                            >
                                {key}
                            </option>
                        ))}
                </select>
            </div>

			{/* FUNCTION EDITOR */}
			<label>Run Function</label>

			<div className="editor-shell">
				<pre className="editor-block opacity-70 select-none">
					{FUNCTION_HEADER.replace(
						"{{CTX}}",
						usedCtx.join(", ")
					).replace(
						"{{ARGS}}",
						(command.args || [])
							.map((a) => (a.required ? a.name : `${a.name}?`))
							.join(", ")
					).replace(
                        "{{EXAMPLE}}",
                        command.args && command.args.length > 0
                            ? `args['${command.args[0].name}']`
                            : "args['Key']"
                    )}
				</pre>

				<textarea
					ref={textareaRef}
					tabIndex={-1}
					className="editor-textarea editor-block resize-none overflow-hidden w-full"
					value={body}
					onChange={(e) => {
						setBody(e.target.value);
						autoResize();
					}}
					placeholder="// Write command logic here"
				/>

				<pre className="editor-block opacity-70 select-none">
					{FUNCTION_FOOTER}
				</pre>
			</div>

            {!canCreate() && (
                <div style={{ color: "red" }} className="text-sm border border-yellow-400/40 bg-yellow-400/10 p-2 rounded">
                    <FontAwesomeIcon icon={faWarning} /> Command needs a name.
                </div>
            )}
			<Button onClick={handleCreate} disabled={!canCreate()}>Create Command</Button>
		</div>
	);
};

export default CreateCommand;
