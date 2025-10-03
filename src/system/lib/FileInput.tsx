import { useState } from "react";
import virtualFS from "../../utils/VirtualFS";
import { Permission } from "../../utils/types";
import Button from "./Button";
import { useApplications } from "../../Providers/ApplicationProvider";
import { useUser } from "../../Providers/UserProvider";

const FileInput: React.FC<{ name: string, closePopup: () => void, type: "file" | "directory" }> = ({ name, type, closePopup }) => {
    const [input, setInput] = useState<string>("");
    const { getDesktopApps } = useApplications();
    const { currentUser } = useUser();
    
    const handleWrite = async () => {
        if (type === "directory") {
            await virtualFS.writeDirectory(`Users/${currentUser?.username}/Desktop/`, input, Permission.USER);
        } else {
            await virtualFS.writeFile(`Users/${currentUser?.username}/Desktop/`, input, "", "txt");
        }

        await getDesktopApps();
    };

    const handleConfirm = () => {
        handleWrite();
        getDesktopApps();
        closePopup();
    }
    
    return (
        <div className="w-full h-full">
                <span>{ name }</span>
                <div className={`relative my-2 w-full px-5`}>
                    <input
                        type="text"
                        onChange={(e) => setInput(e.target.value)}
                        className="input-main transition-all duration-300 ease-in-out focus:outline-none focus:border-accent"
                        placeholder={`New ${type} name...`}
                    />
                </div>
                <Button onClick={handleConfirm}>Confirm</Button>
        </div>
    );
};

export default FileInput;