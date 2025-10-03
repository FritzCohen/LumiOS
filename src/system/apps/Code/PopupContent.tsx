import { ReactNode, useEffect, useState } from "react";
import { Directory, File, Permission } from "../../../utils/types";
import virtualFS from "../../../utils/VirtualFS";
import Button from "../../lib/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { useKernal } from "../../../Providers/KernalProvider";
import { getIcon } from "../../../utils/Process";
import "./Code.css";

interface PopupContentProps {
    direct: string
    index: number | string
    type: "file" | "directory"
    setDirect: (prev: string) => void
};

interface NamedFile extends File {
    name: string;
  }
  
interface NamedDirectory extends Directory {
    name: string;
}

const PopupContent: React.FC<PopupContentProps> = ({ direct, index, setDirect, type }) => {
    const [directory, setDirectory] = useState<string>(direct.charAt(0) === "/" ? direct : "/" + direct);
    const [selectedFile, setSelectedFile] = useState<NamedDirectory | NamedFile | null>(null);
    const [content, setContent] = useState<Record<string, NamedDirectory | NamedFile>>({});
    const { removePopup } = useKernal();

    const fetchContent = async () => {
        const fetchedContent = await virtualFS.readdir(directory);
        const contentWithNames = Object.keys(fetchedContent).reduce((acc, key) => {
            const item = fetchedContent[key];
            acc[key] = { ...item, name: key }; // Add the name property
            return acc;
        }, {} as Record<string, NamedDirectory | NamedFile>);
        
        setContent(contentWithNames);
    };

    useEffect(() => {
        fetchContent();
        setDirectory(directory.replace("//", "/"));
        setSelectedFile(null);
    }, [directory]);

    const getContent = (): ReactNode => {
        const allItems = Object.keys(content).map((key) => content[key]);
      
        // Single click handler
        const handleSingleClick = (item: NamedDirectory | NamedFile) => {       
          if (item.type === type) {
            setSelectedFile(item);
          }
          // You can also add any selection logic here, like highlighting the item
        };
      
        // Double click handler for directories
        const handleDoubleClick = (item: NamedDirectory | NamedFile) => {
          if (item.type === "directory") {
            setDirectory(`${directory}/${item.name}`); // Assuming 'item' holds directory information
          }
        };
      
        return allItems.map((file, index) => (
          <div
            key={index}
            className={`popup-item ${selectedFile?.name === file.name ? "active" : ""}`}
            // Handle both single and double click events
            onClick={() => handleSingleClick(file)}
            onDoubleClick={() => handleDoubleClick(file)}
          >
            <img
              className="icon"
              alt="folder"
              src={getIcon(file.type === "directory" ? file.type : file.fileType as string)}
            />
            {Object.keys(content)[index]}
          </div>
        ));
    };
    
    const handleBack = () => {
        if (directory === "root" || directory === "") return;
        const updatedDirectory = directory.endsWith("/") ? directory.slice(0, -1) : directory;
        const parts = updatedDirectory.split("/");
        if (parts.length > 1) {
        const finalDirectory = parts.slice(0, -1).join("/");
        setDirectory(finalDirectory);
        
        }
    };

    const handleConfirm = () => {
        if (selectedFile) {
            setDirect(`${directory}/${selectedFile.name}/`);
        } else {
            setDirect(directory);
        }
        removePopup(index);
    };

    const handleAddFolder = async () => {
      const folderName = prompt("Project name: ");

      if (folderName) {
        await virtualFS.writeDirectory(directory, folderName, Permission.USER);
        await fetchContent();
      }
    };

    return ( 
        <div className="w-full h-full flex flex-col overflow-y-auto">
            <h3 className="my-2 font-bold">{ directory }</h3>
            <div className="flex flex-row w-full justify-between items-center mb-2">
                <Button onClick={handleBack}><FontAwesomeIcon icon={faChevronLeft} /> Back</Button>
                <div className="space-x-2">
                  <Button onClick={handleAddFolder}>New Folder</Button>
                  <Button onClick={handleConfirm}>Confirm <FontAwesomeIcon icon={faCheckCircle} /></Button>
                </div>
            </div>
            {getContent()}
        </div>
     );
}
 
export default PopupContent;