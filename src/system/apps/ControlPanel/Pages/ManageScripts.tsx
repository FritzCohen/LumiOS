import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faSave } from "@fortawesome/free-solid-svg-icons";
import { Script, useScripts } from "../../../../context/scripts/ScriptProvider";
import Button from "../../../lib/Button";

const ManageScripts = () => {
    const [selectedScript, setSelectedScript] = useState<Script | null>(null);
    const [updatedScript, setUpdatedScript] = useState<string>("");
    const { scripts, removeScript, modifyScript } = useScripts();

    const getLevel = (permission: number): string => {
        switch (permission) {
            case 1: return "Elevated";
            case 2: return "System";
            default: return "User";
        }
    };

    const handleScriptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setUpdatedScript(e.target.value);
    };

    const handleSaveScript = async () => {
        if (!selectedScript) return;

        try {
            const parsed: Script = JSON.parse(updatedScript);
            // update all props via modifyScript
            (Object.keys(parsed) as (keyof Script)[]).forEach(async (prop) => {
                await modifyScript(selectedScript.name, prop, parsed[prop]);
            });
            setSelectedScript(null);
        } catch (err) {
            console.error("Invalid JSON in editor:", err);
        }
    };

    const handleDelete = async () => {
        if (!selectedScript) return;
        removeScript(selectedScript.name);
        setSelectedScript(null);
    };

    return (
        selectedScript == null ? (
            <div className="flex flex-col overflow-y-auto w-full h-full">
                <div className="script-column overflow-y-auto">
                    {scripts.length === 0 && "No scripts are installed."}
                    {scripts.map((script, index) => (
                        <div
                            key={index}
                            onClick={() => {
                                setSelectedScript(script);
                                setUpdatedScript(JSON.stringify(script, null, 2));
                            }}
                            className="cursor-pointer p-2 mb-2 rounded"
                        >
                            {script.name}
                            <div>{getLevel(script.permission)}</div>
                        </div>
                    ))}
                </div>
            </div>
        ) : (
            <div className="flex flex-col gap-2 w-full h-full p-4 overflow-y-auto">
                <div className="flex justify-between items-center">
                    <Button onClick={() => setSelectedScript(null)}>
                        <FontAwesomeIcon icon={faChevronLeft} /> Back
                    </Button>
                    <h2 className="font-bold text-xl">{selectedScript.name}</h2>
                </div>
                <p className="font-light">
                    Permission Level: {getLevel(selectedScript.permission)}
                </p>
                <h4 className="text-lg mt-4 font-semibold">Possible Levels:</h4>
                <ul>
                    <li>User: Cannot change system files</li>
                    <li>Elevated: Can change certain files that are not important</li>
                    <li>System: Has full control over everything</li>
                </ul>
                <div className="flex w-full justify-between items-center border p-2 mt-2">
                    <h3 className="text-lg font-semibold">Delete Script</h3>
                    <Button onClick={handleDelete}>Delete</Button>
                </div>
                <div className="flex justify-between items-center">
                    <h3 className="text-lg mt-4">Edit Script</h3>
                    <Button onClick={handleSaveScript} className="mt-4 self-end">
                        <FontAwesomeIcon icon={faSave} /> Save
                    </Button>
                </div>
                <textarea
                    value={updatedScript}
                    onChange={handleScriptChange}
                    className="w-full min-h-64 p-2 mt-2 border rounded flex-grow"
                />
            </div>
        )
    );
};

export default ManageScripts;
