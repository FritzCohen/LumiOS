import { ReactNode, useState } from "react";
import Button from "./Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretLeft, faCaretRight } from "@fortawesome/free-solid-svg-icons";
import Select from "./Select";
import { useKernal } from "../../Providers/KernalProvider";
import img from "../../assets/Icons/info.png";
import { useUser } from "../../Providers/UserProvider";
import virtualFS from "../../utils/VirtualFS";

const Update: React.FC<{ description: string }> = ({ description }) => {
    const [menu, setMenu] = useState(0);
    const [updateType, setUpdateType] = useState("download");
    const { addOpenedApp, addPopup } = useKernal();
    const { currentUser } = useUser();

    const handleSystemUpdate = async () => {
        await virtualFS.updateSpecificDirectory(`/Users/${currentUser?.username}/Apps/`, `/Users/Default/`, true);
        await virtualFS.updateSpecificDirectory("System/", "System/", false);
        await virtualFS.updateSpecificDirectory("System/Plugins/", "System/Plugins/", false);

        addPopup({
            name: "Notification",
            description: "Please reload the page to confirm the changes made.",
            minimized: false,
            onAccept: async () => { window.location.reload() }
        });
    };

    const handleFileDownload = async () => {
        try {
            const lumiResponse = await fetch("https://raw.githubusercontent.com/LuminesenceProject/LumiOS/main/Info.json");
            if (!lumiResponse.ok) throw new Error(`HTTP error! Status: ${lumiResponse.status}`);
            const data = await lumiResponse.json();
            const dataVersion = Number(data[0].version);

            const response = await fetch(`https://raw.githubusercontent.com/LuminesenceProject/LumiOS/main/LumiOS.v${dataVersion}.html`);
            if (!response.ok) throw new Error("Network response was not ok");
            const newContent = await response.text();

            const blob = new Blob([newContent], { type: "text/html" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `LumiOS.v${dataVersion}.html`;
            link.click();
            URL.revokeObjectURL(link.href);
        } catch (error) {
            console.error("Error downloading file:", error);
        }
    };

    const handleFileUpdate = async () => {
        try {
            const lumiResponse = await fetch("https://raw.githubusercontent.com/LuminesenceProject/LumiOS/main/Info.json");
            if (!lumiResponse.ok) throw new Error(`HTTP error! Status: ${lumiResponse.status}`);
            const data = await lumiResponse.json();
            const dataVersion = Number(data[0].version);

            const [fileHandle] = await (window as any).showOpenFilePicker({
                types: [{ description: "HTML files", accept: { "text/html": [".html"] } }],
            });

            const response = await fetch(`https://raw.githubusercontent.com/LuminesenceProject/LumiOS/main/LumiOS.v${dataVersion}.html`);
            if (!response.ok) throw new Error("Network response was not ok");
            const newContent = await response.text();

            const writable = await fileHandle.createWritable();
            await writable.write(newContent);
            await writable.close();
        } catch (error) {
            console.error("Error updating file:", error);
        }
    };

    const handleConfirm = () => {
        if (updateType === "download") handleFileDownload();
        else if (updateType === "update") handleFileUpdate();
        else handleSystemUpdate();
    };

    const handleInfoClick = () => {
        addOpenedApp({
            name: "Info",
            minimized: false,
            maximized: false,
            type: "",
            svg: img,
            path: `/Users/${currentUser?.username}/Apps/`,
        });
    };

    const getMenu = (): ReactNode => {
        switch (menu) {
            case 0:
                return <div className="flex flex-col gap-2">
                    <h3 className="font-semibold text-lg">Version Mismatch</h3>
                    <p className="font-light text-sm">{description} Click <span onClick={handleInfoClick} className="font-bold text-blue-500 cursor-pointer">here</span> for more details. Use system update if already on correct file.</p>
                </div>;
            case 1:
                return <div className="flex flex-col gap-2">
                    <h3>Choose an action:</h3>
                    <Select onChange={(e) => setUpdateType(e.target.value)}>
                        <option value="download">Download New File</option>
                        <option value="update">Update Existing File</option>
                        <option value="system">System Update</option>
                    </Select>
                    <span>Selected: {updateType === "download" ? "Download new file" : updateType === "update" ? "Update existing file" : "System Update"}</span>
                </div>;
            case 2:
                return <div className="flex flex-col gap-2">
                    <h3 className="font-semibold text-lg">{updateType === "download" ? "Download" : updateType === "update" ? "Update" : "System Update"}</h3>
                    <p>
                        {updateType === "download" ? "Click below to download the latest version as a new file." :
                            updateType === "update" ? "Select the current file to update its content." :
                                "Apply a system update. Only use if you have the correct file but outdated version."}
                    </p>
                    <Button onClick={handleConfirm}>Confirm</Button>
                </div>;
            default:
                return <>Unexpected state: {menu}</>;
        }
    };

    return (
        <div className="w-full h-full">
            {getMenu()}
            <div className="w-full flex flex-row justify-center items-center px-2 py-2">
                <Button onClick={() => setMenu(Math.max(0, menu - 1))}><FontAwesomeIcon icon={faCaretLeft} /> Back</Button>
                <Button onClick={() => setMenu(Math.min(2, menu + 1))}>Next <FontAwesomeIcon icon={faCaretRight} /></Button>
            </div>
        </div>
    );
};

export default Update;