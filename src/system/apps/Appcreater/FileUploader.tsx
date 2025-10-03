import React from "react";

type Props = { onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void };

const FileUploader: React.FC<Props> = ({ onUpload }) => (
  <>
    <label
      htmlFor="app-upload"
      className="custom-file-upload inline-block px-4 py-2 bg-accent text-white rounded cursor-pointer hover:bg-accent/80"
    >
      Upload App / Game
    </label>
    <input
      id="app-upload"
      type="file"
      webkitdirectory="true"
      directory=""
      onChange={onUpload}
      className="hidden"
    />
  </>
);

export default FileUploader;