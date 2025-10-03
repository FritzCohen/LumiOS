import { useState } from "react";
import { usePluginScript } from "../../../Providers/ScriptProvider";
import { Permission } from "../../../utils/types";
import Button from "../../lib/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faSave } from "@fortawesome/free-solid-svg-icons";
import { useKernal } from "../../../Providers/KernalProvider";

interface ScriptsProps {
    setMenu: (prev: number) => void;
}

interface Script {
    name: string;
    description: string;
    permission: Permission;
    app: string;
    script: string;
}

const Scripts: React.FC<ScriptsProps> = ({ setMenu }) => {
    const [selectedScript, setSelectedScript] = useState<Script | null>(null);
    const [updatedScript, setUpdatedScript] = useState<string>(JSON.stringify(selectedScript));
    const { addPopup } = useKernal();
    const { scripts, removeScript, modifyScript, fetchScripts } = usePluginScript();

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
        if (selectedScript) {            
            // Call your saveScript function or logic here
            await modifyScript(selectedScript.name, JSON.parse(updatedScript));
            await fetchScripts();
            setSelectedScript(null);
        }
    };

    const handleDelete = async () => {
        if (!selectedScript) return;

        addPopup({
            name: `Remove ${selectedScript.name}`,
            appName: "Control Panel",
            description: "Delete an installed script.",
            onAccept: async () => {
                await removeScript(selectedScript.name);
                setSelectedScript(null);
            },
            minimized: false,
        });
    };

    return (
        selectedScript == null ?
        <div className="flex flex-col overflow-y-auto w-full h-full">
            <div className="flex justify-between items-center w-full p-4">
                <Button onClick={() => setMenu(0)}>
                    <FontAwesomeIcon icon={faChevronLeft} /> Back
                </Button>
                <h3 className="font-bold text-xl p-2">Manage Scripts</h3>
            </div>
            <div className="script-column overflow-y-auto">
                {scripts.length == 0 && "No scripts are installed."}
                {scripts.map((script, index) => (
                    <div key={index} onClick={() => { 
                        setSelectedScript(script);
                    }}>
                        {script.name}
                        <div>{ getLevel(script.permission) }</div>
                    </div>
                ))}
            </div>
        </div>
        :
        <div className="flex flex-col gap-2 w-full h-full p-4 overflow-y-auto">
            <div className="flex justify-between items-center">
                <Button onClick={() => setSelectedScript(null)}>
                    <FontAwesomeIcon icon={faChevronLeft} /> Back
                </Button>
                <h2 className="font-bold text-xl">{selectedScript.name}</h2>
            </div>
            <h3 className="text-lg mt-4 font-semibold">Description of: {selectedScript.name}</h3>
            <p className="font-light">{selectedScript.description}</p>
            <h3 className="text-lg mt-4 font-semibold">Changes are made to: {selectedScript.app}</h3>
            <p className="font-light">Permission Level: {getLevel(selectedScript.permission)}</p>
            <h4 className="text-lg mt-4 font-semibold">Possible Levels: </h4>
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
                defaultValue={JSON.stringify(selectedScript)}
                onChange={handleScriptChange}
                className="w-full min-h-64 p-2 mt-2 border rounded flex-grow"
                style={{ color: "black" }}
            />
        </div>
    );
}

export default Scripts;