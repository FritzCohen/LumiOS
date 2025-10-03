import { ReactNode, useState } from "react";
import Button from "../../lib/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { usePluginScript } from "../../../Providers/ScriptProvider";
import { Permission } from "../../../utils/types";

interface InstallScriptProps {
    setMenu: (prev: number) => void
}

interface Script {
    name: string;
    description: string;
    permission: Permission;
    app: string;
    script: string;
}

const InstallScript: React.FC<InstallScriptProps> = ({ setMenu }) => {
    const [current, setCurrent] = useState<number>(0);
    const [scriptLink, setScriptLink] = useState<string>("");
    const [newScript, setNewScript] = useState<Script>({
        name: "",
        description: "",
        permission: 0, // Default to User permission
        app: "",
        script: ""
    });
    const { addScript } = usePluginScript();

    const handleCreateScript = () => {
        addScript(newScript);
        alert("New script created successfully!");
        setCurrent(0); // Return to the menu
    };

    const handleLoadFromLink = async () => {
        try {
            const response = await fetch(scriptLink);
            const scriptData = await response.text(); // Assuming the script is plain text
            const loadedScript: Script = {
                name: "Script from Link",
                description: "Loaded from external link",
                permission: 0,
                app: "Unknown App",
                script: scriptData
            };
            addScript(loadedScript);
            alert("Script loaded successfully!");
            setCurrent(0); // Return to the menu
        } catch {
            alert("Failed to load script from link.");
        }
    };

    const getCurrent = (): ReactNode => {
        switch (current) {
            case 1: return (
                <div className="flex flex-col p-4 w-full h-full">
                    <div className="flex w-full justify-between items-center">
                        <Button onClick={() => setCurrent(0)}>
                            <FontAwesomeIcon icon={faChevronLeft} /> Back
                        </Button>
                        <h3 className="font-bold text-xl">Add Script from Link</h3>
                    </div>
                    <input
                        type="text"
                        placeholder="Enter script URL"
                        value={scriptLink}
                        onChange={(e) => setScriptLink(e.target.value)}
                        className="input-main"
                    />
                    <Button onClick={handleLoadFromLink} className="mt-4">
                        Load Script
                    </Button>
                </div>
            );
            case 2: return (
                <div className="flex flex-col gap-2 p-4 overflow-y-auto w-full h-full">
                <div className="flex flex-row justify-between items-center">
                <Button onClick={() => setCurrent(0)}>
                    <FontAwesomeIcon icon={faChevronLeft} /> Back
                </Button>
                <h3 className="font-bold text-xl">Create Your Own Script</h3>
                </div>
                <input
                    type="text"
                    placeholder="Script Name"
                    value={newScript.name}
                    onChange={(e) => setNewScript({ ...newScript, name: e.target.value })}
                    className="input-main"
                />
                <input
                    type="text"
                    placeholder="Description"
                    value={newScript.description}
                    onChange={(e) => setNewScript({ ...newScript, description: e.target.value })}
                    className="input-main"
                />
                <input
                    type="text"
                    placeholder="App Name"
                    value={newScript.app}
                    onChange={(e) => setNewScript({ ...newScript, app: e.target.value })}
                    className="input-main"
                />
                <textarea
                    placeholder="Script Code"
                    value={newScript.script}
                    onChange={(e) => setNewScript({ ...newScript, script: e.target.value })}
                    className="input-main h-48"
                />
                <div>
                <Button onClick={handleCreateScript} className="mt-4">
                    Create Script
                </Button>
                </div>
            </div>
            )
            default: return <>
            <div className="flex justify-between items-center w-full p-4">
                <Button onClick={() => setMenu(0)}>
                    <FontAwesomeIcon icon={faChevronLeft} /> Back
                </Button>
                <h3 className="font-bold text-xl p-2">Install Scripts</h3>
            </div>
            <div className="script-column">
                <div onClick={() => setCurrent(1)}>
                    Add script from link
                </div>
                <div onClick={() => setCurrent(2)}>
                    Create your own script
                </div>
            </div></>
        }
    };

    return getCurrent();
}
 
export default InstallScript;