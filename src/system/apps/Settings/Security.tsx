import { useState } from "react";
import Button from "../../lib/Button";
import { Directory, File } from "../../api/types";
import virtualFS from "../../api/virtualFS";
import secureBot from "../../api/secureBot";

interface FileCheck {
	name: string;
	path: string;
	file: File;
}

const Security = () => {
	const [scanning, setScanning] = useState(false);
	const [progress, setProgress] = useState(0);
	const [currentFile, setCurrentFile] = useState<string | null>(null);
	const [dangerousFiles, setDangerousFiles] = useState<FileCheck[]>([]);
	const [safeFiles, setSafeFiles] = useState<FileCheck[]>([]);
	const [unknownFiles, setUnknownFiles] = useState<FileCheck[]>([]);
	const [showSafe, setShowSafe] = useState(false);
	const [showUnknown, setShowUnknown] = useState(false);
    const [responseTime, setResponseTime] = useState<number>(0);

	const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

	const runCheck = async () => {
		setScanning(true);
		setProgress(0);
		setCurrentFile(null);
		setDangerousFiles([]);
		setSafeFiles([]);
		setUnknownFiles([]);

		const allFiles: FileCheck[] = [];
		const root = virtualFS.getFileSystem();
		const gatherFiles = async (dir: Directory, path: string) => {
			for (const [name, child] of Object.entries(dir.children)) {
				if (child.type === "file") {
					allFiles.push({ name, path, file: child });
				} else if (child.type === "directory") {
					await gatherFiles(child, `${path}${name}/`);
				}
			}
		};

		await gatherFiles(root, "/");

		for (let i = 0; i < allFiles.length; i++) {
			const file = allFiles[i];
			setCurrentFile(`${file.path}${file.name}`);
			const isSafe = await secureBot.checkFile(file);
			await sleep(50); // simulate delay for UX clarity

			if (isSafe) {
				setSafeFiles((prev) => [...prev, file]);
			} else {
				setDangerousFiles((prev) => [...prev, file]);
			}

			setProgress(Math.round(((i + 1) / allFiles.length) * 100));
		}

		setProgress(100);
		setCurrentFile("Fully Scanned");
		setScanning(false);
	};

	const renderTable = (files: FileCheck[], title: string) => (
		<div className="mt-4">
			<h4 className="font-semibold">{title}</h4>
			<table className="w-full text-sm border border-gray-300 mt-1">
				<thead>
					<tr className="bg-gray-100 text-left">
						<th className="p-2">Name</th>
						<th className="p-2">Path</th>
					</tr>
				</thead>
				<tbody>
					{files.map((file, idx) => (
						<tr
							key={`${file.path}${file.name}-${idx}`}
							className="border-t"
						>
							<td className="p-2">{file.name}</td>
							<td className="p-2">{file.path}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
    
    const fetchResponseTime = async () => {
      const startTime = performance.now(); // Record start time
      try {
          const response = await fetch('https://raw.githubusercontent.com/LuminesenceProject/LumiOS/main/Info.json');
          if (response.ok) {
              const endTime = performance.now(); // Record end time
              const timeDiff = endTime - startTime; // Calculate time difference
              setResponseTime(Math.round(timeDiff)); // Update state with response time
          } else {
              throw new Error('Network response was not ok.');
          }
      } catch (error) {
          console.error('Error fetching:', error);
      }
    };  

    const getStat = () => {
        setTimeout(() => {}, 200);

        if (responseTime < 100) {
            return "Fast"
          } else if (responseTime > 100) {
            return "Good"
          } else if (responseTime > 150) {
            return "Ok"
          } else if (responseTime > 200) {
            return "Slow"
          } else {
            return "Toilet"
          }
    };

	return (
		<div className="flex flex-col gap-4 p-5 overflow-y-scroll w-full h-full">
			<h2 className="font-bold text-xl">Security</h2>

			<div className="flex justify-between items-center gap-3">
				<h4>Run file check</h4>
				<Button onClick={runCheck} disabled={scanning}>
					{scanning ? "Scanning..." : "Check"}
				</Button>
			</div>

			{progress > 0 && (
				<div className="custom-progress-wrapper" tabIndex={0}>
					<div
						className="custom-progress-bar"
						style={{ width: `${progress}%` }}
					>
						{progress}%
					</div>
				</div>
			)}

			{currentFile && (
				<div className="text-sm text-gray-600">
					{scanning ? `Scanning: ${currentFile}` : currentFile}
				</div>
			)}

			{renderTable(dangerousFiles, "Dangerous Files")}

			<div>
				<button
					onClick={() => setShowSafe((v) => !v)}
					className="text-blue-500 underline text-sm"
				>
					{showSafe ? "Hide" : "Show"} Safe Files
				</button>
				{showSafe && renderTable(safeFiles, "Safe Files")}
			</div>

			<div>
				<button
					onClick={() => setShowUnknown((v) => !v)}
					className="text-blue-500 underline text-sm"
				>
					{showUnknown ? "Hide" : "Show"} Unknown Files
				</button>
				{showUnknown && renderTable(unknownFiles, "Unknown Files")}
			</div>
			<hr />
			<div className="flex justify-between items-center gap-3">
				<h4>Run wifi check</h4>
				<Button onClick={fetchResponseTime}>
					Check
				</Button>
			</div>
            <div className="flex flex-row gap-1">
                Status: {responseTime != 0 ? getStat() : "N/A"}
                <p className="clean-p">
                    {responseTime != 0 && `${responseTime}ms`}
                </p>
            </div>
		</div>
	);
};

export default Security;
