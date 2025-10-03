import React from "react";
import FileBrowser from "./FileBrowser"; // Assuming FileBrowser is in the same folder
import { OpenedApp } from "../../../../context/kernal/kernal";
import { Directory, File } from "../../../api/types";

interface CreateShortcutPopupProps {
  props: OpenedApp;
  direct: string;
  setDirect: (newDirect: string) => void;
  onComplete: (
    item: File | Directory,
    path: string,
    name: string,
    inputName?: string
  ) => void;
}

const CreateShortcutPopup: React.FC<CreateShortcutPopupProps> = ({
  props,
  direct,
  setDirect,
  onComplete,
}) => {
  return (
    <FileBrowser
      props={props}
      direct={direct}
      setDirect={setDirect}
      typeFilter="file"
      fileTypeFilter=""
      showNameInput={false}
      onComplete={onComplete}
      allowFolderCreation={false}
      confirmText="Select"
    />
  );
};

export default CreateShortcutPopup;