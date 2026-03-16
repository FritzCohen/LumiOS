import { useRef, useState } from "react";
import { OpenedApp } from "../../../../context/kernal/kernal";
import { NamedDirectory, NamedFile } from "../../../apps/FileExplorer/fileExplorerTypes";
import Popup from "./Popup";
import { useUser } from "../../../../context/user/user";
import { FileErrorType, Permission } from "../../../../types/globals";
import Button from "../../../lib/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuestionCircle, faFloppyDisk } from "@fortawesome/free-solid-svg-icons";
import { User } from "../../../../context/user/userTypes";
import DatePicker from "../../../lib/DatePicker";
import virtualFS from "../../../api/virtualFS";
import fileTypes, { FileType } from "../../../api/FileTypes";
import { createError } from "../../../api/errors";
import useVerification from "../../../../hooks/useVerification";

// Types for better organization
interface EditState {
  name: string;
  type: FileType;
  date: string;
  permission: Permission;
}

// Custom hook for editing logic
const useItemEditor = (item: NamedFile | NamedDirectory, path: string) => {
  const [editState, setEditState] = useState<EditState>({
    name: item.name,
    type: item.type === "file" ? item.fileType : "txt",
    date: "date" in item ? new Date(item.date).toISOString().slice(0, 16) : "",
    permission: item.permission
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const updateEditState = (updates: Partial<EditState>) => {
    setEditState(prev => ({ ...prev, ...updates }));
    setHasUnsavedChanges(true);
  };

  const saveChanges = async (): Promise<boolean> => {
    try {
      if (editState.permission !== item.permission) {
        await virtualFS.updateItem(path, item.name, "permission", editState.permission);
      }

      if ("date" in item && editState.date) { // tf why i gotta convert like this bro :((()))
        await virtualFS.updateItem(path, item.name, "date", editState.date as unknown as Date);
      }

      if ("fileType" in item && editState.type) {
        await virtualFS.updateItem(path, item.name, "fileType", editState.type);
      }

      if (editState.name !== item.name) {
        await virtualFS.rename(path, item.name, editState.name);
      }

      setHasUnsavedChanges(false);
      return true;
    } catch (error) {
      console.error("Failed to save changes:", error);
      return false;
    }
  };

  return {
    editState,
    updateEditState,
    saveChanges,
    hasUnsavedChanges,
    resetChanges: () => setEditState({
      name: item.name,
      type: item.type === "file" ? item.fileType : "txt",
      date: "date" in item ? new Date(item.date).toISOString().slice(0, 16) : "",
      permission: item.permission
    })
  };
};

// Props interfaces
interface GeneralTabProps {
  item: NamedFile | NamedDirectory;
  path: string;
  editState: EditState;
  onEditStateChange: (updates: Partial<EditState>) => void;
  requiresVerification: (permission?: Permission) => boolean;
  onVerifyUser: () => Promise<boolean>;
}

interface PermissionsTabProps {
  item: NamedFile | NamedDirectory;
  editState: EditState;
  onEditStateChange: (updates: Partial<EditState>) => void;
  currentUser: User | null;
  requiresVerification: (permission?: Permission) => boolean;
  onVerifyUser: () => Promise<boolean>;
}

// Reusable editable field component
const EditableField: React.FC<{
  label: string;
  value: string;
  isEditing: boolean;
  onEditStart: () => void;
  onEditEnd: () => void;
  onValueChange: (value: string) => void;
  renderDisplay?: (value: string) => React.ReactNode;
  inputType?: "text" | "textarea";
}> = ({ 
  label, 
  value, 
  isEditing, 
  onEditStart, 
  onEditEnd, 
  onValueChange, 
  renderDisplay,
  inputType = "text"
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && inputType === "text") {
      onEditEnd();
    } else if (e.key === "Escape") {
      onEditEnd();
    }
  };

  return (
    <div
      className={`file-popup-item flex justify-between items-center rounded-sm p-1 ${
        isEditing ? "bg-gray-100" : ""
      }`}
      onClick={onEditStart}
    >
      <strong>{label}:</strong>
      {isEditing ? (
        inputType === "textarea" ? (
          <textarea
            className="input-like-select text-right bg-transparent border-none p-0 focus:outline-none resize-none"
            style={{ color: "black", width: "150px" }}
            value={value}
            autoFocus
            onChange={(e) => onValueChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={onEditEnd}
            onClick={(e) => e.stopPropagation()}
            rows={3}
          />
        ) : (
          <input
            className="input-like-select text-right bg-transparent border-none p-0 focus:outline-none"
            style={{ color: "black" }}
            value={value}
            autoFocus
            onChange={(e) => onValueChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={onEditEnd}
            onClick={(e) => e.stopPropagation()}
          />
        )
      ) : (
        <span className="truncate text-right ml-2">
          {renderDisplay ? renderDisplay(value) : value}
        </span>
      )}
    </div>
  );
};

const GeneralTab: React.FC<GeneralTabProps> = ({
  item,
  path,
  editState,
  onEditStateChange,
  requiresVerification,
  onVerifyUser,
}) => {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const dateRef = useRef(null);

  const handleEditAttempt = async (target: "name" | "date") => {
    if (requiresVerification()) {
      const verified = await onVerifyUser();
      if (!verified) {
        // alert("Verification failed. Cannot modify field.");
        return;
      }
    }
    setSelectedItem(target);
  };

  const handleDateChange = (newDate: string) => {
    onEditStateChange({ date: newDate });
  };

  const formatDateDisplay = (dateString: string) => {
    const date = new Date(dateString);
    return (
      <>
        {date.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        })}{" "}
        at{" "}
        {date.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        })}
      </>
    );
  };

  return (
    <div className="flex flex-col gap-2 relative">
      {/* Editable Name Field */}
      <EditableField
        label="Name"
        value={editState.name}
        isEditing={selectedItem === "name"}
        onEditStart={() => handleEditAttempt("name")}
        onEditEnd={() => setSelectedItem(null)}
        onValueChange={(newName) => onEditStateChange({ name: newName })}
      />

      {/* Editable Date Field */}
      {"date" in item && (
        <div className="file-popup-item flex justify-between items-center rounded-sm p-1">
          <strong>Modified:</strong>
          <div className="flex items-center gap-2 relative">
            <span
              className="text-right ml-2 cursor-pointer"
              onClick={() => handleEditAttempt("date")}
            >
              {formatDateDisplay(editState.date)}
            </span>
            <button
              className="text-gray-600 hover:text-black"
              onClick={(e) => {
                e.stopPropagation();
                setShowDatePicker((prev) => !prev);
              }}
              ref={dateRef}
            >
              📅
            </button>
            {showDatePicker && (
              <DatePicker
                value={editState.date}
                anchorRef={dateRef}
                onChange={handleDateChange}
                onClose={() => setShowDatePicker(false)}
              />
            )}
          </div>
        </div>
      )}

      {/* Read-only fields */}
      {"fullPath" in item && (
        <div className="file-popup-item flex justify-between items-center rounded-sm p-1">
          <strong>Path:</strong>
          <span className="truncate text-right ml-2">{path === "" ? "Root" : path}</span>
        </div>
      )}

      {"type" in item && (
        <div className="file-popup-item flex justify-between items-center rounded-sm p-1">
          <strong>Type:</strong>
          <span className="ml-2">{item.type}</span>
        </div>
      )}

      {"fileType" in item && (
        <div className="file-popup-item flex justify-between items-center rounded-sm p-1">
          <strong>File Type:</strong>
          <select
            value={editState.type}
            onChange={(e) => onEditStateChange({ type: e.target.value as FileType })}
            className="border border-gray-300 rounded px-1 py-0.5"
          >
            {Object.keys(fileTypes).map((type, index) => (
              <option key={index} value={type}>{type}</option>
            ))}
            {/* Add more file types as needed */}
          </select>
        </div>
      )}
    </div>
  );
};

