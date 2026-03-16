import { useEffect, useState } from "react";
import virtualFS from "../../../api/virtualFS";
import { Directory, File, FileContentMap } from "../../../api/types";
import Button from "../../../lib/Button";
import Popup from "./Popup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { useKernel } from "../../../../hooks/useKernal";
import { OpenedApp } from "../../../../context/kernal/kernal";
import { getIconForFile } from "../../../../constants/constants";
import fileTypes from "../../../api/FileTypes";
import { useUser } from "../../../../context/user/user";
import Input from "../../../lib/Input";

interface BaseFileBrowserProps {
  props: OpenedApp;
  direct: string;
  setDirect: (newDirect: string) => void;
  onComplete: (
    item: File | Directory,
    path: string,
    name: string,
    inputName?: string
  ) => void;
  confirmText?: string;
  typeFilter?: "file" | "directory";
  fileTypeFilter?: keyof FileContentMap | "";
  showNameInput?: boolean;
  showConfirm?: boolean;
  allowFolderCreation?: boolean;
  allowFileCreation?: boolean;
}

const FileBrowser = ({
  props,
  direct,
  setDirect,
  onComplete,
  confirmText = "Confirm",
  typeFilter = "file",
  fileTypeFilter = "",
  showNameInput = false,
  showConfirm = true,
  allowFolderCreation = true,
  allowFileCreation = false,
}: BaseFileBrowserProps) => {
  const [directory, setDirectory] = useState<string>(
    direct.charAt(0) === "/" ? direct : "/" + direct
  );
  const [selectedFile, setSelectedFile] = useState<File | Directory | null>(null);
  const [content, setContent] = useState<Record<string, File | Directory>>({});
  const [inputName, setInputName] = useState<string>("");
  const [selectedFileType, setSelectedFileType] = useState<keyof FileContentMap>("txt");
  const { closeApp } = useKernel();
  const { currentUser } = useUser();

  const fetchContent = async () => {
    const fetched = await virtualFS.readdir(directory);
    setContent(fetched);
  };

  useEffect(() => {
    fetchContent();
    setSelectedFile(null);
    setDirectory(directory.replace("//", "/"));
  }, [directory]);

  const handleBack = () => {
    const updated = directory.endsWith("/") ? directory.slice(0, -1) : directory;
    const parts = updated.split("/");
    if (parts.length > 1) {
      setDirectory(parts.slice(0, -1).join("/"));
    }
  };

  const handleConfirm = () => {
    if (!selectedFile) return;
    const name = Object.entries(content).find(([, v]) => v === selectedFile)?.[0] || "";
    setDirect(selectedFile.type === "directory" ? `${directory}/${name}/` : directory);
    onComplete(selectedFile, directory, name, showNameInput ? inputName : undefined);
    closeApp(props.id);
  };

  const handleAddFolder = async () => {
    if (!inputName || !currentUser) return;
    await virtualFS.writeDirectory(directory, inputName, currentUser.permission);
    await fetchContent();
  };

  const handleAddFile = async () => {
    if (!inputName || !currentUser) return;
    const defaultContent: any = {
      txt: "",
      js: "",
      css: "",
      html: "",
      img: new Uint8Array(),
      exe: {},
      theme: {},
      sys: {},
      shortcut: "",
    };

    await virtualFS.writeFile(
      directory,
      inputName,
      defaultContent[selectedFileType],
      selectedFileType
    );
    await fetchContent();

    if (!allowFileCreation) closeApp(props.id);
  };

  return (
    <Popup app={props} frozenBackground width={500} height={400}>
      <div className="w-full h-full flex flex-col p-5">
        <h3 className="mb-2 font-bold">{directory}</h3>
        <div className="flex flex-row w-full justify-between items-center mb-2">
          <Button onClick={handleBack}>
            <FontAwesomeIcon icon={faChevronLeft} /> Back
          </Button>
          <div className="flex flex-row gap-1">
            {allowFolderCreation && <Button onClick={handleAddFolder}>New Folder</Button>}
            {allowFileCreation && (
              <>
                <select
                  value={selectedFileType}
                  onChange={(e) => setSelectedFileType(e.target.value as keyof FileContentMap)}
                  className="border rounded px-2 py-1"
                >
                  {Object.keys(fileTypes).map((ft) => (
                    <option key={ft} value={ft}>{ft}</option>
                  ))}
                </select>
                <Button onClick={handleAddFile}>New File</Button>
              </>
            )}
            {(!allowFileCreation || showConfirm) && <Button onClick={handleConfirm}>
              {confirmText} <FontAwesomeIcon icon={faCheckCircle} />
            </Button>}
          </div>
        </div>
        <div className="flex-grow overflow-y-auto space-y-1">
          {Object.entries(content).map(([name, item]) => {
            const icon = getIconForFile(item);
            const selected = selectedFile === item;
            const validType =
              item.type === typeFilter &&
              (item.type === "directory" || fileTypeFilter === "" || item.fileType === fileTypeFilter);

            return (
              <div
                key={name}
                className={`file-popup-item ${selected ? "active" : ""} ${validType || item.type === "directory" ? "cursor-pointer" : "opacity-50"}`}
                onClick={() => validType && setSelectedFile(item)}
                onDoubleClick={() => item.type === "directory" && setDirectory(`${directory}/${name}`)}
              >
                {typeof icon === "string" ? (
                  <img src={icon} className="icon" alt="icon" />
                ) : (
                  <FontAwesomeIcon icon={icon} className="icon" />
                )}
                {name}
              </div>
            );
          })}
        </div>
        {showNameInput && (
          <Input
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            className="w-full"
            placeholder="Enter name"
          />
        )}
      </div>
    </Popup>
  );
};

export default FileBrowser;
