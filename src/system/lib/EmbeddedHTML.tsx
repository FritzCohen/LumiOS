import React, { useEffect, useRef } from "react";
import { useExecuteCommand, useCommands } from "./Commands";

interface EmbeddedHtmlProps {
  html: string;
  onCommand?: (command: string, data?: any) => void;
  originWhitelist?: string[]; // Optional: restrict allowed origins
}

const EmbeddedHtml: React.FC<EmbeddedHtmlProps> = ({ html, originWhitelist = ["*"] }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const commands = useCommands();
  const executeCommand = useExecuteCommand(commands); // ✅ Call the hook at the top level

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      const { type, name, args } = event.data;

      if (type === "command") {
        const result = await executeCommand(name, args);

        (event.source as Window).postMessage(
          { type: "commandResult", result },
          event.origin || "*"
        );
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [executeCommand, originWhitelist]); // ✅ Include executeCommand in dependencies

  return (
    <iframe
      ref={iframeRef}
      srcDoc={html}
      sandbox="allow-scripts allow-same-origin"
      className="desktop-frame"
    />
  );
};

export default EmbeddedHtml;