const PermissionsTab: React.FC<PermissionsTabProps> = ({
  item,
  editState,
  onEditStateChange,
  currentUser,
  requiresVerification,
  onVerifyUser,
}) => {
  const getPermissionLabel = (perm: Permission): string => {
    switch (perm) {
      case Permission.SYSTEM:
        return "System";
      case Permission.ELEVATED:
        return "Elevated";
      case Permission.USER:
        return "User";
      case Permission.NONE:
        return "None";
      default:
        return "Unknown";
    }
  };

  const handlePermissionChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPerm = parseInt(e.target.value) as Permission;
    
    if (requiresVerification(Permission.ELEVATED)) {
      const verified = await onVerifyUser();
      if (!verified) {
        // alert("Verification failed. Permission not changed.");
        return;
      }
    }

    onEditStateChange({ permission: newPerm });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="file-popup-item p-1 rounded-sm">
        <strong>Current User:</strong> {currentUser?.username || "Unknown"}
      </div>

      <div className="file-popup-item p-1 rounded-sm">
        <strong>User Permission:</strong>{" "}
        {getPermissionLabel(currentUser?.permission || Permission.NONE)}
      </div>

      <div className="file-popup-item p-1 rounded-sm">
        <strong>Deletable:</strong> {item.deleteable ? "Yes" : "No"}
      </div>

      <div className="mt-2">
        <label>
          <strong>Item Permission:</strong>
        </label>
        <select
          value={editState.permission}
          onChange={handlePermissionChange}
          className="w-full border border-gray-300 rounded px-1 py-0.5 mt-1"
        >
          {Object.keys(Permission)
            .filter((key) => isNaN(Number(key)))
            .map((key) => {
              const permValue = Permission[key as keyof typeof Permission];
              return (
                <option key={key} value={permValue}>
                  {getPermissionLabel(permValue)}
                </option>
              );
            })}
        </select>
      </div>
    </div>
  );
};

