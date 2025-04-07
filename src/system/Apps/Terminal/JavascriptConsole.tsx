import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle } from "@fortawesome/free-solid-svg-icons";
import { saveStamp } from "../../../structures/Timestamp";

interface JavascriptConsoleProps {
  setCurrentMenu: (prev: number) => void;
}

const JavascriptConsole: React.FC<JavascriptConsoleProps> = ({ setCurrentMenu }) => {
  const [input, setInput] = useState<string>("");
  const [stack, setStack] = useState<Array<{ command: string; success: boolean; color: string }>>([
    { command: "Type 'js' to switch to Terminal.", success: true, color: "gray" },
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollToBottom();
  }, [stack]);

  const scrollToBottom = () => {
      if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
  };

  const handleEnterKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleConsoleInput(input);
      setInput("");
    }
  };

  const handleConsoleInput = (command: string) => {
    if (command === "js") return setCurrentMenu(0);

    setStack((prevStack) => [...prevStack, { command: command, success: true, color: "gray" }]);

    try {
      const result = eval(command);      

      setStack((prevStack) => [...prevStack, { command: result as string || "undefined", success: true, color: "lightblue" }]);
      saveStamp({
        app: "JavascriptConsole",
        content: input,
        openedApps: [],
      });
    } catch (error: unknown | any) {
      console.error(error);

      setStack([...stack, { command: error.message, success: false, color: "red" }]);
      saveStamp({
        app: "JavascriptConsole",
        content: input,
        openedApps: [],
        error: error,
      });
    }
  };

  return (
    <div style={{ background: "#090909", color: "whitesmoke", fontFamily: "Segoe UI, sans-serif" }} className="w-full h-full p-4 overflow-hidden overflow-y-auto">
      <div className="mt-2">
        {stack.map((item, index) => (
          <div key={index} className="flex items-center py-1 px-2 bg-black rounded-sm text-sm">
            <FontAwesomeIcon icon={faCircle} style={{ color: item.success ? item.color : "red", marginRight: "8px", width: "10px", height: "10px" }} />
            <span style={{ color: item.success ? item.color : "red" }}>{item.command}</span>
          </div>
        ))}
        <div style={{ float: "left", clear: "both" }} ref={messagesEndRef} />
      </div>
      <div className="flex flex-row gap-2 items-center mt-2">
        <div style={{ color: "#FF7A00" }}>{">"}</div>
        <div className="flex flex-row justify-between items-center w-full gap-2">
          <h3>Javascript</h3>
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyPress={handleEnterKeyPress}
            placeholder="Enter scripts..."
            className="w-full py-1 px-2 outline-none border-none border-b-2 focus:border-none"
            style={{ background: "transparent", color: "white" }}
          />
        </div>
      </div>
    </div>
  );
};

export default JavascriptConsole; 