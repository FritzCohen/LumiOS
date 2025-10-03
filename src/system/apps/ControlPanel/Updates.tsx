import { useEffect, useState } from "react";
import virtualFS from "../../../utils/VirtualFS";
import defaultFS from "../../../utils/defaultFS";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faRefresh, faTrash } from "@fortawesome/free-solid-svg-icons";
import { Game } from "../../../utils/types";
import Button from "../../lib/Button";
import { useApplications } from "../../../Providers/ApplicationProvider";

interface Update {
    version: number;
    updated: string[];
    requiresDownload: boolean;
}

interface versionInterface {
    name: string;
    image: string;
    version: string;
    secure: boolean;
}

interface UpdatesProps {
    setMenu: (prev: number) => void
}

const Updates: React.FC<UpdatesProps> = ({ setMenu }) => {
    const [downloaded, setDownloaded] = useState<string[]>([]);
    const [updates, setUpdates] = useState<Update[]>([]);
    const [version, setVersion] = useState<versionInterface>();
    const [thisVersion, setThisVersion] = useState<versionInterface>();
    const { deleteInstalledApp } = useApplications();

    const fetchDownloaded = async () => {
        const apps = Object.keys(await virtualFS.readdir("Apps/"));
        const defaultApps = Object.keys(defaultFS.root.children.Apps.type === "directory" && defaultFS.root.children.Apps.children);

        const newApps = apps.filter(app => !defaultApps.includes(app));
        setDownloaded(newApps);

        // Handle apps that need to be updated
        const fetchedContent = await fetch("https://raw.githubusercontent.com/LuminesenceProject/LumiOS/main/Updates.json");
        const json: Update[] = await fetchedContent.json();

        const version = await fetch("https://raw.githubusercontent.com/LuminesenceProject/LumiOS/main/Info.json");
        const versionJson = await version.json();

        const currentVersion = await virtualFS.readfile("System/", "Version");
        const currentVersionContent: versionInterface = currentVersion.content;

        if (json) {
            setUpdates(json);
        }

        if (versionJson) {                
            setVersion(versionJson[0]);
            setThisVersion(currentVersionContent);
        }
    };

    useEffect(() => {
        fetchDownloaded();
    }, []);

    const handleAppUpdate = async (app: string) => {
        await virtualFS.initialize();
        
        const fetchedContent = await fetch("https://raw.githubusercontent.com/LuminesenceProject/LumiOS/main/Data.json");
        const json: Game[] = await fetchedContent.json();

        const file = json.find(game => game.name === app);
        const fileContent = await fetch(file?.path || "");
        const text = await fileContent.text();

        await virtualFS.updateFile("Apps/", app, {
            text,
        }, "exe");
    }
    
    const handleLumiOSUpdate = () => {
        // Function to handle file download
        function triggerDownload(url: string, filename: string) {
            // Create a link element
            const link = document.createElement('a');
    
            // Set the link's href attribute to the file URL
            link.href = url;
    
            // Set the download attribute to specify the filename
            link.download = filename;
    
            // Append the link to the document (not visible to the user)
            document.body.appendChild(link);
    
            // Trigger a click event on the link
            link.click();
    
            // Remove the link from the document
            document.body.removeChild(link);
        }
    
        // Construct the raw file URL
        const rawUrl = `https://github.com/LuminesenceProject/LumiOS/raw/main/LumiOS.v${version?.version}.html`;
    
        // Trigger the file download
        triggerDownload(rawUrl, `LumiOS.v${version?.version}.html`);
    };

    const handleAppDelete = async (app: string) => {
        await deleteInstalledApp(app);

        await fetchDownloaded();
    };

    return ( 
        <div className="flex flex-col p-5">
            <div className="flex flex-row justify-between items-center w-full">
                <Button onClick={() => setMenu(0)}><FontAwesomeIcon icon={faChevronLeft} /> Back</Button>
                <h3 className="my-2 font-semibold text-lg">Updates</h3>
            </div>
            {downloaded.length == 0 && <h4>No updates are needed.</h4>}
            <hr style={{ color: "gray" }} className="w-11/12 text-center mx-auto my-2" />
            {downloaded.length == 0 && version?.version !== thisVersion?.version && <p className="text-xs font-light text-center">Updates will appear here.</p>}
            <div className="script-column">
                {version?.version !== thisVersion?.version && (
                    <div className={`flex w-full items-center justify-between py-1 px-2 rounded-sm`}>
                        <h4 className="text-md">LumiOS</h4>
                        <div className="flex text-sm justify-center items-center gap-2">
                            <Button onClick={handleLumiOSUpdate}><FontAwesomeIcon icon={faRefresh} /></Button>
                        </div>
                    </div>
                )}
                {downloaded.map((app: string, index: number) => (
                    <div key={index} className={`flex w-full items-center justify-between py-1 px-2 rounded-sm ${index % 2 != 0 ? "!bg-secondary" : "bg-primary"}`}>
                        <h4 className="text-md">{ app }</h4>
                        <div className="flex text-sm justify-center items-center gap-2">
                            {!updates.some(value => value.updated.includes(app)) ? <p>No update needed.</p> : <p>Update Required.</p>}
                            <Button onClick={() => handleAppUpdate(app)} disabled={!updates.some(value => value.updated.includes(app))}><FontAwesomeIcon icon={faRefresh} /></Button>
                            <Button onClick={() => handleAppDelete(app)}><FontAwesomeIcon icon={faTrash} /></Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
 
export default Updates;