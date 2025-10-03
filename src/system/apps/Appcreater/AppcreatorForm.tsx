import React from "react";
import Input from "../../lib/Input";

type Props = {
  name: string;
  description: string;
  pinned: boolean;
  shortcut: boolean;
  uploadAsApp: boolean;
  icon: File | null;
  setName: (v: string) => void;
  setDescription: (v: string) => void;
  setPinned: (v: boolean) => void;
  setShortcut: (v: boolean) => void;
  setUploadAsApp: (v: boolean) => void;
  setIcon: (f: File | null) => void;
};

const AppCreatorForm: React.FC<Props> = ({
  name,
  description,
  pinned,
  shortcut,
  uploadAsApp,
  icon,
  setName,
  setDescription,
  setPinned,
  setShortcut,
  setUploadAsApp,
  setIcon
}) => {
  return (
    <div className="space-y-4 py-2">
      {/* Name Input */}
      <div className="flex flex-col">
        <label className="font-semibold mb-1">Name</label>
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter app or game name"
          className="input-like-select"
        />
      </div>

      {/* Description */}
      <div className="flex flex-col">
        <label className="font-semibold mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input-like-select resize-none h-20"
        />
      </div>

      {/* Icon Upload */}
      <div>
        <label
          htmlFor="icon-upload"
          className="ripple-button inline-block cursor-pointer"
        >
          {icon ? icon.name : "Choose Icon"}
        </label>
        <input
          id="icon-upload"
          type="file"
          accept=".svg,.png,.jpg,.jpeg"
          onChange={(e) => setIcon(e.target.files?.[0] || null)}
          className="hidden"
        />
      </div>

      {/* Checkboxes */}
      <div className="flex flex-wrap gap-4 mt-2">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={pinned}
            onChange={() => setPinned(!pinned)}
            className="ripple-checkbox"
          />
          Pin to taskbar
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={shortcut}
            onChange={() => setShortcut(!shortcut)}
            className="ripple-checkbox"
          />
          Create shortcut
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={uploadAsApp}
            onChange={() => setUploadAsApp(!uploadAsApp)}
            className="ripple-checkbox"
          />
          Upload as App
        </label>
      </div>
    </div>
  );
};

export default AppCreatorForm;
