import React from "react";
import Button from "../../lib/Button";
import { CodeState } from "./codeTypes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";

const Topbar: React.FC<{ code: CodeState }> = ({ code }) => {
  const {
    menu,
    setMenu,
    selectedFile,
    setSelectedFile,
    openFiles,
    closeFile,
    openFilesMap,
  } = code;

  const handleTabClick = (path: string) => {
    setSelectedFile(path);
    setMenu(2);
  };

  const handleTabClose = (e: React.MouseEvent, path: string) => {
    e.stopPropagation();
    closeFile(path);

    if (selectedFile === path) {
      const remaining = openFiles.filter(f => f !== path);
      if (remaining.length > 0) {
        setSelectedFile(remaining[remaining.length - 1]);
        setMenu(2);
      } else {
        setSelectedFile(null);
        setMenu(0);
      }
    }
  };

  return (
    <div className="code-topbar px-2 py-1 flex items-center justify-between gap-2">
      <div className="flex gap-2">
        <Button onClick={() => setMenu(1)} active={menu === 1}>File</Button>
        <Button onClick={() => setMenu(2)} active={menu === 2}>Code</Button>
        <Button onClick={() => setMenu(3)} active={menu === 3}>Result</Button>
      </div>

      <div className="flex gap-1 overflow-x-auto no-scrollbar">
        {openFiles.map((path) => {
          const file = openFilesMap?.[path];
          const label = file?.name || path.split("/").pop() || "Untitled";

          return (
            <div
              key={path}
              className={`code-item code-topbar-item ${
                path === selectedFile ? "active" : ""
              }`}
              onClick={() => handleTabClick(path)}
            >
              <span className="truncate max-w-[150px]">{label}</span>
              <button
                onClick={(e) => handleTabClose(e, path)}
                className="ml-2 text-xs px-2 py-0.5 rounded"
              >
                <FontAwesomeIcon icon={faX} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Topbar;