const CATEGORIES = ["General", "Permissions"];

const ItemInfoPopup: React.FC<{
  props: OpenedApp;
  item: NamedFile | NamedDirectory;
  path: string;
}> = ({ props, item, path }) => {
  const [activeTab, setActiveTab] = useState(0);
  const { currentUser } = useUser();

  const { verifyUser, requiresVerification } = useVerification(currentUser);
  const { editState, updateEditState, saveChanges, hasUnsavedChanges } = useItemEditor(item, path);

  const handleSave = async () => {
    const success = await saveChanges();
    if (success) {
      // Optionally show success message or close popup
      console.log("Changes saved successfully");
    } else {
      // alert("Failed to save changes. Please try again.");
      throw createError(FileErrorType.Unknown)
    }
  };

  const handleClose = (complete: () => void) => {
    if (hasUnsavedChanges) {
      const shouldSave = confirm("You have unsaved changes. Do you want to save before closing?");
      if (shouldSave) {
        handleSave().then(complete);
      } else {
        complete();
      }
    } else {
      complete();
    }
  };

  const getTabContent = () => {
    const commonProps = {
      item,
      path,
      editState,
      onEditStateChange: updateEditState,
      currentUser,
      requiresVerification,
      onVerifyUser: verifyUser,
    };

    switch (activeTab) {
      case 0:
        return <GeneralTab {...commonProps} />;
      case 1:
        return <PermissionsTab {...commonProps} />;
      default:
        return <div>Invalid tab</div>;
    }
  };

  return (
    <Popup app={props} closeOnComplete width={350} height={500} allowOverflow>
      {({ complete }) => (
        <div className="flex flex-col border border-border-subtle box-border divide-y divide-solid rounded-lg gap-2 p-2 h-full w-full">
          {/* Category Tabs */}
          <div className="flex flex-row gap-2">
            {CATEGORIES.map((category, index) => (
              <Button 
                key={index} 
                onClick={() => setActiveTab(index)}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Content */}
          <div className="flex flex-col flex-grow p-2 overflow-auto">
            {getTabContent()}
          </div>

          {/* Footer */}
          <div className="flex flex-row justify-between items-center pt-2">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faQuestionCircle} />
              {hasUnsavedChanges && (
                <span className="text-sm text-orange-600">Unsaved changes</span>
              )}
            </div>
            <div className="flex gap-2">
              {hasUnsavedChanges && (
                <Button 
                  onClick={handleSave}
                  className="flex items-center gap-1"
                >
                  <FontAwesomeIcon icon={faFloppyDisk} />
                  Save
                </Button>
              )}
              <Button onClick={() => handleClose(complete)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </Popup>
  );
};

export default ItemInfoPopup;