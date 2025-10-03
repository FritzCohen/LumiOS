import { faCheckCircle, faDownload, faFileImport, faRefresh, faToggleOff, faToggleOn, faXmarkCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import virtualFS from "../../../utils/VirtualFS";
import Button from "../../lib/Button";
import { useKernal } from "../../../Providers/KernalProvider";
import Select from "../../lib/Select";
import { useUser } from "../../../Providers/UserProvider";
import { useApplications } from "../../../Providers/ApplicationProvider";

const InputPopup: React.FC<{ name: string, closePopup: () => void }> = ({ name, closePopup }) => {
    const [input, setInput] = useState<string>("");
    const { systemProps, updateSystemProp } = useKernal();

    const handleConfirm = async () => {
        updateSystemProp({
            ...systemProps,
            gamesLink: input,
        })
        closePopup();
    };

    return (
        <div className="w-full h-full">
                <span>{ name }</span>
                <div className={`relative my-2 w-full px-5`}>
                    <input
                        type="text"
                        onChange={(e) => setInput(e.target.value)}
                        className="input-main transition-all duration-300 ease-in-out focus:outline-none focus:border-accent"
                        defaultValue={systemProps.gamesLink || "https://raw.githubusercontent.com/LuminesenceProject/lumi-games/refs/heads/main/Data.json"}
                        placeholder="Enter new link..."
                    />
                </div>
                <Button onClick={handleConfirm}>Confirm</Button>
        </div>
    );
};

const DevtoolsPopup: React.FC<{ name: string, closePopup: () => void }> = ({ name, closePopup }) => {
    const [input, setInput] = useState<string>("");
    const { systemProps, updateSystemProp } = useKernal();    

    const handleConfirm = async () => {        
        updateSystemProp({
            ...systemProps,
            devMode: input === "true",
        })
        closePopup();
    };

    return (
        <div className="w-full h-full flex flex-col gap-2 overflow-auto">
                <span>{ name }</span>
                Gives access to the virtualFS window variable (window.virtualFS). Does not do anything else.
                <Select defaultValue={String(systemProps.devMode)} onChange={(e) => setInput(e.target.value)}>
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                </Select>
                <Button onClick={handleConfirm}>Confirm</Button>
        </div>
    );
}

const Security = () => {
    const [currentVersion, setCurrentVersion] = useState<number>(0);
    const [version, setVersion] = useState<number>(0);
    const [status, setStatus] = useState<boolean>(true);
    const { systemProps, addPopup, removePopup, updateSystemProp } = useKernal();
    const { getInstalledApps, getTaskbarApps, getDesktopApps } = useApplications();
    const { currentUser } = useUser();

    useEffect(() => {
        const fetchCurrentUpdate = async () => {
            const file = await virtualFS.readfile("System/", "Version");
            const response = await fetch("https://raw.githubusercontent.com/LuminesenceProject/LumiOS/main/Info.json");

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();         
            
            // Check for version
            setStatus(data[0].version === file.content.version);
            setVersion(data[0].version);
            setCurrentVersion(file.content.version);
        };

        fetchCurrentUpdate();
    }, []);

    const handleUpdate = async () => {
        if (currentVersion == version) return;

        const updateFileSystem = async () => { 
            try {
                // Request file access (assuming user has selected the file previously)
                // You should get the file handle from a file picker or a file input in a real-world application.
                const [fileHandle] = await (window as any).showOpenFilePicker({
                    types: [{
                        description: 'HTML files',
                        accept: { 'text/html': ['.html'] }
                    }]
                });
        
                // Fetch the new content from the server
                const response = await fetch(`https://raw.githubusercontent.com/LuminesenceProject/LumiOS/main/LumiOS.v${version}.html`);
                if (!response.ok) throw new Error('Network response was not ok');
                const newContent = await response.text();
        
                // Create a writable stream to the file
                const writable = await fileHandle.createWritable();
        
                // Write the new content to the file
                await writable.write(newContent);
        
                // Close the file and save changes
                await writable.close();
                await virtualFS.updateSpecificDirectory(`/Users/${currentUser?.username}/Apps/`, `/Users/Default/`, true);
                await virtualFS.updateSpecificDirectory("System/", "System/", false);
                await virtualFS.updateSpecificDirectory("System/Plugins/", "System/Plugins/", false);
        
                await updateSystemProp({
                    ...systemProps,
                    firstLogin: false,
                });
            } catch (error) {
                console.error('Error updating file:', error);
                window.alert("Failed to update file.");
            }
        };    

        addPopup({
            name: "System Update",
            description: `Update the current system of Lumi OS from v${currentVersion} to v${version}.`,
            appName: "Settings",
            minimized: false,
            onAccept: updateFileSystem,
        });
    };

    const handleGamesChange = () => {
        const name = "Update Games Link";

        addPopup({
            name: name,
            description: `Update the current system of Lumi OS from v${currentVersion} to v${version}.`,
            appName: "Settings",
            minimized: false,
            onAccept: async () => {},
            children: <InputPopup name={name} closePopup={() => removePopup(name)} />
        });
    };

    const handleFileSystemDownload = () => {
        // Access the root of the virtual file system
        // @ts-expect-error IK its inaccessable f u
        const fs = virtualFS.root;
    
        // Convert the file system object to a JSON string
        const jsonContent = JSON.stringify(fs, null, 2); // Pretty-print with 2 spaces for readability
    
        // Create a Blob from the JSON string
        const blob = new Blob([jsonContent], { type: 'application/json' });
    
        // Create a link element
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'fileSystem.json'; // Set the desired file name
    
        // Programmatically click the link to trigger the download
        link.click();
    
        // Clean up the URL object
        URL.revokeObjectURL(link.href);
    };

    const handleFileSystemImport = async () => {
        await virtualFS.importFS();
    }

    const handleDevmodeChange = () => {
        const name = "Update Devmode";

        addPopup({
            name: name,
            description: `${systemProps.devMode ? "Disable" : "Enable"} devmode. It gives access to the virtualFS variable.`,
            appName: "Settings",
            minimized: false,
            onAccept: async () => {},
            children: <DevtoolsPopup name={name} closePopup={() => removePopup(name)} />
        });
    };

    const handleReload = async () => {
        await getInstalledApps();
        await getTaskbarApps();
        await getDesktopApps();
    };

    return ( 
        <div className="flex flex-col gap-2">
            <h3 className="text-xl my-2">Updates</h3>
            <div className="flex justify-between items-center py-2 w-full px-4">
                <div className="flex items-center gap-2">
                    <div>
                        <FontAwesomeIcon icon={faRefresh} className="w-12 h-12" />
                        <div className="absolute translate-x-10 -translate-y-4">
                            <FontAwesomeIcon style={{
                                color: status ? "green" : "red"
                            }} 
                            icon={status ? faCheckCircle : faXmarkCircle} />
                        </div>
                    </div>
                    <div className="flex flex-col pl-2 text-sm">
                        <h5 className="font-semibold">{ status ? "You're up to date" : "Update needed"}</h5>
                        <p>Last checked: Today</p>
                    </div>
                </div>
                <Button onClick={handleUpdate} disabled={currentVersion == version}>Check For Updates</Button>
            </div>
            <h5 className="mt-5 font-semibold">More Options:</h5>
            <div>
                <span>Change Games Link: </span>
                <Button onClick={handleGamesChange}>Change Link</Button>
            </div>
            <div>
                <span>Download File System: </span>
                <Button onClick={handleFileSystemDownload}>Download <FontAwesomeIcon icon={faDownload} /></Button>
            </div>
            <div>
                <span>Import File System: </span>
                <Button onClick={handleFileSystemImport}>Import <FontAwesomeIcon icon={faFileImport} /></Button>
            </div>
            <div>
                <span>{systemProps.devMode ? "Disable" : "Enable"} Devmode </span>
                <Button onClick={handleDevmodeChange}>Change <FontAwesomeIcon icon={systemProps.devMode ? faToggleOff : faToggleOn} /></Button>
            </div>
            <div>
                <span>Reload Apps</span>
                <Button onClick={handleReload}>Reload <FontAwesomeIcon icon={faRefresh} /></Button>
            </div>
        </div>
    );
}
 
export default Security;