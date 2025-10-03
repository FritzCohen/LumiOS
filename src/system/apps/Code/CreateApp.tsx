import { useState } from "react";
import Button from "../../lib/Button";
import { useApplications } from "../../../Providers/ApplicationProvider";
import { useUser } from "../../../Providers/UserProvider";
import { App } from "../../../utils/types";

const CreateApp: React.FC<{ name: string, closePopup: () => void, defaultName: string, html: string }> = ({ name, closePopup, html, defaultName }) => {
    const [input, setInput] = useState<string>(defaultName || "");
    const [desc, setDesc] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [pinned, setPinned] = useState(false);
    const [shortcut, setShortcut] = useState(false);
    const [imageBase64, setImageBase64] = useState<string>("");

    const { currentUser } = useUser();
    const { addInstalledApp, addTaskbarApp, addDesktopApp } = useApplications();

    // Convert image to Base64
    const handleImageUpload = (file: File) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            if (reader.result) {
                setImageBase64(reader.result.toString());
            }
        };
    };

    const handleConfirm = async () => {
        if (input.trim().length === 0) {
            setError("App name cannot be empty.");
            setTimeout(() => setError(""), 2000);
            return;
        }

        const appData: App = {
            name: input,
            actualName: input,
            description: desc,
            userInstalled: true,
            fileContent: html,
            svg: imageBase64 || "", // Fallback to an empty string if no image is uploaded
            path: `Users/${currentUser?.username}/Apps/`,
        };

        addInstalledApp(appData);

        if (pinned) {
            await addTaskbarApp(appData);
        }

        if (shortcut) {
            await addDesktopApp(appData);
        }

        closePopup();
    };

    return (
        <div className="w-full h-full flex flex-col gap-4 overflow-y-auto mb-5">
            <span>{name}</span>
            <div className="relative my-2 w-full px-5">
                <input
                    type="text"
                    onChange={(e) => setInput(e.target.value)}
                    className="input-main transition-all duration-300 ease-in-out focus:outline-none focus:border-accent"
                    value={input}
                    placeholder="Enter app name..."
                />
                <input
                    type="text"
                    onChange={(e) => setDesc(e.target.value)}
                    className="input-main transition-all duration-300 ease-in-out focus:outline-none focus:border-accent"
                    placeholder="Description..."
                />
                <div>
                    <label htmlFor="image-upload" className="custom-file-upload">
                        Choose Image File
                    </label>
                    <input
                        type="file"
                        id="image-upload"
                        accept=".svg, .jpg, .jpeg, .png"
                        className="hidden"
                        onChange={(e) => {
                            if (e.target.files?.[0]) {
                                handleImageUpload(e.target.files[0]);
                            }
                        }}
                    />
                </div>
                <div className="inline-flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="pinned"
                        checked={pinned}
                        onChange={() => setPinned(!pinned)}
                        className="p-2 border rounded-md focus:outline-none focus:ring"
                    />
                    <label htmlFor="pinned" className="ml-2">Pinned when installed</label>
                </div>

                <div className="inline-flex items-center">
                    <input
                        type="checkbox"
                        id="shortcut"
                        checked={shortcut}
                        onChange={() => setShortcut(!shortcut)}
                        className="p-2 border rounded-md focus:outline-none focus:ring"
                    />
                    <label htmlFor="shortcut" className="ml-2">Shortcut when installed</label>
                </div>

                {error && <p className="text-red-500">{error}</p>}
            </div>
            <Button onClick={handleConfirm}>Confirm</Button>
        </div>
    );
};

export default CreateApp;