// Zipper.tsx
import React, { useEffect, useState } from "react";
import JSZip from "jszip";
import virtualFS from "../../../api/virtualFS";

interface ZipperProps {
  zippedContent: ArrayBuffer;       // Raw zip data
  targetDir: string;                // Where to write extracted files
  permission?: number;              // File permission
  onDone?: () => void;              // Callback when extraction is finished
}

const Zipper: React.FC<ZipperProps> = ({ zippedContent, targetDir, permission = 1, onDone }) => {
  const [progress, setProgress] = useState(0);
  const [filesProcessed, setFilesProcessed] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const unzip = async () => {
      try {
        const zip = await JSZip.loadAsync(zippedContent);
        const entries = Object.entries(zip.files) as [string, JSZip.JSZipObject][];
        let processedCount = 0;

        for (const [relativePath, file] of entries) {
          if (file.dir) {
            await virtualFS.writeDirectory(targetDir, relativePath, permission);
          } else {
            const content = await file.async("uint8array");
            const fileName = relativePath.split("/").pop() || "unknown";
            const parentPath = relativePath.includes("/")
              ? relativePath.substring(0, relativePath.lastIndexOf("/"))
              : "";

            if (parentPath) {
              await virtualFS.writeDirectory(`${targetDir}/`, parentPath, permission);
            }

            await virtualFS.writeFile(`${targetDir}/${parentPath}`, fileName, content, "txt");
          }

          processedCount++;
          setFilesProcessed(prev => [...prev, relativePath]);
          setProgress(Math.round((processedCount / entries.length) * 100));
        }

        setDone(true);
        onDone?.();
      } catch (err) {
        console.error("Unzipping failed:", err);
      }
    };

    unzip();
  }, [zippedContent, targetDir, permission, onDone]);

  return (
    <div className="flex flex-col gap-4 p-4 bg-black text-white h-full">
      <h2 className="text-xl font-bold">Unzipping...</h2>

      {/* Progress bar (Tailwind only) */}
      <div className="w-full bg-gray-700 rounded h-3">
        <div
          className="bg-green-500 h-3 rounded transition-all duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p>{progress}%</p>

      {/* File list */}
      <div className="flex-1 overflow-y-auto bg-gray-900 rounded p-2 text-sm">
        {filesProcessed.map((f, i) => (
          <div key={i} className="truncate">{f}</div>
        ))}
      </div>

      {done && <p className="text-green-400 font-semibold">✅ Extraction complete</p>}
    </div>
  );
};

export default Zipper;
