// FileExplorerControls.tsx
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBackward,
  faFileCirclePlus,
  faFolderPlus,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";
import cut from "../../../assets/Icons/Settings/cut.png";
import copy from "../../../assets/Icons/Settings/copy.png";
import paste from "../../../assets/Icons/Settings/paste.png";
import garbage from "../../../assets/Icons/Settings/garbage.png";
import InputBar from "./InputBar";
import { FileExplorerState } from "./fileExplorerTypes";

const FileExplorerControls: React.FC<{ explorer: FileExplorerState }> = ({ explorer }) => {
  const {
    handleBack,
    handleAddFile,
    handleAddFolder,
    handleCut,
    handleCopy,
    handlePaste,
    handleDelete,
    handleFileUpload,
    clipboard,
    directory,
    setDirectory,
  } = explorer;

  return (
    <div className="flex flex-col items-center justify-between gap-2 w-full py-2 px-5">
      <div className="file-explorer-bar w-full">
        <div className="w-full flex">
          <div className="grid grid-cols-7 gap-1">
            <button onClick={handleBack} className="file-button">
              <FontAwesomeIcon icon={faBackward} />
              Back
            </button>
            <button onClick={handleAddFile} className="file-button">
              <FontAwesomeIcon icon={faFileCirclePlus} />
              File
            </button>
            <button onClick={handleAddFolder} className="file-button">
              <FontAwesomeIcon icon={faFolderPlus} />
              Folder
            </button>
            <button
              onClick={handleCut}
              className={`file-button ${
                clipboard.items.length !== 0 && clipboard.type === "cut"
                  ? "file-button-active"
                  : ""
              }`}
            >
              <img className="icon" alt="cut" src={cut} />
              Cut
            </button>
            <button
              onClick={handleCopy}
              className={`file-button ${
                clipboard.items.length !== 0 && clipboard.type === "copy"
                  ? "file-button-active"
                  : ""
              }`}
            >
              <img className="icon" alt="copy" src={copy} />
              Copy
            </button>
            <button onClick={handlePaste} className="file-button">
              <img className="icon" alt="paste" src={paste} />
              Paste
            </button>
            <button onClick={handleDelete} className="file-button">
              <img className="icon invert" alt="delete" src={garbage} />
              Delete
            </button>
          </div>
        </div>
        <div>
          <button
            onClick={handleFileUpload}
            className="file-button !text-xs !p-0.5"
          >
            <FontAwesomeIcon icon={faDownload} />
            Upload
          </button>
        </div>
      </div>
      <InputBar directory={directory} setDirectory={setDirectory} />
    </div>
  );
};

export default FileExplorerControls;