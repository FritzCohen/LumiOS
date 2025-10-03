import { faFile, faFileExport, faFolderOpen, faPlay } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import virtualFS from "../../../utils/VirtualFS";
import { useEffect, useRef, useState } from "react";
import { Process } from "../../../utils/types";
import { useKernal } from "../../../Providers/KernalProvider";
import PopupContent from "../Code/PopupContent";

interface NotepadProps {
    app: Process;
    refresh: () => Promise<void>;
}

const Notepad: React.FC<NotepadProps> = ({ app, refresh }) => {
    const { resetOptionalProperties, addPopup, optionalProperties } = useKernal();
    const [directory, setDirectory] = useState<string>(optionalProperties.path || app?.path || ""); // @ts-expect-error This is easier then passing props.
    const [selectedFile, setSelectedFile] = useState<string>(app ? (app.displayName ?? app.name) : "");
    const [isStringified, setIsStringified] = useState<boolean>(false);
    const [saveColor, setSaveColor] = useState<string>("");
    const [runColor, setRunColor] = useState<string>("");
    const [appUsed, setAppUsed] = useState<boolean>(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [reload, setReload] = useState<(() => void) | null>(null);

    useEffect(() => {
        setReload(() => optionalProperties.reload); // Store reload function
        resetOptionalProperties();
        fetchContent();
        setAppUsed(true);
    }, [directory, selectedFile]); // Runs when selected file or directory changes    

    const fetchContent = async () => {
        try {
            //const contentPath = `${directory}/${selectedFile}`;
            let content = appUsed ? undefined : app.content;

            if (!content) {
                const file = await virtualFS.readfile(directory, selectedFile);
                content = await file.content;
            }

            if (content) {
                const contentString = typeof content === "string" ? content : JSON.stringify(content);
                setIsStringified(typeof content !== "string");
                if (textareaRef.current) textareaRef.current.value = contentString;
            } else {
                if (textareaRef.current) textareaRef.current.value = "";
            }
        } catch (error) {
            console.error("Failed to fetch content:", error);
        }
    };

    const handleSave = async () => {
        try {
            const content = textareaRef.current?.value || "";
            const parsedContent = isStringified ? JSON.parse(content) : content;
    
            await virtualFS.updateFile(directory, selectedFile, parsedContent, app.type as string || "text");
            
            if (refresh) await refresh();
            if (reload) await reload(); // Call stored reload function
    
            setSaveColor("green");
            setTimeout(() => setSaveColor(""), 2000);
        } catch (error) {
            console.error("Failed to save file:", error);
            setSaveColor("red");
            setTimeout(() => setSaveColor(""), 2000);
        }
    };

    const handleOpenFolder = () => {
        addPopup({
            name: "FilePicker",
            minimized: false,
            onAccept: async () => {},
            description: "",
            children: (
                <PopupContent
                    setDirect={(newPath) => { // Follows format directory/filename
                        const parts = newPath.split("/").filter(part => part !== "");
                        const newFile = parts.pop() || ""; // Name is contained in last part
                        const newDirectory = parts.join("/");
                    
                        setDirectory(newDirectory);
                        setSelectedFile(newFile);
                    }}
                    direct={directory}
                    index="FilePicker"
                    type="file"
                />
            ),
        });
    };

    const handleRun = () => {
        try {
            const type: string = app.type as string;

            const value = textareaRef.current && textareaRef.current.value;
            
            if (value && (type === "js" || type === "lumi")) {
                eval(value);

                setRunColor("green");

                setTimeout(() => setRunColor(""), 2000);
            } else {
                setRunColor("red");

                setTimeout(() => setRunColor(""), 2000);
            }
        } catch (e) {
            console.error(e);

            setRunColor("red");

            setTimeout(() => setRunColor(""), 2000);
        }
    };

    return (
        <div className="flex flex-row text-text-base h-full">
            <div className="flex flex-col relative">
                <button
                    className="transition-colors duration-200 hover:bg-secondary p-2 rounded"
                    onClick={handleOpenFolder}
                >
                    <FontAwesomeIcon icon={faFolderOpen} />
                </button>
                <button 
                    className="transition-colors duration-200 hover:bg-secondary p-2 rounded"
                    style={{ color: runColor }}
                    onClick={handleRun}
                >
                    <FontAwesomeIcon icon={faPlay} />
                </button>
                <button
                    className="transition-colors duration-200 hover:bg-secondary p-2 rounded"
                    style={{ color: saveColor }}
                    onClick={handleSave}
                >
                    <FontAwesomeIcon icon={faFile} />
                </button>
                <input id="file-input" type="file" style={{ display: "none" }} />
                <button className="transition-colors duration-200 hover:bg-secondary p-2 rounded">
                    <FontAwesomeIcon icon={faFileExport} />
                </button>
            </div>
            <textarea
                ref={textareaRef}
                defaultValue={app ? app.content : ""}
                className="flex-grow h-full w-full p-2"
                style={{ background: "transparent" }}
            />
        </div>
    );
};

export default Notepad;