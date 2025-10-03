import { faPencil } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState, KeyboardEvent } from "react";

interface InputBarProps {
  directory: string;
  setDirectory: (path: string) => void;
}

const InputBar: React.FC<InputBarProps> = ({ directory, setDirectory }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(directory);

  const handlePathClick = (index: number) => {
    const parts = directory.split("/");
    const newPath = parts.slice(0, index + 1).join("/");
    setDirectory(newPath);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value.replace("Root", ""));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setDirectory(inputValue);
      setIsEditing(false);
    } else if (e.key === "Escape") {
      setInputValue(directory);
      setIsEditing(false);
    }
  };

  return (
    <div className={`flex items-center gap-1 w-full rounded ${isEditing ? "p-0" : "p-2"}`} style={{
      background: isEditing ? "" : "rgba(255, 255, 255, 0.2)"
    }}>
      {isEditing ? (
        <div className="relative w-full">
            <input
            className="input-main transition-all duration-300 ease-in-out focus:outline-none focus:border-accent !py-1"
            value={"Root" + inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onBlur={() => {
                setIsEditing(false);
                setInputValue(directory);
            }}
            autoFocus
            />
        </div>
      ) : (
        <div className="flex items-center gap-1">
          {directory.split("/").map((part, index) => (
            <React.Fragment key={index}>
              <span
                className="cursor-pointer text-blue-600 hover:underline"
                onClick={() => handlePathClick(index)}
              >
                {index == 0 && part === "" && "Root"}
                {part}
              </span>
              {index < directory.split("/").length - 1 && part !== "" && <span>/</span>}
              {index == 0 && part === "" && "/"}
            </React.Fragment>
          ))}
          <button
            className="ml-2 text-gray-500 hover:text-gray-800"
            onClick={() => {
              setIsEditing(true);
              setInputValue(directory);
            }}
          >
            <FontAwesomeIcon icon={faPencil} />
          </button>
        </div>
      )}
    </div>
  );
};

export default InputBar;