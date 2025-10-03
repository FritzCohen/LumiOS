import { useEffect, useState } from "react";
import virtualFS from "../../api/virtualFS";
import { createError } from "../../api/errors";
import { Directory, File } from "../../api/types";
import { FileErrorType } from "../../../types/globals";

// --- Step 1: Build Directory ---
function buildDirectory(flatMap: Record<string, File>): Directory {
  const root: Directory = {
    type: "directory",
    date: new Date(),
    permission: 1,
    deleteable: false,
    children: {},
  };

  for (const fullPath in flatMap) {
    const parts = fullPath.split("/");
    let current: Directory = root;

    parts.forEach((part, idx) => {
      const isLast = idx === parts.length - 1;

      if (isLast) {
        current.children[part] = flatMap[fullPath];
      } else {
        if (!current.children[part]) {
          current.children[part] = {
            type: "directory",
            date: new Date(),
            permission: 1,
            deleteable: false,
            children: {},
          };
        }
        current = current.children[part] as Directory;
      }
    });
  }

  return root;
}

// --- Step 2: Create Blob URLs ---
function guessMime(fileType: string): string {
  switch (fileType) {
    case "html": return "text/html";
    case "css": return "text/css";
    case "js": return "application/javascript";
    case "json": return "application/json";
    case "png": return "image/png";
    case "jpg":
    case "jpeg": return "image/jpeg";
    case "gif": return "image/gif";
    case "ico": return "image/x-icon";
    default: return "application/octet-stream";
  }
}

function createVirtualURLs(tree: Directory): Map<string, string> {
  const map = new Map<string, string>();

  function walk(dir: Directory, prefix: string) {
    for (const [childName, child] of Object.entries(dir.children)) {
      const fullPath = prefix ? `${prefix}/${childName}` : childName;

      if (child.type === "file") {
        let blob: Blob;
        if (typeof child.content === "string") {
          blob = new Blob([child.content], { type: guessMime(child.fileType) });
        } else {
          blob = new Blob([child.content]);
        }
        map.set(fullPath, URL.createObjectURL(blob));
      } else {
        walk(child, fullPath);
      }
    }
  }

  walk(tree, "");
  return map;
}

// --- Step 3: Rewrite HTML ---
function rewriteHtml(content: string, urlMap: Map<string, string>, baseDir: string): string {
  return content.replace(
    /(src|href)=["']([^"']+)["']/g,
    (_, attr, relPath) => {
      let resolved: string;

      if (relPath.startsWith("./")) {
        resolved = `${baseDir}/${relPath.slice(2)}`;
      } else if (relPath.startsWith("../")) {
        // resolve ../ manually
        const parts = baseDir.split("/");
        parts.pop(); // go up
        resolved = `${parts.join("/")}/${relPath.slice(3)}`;
      } else {
        resolved = `${baseDir}/${relPath}`;
      }

      const blobUrl = urlMap.get(resolved);
      return blobUrl ? `${attr}="${blobUrl}"` : `${attr}="${relPath}"`;
    }
  );
}

// --- Step 4: Component ---
const HTMLViewer: React.FC<{ name: string; path: string }> = ({ name, path }) => {
  const [iframeSrc, setIframeSrc] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      const dirContent: Record<string, File> = await virtualFS.readdir(path) as Record<string, File>;
      if (!dirContent) throw createError(FileErrorType.InvalidFileType);

      const tree = buildDirectory(dirContent);
      const urlMap = createVirtualURLs(tree);

      const target = dirContent[name];

      if (!target || target.type !== "file" || target.fileType !== "html") {  
        console.log(target);
              
        throw createError(FileErrorType.InvalidFileType);
      }

      const rewritten = rewriteHtml(target.content as string, urlMap, path);
      const htmlBlob = new Blob([rewritten], { type: "text/html" });
      setIframeSrc(URL.createObjectURL(htmlBlob));
    };

    fetchContent();
  }, [name, path]);

  return (
    <div className="w-full h-full">
      {iframeSrc ? (
        <iframe src={iframeSrc} className="w-full h-full" />
      ) : (
        "Loading..."
      )}
    </div>
  );
};

export default HTMLViewer;
