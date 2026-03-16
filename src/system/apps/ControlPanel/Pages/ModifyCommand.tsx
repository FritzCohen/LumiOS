import { useEffect, useRef, useState, useCallback } from "react";
import { ConsoleCommand } from "../../../../constants/defaultCommands";
import Input from "../../../lib/Input";
import Button from "../../../lib/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark, faWarning } from "@fortawesome/free-solid-svg-icons";

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
  return (async ({ {{CTX}} }, { {{ARGS}} }) => {
`;

const FUNCTION_FOOTER = `
  })(args, ctx);
}`;

// ---------------- PARSER ----------------
const parseRun = (run: ConsoleCommand["run"]) => {
  const src = run.toString();

  console.log(src);
  

  // Match the inner function signature
  const match = src.match(/\(\s*\{\s*([^}]*)\s*\}\s*,\s*\{\s*([^}]*)\s*\}\s*\)\s*=>\s*(\{?)/);
  if (!match) return { context: [], args: [], body: "" };

  const context = match[1].split(",").map(s => s.trim()).filter(Boolean);
  const args = match[2].split(",").map(s => s.trim()).filter(Boolean);

  const bodyStart = match.index! + match[0].length;
  let body = "";

  if (match[3] === "{") {
    // Block body: count braces
    let pos = bodyStart;
    let openBraces = 1;
    while (pos < src.length && openBraces > 0) {
      const char = src[pos];
      if (char === "{") openBraces++;
      else if (char === "}") openBraces--;
      pos++;
    }
    body = src.substring(bodyStart, pos - 1).trim();
  } else {
    // Concise body: take until first closing parenthesis of outer call
    const endPos = src.lastIndexOf(")");
    body = src.substring(bodyStart, endPos).trim();
  }

  return { context, args, body };
};

// ---------------- COMPONENT ----------------
const ModifyCommand = ({
	command,
	onChange,
}: {
	command: ConsoleCommand;
	onChange: (cmd: ConsoleCommand) => void;
}) => {
	const parsed = parseRun(command.run);

	// ----------------------------------------
	// STATE
	// ----------------------------------------
	const [localCmd, setLocalCmd] = useState(command);
	const [usedCtx, setUsedCtx] = useState<string[]>(parsed.context);
	const [availableCtx, setAvailableCtx] = useState(
		VALID_CONTEXT.filter((c) => !parsed.context.includes(c))
	);
	const [body, setBody] = useState(parsed.body);

	// ARG EDITING
	const [argName, setArgName] = useState("");
	const [argRequired, setArgRequired] = useState(false);

	const textareaRef = useRef<HTMLTextAreaElement>(null);

	// ----------------------------------------
	// AUTO RESIZE
	// ----------------------------------------
	useEffect(() => {
		const el = textareaRef.current;
		if (!el) return;
		el.style.height = "0px";
		el.style.height = el.scrollHeight + "px";
	}, [body]);

	// ----------------------------------------
	// ARG LOGIC
	// ----------------------------------------
	const addArg = () => {
		if (!argName.trim()) return;
		setLocalCmd((prev) => ({
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
		setLocalCmd((prev) => ({
			...prev,
			args: (prev.args || []).filter((_, i) => i !== index),
		}));
	};

	const hasOrderingIssue = useCallback(() => {
		let seenOptional = false;
		return (localCmd.args || []).some((arg) => {
			if (!arg.required) seenOptional = true;
			else if (seenOptional) return true;
			return false;
		});
	}, [localCmd.args]);

	// ----------------------------------------
	// CONTEXT DRAG
	// ----------------------------------------
	const moveCtx = (
		item: string,
		from: string[],
		toSetter: React.Dispatch<React.SetStateAction<string[]>>,
		fromSetter: React.Dispatch<React.SetStateAction<string[]>>
	) => {
		if (!from.includes(item)) return;
		toSetter((p) => [...p, item]);
		fromSetter((p) => p.filter((x) => x !== item));
	};

	// ----------------------------------------
	// REBUILD RUN
	// ----------------------------------------
// rebuildRun: builds the live function from raw body
const rebuildRun = () => {
  const argNames = (localCmd.args || []).map(a => a.name);
  const ctxList = usedCtx.join(", ");

  return new Function(
    "args",
    "ctx",
    `
      const argsObj = { ${argNames.map((n, i) => `${n}: args[${i}]`).join(", ")} };
      return (({ ${ctxList} }, { ${argNames.join(", ")} }) => {
        ${body}
      })(ctx, argsObj);
    `
  ) as ConsoleCommand["run"];
};

	const handleSave = () => {
		const rebuilt = rebuildRun();
		onChange({
			...localCmd,
			run: rebuilt,
			args: localCmd.args, 
		});
	};


	// ----------------------------------------
	// RENDER
	// ----------------------------------------
	return (
		<div className="flex flex-col gap-4">
			{/* BASIC INFO */}
			<div className="p-4 rounded bg-surfaceAlt">
				<label>Command Name</label>
				<Input
					value={localCmd.key}
					onChange={(e) =>
						setLocalCmd({ ...localCmd, key: e.target.value })
					}
				/>
				<label>Description</label>
				<Input
					value={localCmd.description}
					onChange={(e) =>
						setLocalCmd({
							...localCmd,
							description: e.target.value,
						})
					}
				/>
			</div>

			{/* ARGS */}
			<div className="p-4 rounded bg-surface space-y-2">
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
				<div className="flex gap-2 items-center">
					<Input
						placeholder="arg name"
						value={argName}
						onChange={(e) => setArgName(e.target.value)}
					/>
				</div>
				<Button onClick={addArg} full>
					Add
				</Button>

				<label>Arguments</label>
				{(localCmd.args || []).map((arg, i) => (
					<div key={i} className="flex gap-3 border p-2 items-center">
						<span className="font-mono">{arg.name}</span>
						<span className="opacity-70">
							{arg.required ? "(required)" : "(optional)"}
						</span>
						<div
							className="ml-auto cursor-pointer"
							onClick={() => removeArg(i)}
						>
							<FontAwesomeIcon icon={faCircleXmark} />
						</div>
					</div>
				))}
				{hasOrderingIssue() && (
					<div className="text-sm border border-yellow-400/40 bg-yellow-400/10 p-2 rounded flex items-center gap-2">
						<FontAwesomeIcon icon={faWarning} /> Optional argument
						precedes required one.
					</div>
				)}
			</div>

			{/* CONTEXT */}
			<div className="p-4 rounded bg-surface space-y-3">
				<label>Available Context</label>
				<div
					className="flex gap-2 flex-wrap border p-2"
					onDragOver={(e) => e.preventDefault()}
					onDrop={(e) => {
						const item = e.dataTransfer.getData("text/plain");
						moveCtx(item, usedCtx, setAvailableCtx, setUsedCtx);
					}}
				>
					{availableCtx.map((ctx) => (
						<div
							key={ctx}
							draggable
							onDragStart={(e) =>
								e.dataTransfer.setData("text/plain", ctx)
							}
							className="p-2 border cursor-move"
						>
							{ctx}
						</div>
					))}
				</div>

				<label>Used Context</label>
				<div
					className="flex gap-2 flex-wrap border p-2"
					onDragOver={(e) => e.preventDefault()}
					onDrop={(e) => {
						const item = e.dataTransfer.getData("text/plain");
						moveCtx(
							item,
							availableCtx,
							setUsedCtx,
							setAvailableCtx
						);
					}}
				>
					{usedCtx.map((ctx) => (
						<div
							key={ctx}
							draggable
							onDragStart={(e) =>
								e.dataTransfer.setData("text/plain", ctx)
							}
							className="p-2 border cursor-move"
						>
							{ctx}
						</div>
					))}
					{usedCtx.length === 0 && (
						<div className="p-2 border clean-p">
							No context items used
						</div>
					)}
				</div>
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
						(localCmd.args || []).map((a) => a.name).join(", ")
					)}
				</pre>

				<textarea
					ref={textareaRef}
					className="editor-textarea editor-block resize-none overflow-hidden w-full"
					value={body}
					onChange={(e) => setBody(e.target.value)}
				/>

				<pre className="editor-block opacity-70 select-none">
					{FUNCTION_FOOTER}
				</pre>
			</div>

			<Button onClick={handleSave}>Save Changes</Button>
		</div>
	);
};

export default ModifyCommand;
