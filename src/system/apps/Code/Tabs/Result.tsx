import React, { useEffect, useRef, useState } from "react";
import { CodeState } from "../codeTypes";
import { NamedFile } from "../../FileExplorer/fileExplorerTypes";

const Result: React.FC<{ code: CodeState }> = ({ code }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { content, selectedFile, openFilesMap } = code;
  const [nonHtmlMessage, setNonHtmlMessage] = useState<string | null>(null);

  // Helper: resolve file by path from openFilesMap or content folders
  function resolveFile(path: string): NamedFile | undefined {
    if (!path) return undefined;

    // 1. Check open files map first
    if (openFilesMap && openFilesMap[path]) {
      return openFilesMap[path];
    }

    // 2. Check folder content
    const parts = path.split("/").filter(Boolean);
    const itemName = parts.pop();
    if (!itemName) return undefined;

    let dirPath = "/" + parts.join("/");
    if (!dirPath.endsWith("/")) dirPath += "/";

    // Try with and without trailing slash keys
    if (content[dirPath]?.[itemName] && content[dirPath][itemName].type === "file") {
      return content[dirPath][itemName] as NamedFile;
    }
    if (content[dirPath.slice(0, -1)]?.[itemName] && content[dirPath.slice(0, -1)][itemName].type === "file") {
      return content[dirPath.slice(0, -1)][itemName] as NamedFile;
    }

    return undefined;
  }

  // Resolve relative path like './style.css' or '../script.js'
  function resolveRelativePath(base: string, relative: string): string {
    const baseParts = base.split("/").slice(0, -1); // remove filename
    const relParts = relative.split("/");

    for (const part of relParts) {
      if (part === "." || part === "") continue;
      if (part === "..") baseParts.pop();
      else baseParts.push(part);
    }

    return baseParts.join("/");
  }

  useEffect(() => {
    if (!selectedFile) {
      setNonHtmlMessage(null);
      if (iframeRef.current?.contentDocument) {
        iframeRef.current.contentDocument.open();
        iframeRef.current.contentDocument.write("");
        iframeRef.current.contentDocument.close();
      }
      return;
    }

    const file = resolveFile(selectedFile);

    if (!file || file.type !== "file" || file.fileType !== "html") {
      setNonHtmlMessage("Cannot display this file");
      if (iframeRef.current?.contentDocument) {
        iframeRef.current.contentDocument.open();
        iframeRef.current.contentDocument.write("");
        iframeRef.current.contentDocument.close();
      }
      return;
    }

    setNonHtmlMessage(null);
    const parser = new DOMParser();
    const doc = parser.parseFromString(file.content as string, "text/html");

    // Replace linked CSS with inline styles
    doc.querySelectorAll("link[rel='stylesheet']").forEach((link) => {
      const href = link.getAttribute("href");
      if (!href) return;

      let resolved = resolveRelativePath(selectedFile, href);

      // Append trailing slash for folder lookup if no extension (folder)
      if (!resolved.includes(".") && !resolved.endsWith("/")) {
        resolved += "/";
      }

      const cssFile = resolveFile(resolved);
      if (cssFile && cssFile.type === "file" && cssFile.fileType === "css") {
        const styleEl = document.createElement("style");
        styleEl.textContent = cssFile.content as string;
        link.replaceWith(styleEl);
      }
    });

    // Replace linked scripts with inline scripts
    doc.querySelectorAll("script[src]").forEach((script) => {
      const src = script.getAttribute("src");
      if (!src) return;

      let resolved = resolveRelativePath(selectedFile, src);

      // Append trailing slash for folder lookup if no extension (folder)
      if (!resolved.includes(".") && !resolved.endsWith("/")) {
        resolved += "/";
      }

      const jsFile = resolveFile(resolved);
      if (jsFile && jsFile.type === "file" && jsFile.fileType === "js") {
        const inlineScript = document.createElement("script");
        inlineScript.textContent = jsFile.content as string;
        script.replaceWith(inlineScript);
      }
    });

    const finalHtml = "<!DOCTYPE html>\n" + doc.documentElement.outerHTML;

    if (iframeRef.current?.contentDocument) {
      iframeRef.current.contentDocument.open();
      iframeRef.current.contentDocument.write(finalHtml);
      iframeRef.current.contentDocument.close();
    }
  }, [content, selectedFile, openFilesMap]);

  return (
    <div className="w-full h-full flex flex-col">
      <iframe
        ref={iframeRef}
        title="Preview"
        className="flex-grow"
        style={{ display: nonHtmlMessage ? "none" : "block" }}
      />
      {nonHtmlMessage && (
        <div className="p-4 text-center text-gray-600">{nonHtmlMessage}</div>
      )}
    </div>
  );
};

export default Result;